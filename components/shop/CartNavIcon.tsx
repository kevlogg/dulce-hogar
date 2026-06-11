"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";

export function CartNavIcon() {
  const { items } = useCart();
  const [open, setOpen] = useState(false);
  const [productos, setProductos] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const totalItems = items.reduce((s, i) => s + i.cantidad, 0);

  useEffect(() => {
    if (!open || items.length === 0) return;
    const ids = items.map((i) => i.productoId).filter((id) => !productos[id]);
    if (ids.length === 0) return;
    setLoading(true);
    Promise.all(ids.map((id) => fetch(`/api/productos/${id}`).then((r) => (r.ok ? r.json() : null))))
      .then((results) => {
        const map: Record<string, any> = {};
        results.forEach((p, i) => { if (p) map[ids[i]] = p; });
        setProductos((prev) => ({ ...prev, ...map }));
      })
      .finally(() => setLoading(false));
  }, [open, items]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const total = items.reduce((sum, item) => {
    const p = productos[item.productoId];
    if (!p) return sum;
    return sum + (p.precioEfectivo ?? Math.round(p.precio * 0.75)) * item.cantidad;
  }, 0);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/shop/carrito"
        className="relative text-[#2C1A10] hover:text-[#C9A87C] transition-colors shrink-0 block p-1"
        aria-label="Carrito"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
        {totalItems > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-[#C9A87C] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center leading-none">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </Link>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white rounded-2xl shadow-2xl border border-[#E0D4C4] z-50 overflow-hidden">
          {items.length === 0 ? (
            <div className="p-6 text-center text-[#A0724A] text-sm">El carrito está vacío</div>
          ) : (
            <>
              <div className="p-4 border-b border-[#F0E8DC]">
                <p className="text-xs font-semibold text-[#A0724A] uppercase tracking-wide">
                  {totalItems} {totalItems === 1 ? "producto" : "productos"}
                </p>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-[#F0E8DC]">
                {loading && items.every((i) => !productos[i.productoId]) ? (
                  <div className="p-6 text-center text-sm text-[#A0724A]">Cargando...</div>
                ) : (
                  items.map((item) => {
                    const p = productos[item.productoId];
                    return (
                      <div key={item.productoId} className="flex gap-3 p-3 items-center">
                        {p?.imagenes?.[0] ? (
                          <img src={p.imagenes[0]} alt={p.nombre} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                        ) : (
                          <div className="w-14 h-14 bg-[#EFEBE3] rounded-lg shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#2C1A10] line-clamp-2 leading-tight">
                            {p?.nombre ?? item.productoId}
                          </p>
                          <p className="text-xs text-[#A0724A] mt-0.5">x{item.cantidad}</p>
                        </div>
                        <p className="text-sm font-bold text-[#2C1A10] shrink-0">
                          {p ? `$${((p.precioEfectivo ?? Math.round(p.precio * 0.75)) * item.cantidad).toLocaleString("es-AR")}` : "..."}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-4 border-t border-[#E0D4C4] bg-[#FAF7F3]">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm text-[#A0724A]">Total efectivo</span>
                  <span className="font-bold text-[#2C1A10] text-base">${total.toLocaleString("es-AR")}</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href="/shop/carrito"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center text-sm border border-[#2C1A10] text-[#2C1A10] py-2 rounded-full hover:bg-[#2C1A10] hover:text-white transition-all"
                  >
                    Ver carrito
                  </Link>
                  <Link
                    href="/shop/checkout"
                    onClick={() => setOpen(false)}
                    className="flex-1 text-center text-sm bg-[#2C1A10] text-white py-2 rounded-full hover:bg-[#A0724A] transition-all"
                  >
                    Comprar
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
