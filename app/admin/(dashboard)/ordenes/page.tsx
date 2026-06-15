"use client";
import { useEffect, useState } from "react";

type Orden = {
  id: string;
  clienteInfo?: { nombre?: string; apellido?: string; email?: string; telefono?: string };
  direccionEnvio?: { calle?: string; numero?: string; ciudad?: string; provincia?: string; codigoPostal?: string };
  items?: { nombre: string; cantidad: number; precioUnitario: number; opcionesSeleccionadas?: any[] }[];
  montoTotal?: number;
  estadoPago?: string;
  estadoEnvio?: string;
  metodoPago?: string;
  createdAt?: any;
};

const PAGO_OPTS = ["pendiente", "completado", "fallido"];
const ENVIO_OPTS = ["procesando", "enviado", "entregado"];

const PAGO_COLORS: Record<string, string> = {
  pendiente: "bg-yellow-100 text-yellow-800",
  completado: "bg-green-100 text-green-700",
  fallido: "bg-red-100 text-red-700",
};
const ENVIO_COLORS: Record<string, string> = {
  procesando: "bg-blue-100 text-blue-700",
  enviado: "bg-purple-100 text-purple-700",
  entregado: "bg-green-100 text-green-700",
};

function parseDate(v: any): string {
  if (!v) return "-";
  if (typeof v === "string") return new Date(v).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (v._seconds) return new Date(v._seconds * 1000).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return "-";
}

export default function OrdenesAdminPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/ordenes")
      .then((r) => r.json())
      .then((data) => setOrdenes(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  async function updateStatus(id: string, field: "estadoPago" | "estadoEnvio", value: string) {
    setUpdating(id + field);
    await fetch(`/api/ordenes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    setOrdenes((prev) => prev.map((o) => o.id === id ? { ...o, [field]: value } : o));
    setUpdating(null);
  }

  const filtradas = ordenes.filter((o) => {
    const q = busqueda.toLowerCase();
    if (!q) return true;
    const nombre = `${o.clienteInfo?.nombre ?? ""} ${o.clienteInfo?.apellido ?? ""}`.toLowerCase();
    return nombre.includes(q) || o.clienteInfo?.email?.toLowerCase().includes(q) || o.id.includes(q);
  });

  const total = ordenes.length;
  const pendientes = ordenes.filter((o) => o.estadoPago === "pendiente").length;
  const enviados = ordenes.filter((o) => o.estadoEnvio === "enviado").length;
  const entregados = ordenes.filter((o) => o.estadoEnvio === "entregado").length;
  const totalVentas = ordenes.reduce((s, o) => s + (o.montoTotal ?? 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2C1A10]">Órdenes</h1>
        <p className="text-sm text-gray-500">Registro de pedidos y clientes</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total órdenes", value: total, color: "text-[#2C1A10]" },
          { label: "Pago pendiente", value: pendientes, color: "text-yellow-600" },
          { label: "En camino", value: enviados, color: "text-purple-600" },
          { label: "Entregados", value: entregados, color: "text-green-600" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#2C1A10] text-white rounded-xl p-4 mb-6 flex items-center justify-between">
        <p className="text-sm opacity-80">Ventas totales (monto acumulado)</p>
        <p className="text-2xl font-bold">${totalVentas.toLocaleString("es-AR")}</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por cliente, email o ID..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A87C] bg-white"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Cargando órdenes...</div>
        ) : filtradas.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {busqueda ? "Sin resultados." : "No hay órdenes registradas todavía."}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtradas.map((o) => (
              <div key={o.id}>
                <div
                  className="flex flex-wrap items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                >
                  <div className="min-w-[120px]">
                    <p className="font-mono text-xs text-gray-400">{o.id.slice(0, 10)}...</p>
                    <p className="text-xs text-gray-500 mt-0.5">{parseDate(o.createdAt)}</p>
                  </div>

                  <div className="flex-1 min-w-[140px]">
                    <p className="font-semibold text-sm text-[#2C1A10]">
                      {o.clienteInfo?.nombre} {o.clienteInfo?.apellido}
                    </p>
                    <p className="text-xs text-gray-500">{o.clienteInfo?.email}</p>
                    {o.clienteInfo?.telefono && (
                      <p className="text-xs text-gray-400">{o.clienteInfo.telefono}</p>
                    )}
                  </div>

                  <div className="text-right min-w-[100px]">
                    <p className="font-bold text-sm text-[#2C1A10]">${(o.montoTotal ?? 0).toLocaleString("es-AR")}</p>
                    <p className="text-xs text-gray-500">{o.items?.length ?? 0} {o.items?.length === 1 ? "ítem" : "ítems"}</p>
                    {o.metodoPago && (
                      <p className="text-xs text-gray-400 capitalize">{o.metodoPago}</p>
                    )}
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">Pago</p>
                    <select
                      value={o.estadoPago ?? "pendiente"}
                      onChange={(e) => updateStatus(o.id, "estadoPago", e.target.value)}
                      disabled={updating === o.id + "estadoPago"}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-semibold cursor-pointer ${PAGO_COLORS[o.estadoPago ?? "pendiente"] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {PAGO_OPTS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <div onClick={(e) => e.stopPropagation()}>
                    <p className="text-[10px] text-gray-400 mb-1 font-semibold uppercase tracking-wide">Envío</p>
                    <select
                      value={o.estadoEnvio ?? "procesando"}
                      onChange={(e) => updateStatus(o.id, "estadoEnvio", e.target.value)}
                      disabled={updating === o.id + "estadoEnvio"}
                      className={`text-xs px-2 py-1 rounded-full border-0 font-semibold cursor-pointer ${ENVIO_COLORS[o.estadoEnvio ?? "procesando"] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {ENVIO_OPTS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                  </div>

                  <div className="text-gray-400 text-sm">{expanded === o.id ? "▲" : "▼"}</div>
                </div>

                {expanded === o.id && (
                  <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dirección de envío</p>
                      {o.direccionEnvio ? (
                        <p className="text-sm text-[#2C1A10] leading-relaxed">
                          {o.direccionEnvio.calle} {o.direccionEnvio.numero}<br />
                          {o.direccionEnvio.ciudad}, {o.direccionEnvio.provincia} {o.direccionEnvio.codigoPostal}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400">Sin datos</p>
                      )}
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Productos del pedido</p>
                      <div className="space-y-1.5">
                        {(o.items ?? []).map((item, i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span className="text-[#2C1A10]">
                              {item.nombre} <span className="text-gray-400">x{item.cantidad}</span>
                            </span>
                            <span className="font-semibold text-[#2C1A10]">
                              ${(item.precioUnitario * item.cantidad).toLocaleString("es-AR")}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between text-sm font-bold text-[#2C1A10] border-t border-gray-200 pt-1.5 mt-1.5">
                          <span>Total</span>
                          <span>${(o.montoTotal ?? 0).toLocaleString("es-AR")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
