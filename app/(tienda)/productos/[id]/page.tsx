import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/shop/ProductDetailClient";
import type { Metadata } from "next";

async function getProducto(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/productos/${id}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function getRelacionados(categoria: string, excludeId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/productos`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    const todos = await res.json();
    return todos
      .filter((p: any) => p.categoria === categoria && p.id !== excludeId)
      .slice(0, 4);
  } catch {
    return [];
  }
}

const CATEGORIA_LABELS: Record<string, string> = {
  MUEBLES: "Muebles",
  TEXTILES: "Textiles",
  EXTERIOR: "Exterior",
  ESPEJOS: "Espejos",
  DECO: "Decoración",
  ILUMINACION: "Iluminación",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const producto = await getProducto(id);
  if (!producto) return {};
  return {
    title: producto.nombre,
    description: producto.descripcion
      ? producto.descripcion.slice(0, 155)
      : `${producto.nombre} — Dulce Hogar. Envíos a todo el país.`,
  };
}

export default async function ProductoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const producto = await getProducto(id);
  if (!producto) notFound();

  const relacionados = await getRelacionados(producto.categoria, id);
  const whatsappMsg = encodeURIComponent(
    `Hola! Me interesa el producto: ${producto.nombre} ($${producto.precio?.toLocaleString()}). ¿Tienen disponibilidad?`
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <nav className="flex items-center gap-2 text-sm text-[#A0724A] mb-8 flex-wrap">
        <Link href="/" className="hover:text-[#2C1A10] transition-colors">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-[#2C1A10] transition-colors">
          {CATEGORIA_LABELS[producto.categoria] ?? producto.categoria}
        </Link>
        <span>/</span>
        <span className="text-[#2C1A10] font-medium truncate max-w-xs">{producto.nombre}</span>
      </nav>

      <ProductDetailClient
        producto={producto}
        relacionados={relacionados}
        whatsappMsg={whatsappMsg}
      />
    </div>
  );
}
