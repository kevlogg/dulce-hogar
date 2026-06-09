import { Producto } from "@/lib/types";
import { useCart } from "@/components/shop/CartProvider";
import Link from "next/link";

async function getProducto(id: string) {
  try {
    const res = await fetch(`http://localhost:3000/api/productos/${id}`, {
      next: { revalidate: 60 },
    });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const producto = (await getProducto(id)) as Producto | null;

  if (!producto) {
    return <div className="text-center py-12">Producto no encontrado</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        {producto.imagenes?.[0] && (
          <img
            src={producto.imagenes[0]}
            alt={producto.nombre}
            className="w-full rounded"
          />
        )}
      </div>
      <div>
        <h1 className="text-4xl font-bold text-[#2C1A10] mb-4">
          {producto.nombre}
        </h1>
        <p className="text-gray-600 mb-6">{producto.descripcion}</p>
        <p className="text-3xl font-bold text-[#C9A87C] mb-6">
          ${producto.precio.toLocaleString("es-AR")}
        </p>

        {producto.opciones && producto.opciones.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold mb-2">Opciones:</h3>
            {producto.opciones.map((opcion) => (
              <div key={opcion.id} className="mb-4">
                <p className="text-sm font-semibold">{opcion.nombre}</p>
                {opcion.items.map((item) => (
                  <label key={item.id} className="flex items-center gap-2 text-sm">
                    <input type={opcion.tipo === "checkbox" ? "checkbox" : "radio"} />
                    {item.nombre}
                    {item.precioAdicional > 0 && (
                      <span className="text-gray-500">
                        +${item.precioAdicional}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            ))}
          </div>
        )}

        <Link
          href="/shop/carrito"
          className="inline-block bg-[#2C1A10] text-white px-8 py-3 rounded hover:bg-[#A0724A]"
        >
          Agregar al carrito
        </Link>
      </div>
    </div>
  );
}
