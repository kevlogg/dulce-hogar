"use client";

import { useCart } from "@/components/shop/CartProvider";
import { useState } from "react";
import { Producto, OpcionProducto, Accesorio } from "@/lib/types";

interface Props {
  producto: Producto;
  onColorImageIdx?: (idx: number) => void;
}

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

function getColor(nombre: string): string | null {
  return COLOR_MAP[nombre.toLowerCase().trim()] ?? null;
}

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

export function AddToCartButton({ producto, onColorImageIdx }: Props) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const [selecciones, setSelecciones] = useState<Record<string, string>>({});
  const [accesoriosActivos, setAccesoriosActivos] = useState<Set<string>>(new Set());
  const [error, setError] = useState(false);

  const opciones: OpcionProducto[] = producto.opciones ?? [];
  const accesorios: Accesorio[] = producto.accesorios ?? [];

  function handleSelect(opcionId: string, itemId: string, item: { imagenIdx?: number }) {
    setSelecciones((prev) => ({ ...prev, [opcionId]: itemId }));
    setError(false);
    if (opcionId === "color" && item.imagenIdx !== undefined && onColorImageIdx) {
      onColorImageIdx(item.imagenIdx);
    }
  }

  function toggleAccesorio(id: string) {
    setAccesoriosActivos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const precioBase = producto.precio;
  const precioEfBase = producto.precioEfectivo ?? Math.round(producto.precio * 0.75);
  const extraLista = accesorios
    .filter((a) => accesoriosActivos.has(a.id))
    .reduce((s, a) => s + a.precio, 0);
  const extraEfectivo = accesorios
    .filter((a) => accesoriosActivos.has(a.id))
    .reduce((s, a) => s + (a.precioEfectivo ?? Math.round(a.precio * 0.75)), 0);

  function handleAdd() {
    const missing = opciones.some((op) => !selecciones[op.id]);
    if (missing) { setError(true); return; }
    const opcionesSeleccionadas = opciones.map((op) => {
      const item = op.items.find((it) => it.id === selecciones[op.id]);
      return { opcionId: op.id, itemSeleccionadoId: selecciones[op.id] ?? "", precioAdicional: item?.precioAdicional ?? 0 };
    });
    add({
      productoId: producto.id,
      cantidad: 1,
      opcionesSeleccionadas,
      accesoriosSeleccionados: accesoriosActivos.size > 0 ? [...accesoriosActivos] : undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Opciones (colores, variantes) */}
      {opciones.map((opcion) => {
        const isColorOpcion = opcion.id === "color";
        const selectedItem = opcion.items.find((i) => i.id === selecciones[opcion.id]);
        return (
          <div key={opcion.id}>
            <p className="text-sm font-semibold text-[#2C1A10] mb-2.5">
              {opcion.nombre}
              {selectedItem && <span className="ml-2 font-normal text-[#A0724A]">— {selectedItem.nombre}</span>}
            </p>
            <div className="flex flex-wrap gap-2.5">
              {opcion.items.map((item) => {
                const selected = selecciones[opcion.id] === item.id;
                const color = isColorOpcion ? getColor(item.nombre) : null;
                if (color) {
                  const light = isLight(color);
                  return (
                    <button key={item.id} type="button" title={item.nombre} onClick={() => handleSelect(opcion.id, item.id, item)} className="relative flex flex-col items-center gap-1 group">
                      <span className={`w-9 h-9 rounded-full border-2 transition-all block ${selected ? "ring-2 ring-offset-2 ring-[#2C1A10] border-transparent scale-110" : "border-[#D0C4B4] hover:scale-105"}`} style={{ backgroundColor: color }}>
                        {selected && <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${light ? "text-[#2C1A10]" : "text-white"}`}>✓</span>}
                      </span>
                      <span className="text-[10px] text-[#A0724A] leading-tight max-w-[3rem] text-center">{item.nombre}</span>
                    </button>
                  );
                }
                return (
                  <button key={item.id} type="button" onClick={() => handleSelect(opcion.id, item.id, item)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${selected ? "border-[#2C1A10] bg-[#2C1A10] text-white" : "border-[#E0D4C4] text-[#3D2B1F] hover:border-[#C9A87C]"}`}>
                    {item.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Accesorios opcionales */}
      {accesorios.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-[#2C1A10] mb-2.5">Accesorios opcionales</p>
          <div className="flex flex-col gap-2">
            {accesorios.map((acc) => {
              const active = accesoriosActivos.has(acc.id);
              const ef = acc.precioEfectivo ?? Math.round(acc.precio * 0.75);
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => toggleAccesorio(acc.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 text-left transition-all ${active ? "border-[#2C1A10] bg-[#F7F3EE]" : "border-[#E0D4C4] hover:border-[#C9A87C]"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${active ? "border-[#2C1A10] bg-[#2C1A10]" : "border-[#D0C4B4]"}`}>
                      {active && <span className="text-white text-[10px] font-bold">✓</span>}
                    </span>
                    <span className="text-sm font-medium text-[#2C1A10]">{acc.nombre}</span>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-bold text-[#2C1A10]">+${acc.precio.toLocaleString("es-AR")}</p>
                    <p className="text-xs text-green-700">+${ef.toLocaleString("es-AR")} ef.</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Precio total actualizado si hay accesorios seleccionados */}
      {accesoriosActivos.size > 0 && (
        <div className="bg-[#F7F3EE] rounded-xl px-4 py-3 flex items-center justify-between border border-[#E0D4C4]">
          <span className="text-sm text-[#3D2B1F] font-medium">Total con accesorios</span>
          <div className="text-right">
            <p className="font-bold text-[#2C1A10]">${(precioBase + extraLista).toLocaleString("es-AR")} <span className="text-xs font-normal text-[#A0724A]">cuotas</span></p>
            <p className="text-sm font-bold text-green-700">${(precioEfBase + extraEfectivo).toLocaleString("es-AR")} <span className="text-xs font-normal">efectivo</span></p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2">
          <span className="shrink-0 mt-0.5">⚠️</span>
          <span>Por favor seleccioná todas las opciones disponibles antes de agregar al carrito.</span>
        </div>
      )}

      <button
        onClick={handleAdd}
        className={`w-full py-4 rounded-full font-bold text-lg transition-all ${added ? "bg-green-500 text-white" : "bg-[#2C1A10] text-white hover:bg-[#A0724A]"}`}
      >
        {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
      </button>
    </div>
  );
}
