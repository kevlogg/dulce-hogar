"use client";
import { useCart } from "@/components/shop/CartProvider";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function CarritoPage() {
  const { items, remove } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div>Cargando...</div>;

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="mb-4">Tu carrito está vacío</p>
        <Link
          href="/shop"
          className="inline-block bg-[#2C1A10] text-white px-6 py-2 rounded"
        >
          Volver a tienda
        </Link>
      </div>
    );
  }

  const total = items.reduce((sum, item) => {
    const opcionesTotal = item.opcionesSeleccionadas.reduce(
      (acc, opt) => acc + opt.precioAdicional,
      0
    );
    return sum + opcionesTotal * item.cantidad;
  }, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Carrito</h1>
      <div className="space-y-4 mb-8">
        {items.map((item) => (
          <div key={item.productoId} className="bg-white p-4 rounded flex justify-between">
            <div>
              <p className="font-bold">{item.productoId}</p>
              <p className="text-sm text-gray-600">Cantidad: {item.cantidad}</p>
            </div>
            <button
              onClick={() => remove(item.productoId)}
              className="text-red-500 hover:text-red-700"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
      <div className="border-t pt-4 mb-8">
        <p className="text-xl font-bold">
          Total: ${total.toLocaleString("es-AR")}
        </p>
      </div>
      <Link
        href="/shop/checkout"
        className="inline-block bg-[#2C1A10] text-white px-8 py-3 rounded hover:bg-[#A0724A]"
      >
        Proceder a checkout
      </Link>
    </div>
  );
}
