"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Orden } from "@/lib/types";

export function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get("orden");
  const paymentId = searchParams.get("payment_id") ?? searchParams.get("collection_id");
  const [orden, setOrden] = useState<Orden | null>(null);

  useEffect(() => {
    if (!ordenId) return;

    // Confirmar pago con MP si hay payment_id en la URL
    if (paymentId) {
      fetch("/api/pagos/confirmar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, ordenId }),
      }).catch(() => null);
    }

    fetch(`/api/ordenes/${ordenId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setOrden(data))
      .catch(() => null);
  }, [ordenId, paymentId]);

  return (
    <div className="max-w-md mx-auto text-center py-12 px-4">
      <h1
        className="text-4xl font-bold text-[#2C1A10] mb-4"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        ¡Gracias por tu compra!
      </h1>
      <p className="text-gray-600 mb-6">Tu orden ha sido recibida.</p>

      {ordenId && (
        <div className="bg-white p-4 rounded-xl border border-[#E0D4C4] mb-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            Número de orden
          </p>
          <p className="font-bold text-lg break-all text-[#2C1A10]">
            #{ordenId.slice(-6).toUpperCase()}
          </p>
        </div>
      )}

      {orden?.trackingNumber ? (
        <div className="bg-[#F9F5F0] p-5 rounded-xl border border-[#E0D4C4] mb-6 text-left">
          <p className="text-xs font-semibold text-[#A0724A] uppercase tracking-wide mb-1">
            Número de seguimiento
          </p>
          <p className="font-bold text-xl text-[#2C1A10] mb-3">
            {orden.trackingNumber}
          </p>
          <p className="text-sm text-gray-600 mb-3">
            {orden.direccionEnvio.tipoEntrega === "sucursal"
              ? `Retiro en sucursal: ${orden.direccionEnvio.sucursalNombre}`
              : `Envío a: ${orden.direccionEnvio.calle} ${orden.direccionEnvio.numero}, ${orden.direccionEnvio.ciudad}`}
          </p>
          <a
            href={`https://www.viacargo.com.ar/seguimiento?guia=${orden.trackingNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#A0724A] underline hover:text-[#2C1A10]"
          >
            Rastrear mi envío →
          </a>
        </div>
      ) : (
        <p className="text-gray-600 mb-6">
          Te enviaremos un email con los detalles de tu compra y el número de
          seguimiento en cuanto el envío esté listo.
        </p>
      )}

      <Link
        href="/"
        className="inline-block bg-[#2C1A10] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#A0724A] transition-colors"
      >
        Volver a la tienda
      </Link>
    </div>
  );
}
