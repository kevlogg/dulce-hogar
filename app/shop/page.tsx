import { Producto } from "@/lib/types";
import Link from "next/link";

async function getProductos() {
  try {
    const res = await fetch("http://localhost:3000/api/productos", {
      next: { revalidate: 60 },
    });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function ShopPage() {
  const productos = (await getProductos()) as Producto[];

  return (
    <div>
      <h1 className="text-4xl font-bold text-[#2C1A10] mb-8">Productos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productos.map((p) => (
          <Link key={p.id} href={`/shop/productos/${p.id}`}>
            <div className="bg-white p-4 rounded shadow hover:shadow-lg">
              {p.imagenes?.[0] && (
                <img
                  src={p.imagenes[0]}
                  alt={p.nombre}
                  className="w-full h-40 object-cover rounded mb-2"
                />
              )}
              <h3 className="font-bold text-[#2C1A10]">{p.nombre}</h3>
              <p className="text-[#C9A87C]">${p.precio}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
