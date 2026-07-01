"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Producto } from "@/lib/types";

const CATEGORIAS = [
  { key: "TODOS", label: "Todos" },
  { key: "MUEBLES", label: "Muebles" },
  { key: "TEXTILES", label: "Textiles" },
  { key: "EXTERIOR", label: "Exterior" },
  { key: "ESPEJOS", label: "Espejos" },
  { key: "DECO", label: "Decoración" },
  { key: "ILUMINACION", label: "Iluminación" },
];

const COLOR_MAP: Record<string, string> = {
  negro: "#1C1C1C",
  marron: "#7B4219",
  marrón: "#7B4219",
  beige: "#E8D9C0",
  blanco: "#F8F8F5",
  gris: "#9E9E9E",
  natural: "#C8A96E",
  terracota: "#C07B54",
  yute: "#C8A96E",
  dorado: "#D4AF37",
  rosa: "#E8A4B0",
  "verde oscuro": "#2D5016",
  "verde oliva": "#6B7C3E",
  tramado: "#A0896B",
  encerada: "#8B6F47",
  "gris con lineas blancas": "#A0A0A0",
  "natural con marron": "#B89060",
};

function getColorHex(nombre: string): string | null {
  return COLOR_MAP[nombre.toLowerCase().trim()] ?? null;
}

function sinTildes(str: string) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function CardImage({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const [idx, setIdx] = useState(0);
  const [hovered, setHovered] = useState(false);

  if (!imagenes?.length) {
    return (
      <div className="h-64 bg-[#EFEBE3] flex items-center justify-center">
        <span className="text-4xl">🛋️</span>
      </div>
    );
  }

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i - 1 + imagenes.length) % imagenes.length);
  };
  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + 1) % imagenes.length);
  };

  return (
    <div
      className="h-64 relative overflow-hidden"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={imagenes[idx]}
        alt={nombre}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {imagenes.length > 1 && hovered && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#2C1A10] w-7 h-7 rounded-full flex items-center justify-center shadow text-sm font-bold transition-all"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-[#2C1A10] w-7 h-7 rounded-full flex items-center justify-center shadow text-sm font-bold transition-all"
          >
            ›
          </button>
        </>
      )}

      {imagenes.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
          {imagenes.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all ${i === idx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface Props {
  productos: Producto[];
}

const VALID_CATS = new Set(["MUEBLES", "TEXTILES", "EXTERIOR", "ESPEJOS", "DECO", "ILUMINACION"]);

const PROMO_MUNDIAL = ["mesa + 4 sillas tulum", "mesa comedor", "mecedora viral", "hamaca jamaica"];
const isMundial = (nombre: string) =>
  PROMO_MUNDIAL.some((n) => nombre.toLowerCase().includes(n.toLowerCase()));

export function CatalogoClient({ productos }: Props) {
  const searchParams = useSearchParams();
  const [categoria, setCategoria] = useState(() => {
    const cat = searchParams.get("cat")?.toUpperCase() ?? "";
    return VALID_CATS.has(cat) ? cat : "TODOS";
  });
  const [busqueda, setBusqueda] = useState(() => searchParams.get("q") ?? "");

  const filtrados = useMemo(() => {
    const q = sinTildes(busqueda);
    const lista = productos.filter((p) => {
      const matchCat = categoria === "TODOS" || p.categoria === categoria;
      const matchBusq = q === "" || sinTildes(p.nombre).includes(q);
      return matchCat && matchBusq;
    });
    return lista.sort((a, b) => {
      const aM = isMundial(a.nombre) ? 0 : 1;
      const bM = isMundial(b.nombre) ? 0 : 1;
      return aM - bM;
    });
  }, [productos, categoria, busqueda]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors">
          ← Volver al inicio
        </Link>
        <h1
          className="text-3xl lg:text-4xl font-bold text-[#2C1A10] mt-3 mb-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Catálogo completo
        </h1>
        <p className="text-[#A0724A] text-sm">{filtrados.length} productos encontrados</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A0724A]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-12 pr-10 py-3.5 rounded-full border border-[#E0D4C4] bg-white text-[#2C1A10] placeholder-[#A0724A] focus:outline-none focus:border-[#C9A87C] transition-colors"
        />
        {busqueda && (
          <button
            onClick={() => setBusqueda("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A0724A] hover:text-[#2C1A10]"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap mb-8">
        {CATEGORIAS.map((cat) => {
          const count =
            cat.key === "TODOS"
              ? productos.length
              : productos.filter((p) => p.categoria === cat.key).length;
          return (
            <button
              key={cat.key}
              onClick={() => setCategoria(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                categoria === cat.key
                  ? "bg-[#2C1A10] text-white border-[#2C1A10]"
                  : "bg-white text-[#3D2B1F] border-[#E0D4C4] hover:border-[#C9A87C]"
              }`}
            >
              {cat.label}
              <span className={`ml-1.5 text-xs ${categoria === cat.key ? "opacity-70" : "text-[#A0724A]"}`}>
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {filtrados.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-[#A0724A] text-lg mb-2">No se encontraron productos</p>
          <button
            onClick={() => { setCategoria("TODOS"); setBusqueda(""); }}
            className="text-sm text-[#C9A87C] hover:text-[#2C1A10] underline"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtrados.map((p) => {
            const mundial = isMundial(p.nombre);
            return (
              <Link key={p.id} href={`/productos/${p.id}`} className="group">
                <div className={`bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden ${mundial ? "border-2 border-[#74AADB]" : "border border-[#E0D4C4]"}`}>
                  {/* Franja Argentina al tope de la card */}
                  {mundial && (
                    <div className="flex h-1.5">
                      <div className="flex-1 bg-[#74AADB]" />
                      <div className="flex-1 bg-white border-y border-[#74AADB]" />
                      <div className="flex-1 bg-[#74AADB]" />
                    </div>
                  )}
                  <div className="relative">
                    <CardImage imagenes={p.imagenes} nombre={p.nombre} />
                    {mundial ? (
                      <span className="absolute top-2 left-2 z-10 bg-[#74AADB] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        🇦🇷 PROMO MUNDIAL
                      </span>
                    ) : (
                      <span className="absolute top-2 left-2 z-10 bg-[#E65100] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                        6 cuotas sin interés
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-[#C9A87C]">
                      {CATEGORIAS.find((c) => c.key === p.categoria)?.label ?? p.categoria}
                    </span>
                    <h3 className="font-bold text-[#2C1A10] text-sm mt-1 mb-2 line-clamp-2">{p.nombre}</h3>
                    {(() => {
                      const colorOpcion = p.opciones?.find((o) => o.id === "color");
                      const colores = colorOpcion?.items
                        .map((item) => ({ nombre: item.nombre, hex: getColorHex(item.nombre) }))
                        .filter((c) => c.hex !== null) ?? [];
                      if (!colores.length) return null;
                      return (
                        <div className="flex gap-1 mb-2 flex-wrap">
                          {colores.slice(0, 6).map((c) => (
                            <span
                              key={c.nombre}
                              title={c.nombre}
                              className="w-4 h-4 rounded-full border border-[#D0C4B4] shrink-0"
                              style={{ backgroundColor: c.hex! }}
                            />
                          ))}
                          {colores.length > 6 && (
                            <span className="text-[10px] text-[#A0724A] leading-4">+{colores.length - 6}</span>
                          )}
                        </div>
                      );
                    })()}
                    <div className="space-y-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[#2C1A10] font-bold text-base">${p.precio.toLocaleString("es-AR")}</span>
                        <span className="text-[10px] text-[#A0724A]">cuotas</span>
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={mundial ? "text-[#003DA5] font-bold text-base" : "text-green-700 font-bold text-base"}>
                          ${(p.precioEfectivo ?? Math.round(p.precio * 0.75)).toLocaleString("es-AR")}
                        </span>
                        <span className={mundial ? "text-[10px] text-[#74AADB]" : "text-[10px] text-green-600"}>
                          efectivo / transferencia
                        </span>
                        {mundial ? (
                          <span className="bg-[#74AADB] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">30% OFF</span>
                        ) : (
                          <span className="bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">25% OFF</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
