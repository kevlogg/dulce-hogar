"use client";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";

export default function OrdenesAdminPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ordenes")
      .then((r) => r.json())
      .then(setOrdenes)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div>
      <SectionHeader title="Órdenes" description="Gestiona órdenes de clientes" />
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2">ID Orden</th>
              <th className="text-left p-2">Cliente</th>
              <th className="text-left p-2">Email</th>
              <th className="text-left p-2">Total</th>
              <th className="text-left p-2">Estado Pago</th>
              <th className="text-left p-2">Estado Envío</th>
            </tr>
          </thead>
          <tbody>
            {ordenes.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-500">
                  No hay órdenes
                </td>
              </tr>
            ) : (
              ordenes.map((o: any) => (
                <tr key={o.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 font-mono text-xs">{o.id?.substring(0, 8)}</td>
                  <td className="p-2">
                    {o.clienteInfo?.nombre} {o.clienteInfo?.apellido}
                  </td>
                  <td className="p-2">{o.clienteInfo?.email}</td>
                  <td className="p-2">${o.montoTotal}</td>
                  <td className="p-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        o.estadoPago === "completado"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {o.estadoPago}
                    </span>
                  </td>
                  <td className="p-2">
                    <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                      {o.estadoEnvio}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
