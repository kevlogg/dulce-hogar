"use client";
import { useCart } from "@/components/shop/CartProvider";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";

const PROVINCIAS = [
  "Buenos Aires", "CABA", "Catamarca", "Chaco", "Chubut", "Córdoba",
  "Corrientes", "Entre Ríos", "Formosa", "Jujuy", "La Pampa", "La Rioja",
  "Mendoza", "Misiones", "Neuquén", "Río Negro", "Salta", "San Juan",
  "San Luis", "Santa Cruz", "Santa Fe", "Santiago del Estero",
  "Tierra del Fuego", "Tucumán",
];

export default function CheckoutPage() {
  const { items, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [productos, setProductos] = useState<Record<string, any>>({});
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "cuotas">("efectivo");
  const [formData, setFormData] = useState({
    nombre: "", apellido: "", email: "", telefono: "",
    calle: "", numero: "", depto: "", ciudad: "", codigoPostal: "", provincia: "",
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || items.length === 0) return;
    const ids = items.map((i) => i.productoId).filter((id) => !productos[id]);
    if (!ids.length) return;
    Promise.all(ids.map((id) => fetch(`/api/productos/${id}`).then((r) => (r.ok ? r.json() : null)))).then(
      (results) => {
        const map: Record<string, any> = {};
        results.forEach((p, i) => { if (p) map[ids[i]] = p; });
        setProductos((prev) => ({ ...prev, ...map }));
      }
    );
  }, [mounted, items]);

  const totalEfectivo = items.reduce((s, i) => {
    const p = productos[i.productoId];
    return s + (p ? (p.precioEfectivo ?? Math.round(p.precio * 0.75)) * i.cantidad : 0);
  }, 0);
  const totalCuotas = items.reduce((s, i) => {
    const p = productos[i.productoId];
    return s + (p ? p.precio * i.cantidad : 0);
  }, 0);
  const total = metodoPago === "efectivo" ? totalEfectivo : totalCuotas;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productoId: i.productoId,
            nombre: productos[i.productoId]?.nombre ?? i.productoId,
            cantidad: i.cantidad,
            precioUnitario: metodoPago === "efectivo"
              ? (productos[i.productoId]?.precioEfectivo ?? Math.round((productos[i.productoId]?.precio ?? 0) * 0.75))
              : (productos[i.productoId]?.precio ?? 0),
            opcionesSeleccionadas: i.opcionesSeleccionadas,
          })),
          clienteInfo: { nombre: formData.nombre, apellido: formData.apellido, email: formData.email, telefono: formData.telefono },
          direccionEnvio: { calle: formData.calle, numero: formData.numero, depto: formData.depto, ciudad: formData.ciudad, codigoPostal: formData.codigoPostal, provincia: formData.provincia },
          montoTotal: total,
          metodoPago,
        }),
      });
      if (res.ok) {
        const { id } = await res.json();
        clear();
        router.push(`/confirmacion?orden=${id}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center">
        <p className="text-[#A0724A] mb-6">No tenés productos en el carrito.</p>
        <Link href="/productos" className="inline-block bg-[#2C1A10] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#A0724A] transition-all">
          Ver productos
        </Link>
      </div>
    );
  }

  const inputClass = "w-full border border-[#E0D4C4] bg-white rounded-xl px-4 py-3 text-[#2C1A10] placeholder-[#B0A090] focus:outline-none focus:border-[#C9A87C] transition-colors text-sm";
  const labelClass = "block text-xs font-semibold text-[#A0724A] uppercase tracking-wide mb-1.5";

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      <div className="mb-8">
        <Link href="/carrito" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors">
          ← Volver al carrito
        </Link>
        <h1 className="text-3xl font-bold text-[#2C1A10] mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Checkout
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          {/* Datos personales */}
          <div className="bg-white rounded-2xl border border-[#E0D4C4] p-6">
            <h2 className="font-bold text-[#2C1A10] text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#2C1A10] text-white rounded-full flex items-center justify-center text-xs">1</span>
              Datos personales
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre</label>
                <input type="text" name="nombre" required placeholder="Florencia" value={formData.nombre} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Apellido</label>
                <input type="text" name="apellido" required placeholder="García" value={formData.apellido} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" name="email" required placeholder="flor@mail.com" value={formData.email} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Teléfono</label>
                <input type="tel" name="telefono" required placeholder="+54 9 11 1234-5678" value={formData.telefono} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-white rounded-2xl border border-[#E0D4C4] p-6">
            <h2 className="font-bold text-[#2C1A10] text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#2C1A10] text-white rounded-full flex items-center justify-center text-xs">2</span>
              Dirección de envío
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Calle</label>
                <input type="text" name="calle" required placeholder="Av. Corrientes" value={formData.calle} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Número</label>
                <input type="text" name="numero" required placeholder="1234" value={formData.numero} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Depto / Piso (opcional)</label>
                <input type="text" name="depto" placeholder="3B" value={formData.depto} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ciudad</label>
                <input type="text" name="ciudad" required placeholder="Buenos Aires" value={formData.ciudad} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Código Postal</label>
                <input type="text" name="codigoPostal" required placeholder="Ej: 1744" value={formData.codigoPostal} onChange={handleChange} className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Provincia</label>
                <select name="provincia" required value={formData.provincia} onChange={handleChange} className={inputClass}>
                  <option value="">Seleccioná una provincia</option>
                  {PROVINCIAS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div className="bg-white rounded-2xl border border-[#E0D4C4] p-6">
            <h2 className="font-bold text-[#2C1A10] text-base mb-5 flex items-center gap-2">
              <span className="w-6 h-6 bg-[#2C1A10] text-white rounded-full flex items-center justify-center text-xs">3</span>
              Método de pago
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMetodoPago("efectivo")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${metodoPago === "efectivo" ? "border-green-500 bg-green-50" : "border-[#E0D4C4] hover:border-[#C9A87C]"}`}
              >
                <p className="font-bold text-[#2C1A10] text-sm mb-1">Efectivo / Transferencia</p>
                <p className="text-xs text-green-700 font-semibold">25% OFF — ${totalEfectivo.toLocaleString("es-AR")}</p>
                <p className="text-xs text-[#A0724A] mt-0.5">Pago al recibir o por transferencia</p>
              </button>
              <button
                type="button"
                onClick={() => setMetodoPago("cuotas")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${metodoPago === "cuotas" ? "border-[#2C1A10] bg-[#FAF7F3]" : "border-[#E0D4C4] hover:border-[#C9A87C]"}`}
              >
                <p className="font-bold text-[#2C1A10] text-sm mb-1">Cuotas fijas</p>
                <p className="text-xs text-[#2C1A10] font-semibold">${totalCuotas.toLocaleString("es-AR")}</p>
                <p className="text-xs text-[#A0724A] mt-0.5">3 y 6 cuotas sin interés</p>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2C1A10] text-white py-4 rounded-full font-bold text-base hover:bg-[#A0724A] transition-all disabled:opacity-50"
          >
            {loading ? "Procesando..." : `Confirmar pedido — $${total.toLocaleString("es-AR")}`}
          </button>
        </form>

        {/* Resumen */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#E0D4C4] p-5 sticky top-20 md:top-32">
            <h2 className="font-bold text-[#2C1A10] mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              Tu pedido
            </h2>
            <div className="space-y-3 mb-4 max-h-72 overflow-y-auto">
              {items.map((item) => {
                const p = productos[item.productoId];
                const precio = metodoPago === "efectivo"
                  ? (p?.precioEfectivo ?? Math.round((p?.precio ?? 0) * 0.75))
                  : (p?.precio ?? 0);
                return (
                  <div key={item.productoId} className="flex gap-2 items-center">
                    {p?.imagenes?.[0] ? (
                      <img src={p.imagenes[0]} alt={p.nombre} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                    ) : (
                      <div className="w-12 h-12 bg-[#EFEBE3] rounded-lg shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#2C1A10] line-clamp-2 leading-tight">{p?.nombre ?? item.productoId}</p>
                      <p className="text-xs text-[#A0724A]">x{item.cantidad}</p>
                    </div>
                    <p className="text-sm font-bold text-[#2C1A10] shrink-0">${(precio * item.cantidad).toLocaleString("es-AR")}</p>
                  </div>
                );
              })}
            </div>
            <div className="border-t border-[#E0D4C4] pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#A0724A]">Subtotal</span>
                <span className="font-semibold text-[#2C1A10]">${total.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A0724A]">Envío</span>
                <span className="text-[#2C1A10]">A calcular</span>
              </div>
              <div className="flex justify-between font-bold text-[#2C1A10] pt-1 border-t border-[#E0D4C4]">
                <span>Total</span>
                <span className={metodoPago === "efectivo" ? "text-green-700" : ""}>${total.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
