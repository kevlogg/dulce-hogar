"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const CATS = [
  { key: "MUEBLES", label: "Muebles", icon: "🛋️" },
  { key: "TEXTILES", label: "Textiles", icon: "🧶" },
  { key: "EXTERIOR", label: "Exterior", icon: "🌿" },
  { key: "ESPEJOS", label: "Espejos", icon: "🪞" },
  { key: "DECO", label: "Decoración", icon: "🏺" },
  { key: "ILUMINACION", label: "Iluminación", icon: "💡" },
];

type Producto = {
  id: string;
  nombre: string;
  precio: number;
  precioEfectivo?: number;
  categoria: string;
  imagenes?: string[];
  stock?: number;
};

export default function CategoriasAdminPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/productos")
      .then((r) => r.json())
      .then((data) => setProductos(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const byCategory = (key: string) => productos.filter((p) => p.categoria === key);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#2C1A10]">Categorías</h1>
          <p className="text-sm text-gray-500">{productos.length} productos distribuidos en {CATS.length} categorías</p>
        </div>
        <Link
          href="/admin/productos"
          className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:border-[#C9A87C] hover:text-[#2C1A10] transition-colors"
        >
          Ir a productos →
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400 text-sm">Cargando...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {CATS.map((cat) => {
            const items = byCategory(cat.key);
            const sinStock = items.filter((p) => (p.stock ?? 0) === 0).length;
            const isOpen = selected === cat.key;
            return (
              <div key={cat.key} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                  onClick={() => setSelected(isOpen ? null : cat.key)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#2C1A10]">{cat.label}</p>
                      <p className="text-xs text-gray-500">{items.length} productos</p>
                    </div>
                    <div className="text-right shrink-0">
                      {sinStock > 0 && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold block mb-1">
                          {sinStock} sin stock
                        </span>
                      )}
                      <span className="text-gray-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    {items.length === 0 ? (
                      <p className="text-sm text-gray-400 px-4 py-3">Sin productos en esta categoría.</p>
                    ) : (
                      <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                        {items.map((p) => (
                          <div key={p.id} className="flex items-center gap-3 px-4 py-2.5">
                            {p.imagenes?.[0] ? (
                              <img src={p.imagenes[0]} alt={p.nombre} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                            ) : (
                              <div className="w-10 h-10 bg-[#F7F3EE] rounded-lg shrink-0 flex items-center justify-center text-lg">{cat.icon}</div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-[#2C1A10] line-clamp-1">{p.nombre}</p>
                              <p className="text-xs text-gray-500">${(p.precioEfectivo ?? Math.round(p.precio * 0.75)).toLocaleString("es-AR")} efectivo</p>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${
                              (p.stock ?? 0) > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                            }`}>
                              {p.stock ?? 0}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Global stats */}
      {!loading && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-[#2C1A10]">Resumen general</p>
          </div>
          <div className="divide-y divide-gray-50">
            {CATS.map((cat) => {
              const items = byCategory(cat.key);
              const pct = productos.length ? Math.round((items.length / productos.length) * 100) : 0;
              return (
                <div key={cat.key} className="flex items-center gap-3 px-4 py-2.5">
                  <span className="text-base w-6 text-center">{cat.icon}</span>
                  <span className="text-sm font-medium text-[#2C1A10] w-28">{cat.label}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-[#C9A87C] h-2 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right">{items.length} prods ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
