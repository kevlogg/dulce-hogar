"use client";
import { useEffect, useState, useRef } from "react";

const CATS = [
  { key: "MUEBLES", label: "Muebles" },
  { key: "TEXTILES", label: "Textiles" },
  { key: "EXTERIOR", label: "Exterior" },
  { key: "ESPEJOS", label: "Espejos" },
  { key: "DECO", label: "Decoración" },
  { key: "ILUMINACION", label: "Iluminación" },
];

type Producto = {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioEfectivo?: number;
  categoria: string;
  stock: number;
  imagenes?: string[];
  opciones?: any[];
  especificaciones?: Record<string, string>;
  peso?: number;
  alto?: number;
  ancho?: number;
  largo?: number;
};

const EMPTY: any = {
  nombre: "",
  descripcion: "",
  precio: "",
  precioEfectivo: "",
  categoria: "MUEBLES",
  stock: "0",
  imagenes: "",
  opciones: "[]",
  peso: "",
  alto: "",
  ancho: "",
  largo: "",
};

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A87C] bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

export default function ProductosAdminPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const firstInput = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    fetch("/api/productos")
      .then((r) => r.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (modal) setTimeout(() => firstInput.current?.focus(), 50); }, [modal]);

  const filtrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setError("");
    setModal(true);
  }

  function openEdit(p: Producto) {
    setEditing(p);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: String(p.precio),
      precioEfectivo: String(p.precioEfectivo || ""),
      categoria: p.categoria || "MUEBLES",
      stock: String(p.stock ?? 0),
      imagenes: (p.imagenes || []).join("\n"),
      opciones: JSON.stringify(p.opciones || [], null, 2),
      peso: String(p.peso ?? ""),
      alto: String(p.alto ?? ""),
      ancho: String(p.ancho ?? ""),
      largo: String(p.largo ?? ""),
    });
    setError("");
    setModal(true);
  }

  const set = (k: string, v: string) => setForm((f: any) => ({ ...f, [k]: v }));

  async function save() {
    if (!form.nombre.trim() || !form.precio) { setError("Nombre y precio son obligatorios."); return; }
    setSaving(true);
    setError("");
    const imagenes = form.imagenes.split("\n").map((s: string) => s.trim()).filter(Boolean);
    let opciones: any[] = [];
    try { opciones = JSON.parse(form.opciones || "[]"); } catch {}
    const precio = Number(form.precio);
    const precioEfectivo = form.precioEfectivo ? Number(form.precioEfectivo) : Math.round(precio * 0.75);
    const body = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio,
      precioEfectivo,
      categoria: form.categoria,
      categoriaId: form.categoria,
      stock: Number(form.stock) || 0,
      imagenes,
      opciones,
      especificaciones: {},
      ...(form.peso ? { peso: Number(form.peso) } : {}),
      ...(form.alto ? { alto: Number(form.alto) } : {}),
      ...(form.ancho ? { ancho: Number(form.ancho) } : {}),
      ...(form.largo ? { largo: Number(form.largo) } : {}),
    };
    const url = editing ? `/api/productos/${editing.id}` : "/api/productos";
    const method = editing ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (res.ok) { setModal(false); load(); }
    else { setError("Error al guardar. Intentá de nuevo."); }
    setSaving(false);
  }

  async function confirmDelete() {
    if (!deleteId) return;
    await fetch(`/api/productos/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    load();
  }

  const catLabel = (key: string) => CATS.find((c) => c.key === key)?.label ?? key;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#2C1A10]">Productos</h1>
          <p className="text-sm text-gray-500">{productos.length} productos en total</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-[#2C1A10] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#A0724A] transition-colors"
        >
          + Nuevo producto
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400 text-sm">Cargando...</div>
        ) : filtrados.length === 0 ? (
          <div className="p-10 text-center text-gray-400 text-sm">
            {busqueda ? "Sin resultados." : "No hay productos. Creá el primero."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Imagen</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio cuotas</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio efectivo</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtrados.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {p.imagenes?.[0] ? (
                        <img src={p.imagenes[0]} alt={p.nombre} className="w-14 h-14 object-cover rounded-lg border border-gray-100" />
                      ) : (
                        <div className="w-14 h-14 rounded-lg bg-[#F7F3EE] flex items-center justify-center text-2xl">🛋️</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#2C1A10] leading-snug">{p.nombre}</p>
                      {p.imagenes && p.imagenes.length > 1 && (
                        <p className="text-xs text-gray-400 mt-0.5">{p.imagenes.length} imágenes</p>
                      )}
                      {(!p.peso || !p.alto || !p.ancho || !p.largo) && (
                        <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                          Faltan datos de envío
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#F7F3EE] text-[#A0724A] px-2 py-1 rounded-full font-medium">
                        {catLabel(p.categoria)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#2C1A10]">
                      ${p.precio?.toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">
                      ${(p.precioEfectivo ?? Math.round(p.precio * 0.75)).toLocaleString("es-AR")}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        (p.stock ?? 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                      }`}>
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => openEdit(p)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#C9A87C] hover:text-[#2C1A10] transition-colors"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal create/edit */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#2C1A10] text-lg">
                {editing ? "Editar producto" : "Nuevo producto"}
              </h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Nombre *</label>
                  <input ref={firstInput} type="text" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} className={inputCls} placeholder="Sofá Chesterfield 3 cuerpos" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Descripción</label>
                  <textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} className={inputCls + " resize-none"} rows={3} placeholder="Descripción del producto..." />
                </div>
                <div>
                  <label className={labelCls}>Categoría</label>
                  <select value={form.categoria} onChange={(e) => set("categoria", e.target.value)} className={inputCls}>
                    {CATS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Stock</label>
                  <input type="number" min="0" value={form.stock} onChange={(e) => set("stock", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Precio cuotas *</label>
                  <input type="number" min="0" value={form.precio} onChange={(e) => set("precio", e.target.value)} className={inputCls} placeholder="150000" />
                </div>
                <div>
                  <label className={labelCls}>Precio efectivo <span className="normal-case text-gray-400 font-normal">(vacío = 75% auto)</span></label>
                  <input type="number" min="0" value={form.precioEfectivo} onChange={(e) => set("precioEfectivo", e.target.value)} className={inputCls} placeholder={form.precio ? String(Math.round(Number(form.precio) * 0.75)) : "Auto"} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Imágenes <span className="normal-case text-gray-400 font-normal">(una URL por línea)</span></label>
                  <textarea value={form.imagenes} onChange={(e) => set("imagenes", e.target.value)} className={inputCls + " resize-none font-mono text-xs"} rows={4} placeholder={"https://firebasestorage...\nhttps://firebasestorage..."} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Opciones / variantes <span className="normal-case text-gray-400 font-normal">(JSON)</span></label>
                  <textarea value={form.opciones} onChange={(e) => set("opciones", e.target.value)} className={inputCls + " resize-none font-mono text-xs"} rows={5} placeholder='[{"id":"color","nombre":"Color","tipo":"radio","items":[{"id":"negro","nombre":"Negro","precioAdicional":0}]}]' />
                </div>
                <div className="sm:col-span-2">
                  <p className={labelCls + " mb-3"}>Datos de envío (requeridos por Envíopack)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className={labelCls}>Peso (kg)</label>
                      <input type="number" min="0" step="0.1" value={form.peso} onChange={(e) => set("peso", e.target.value)} className={inputCls} placeholder="5.5" />
                    </div>
                    <div>
                      <label className={labelCls}>Alto (cm)</label>
                      <input type="number" min="0" value={form.alto} onChange={(e) => set("alto", e.target.value)} className={inputCls} placeholder="80" />
                    </div>
                    <div>
                      <label className={labelCls}>Ancho (cm)</label>
                      <input type="number" min="0" value={form.ancho} onChange={(e) => set("ancho", e.target.value)} className={inputCls} placeholder="90" />
                    </div>
                    <div>
                      <label className={labelCls}>Largo (cm)</label>
                      <input type="number" min="0" value={form.largo} onChange={(e) => set("largo", e.target.value)} className={inputCls} placeholder="100" />
                    </div>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={save} disabled={saving} className="px-5 py-2 text-sm rounded-lg bg-[#2C1A10] text-white font-semibold hover:bg-[#A0724A] transition-colors disabled:opacity-50">
                {saving ? "Guardando..." : editing ? "Guardar cambios" : "Crear producto"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h3 className="font-bold text-[#2C1A10] text-lg mb-2">¿Eliminar producto?</h3>
            <p className="text-gray-500 text-sm mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={confirmDelete} className="px-5 py-2 text-sm rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
