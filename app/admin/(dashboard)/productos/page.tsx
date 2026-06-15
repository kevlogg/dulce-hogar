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

type AccForm = { id: string; nombre: string; precio: string; precioEfectivo: string };

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
  accesorios?: any[];
  especificaciones?: Record<string, string>;
};

type FormState = {
  nombre: string;
  descripcion: string;
  precio: string;
  precioEfectivo: string;
  categoria: string;
  stock: string;
  alto: string;
  ancho: string;
  largo: string;
  peso: string;
  colores: string[];
  otrasOpciones: string;
  accesorios: AccForm[];
};

const EMPTY: FormState = {
  nombre: "",
  descripcion: "",
  precio: "",
  precioEfectivo: "",
  categoria: "MUEBLES",
  stock: "0",
  alto: "",
  ancho: "",
  largo: "",
  peso: "",
  colores: [],
  otrasOpciones: "[]",
  accesorios: [],
};

const inputCls = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#C9A87C] bg-white";
const labelCls = "block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1";

function extractColors(opciones: any[]): string[] {
  const colorOp = opciones?.find((o: any) => o.id === "color");
  return colorOp?.items?.map((i: any) => i.nombre) ?? [];
}

function extractOtherOpciones(opciones: any[]): any[] {
  return opciones?.filter((o: any) => o.id !== "color") ?? [];
}

function buildOpciones(colores: string[], otrasOpciones: any[]): any[] {
  const result = [...otrasOpciones];
  if (colores.length > 0) {
    result.unshift({
      id: "color",
      nombre: "Color",
      tipo: "select",
      items: colores.map((c) => ({
        id: c.toLowerCase().replace(/\s+/g, "-"),
        nombre: c,
        precioAdicional: 0,
        imagenIdx: 0,
      })),
    });
  }
  return result;
}

export default function ProductosAdminPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Producto | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Image state
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [newColorInput, setNewColorInput] = useState("");
  const [newAccNombre, setNewAccNombre] = useState("");
  const [newAccPrecio, setNewAccPrecio] = useState("");
  const [newAccPrecioEf, setNewAccPrecioEf] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    setExistingImages([]);
    setError("");
    setModal(true);
  }

  function openEdit(p: Producto) {
    setEditing(p);
    const colores = extractColors(p.opciones ?? []);
    const otras = extractOtherOpciones(p.opciones ?? []);
    setForm({
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      precio: String(p.precio),
      precioEfectivo: String(p.precioEfectivo || ""),
      categoria: p.categoria || "MUEBLES",
      stock: String(p.stock ?? 0),
      alto: p.especificaciones?.alto ?? "",
      ancho: p.especificaciones?.ancho ?? "",
      largo: p.especificaciones?.largo ?? "",
      peso: p.especificaciones?.peso ?? "",
      colores,
      otrasOpciones: JSON.stringify(otras, null, 2),
      accesorios: (p.accesorios ?? []).map((a: any) => ({
        id: a.id,
        nombre: a.nombre,
        precio: String(a.precio),
        precioEfectivo: String(a.precioEfectivo ?? ""),
      })),
    });
    setExistingImages(p.imagenes ?? []);
    setError("");
    setModal(true);
  }

  const set = (k: keyof FormState, v: any) => setForm((f) => ({ ...f, [k]: v }));

  async function uploadFiles(files: FileList) {
    setUploading(true);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) urls.push(data.url);
    }
    setExistingImages((prev) => [...prev, ...urls]);
    setUploading(false);
  }

  function removeImage(idx: number) {
    setExistingImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function addColor() {
    const c = newColorInput.trim();
    if (!c) return;
    if (!form.colores.includes(c)) {
      set("colores", [...form.colores, c]);
    }
    setNewColorInput("");
  }

  function removeColor(c: string) {
    set("colores", form.colores.filter((x) => x !== c));
  }

  async function save() {
    if (!form.nombre.trim() || !form.precio) { setError("Nombre y precio son obligatorios."); return; }
    setSaving(true);
    setError("");

    let otrasOpciones: any[] = [];
    try { otrasOpciones = JSON.parse(form.otrasOpciones || "[]"); } catch {}

    const precio = Number(form.precio);
    const precioEfectivo = form.precioEfectivo ? Number(form.precioEfectivo) : Math.round(precio * 0.75);
    const especificaciones: Record<string, string> = {};
    if (form.alto.trim()) especificaciones["alto"] = form.alto.trim();
    if (form.ancho.trim()) especificaciones["ancho"] = form.ancho.trim();
    if (form.largo.trim()) especificaciones["largo"] = form.largo.trim();
    if (form.peso.trim()) especificaciones["peso"] = form.peso.trim();

    const accesorios = form.accesorios
      .filter((a) => a.nombre.trim() && a.precio)
      .map((a) => {
        const p = Number(a.precio);
        const pef = a.precioEfectivo ? Number(a.precioEfectivo) : Math.round(p * 0.75);
        return { id: a.id || a.nombre.toLowerCase().replace(/\s+/g, "-"), nombre: a.nombre.trim(), precio: p, precioEfectivo: pef };
      });

    const body = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim(),
      precio,
      precioEfectivo,
      categoria: form.categoria,
      categoriaId: form.categoria,
      stock: Number(form.stock) || 0,
      imagenes: existingImages,
      opciones: buildOpciones(form.colores, otrasOpciones),
      accesorios,
      especificaciones,
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#2C1A10]">Productos</h1>
          <p className="text-sm text-gray-500">{productos.length} productos en total</p>
        </div>
        <button onClick={openCreate} className="bg-[#2C1A10] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#A0724A] transition-colors">
          + Nuevo producto
        </button>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className={inputCls} />
      </div>

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
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-[#F7F3EE] text-[#A0724A] px-2 py-1 rounded-full font-medium">{catLabel(p.categoria)}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[#2C1A10]">${p.precio?.toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3 text-right font-medium text-green-700">${(p.precioEfectivo ?? Math.round(p.precio * 0.75)).toLocaleString("es-AR")}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${(p.stock ?? 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                        {p.stock ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => openEdit(p)} className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:border-[#C9A87C] hover:text-[#2C1A10] transition-colors">Editar</button>
                        <button onClick={() => setDeleteId(p.id)} className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors">Eliminar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#2C1A10] text-lg">{editing ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Nombre */}
              <div>
                <label className={labelCls}>Nombre *</label>
                <input ref={firstInput} type="text" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} className={inputCls} placeholder="Sofá Chesterfield 3 cuerpos" />
              </div>

              {/* Descripción */}
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => set("descripcion", e.target.value)} className={inputCls + " resize-none"} rows={3} placeholder="Descripción del producto..." />
              </div>

              {/* Categoría + Stock */}
              <div className="grid grid-cols-2 gap-4">
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
              </div>

              {/* Precios */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Precio cuotas *</label>
                  <input type="number" min="0" value={form.precio} onChange={(e) => set("precio", e.target.value)} className={inputCls} placeholder="150000" />
                </div>
                <div>
                  <label className={labelCls}>Precio efectivo <span className="normal-case text-gray-400 font-normal">(vacío = 75% auto)</span></label>
                  <input type="number" min="0" value={form.precioEfectivo} onChange={(e) => set("precioEfectivo", e.target.value)} className={inputCls} placeholder={form.precio ? String(Math.round(Number(form.precio) * 0.75)) : "Auto"} />
                </div>
              </div>

              {/* Dimensiones + Peso */}
              <div>
                <label className={labelCls}>Dimensiones y peso <span className="normal-case text-gray-400 font-normal">(para cotización de envíos)</span></label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Alto (cm)</label>
                    <input type="number" min="0" step="0.1" value={form.alto} onChange={(e) => set("alto", e.target.value)} className={inputCls} placeholder="45" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Ancho (cm)</label>
                    <input type="number" min="0" step="0.1" value={form.ancho} onChange={(e) => set("ancho", e.target.value)} className={inputCls} placeholder="80" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Largo (cm)</label>
                    <input type="number" min="0" step="0.1" value={form.largo} onChange={(e) => set("largo", e.target.value)} className={inputCls} placeholder="120" />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-400 mb-1">Peso (kg)</label>
                    <input type="number" min="0" step="0.1" value={form.peso} onChange={(e) => set("peso", e.target.value)} className={inputCls} placeholder="15" />
                  </div>
                </div>
              </div>

              {/* Colores */}
              <div>
                <label className={labelCls}>Colores disponibles</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newColorInput}
                    onChange={(e) => setNewColorInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addColor(); } }}
                    className={inputCls}
                    placeholder="Ej: Yute, Negro, Blanco..."
                  />
                  <button type="button" onClick={addColor} className="px-3 py-2 text-sm rounded-lg bg-[#F7F3EE] text-[#2C1A10] font-medium hover:bg-[#E0D4C4] transition-colors shrink-0">
                    Agregar
                  </button>
                </div>
                {form.colores.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.colores.map((c) => (
                      <span key={c} className="inline-flex items-center gap-1 bg-[#F7F3EE] text-[#2C1A10] text-xs px-2.5 py-1 rounded-full font-medium">
                        {c}
                        <button type="button" onClick={() => removeColor(c)} className="text-gray-400 hover:text-red-500 ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Imágenes */}
              <div>
                <label className={labelCls}>Imágenes</label>
                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {existingImages.map((url, idx) => (
                      <div key={idx} className="relative group">
                        <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5 rounded-b-lg">Principal</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {/* Upload button */}
                <div
                  className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:border-[#C9A87C] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <p className="text-sm text-gray-400">Subiendo...</p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-500">Hacé click o arrastrá imágenes aquí</p>
                      <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP · Podés subir varias a la vez</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.length) uploadFiles(e.target.files); e.target.value = ""; }}
                />
              </div>

              {/* Accesorios */}
              <div>
                <label className={labelCls}>Accesorios opcionales <span className="normal-case text-gray-400 font-normal">(el cliente puede sumarlos al comprar)</span></label>
                {form.accesorios.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {form.accesorios.map((acc, idx) => (
                      <div key={idx} className="bg-[#F7F3EE] rounded-lg px-3 py-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={acc.nombre}
                            onChange={(e) => { const u = [...form.accesorios]; u[idx] = { ...u[idx], nombre: e.target.value }; set("accesorios", u); }}
                            className="flex-1 bg-transparent text-sm text-[#2C1A10] font-medium focus:outline-none"
                            placeholder="Nombre del accesorio"
                          />
                          <button type="button" onClick={() => set("accesorios", form.accesorios.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-500 text-lg leading-none">×</button>
                        </div>
                        <div className="flex gap-3">
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-[10px] text-gray-500 font-semibold uppercase shrink-0">Lista $</span>
                            <input
                              type="number"
                              value={acc.precio}
                              onChange={(e) => { const u = [...form.accesorios]; u[idx] = { ...u[idx], precio: e.target.value }; set("accesorios", u); }}
                              className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-[#2C1A10] focus:outline-none focus:border-[#C9A87C]"
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-[10px] text-gray-500 font-semibold uppercase shrink-0">Ef. $</span>
                            <input
                              type="number"
                              value={acc.precioEfectivo}
                              onChange={(e) => { const u = [...form.accesorios]; u[idx] = { ...u[idx], precioEfectivo: e.target.value }; set("accesorios", u); }}
                              className="flex-1 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-green-700 focus:outline-none focus:border-[#C9A87C]"
                              placeholder={acc.precio ? String(Math.round(Number(acc.precio) * 0.75)) : "Auto 75%"}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newAccNombre}
                    onChange={(e) => setNewAccNombre(e.target.value)}
                    className={inputCls}
                    placeholder="Nombre del accesorio (ej: Juego 6 sillas)"
                  />
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 font-semibold uppercase mb-1">Precio lista $</label>
                      <input
                        type="number"
                        value={newAccPrecio}
                        onChange={(e) => setNewAccPrecio(e.target.value)}
                        className={inputCls}
                        placeholder="0"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] text-gray-500 font-semibold uppercase mb-1">Precio efectivo $ <span className="normal-case font-normal text-gray-400">(vacío = 75%)</span></label>
                      <input
                        type="number"
                        value={newAccPrecioEf}
                        onChange={(e) => setNewAccPrecioEf(e.target.value)}
                        className={inputCls}
                        placeholder={newAccPrecio ? String(Math.round(Number(newAccPrecio) * 0.75)) : "Auto"}
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => {
                          if (!newAccNombre.trim() || !newAccPrecio) return;
                          set("accesorios", [...form.accesorios, { id: "", nombre: newAccNombre.trim(), precio: newAccPrecio, precioEfectivo: newAccPrecioEf }]);
                          setNewAccNombre(""); setNewAccPrecio(""); setNewAccPrecioEf("");
                        }}
                        className="px-3 py-2 text-sm rounded-lg bg-[#F7F3EE] text-[#2C1A10] font-medium hover:bg-[#E0D4C4] transition-colors whitespace-nowrap"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Otras opciones (JSON avanzado) */}
              <div>
                <label className={labelCls}>Otras opciones / variantes <span className="normal-case text-gray-400 font-normal">(JSON — avanzado)</span></label>
                <textarea value={form.otrasOpciones} onChange={(e) => set("otrasOpciones", e.target.value)} className={inputCls + " resize-none font-mono text-xs"} rows={4} placeholder='[]' />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setModal(false)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={save} disabled={saving || uploading} className="px-5 py-2 text-sm rounded-lg bg-[#2C1A10] text-white font-semibold hover:bg-[#A0724A] transition-colors disabled:opacity-50">
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
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={confirmDelete} className="px-5 py-2 text-sm rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
