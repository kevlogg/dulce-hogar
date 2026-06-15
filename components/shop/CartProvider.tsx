"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/lib/types";

export function cartItemKey(item: CartItem): string {
  const opts = (item.opcionesSeleccionadas ?? [])
    .map((o) => `${o.opcionId}:${o.itemSeleccionadoId}`)
    .sort()
    .join("|");
  const acc = [...(item.accesoriosSeleccionados ?? [])].sort().join(",");
  return `${item.productoId}_${opts}_${acc}`;
}

const CartContext = createContext<{
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (key: string) => void;
  updateCantidad: (key: string, cantidad: number) => void;
  clear: () => void;
}>(null!);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("cart") || "[]"));
    } catch {
      localStorage.removeItem("cart");
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("cart", JSON.stringify(items));
  }, [items, mounted]);

  return (
    <CartContext.Provider
      value={{
        items,
        add: (item) => {
          setItems((p) => {
            const key = cartItemKey(item);
            const exist = p.find((x) => cartItemKey(x) === key);
            return exist
              ? p.map((x) => cartItemKey(x) === key ? { ...x, cantidad: x.cantidad + item.cantidad } : x)
              : [...p, item];
          });
        },
        remove: (key) => setItems((p) => p.filter((x) => cartItemKey(x) !== key)),
        updateCantidad: (key, cantidad) =>
          setItems((p) =>
            cantidad <= 0
              ? p.filter((x) => cartItemKey(x) !== key)
              : p.map((x) => (cartItemKey(x) === key ? { ...x, cantidad } : x))
          ),
        clear: () => setItems([]),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
