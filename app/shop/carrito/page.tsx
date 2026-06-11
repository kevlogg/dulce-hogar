"use client";
import { useCart } from "@/components/shop/CartProvider";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CarritoPage() {
  const { items, remove, updateCantidad } = useCart();
  const [mounted, setMounted] = useState(false);
  const [productos, setProductos] = useState<Record<string, any>>({});

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || items.length === 0) return;
    const ids = items.map((i) => i.productoId).filter((id) => !productos[id]);
    if (ids.length === 0) return;
    Promise.all(ids.map((id) => fetch(`/api/productos/${id}`).then((r) => (r.ok ? r.json() : null)))).then(
      (results) => {
        const map: Record<string, any> = {};
        results.forEach((p, i) => { if (p) map[ids[i]] = p; });
        setProductos((prev) => ({ ...prev, ...map }));
      }
    );
  }, [mounted, items]);

  if (!mounted) return null;

  const totalEfectivo = items.reduce((sum, item) => {
    const p = productos[item.productoId];
    return sum + (p ? (p.precioEfectivo ?? Math.round(p.precio * 0.75)) * item.cantidad : 0);
  }, 0);
  const totalLista = items.reduce((sum, item) => {
    const p = productos[item.productoId];
    return sum + (p ? p.precio * item.cantidad : 0);
  }, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-7xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-[#2C1A10] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Tu carrito está vacío
        </h1>
        <p className="text-[#A0724A] mb-8">Explorá nuestros productos y encontrá lo que tu hogar necesita.</p>
        <Link href="/shop/productos" className="inline-block bg-[#2C1A10] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#A0724A] transition-all">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <Link href="/shop/productos" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors">
          ← Seguir comprando
        </Link>
        <h1 className="text-3xl font-bold text-[#2C1A10] mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Carrito
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const p = productos[item.productoId];
            const precioEfectivo = p ? (p.precioEfectivo ?? Math.round(p.precio * 0.75)) : 0;
            return (
              <div key={item.productoId} className="bg-white rounded-2xl border border-[#E0D4C4] p-4 flex gap-4 items-center">
                {p?.imagenes?.[0] ? (
                  <img src={p.imagenes[0]} alt={p.nombre} className="w-24 h-24 object-cover rounded-xl shrink-0" />
                ) : (
                  <div className="w-24 h-24 bg-[#EFEBE3] rounded-xl shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#C9A87C] font-semibold uppercase tracking-wide mb-1">{p?.categoria ?? ""}</p>
                  <h3 className="font-bold text-[#2C1A10] text-sm leading-snug line-clamp-2 mb-2">{p?.nombre ?? item.productoId}</h3>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#E0D4C4] rounded-full overflow-hidden">
                      <button
                        onClick={() => updateCantidad(item.productoId, item.cantidad - 1)}
                        className="px-3 py-1 text-[#2C1A10] hover:bg-[#F7F3EE] transition-colors text-lg leading-none"
                      >
                        −
                      </button>
                      <span className="px-3 py-1 text-sm font-semibold text-[#2C1A10] min-w-[2rem] text-center">{item.cantidad}</span>
                      <button
                        onClick={() => updateCantidad(item.productoId, item.cantidad + 1)}
                        className="px-3 py-1 text-[#2C1A10] hover:bg-[#F7F3EE] transition-colors text-lg leading-none"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => remove(item.productoId)} className="text-xs text-[#A0724A] hover:text-red-500 transition-colors">
                      Eliminar
                    </button>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-green-700 font-bold text-base">${(precioEfectivo * item.cantidad).toLocaleString("es-AR")}</p>
                  <p className="text-xs text-[#A0724A]">efectivo</p>
                  {p && (
                    <>
                      <p className="text-[#2C1A10] font-semibold text-sm mt-1">${(p.precio * item.cantidad).toLocaleString("es-AR")}</p>
                      <p className="text-xs text-[#A0724A]">cuotas</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#E0D4C4] p-6 sticky top-32">
            <h2 className="font-bold text-[#2C1A10] text-lg mb-5" style={{ fontFamily: "'Playfair Display', serif" }}>
              Resumen del pedido
            </h2>
            <div className="space-y-3 mb-5">
              <div className="flex justify-between text-sm">
                <span className="text-[#A0724A]">Subtotal cuotas</span>
                <span className="text-[#2C1A10] font-semibold">${totalLista.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A0724A]">Subtotal efectivo</span>
                <span className="text-green-700 font-semibold">${totalEfectivo.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#A0724A]">Envío</span>
                <span className="text-[#2C1A10]">A calcular</span>
              </div>
            </div>
            <div className="border-t border-[#E0D4C4] pt-4 mb-6">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-[#2C1A10]">Total efectivo</span>
                <span className="text-green-700 font-bold text-xl">${totalEfectivo.toLocaleString("es-AR")}</span>
              </div>
              <p className="text-xs text-[#A0724A]">25% de descuento pagando en efectivo / transferencia</p>
            </div>
            <Link
              href="/shop/checkout"
              className="block w-full text-center bg-[#2C1A10] text-white py-3.5 rounded-full font-semibold hover:bg-[#A0724A] transition-all mb-3"
            >
              Continuar con la compra →
            </Link>
            <a
              href={`https://wa.me/5491126917777?text=${encodeURIComponent("Hola! Quiero hacer un pedido:\n" + items.map(i => `- ${productos[i.productoId]?.nombre ?? i.productoId} x${i.cantidad}`).join("\n"))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center border-2 border-[#25D366] text-[#25D366] py-3 rounded-full font-semibold hover:bg-[#25D366] hover:text-white transition-all text-sm"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
