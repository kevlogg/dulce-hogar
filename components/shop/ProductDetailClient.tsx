"use client";

import { useState } from "react";
import Link from "next/link";
import { ProductoGallery } from "./ProductoGallery";
import { AddToCartButton } from "./AddToCartButton";
import { Producto } from "@/lib/types";

const CATEGORIA_LABELS: Record<string, string> = {
  MUEBLES: "Muebles",
  TEXTILES: "Textiles",
  EXTERIOR: "Exterior",
  ESPEJOS: "Espejos",
  DECO: "Decoración",
  ILUMINACION: "Iluminación",
};

interface Props {
  producto: Producto;
  relacionados: any[];
  whatsappMsg: string;
}

export function ProductDetailClient({ producto, relacionados, whatsappMsg }: Props) {
  const [activeImageIdx, setActiveImageIdx] = useState<number | undefined>(undefined);

  const precioEfectivo = producto.precioEfectivo ?? Math.round(producto.precio * 0.75);
  const PROMO_MUNDIAL = ["mesa + 4 sillas tulum", "mesa comedor", "mecedora viral", "hamaca jamaica"];
  const mundial = PROMO_MUNDIAL.some((n) => producto.nombre.toLowerCase().includes(n.toLowerCase()));

  return (
    <>
      {/* Two-column main section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
        {/* Left: gallery */}
        <ProductoGallery
          imagenes={producto.imagenes ?? []}
          nombre={producto.nombre}
          activeIndex={activeImageIdx}
        />

        {/* Right: product info + options */}
        <div className="flex flex-col">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-[#C9A87C] mb-3">
            {CATEGORIA_LABELS[producto.categoria] ?? producto.categoria}
          </span>

          <h1
            className="text-xl md:text-2xl font-bold text-[#2C1A10] mb-3 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {producto.nombre}
          </h1>

          {mundial && (
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-2 rounded-full overflow-hidden w-24">
                <div className="flex-1 bg-[#74AADB]" />
                <div className="flex-1 bg-white border-y border-[#74AADB]" />
                <div className="flex-1 bg-[#74AADB]" />
              </div>
              <span className="text-xs font-bold text-[#74AADB] tracking-wide uppercase">🇦🇷 Promo Mundial</span>
            </div>
          )}

          <div className="flex items-baseline gap-4 mb-4">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-[#2C1A10]">
                ${producto.precio?.toLocaleString("es-AR")}
              </p>
              <p className="text-xs text-[#A0724A] mt-0.5">precio cuotas</p>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className={`text-xl md:text-2xl font-bold ${mundial ? "text-[#003DA5]" : "text-green-700"}`}>
                  ${precioEfectivo.toLocaleString("es-AR")}
                </p>
                {mundial ? (
                  <span className="bg-[#74AADB] text-white font-bold px-2 py-0.5 rounded text-xs">30% OFF</span>
                ) : (
                  <span className="bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded text-xs">25% OFF</span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${mundial ? "text-[#74AADB]" : "text-green-600"}`}>efectivo / transferencia</p>
            </div>
          </div>

          {/* Promos */}
          <div className="bg-[#F7F3EE] rounded-xl p-3 mb-4 space-y-1.5 border border-[#E0D4C4]">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#3D2B1F]">💸 25% de descuento pagando en efectivo / transferencia</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#3D2B1F]">
              <span>💳</span>
              <span>3 y 6 cuotas fijas sin interés</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#3D2B1F]">
              <span>🚚</span>
              <span>Flete GBA/CABA · Vía Cargo y Andreani a todo el país</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-green-700 border-t border-[#E0D4C4] pt-1.5">
              <span>✅</span>
              <span>Envío gratis en compras superiores a $299.000</span>
            </div>
          </div>

          {producto.descripcion && (
            <p className="text-[#3D2B1F] leading-relaxed mb-4 text-sm">{producto.descripcion}</p>
          )}

          {producto.id === "zD0UV9Xa7V5LgpvJgFvd" && (
            <div className="bg-[#EEF6FF] border border-[#74AADB] rounded-xl px-4 py-3 mb-4 text-sm text-[#003DA5] font-semibold flex items-center gap-2">
              🇦🇷 Envío gratis — Promo Mundial hasta el 20 de junio
            </div>
          )}

          <div className="flex flex-col gap-3 mt-auto">
            <AddToCartButton
              producto={producto}
              onColorImageIdx={setActiveImageIdx}
            />

            <a
              href={`https://wa.me/5491126917777?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#25D366] text-white py-3.5 rounded-full font-semibold hover:bg-[#1ead54] transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Consultar por WhatsApp
            </a>

            <Link
              href="/productos"
              className="text-center text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors py-2"
            >
              ← Volver al catálogo
            </Link>

            {producto.stock === 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                Este producto tiene un tiempo de preparación estimado de 7 a 14 días hábiles. Siempre intentamos hacerlo en el menor tiempo posible para que lo recibas cuanto antes.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related */}
      {relacionados.length > 0 && (
        <section className="border-t border-[#E0D4C4] pt-12">
          <h2
            className="text-2xl font-bold text-[#2C1A10] mb-6"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            También te puede interesar
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {relacionados.map((p: any) => (
              <Link key={p.id} href={`/productos/${p.id}`}>
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden group border border-[#E0D4C4]">
                  {p.imagenes?.[0] ? (
                    <div className="h-40 overflow-hidden">
                      <img
                        src={p.imagenes[0]}
                        alt={p.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-40 bg-[#EFEBE3]" />
                  )}
                  <div className="p-3">
                    <p className="text-xs font-semibold text-[#2C1A10] line-clamp-2 mb-1">{p.nombre}</p>
                    <div className="flex flex-col">
                      <p className="text-[#2C1A10] font-bold text-sm">${p.precio?.toLocaleString("es-AR")}</p>
                      <p className="text-green-700 text-xs">${(p.precioEfectivo ?? Math.round(p.precio * 0.75)).toLocaleString("es-AR")} efectivo</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
