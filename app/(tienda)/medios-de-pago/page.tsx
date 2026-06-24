import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Medios de Pago | Dulce Hogar",
  description: "Conocé todos los medios de pago disponibles en Dulce Hogar. Cuotas sin interés, efectivo y transferencia con descuento.",
};

export default function MediosDePagoPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors">← Volver al inicio</Link>
        <p className="text-[#C9A87C] text-xs tracking-widest uppercase font-semibold mt-4 mb-2">Dulce Hogar</p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Comprá como quieras
        </h1>
      </div>

      <div className="space-y-6">
        {/* Cuotas */}
        <div className="bg-white border border-[#E0D4C4] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-[#2C1A10] rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0">%</div>
            <h2 className="text-xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>3 y 6 cuotas fijas sin interés</h2>
          </div>
          <p className="text-[#3D2B1F] leading-relaxed mb-3">
            Podés abonar tu compra en <strong>3 o 6 cuotas fijas sin interés</strong> con tarjeta de crédito a través de MercadoPago. El precio que ves en el sitio es el precio final en cuotas, sin cargos adicionales.
          </p>
          <ul className="text-sm text-[#3D2B1F] space-y-1.5">
            <li>• Tarjetas Visa, Mastercard, American Express y más</li>
            <li>• El cobro se procesa de forma segura a través de MercadoPago</li>
            <li>• Podés dividir el pago entre dos tarjetas distintas</li>
          </ul>
        </div>

        {/* Efectivo / Transferencia */}
        <div className="bg-white border border-[#E0D4C4] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0">
              <span className="text-lg">$</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>Efectivo o Transferencia</h2>
              <span className="inline-block bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full mt-0.5">25% OFF</span>
            </div>
          </div>
          <p className="text-[#3D2B1F] leading-relaxed mb-3">
            Elegí esta opción en el checkout y obtenés automáticamente un <strong>25% de descuento</strong> sobre el precio de lista. Podés abonar de dos maneras:
          </p>
          <ul className="text-sm text-[#3D2B1F] space-y-2">
            <li className="flex gap-2">
              <span className="text-[#C9A87C] font-bold shrink-0">Transferencia:</span>
              <span>Realizás la transferencia y nos enviás el comprobante por WhatsApp para confirmar el pedido.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-[#C9A87C] font-bold shrink-0">Efectivo:</span>
              <span>Reservás el producto online y abonás en nuestro local de Moreno en un plazo de 48 hs.</span>
            </li>
          </ul>
        </div>

        {/* Info adicional */}
        <div className="bg-[#F7F3EE] border border-[#E0D4C4] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#2C1A10] mb-3">Información adicional</h2>
          <ul className="text-sm text-[#3D2B1F] space-y-2">
            <li>• Todos los precios publicados incluyen IVA</li>
            <li>• El precio en cuotas y el precio en efectivo/transferencia son distintos</li>
            <li>• Una vez confirmado el pago, recibirás un email con los datos de tu pedido</li>
            <li>• Para consultas sobre pagos escribinos por WhatsApp</li>
          </ul>
        </div>

        <div className="text-center pt-4">
          <a
            href="https://wa.me/5491126917777?text=Hola!%20Tengo%20una%20consulta%20sobre%20los%20medios%20de%20pago"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#25D366] text-white px-8 py-3 rounded-full font-semibold hover:bg-[#1ead54] transition-all"
          >
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
