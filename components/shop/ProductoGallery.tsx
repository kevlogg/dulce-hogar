"use client";

import { useState, useEffect } from "react";

interface Props {
  imagenes: string[];
  nombre: string;
  activeIndex?: number;
}

export function ProductoGallery({ imagenes, nombre, activeIndex }: Props) {
  const [selected, setSelected] = useState(0);

  // Sync to external activeIndex when it changes (color selection)
  useEffect(() => {
    if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < imagenes.length) {
      setSelected(activeIndex);
    }
  }, [activeIndex, imagenes.length]);

  if (imagenes.length === 0) {
    return (
      <div className="w-full aspect-square bg-[#EFEBE3] rounded-2xl flex items-center justify-center">
        <span className="text-6xl">🛋️</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-[4/3] max-h-[480px] bg-[#EFEBE3] rounded-2xl overflow-hidden">
        <img
          src={imagenes[selected]}
          alt={nombre}
          className="w-full h-full object-cover transition-all duration-300"
        />
        {imagenes.length > 1 && (
          <>
            <button
              onClick={() => setSelected((s) => (s - 1 + imagenes.length) % imagenes.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow transition-all"
            >
              ‹
            </button>
            <button
              onClick={() => setSelected((s) => (s + 1) % imagenes.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow transition-all"
            >
              ›
            </button>
          </>
        )}
        <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
          {selected + 1} / {imagenes.length}
        </div>
      </div>

      {imagenes.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {imagenes.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                i === selected ? "border-[#C9A87C] shadow-md" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img src={img} alt={`${nombre} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
