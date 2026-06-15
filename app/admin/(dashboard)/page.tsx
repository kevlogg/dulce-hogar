"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Orden = {
  id: string;
  montoTotal?: number;
  estadoPago?: string;
  estadoEnvio?: string;
  clienteInfo?: { nombre?: string; apellido?: string; email?: string };
  createdAt?: any;
};

type Producto = {
  id: string;
  nombre: string;
  categoria: string;
  stock: number;
  precio: number;
};

function parseDate(v: any): string {
  if (!v) return "-";
  if (typeof v === "string") return new Date(v).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (v._seconds) return new Date(v._seconds * 1000).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });
  return "-";
}

export default function AdminDashboardPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/productos").then((r) => r.json()),
      fetch("/api/ordenes").then((r) => r.json()),
    ]).then(([prods, ords]) => {
      setProductos(Array.isArray(prods) ? prods : []);
      setOrdenes(Array.isArray(ords) ? ords : []);
      setLoading(false);
    });
  }, []);

  const totalVentas = ordenes.reduce((s, o) => s + (o.montoTotal ?? 0), 0);
  const pendientes = ordenes.filter((o) => o.estadoPago === "pendiente").length;
  const sinStock = productos.filter((p) => (p.stock ?? 0) === 0).length;
  const recientes = [...ordenes]
    .sort((a, b) => {
      const ta = a.createdAt?._seconds ?? 0;
      const tb = b.createdAt?._seconds ?? 0;
      return tb - ta;
    })
    .slice(0, 5);

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

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400 text-sm">Cargando...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#2C1A10]">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen general de la tienda</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Productos", value: productos.length, sub: `${sinStock} sin stock`, color: "text-[#2C1A10]", href: "/admin/productos" },
          { label: "Órdenes", value: ordenes.length, sub: `${pendientes} pendientes de pago`, color: "text-[#2C1A10]", href: "/admin/ordenes" },
          { label: "Ventas totales", value: `$${totalVentas.toLocaleString("es-AR")}`, sub: "monto acumulado", color: "text-green-700", href: "/admin/ordenes" },
          { label: "Sin stock", value: sinStock, sub: "productos agotados", color: sinStock > 0 ? "text-red-600" : "text-green-600", href: "/admin/productos" },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#C9A87C] transition-colors cursor-pointer">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent orders */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-[#2C1A10]">Últimas órdenes</p>
            <Link href="/admin/ordenes" className="text-xs text-[#A0724A] hover:text-[#2C1A10]">Ver todas →</Link>
          </div>
          {recientes.length === 0 ? (
            <p className="p-6 text-sm text-gray-400 text-center">Sin órdenes todavía.</p>
          ) : (
            <div className="divide-y divide-gray-50">
              {recientes.map((o) => (
                <div key={o.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#2C1A10] truncate">
                      {o.clienteInfo?.nombre} {o.clienteInfo?.apellido}
                    </p>
                    <p className="text-xs text-gray-400">{parseDate(o.createdAt)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#2C1A10]">${(o.montoTotal ?? 0).toLocaleString("es-AR")}</p>
                    <div className="flex gap-1 justify-end mt-0.5">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${PAGO_COLORS[o.estadoPago ?? "pendiente"] ?? "bg-gray-100 text-gray-500"}`}>
                        {o.estadoPago ?? "pendiente"}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${ENVIO_COLORS[o.estadoEnvio ?? "procesando"] ?? "bg-gray-100 text-gray-500"}`}>
                        {o.estadoEnvio ?? "procesando"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Products without stock */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-[#2C1A10]">Productos sin stock</p>
            <Link href="/admin/productos" className="text-xs text-[#A0724A] hover:text-[#2C1A10]">Gestionar →</Link>
          </div>
          {sinStock === 0 ? (
            <p className="p-6 text-sm text-green-600 text-center font-medium">Todos los productos tienen stock.</p>
          ) : (
            <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
              {productos
                .filter((p) => (p.stock ?? 0) === 0)
                .map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-4 py-2.5">
                    <div>
                      <p className="text-sm font-semibold text-[#2C1A10]">{p.nombre}</p>
                      <p className="text-xs text-gray-400">{p.categoria}</p>
                    </div>
                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">Sin stock</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Agregar producto", desc: "Subir un nuevo producto al catálogo", href: "/admin/productos" },
          { label: "Ver categorías", desc: "Distribución de productos por categoría", href: "/admin/categorias" },
          { label: "Ver órdenes", desc: "Gestionar pedidos y estados de envío", href: "/admin/ordenes" },
        ].map((l) => (
          <Link key={l.label} href={l.href}>
            <div className="bg-white rounded-xl border border-gray-200 p-4 hover:border-[#C9A87C] transition-colors cursor-pointer">
              <p className="text-sm font-bold text-[#2C1A10]">{l.label}</p>
              <p className="text-xs text-gray-500 mt-1">{l.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
