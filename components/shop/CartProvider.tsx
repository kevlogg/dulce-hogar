"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/lib/types";

const CartContext = createContext<{
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (id: string) => void;
  updateCantidad: (id: string, cantidad: number) => void;
  clear: () => void;
}>(null!);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("cart") || "[]"));
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
            const exist = p.find((x) => x.productoId === item.productoId);
            return exist
              ? p.map((x) =>
                  x.productoId === item.productoId
                    ? { ...x, cantidad: x.cantidad + item.cantidad }
                    : x
                )
              : [...p, item];
          });
        },
        remove: (id) => setItems((p) => p.filter((x) => x.productoId !== id)),
        updateCantidad: (id, cantidad) =>
          setItems((p) =>
            cantidad <= 0
              ? p.filter((x) => x.productoId !== id)
              : p.map((x) => (x.productoId === id ? { ...x, cantidad } : x))
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
