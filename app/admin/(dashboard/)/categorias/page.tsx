"use client";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function CategoriasAdminPage() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/categorias")
      .then((r) => r.json())
      .then(setCategorias)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <SectionHeader title="Categorías" description="Gestiona categorías de productos" />
      <div className="mt-6 space-y-4">
        {categorias.length === 0 ? (
          <p className="text-gray-500">No hay categorías.</p>
        ) : (
          categorias.map((c: any) => (
            <div key={c.id} className="bg-white p-4 rounded border">
              <h3 className="font-bold">{c.nombre}</h3>
              <p className="text-sm text-gray-600">{c.descripcion}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
