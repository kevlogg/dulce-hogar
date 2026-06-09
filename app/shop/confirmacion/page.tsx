"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function ConfirmacionPage() {
  const searchParams = useSearchParams();
  const ordenId = searchParams.get("orden");

  return (
    <div className="max-w-md mx-auto text-center py-12">
      <h1 className="text-4xl font-bold text-[#2C1A10] mb-4">
        ¡Gracias por tu compra!
      </h1>
      <p className="text-gray-600 mb-6">Tu orden ha sido recibida.</p>

      {ordenId && (
        <div className="bg-white p-4 rounded mb-6">
          <p className="text-sm text-gray-500">Número de orden:</p>
          <p className="font-bold text-lg break-all">{ordenId}</p>
        </div>
      )}

      <p className="text-gray-600 mb-6">
        Te enviaremos un email con los detalles de tu compra y estado de envío.
      </p>

      <Link
        href="/shop"
        className="inline-block bg-[#2C1A10] text-white px-6 py-3 rounded hover:bg-[#A0724A]"
      >
        Volver a tienda
      </Link>
    </div>
  );
}
