"use client";
import { useCart, cartItemKey } from "@/components/shop/CartProvider";
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

  function getAccesoriosPrecio(item: typeof items[0], p: any, tipo: "lista" | "efectivo"): number {
    if (!item.accesoriosSeleccionados?.length || !p?.accesorios) return 0;
    return item.accesoriosSeleccionados.reduce((sum: number, id: string) => {
      const acc = p.accesorios.find((a: any) => a.id === id);
      if (!acc) return sum;
      return sum + (tipo === "efectivo" ? (acc.precioEfectivo ?? Math.round(acc.precio * 0.75)) : acc.precio);
    }, 0);
  }

  const UMBRAL_ENVIO_GRATIS = 299000;

  const totalEfectivo = items.reduce((sum, item) => {
    const p = productos[item.productoId];
    if (!p) return sum;
    const base = (p.precioEfectivo ?? Math.round(p.precio * 0.75));
    return sum + (base + getAccesoriosPrecio(item, p, "efectivo")) * item.cantidad;
  }, 0);

  const totalLista = items.reduce((sum, item) => {
    const p = productos[item.productoId];
    if (!p) return sum;
    return sum + (p.precio + getAccesoriosPrecio(item, p, "lista")) * item.cantidad;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="text-7xl mb-6">🛒</div>
        <h1 className="text-2xl font-bold text-[#2C1A10] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Tu carrito está vacío
        </h1>
        <p className="text-[#A0724A] mb-8">Explorá nuestros productos y encontrá lo que tu hogar necesita.</p>
        <Link href="/productos" className="inline-block bg-[#2C1A10] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#A0724A] transition-all">
          Ver productos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 md:py-10">
      <div className="mb-8">
        <Link href="/productos" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors">
          ← Seguir comprando
        </Link>
        <h1 className="text-3xl font-bold text-[#2C1A10] mt-3" style={{ fontFamily: "'Playfair Display', serif" }}>
          Carrito
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {/* Banner envío gratis */}
          {totalEfectivo >= UMBRAL_ENVIO_GRATIS ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-3 flex items-center gap-3">
              <span className="text-lg">✅</span>
              <p className="text-sm font-semibold text-green-700">¡Envío gratis aplicado! Tu compra supera los $299.000.</p>
            </div>
          ) : (
            <div className="bg-[#F7F3EE] border border-[#E0D4C4] rounded-2xl px-4 py-3">
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-xs text-[#3D2B1F]">
                  Te faltan <span className="font-bold text-[#2C1A10]">${(UMBRAL_ENVIO_GRATIS - totalEfectivo).toLocaleString("es-AR")}</span> para el <span className="font-bold text-green-700">envío gratis</span>
                </p>
                <p className="text-xs text-[#A0724A]">${UMBRAL_ENVIO_GRATIS.toLocaleString("es-AR")}</p>
              </div>
              <div className="w-full bg-[#E0D4C4] rounded-full h-1.5">
                <div
                  className="bg-green-500 h-1.5 rounded-full transition-all"
                  style={{ width: `${Math.min((totalEfectivo / UMBRAL_ENVIO_GRATIS) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {items.map((item) => {
            const key = cartItemKey(item);
            const p = productos[item.productoId];
            const baseEf = p ? (p.precioEfectivo ?? Math.round(p.precio * 0.75)) : 0;
            const accEf = getAccesoriosPrecio(item, p, "efectivo");
            const accLista = getAccesoriosPrecio(item, p, "lista");
            const precioEfectivo = baseEf + accEf;
            const precioLista = (p?.precio ?? 0) + accLista;

            const accesoriosNombres = item.accesoriosSeleccionados?.map(
              (id) => p?.accesorios?.find((a: any) => a.id === id)?.nombre
            ).filter(Boolean) ?? [];

            return (
              <div key={key} className="bg-white rounded-2xl border border-[#E0D4C4] p-3 sm:p-4 flex gap-3 sm:gap-4 items-start">
                {p?.imagenes?.[0] ? (
                  <img src={p.imagenes[0]} alt={p.nombre} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl shrink-0" />
                ) : (
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#EFEBE3] rounded-xl shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#C9A87C] font-semibold uppercase tracking-wide mb-1">{p?.categoria ?? ""}</p>
                  <h3 className="font-bold text-[#2C1A10] text-sm leading-snug mb-1">{p?.nombre ?? item.productoId}</h3>

                  {/* Opciones seleccionadas (color, variante, etc.) */}
                  {item.opcionesSeleccionadas?.length > 0 && p?.opciones && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.opcionesSeleccionadas.map((sel) => {
                        const opcion = p.opciones.find((o: any) => o.id === sel.opcionId);
                        const itemOp = opcion?.items.find((it: any) => it.id === sel.itemSeleccionadoId);
                        if (!opcion || !itemOp) return null;
                        return (
                          <span key={sel.opcionId} className="inline-flex items-center gap-1 bg-[#F7F3EE] border border-[#E0D4C4] rounded-full px-2 py-0.5 text-[11px] text-[#3D2B1F]">
                            <span className="text-[#A0724A] font-medium">{opcion.nombre}:</span>
                            <span>{itemOp.nombre}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Desglose de precios */}
                  <div className="space-y-1 mb-3">
                    {/* Producto base */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#A0724A]">Producto</span>
                      <div className="flex gap-2 text-right">
                        <span className="text-[#2C1A10] font-medium">${(p?.precio ?? 0).toLocaleString("es-AR")} <span className="text-[#A0724A] font-normal">lista</span></span>
                        <span className="text-green-700 font-medium">${(p?.precioEfectivo ?? Math.round((p?.precio ?? 0) * 0.75)).toLocaleString("es-AR")} <span className="font-normal">ef.</span></span>
                      </div>
                    </div>
                    {/* Cada accesorio */}
                    {(item.accesoriosSeleccionados ?? []).map((id) => {
                      const acc = p?.accesorios?.find((a: any) => a.id === id);
                      if (!acc) return null;
                      const ef = acc.precioEfectivo ?? Math.round(acc.precio * 0.75);
                      return (
                        <div key={id} className="flex items-center justify-between text-xs">
                          <span className="text-[#A0724A]">+ {acc.nombre}</span>
                          <div className="flex gap-2 text-right">
                            <span className="text-[#2C1A10] font-medium">${acc.precio.toLocaleString("es-AR")} <span className="text-[#A0724A] font-normal">lista</span></span>
                            <span className="text-green-700 font-medium">${ef.toLocaleString("es-AR")} <span className="font-normal">ef.</span></span>
                          </div>
                        </div>
                      );
                    })}
                    {/* Total del ítem si hay accesorios */}
                    {(item.accesoriosSeleccionados?.length ?? 0) > 0 && (
                      <div className="flex items-center justify-between text-xs border-t border-[#E0D4C4] pt-1 mt-1">
                        <span className="font-semibold text-[#2C1A10]">Subtotal</span>
                        <div className="flex gap-2 text-right">
                          <span className="text-[#2C1A10] font-bold">${precioLista.toLocaleString("es-AR")} <span className="font-normal text-[#A0724A]">lista</span></span>
                          <span className="text-green-700 font-bold">${precioEfectivo.toLocaleString("es-AR")} <span className="font-normal">ef.</span></span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#E0D4C4] rounded-full overflow-hidden">
                      <button onClick={() => updateCantidad(key, item.cantidad - 1)} className="px-3 py-1 text-[#2C1A10] hover:bg-[#F7F3EE] transition-colors text-lg leading-none">−</button>
                      <span className="px-3 py-1 text-sm font-semibold text-[#2C1A10] min-w-[2rem] text-center">{item.cantidad}</span>
                      <button onClick={() => updateCantidad(key, item.cantidad + 1)} className="px-3 py-1 text-[#2C1A10] hover:bg-[#F7F3EE] transition-colors text-lg leading-none">+</button>
                    </div>
                    <button onClick={() => remove(key)} className="text-xs text-[#A0724A] hover:text-red-500 transition-colors">Eliminar</button>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <p className="text-green-700 font-bold text-base">${(precioEfectivo * item.cantidad).toLocaleString("es-AR")}</p>
                  <p className="text-xs text-[#A0724A]">efectivo</p>
                  {p && (
                    <>
                      <p className="text-[#2C1A10] font-semibold text-sm mt-1">${(precioLista * item.cantidad).toLocaleString("es-AR")}</p>
                      <p className="text-xs text-[#A0724A]">cuotas</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#E0D4C4] p-6 sticky top-20 md:top-32">
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
            <Link href="/checkout" className="block w-full text-center bg-[#2C1A10] text-white py-3.5 rounded-full font-semibold hover:bg-[#A0724A] transition-all mb-3">
              Continuar con la compra →
            </Link>
            <a
              href={`https://wa.me/5491126917777?text=${encodeURIComponent(
                "Hola! Quiero hacer un pedido:\n" +
                items.map((i) => {
                  const p = productos[i.productoId];
                  const accs = i.accesoriosSeleccionados?.map((id) => p?.accesorios?.find((a: any) => a.id === id)?.nombre).filter(Boolean).join(", ");
                  return `- ${p?.nombre ?? i.productoId} x${i.cantidad}${accs ? ` (+ ${accs})` : ""}`;
                }).join("\n")
              )}`}
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
