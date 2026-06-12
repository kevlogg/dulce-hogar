import { Suspense } from "react";
import { CatalogoClient } from "@/components/shop/CatalogoClient";
import { Producto } from "@/lib/types";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Muebles y Decoración",
  description:
    "Explorá todo nuestro catálogo de muebles y decoración: sofás, sillones, mesas, textiles, espejos e iluminación. Envíos a todo el país.",
  alternates: { canonical: "https://dulce-hogar-eight.vercel.app/productos" },
};

async function getProductos(): Promise<Producto[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/productos`, {
      next: { revalidate: 60 },
    });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function ProductosPage() {
  const productos = await getProductos();
  return (
    <Suspense fallback={null}>
      <CatalogoClient productos={productos} />
    </Suspense>
  );
}
