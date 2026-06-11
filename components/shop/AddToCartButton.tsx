"use client";

import { useCart } from "@/components/shop/CartProvider";
import { useState } from "react";
import { Producto, OpcionProducto } from "@/lib/types";

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
  const key = nombre.toLowerCase().trim();
  return COLOR_MAP[key] ?? null;
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
  const [error, setError] = useState(false);

  const opciones: OpcionProducto[] = producto.opciones ?? [];

  function handleSelect(opcionId: string, itemId: string, item: { imagenIdx?: number }) {
    setSelecciones((prev) => ({ ...prev, [opcionId]: itemId }));
    setError(false);
    if (opcionId === "color" && item.imagenIdx !== undefined && onColorImageIdx) {
      onColorImageIdx(item.imagenIdx);
    }
  }

  function handleAdd() {
    const missing = opciones.some((op) => !selecciones[op.id]);
    if (missing) {
      setError(true);
      return;
    }
    const opcionesSeleccionadas = opciones.map((op) => {
      const item = op.items.find((it) => it.id === selecciones[op.id]);
      return {
        opcionId: op.id,
        itemSeleccionadoId: selecciones[op.id] ?? "",
        precioAdicional: item?.precioAdicional ?? 0,
      };
    });
    add({ productoId: producto.id, cantidad: 1, opcionesSeleccionadas });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      {opciones.map((opcion) => {
        const isColorOpcion = opcion.id === "color";
        const selectedItem = opcion.items.find((i) => i.id === selecciones[opcion.id]);

        return (
          <div key={opcion.id}>
            <p className="text-sm font-semibold text-[#2C1A10] mb-2.5">
              {opcion.nombre}
              {selectedItem && (
                <span className="ml-2 font-normal text-[#A0724A]">
                  — {selectedItem.nombre}
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-2.5">
              {opcion.items.map((item) => {
                const selected = selecciones[opcion.id] === item.id;
                const color = isColorOpcion ? getColor(item.nombre) : null;

                if (color) {
                  const light = isLight(color);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      title={item.nombre}
                      onClick={() => handleSelect(opcion.id, item.id, item)}
                      className="relative flex flex-col items-center gap-1 group"
                    >
                      <span
                        className={`w-9 h-9 rounded-full border-2 transition-all block ${
                          selected
                            ? "ring-2 ring-offset-2 ring-[#2C1A10] border-transparent scale-110"
                            : "border-[#D0C4B4] hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      >
                        {selected && (
                          <span
                            className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                              light ? "text-[#2C1A10]" : "text-white"
                            }`}
                          >
                            ✓
                          </span>
                        )}
                      </span>
                      <span className="text-[10px] text-[#A0724A] leading-tight max-w-[3rem] text-center">
                        {item.nombre}
                      </span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(opcion.id, item.id, item)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${
                      selected
                        ? "border-[#2C1A10] bg-[#2C1A10] text-white"
                        : "border-[#E0D4C4] text-[#3D2B1F] hover:border-[#C9A87C]"
                    }`}
                  >
                    {item.nombre}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {error && (
        <p className="text-red-500 text-sm">
          Por favor seleccioná todas las opciones antes de agregar al carrito.
        </p>
      )}

      <button
        onClick={handleAdd}
        className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
          added
            ? "bg-green-500 text-white"
            : "bg-[#2C1A10] text-white hover:bg-[#A0724A]"
        }`}
      >
        {added ? "✓ Agregado al carrito" : "Agregar al carrito"}
      </button>
    </div>
  );
}
