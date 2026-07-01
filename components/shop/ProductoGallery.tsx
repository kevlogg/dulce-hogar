"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  imagenes: string[];
  nombre: string;
  activeIndex?: number;
}

export function ProductoGallery({ imagenes, nombre, activeIndex }: Props) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (activeIndex !== undefined && activeIndex >= 0 && activeIndex < imagenes.length) {
      setSelected(activeIndex);
    }
  }, [activeIndex, imagenes.length]);

  const prevZoom = useCallback(() => setSelected((s) => (s - 1 + imagenes.length) % imagenes.length), [imagenes.length]);
  const nextZoom = useCallback(() => setSelected((s) => (s + 1) % imagenes.length), [imagenes.length]);

  useEffect(() => {
    if (!zoom) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowLeft") prevZoom();
      if (e.key === "ArrowRight") nextZoom();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [zoom, prevZoom, nextZoom]);

  if (imagenes.length === 0) {
    return (
      <div className="w-full aspect-square bg-[#EFEBE3] rounded-2xl flex items-center justify-center">
        <span className="text-6xl">🛋️</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <div
          className="relative w-full aspect-[4/3] max-h-[480px] bg-[#EFEBE3] rounded-2xl overflow-hidden cursor-zoom-in group"
          onClick={() => setZoom(true)}
        >
          <img
            src={imagenes[selected]}
            alt={nombre}
            className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
          />
          {imagenes.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected((s) => (s - 1 + imagenes.length) % imagenes.length); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow transition-all"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelected((s) => (s + 1) % imagenes.length); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow transition-all"
              >
                ›
              </button>
            </>
          )}
          <div className="absolute bottom-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
            {selected + 1} / {imagenes.length}
          </div>
          <div className="absolute top-3 right-3 bg-black/40 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/></svg>
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

      {/* Lightbox */}
      {zoom && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setZoom(false)}
        >
          <button
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/40 rounded-full w-10 h-10 flex items-center justify-center text-xl transition-all"
          >
            ✕
          </button>
          {imagenes.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prevZoom(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/40 rounded-full w-12 h-12 flex items-center justify-center text-3xl transition-all"
              >
                ‹
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); nextZoom(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-white/20 hover:bg-white/40 rounded-full w-12 h-12 flex items-center justify-center text-3xl transition-all"
              >
                ›
              </button>
            </>
          )}
          <img
            src={imagenes[selected]}
            alt={nombre}
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {selected + 1} / {imagenes.length}
          </div>
        </div>
      )}
    </>
  );
}
