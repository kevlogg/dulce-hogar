import { Suspense } from "react";
import { CatalogoClient } from "@/components/shop/CatalogoClient";
import { Producto } from "@/lib/types";

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

export const metadata = {
  title: "Catálogo | Dulce Hogar",
  description: "Todos nuestros muebles y decoración",
};

export default async function ProductosPage() {
  const productos = await getProductos();
  return (
    <Suspense fallback={null}>
      <CatalogoClient productos={productos} />
    </Suspense>
  );
}
