"use client";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function ProductosAdminPage() {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => r.json())
      .then(setProductos)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <SectionHeader title="Productos" description="Gestiona tus productos" />
      <div className="mt-6 space-y-4">
        {productos.length === 0 ? (
          <p className="text-gray-500">No hay productos. Crea uno para empezar.</p>
        ) : (
          productos.map((p: any) => (
            <div key={p.id} className="bg-white p-4 rounded border">
              <h3 className="font-bold">{p.nombre}</h3>
              <p className="text-sm text-gray-600">${p.precio}</p>
              <p className="text-xs text-gray-500">Stock: {p.stock}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
