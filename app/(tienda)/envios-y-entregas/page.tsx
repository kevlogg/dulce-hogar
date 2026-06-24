import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Envíos y Entregas | Dulce Hogar",
  description: "Información sobre envíos y entregas de Dulce Hogar. Flete a domicilio en CABA y GBA, envíos a todo el país.",
};

export default function EnviosYEntregasPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors">← Volver al inicio</Link>
        <p className="text-[#C9A87C] text-xs tracking-widest uppercase font-semibold mt-4 mb-2">Dulce Hogar</p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Envíos y Entregas
        </h1>
      </div>

      <div className="space-y-6">
        {/* Aviso coordinacion */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3 items-start">
          <span className="text-amber-500 text-xl shrink-0">📲</span>
          <p className="text-sm text-amber-800">
            <strong>El costo de envío se coordina por WhatsApp.</strong> Una vez confirmado tu pedido, te contactamos para acordar fecha, horario y costo antes del despacho.
          </p>
        </div>

        {/* CABA y GBA */}
        <div className="bg-white border border-[#E0D4C4] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏙️</span>
            <h2 className="text-xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>CABA y GBA</h2>
          </div>
          <p className="text-[#3D2B1F] leading-relaxed mb-4">
            Realizamos entregas a domicilio con <strong>flete propio</strong> en toda la Ciudad de Buenos Aires y el Gran Buenos Aires. El servicio es puerta a puerta, sin ingreso al interior del domicilio salvo acuerdo previo.
          </p>
          <ul className="text-sm text-[#3D2B1F] space-y-2">
            <li>• Te avisamos por WhatsApp con antelación la fecha y franja horaria estimada</li>
            <li>• Si necesitás subida a piso o acceso especial, consultanos antes de la compra</li>
            <li>• Es responsabilidad del cliente verificar que el mueble entre por puertas, escaleras y ascensores</li>
            <li>• Si no hay nadie disponible al momento de la entrega, se reprograma con costo adicional</li>
          </ul>
        </div>

        {/* Resto del país */}
        <div className="bg-white border border-[#E0D4C4] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📦</span>
            <h2 className="text-xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>Resto del país</h2>
          </div>
          <p className="text-[#3D2B1F] leading-relaxed mb-4">
            Enviamos a todo el país a través de transportistas. Podés elegir entre envío a domicilio o retiro en sucursal de la transportista más cercana.
          </p>
          <ul className="text-sm text-[#3D2B1F] space-y-2">
            <li>• Todos los productos se embalan de forma reforzada sin costo adicional</li>
            <li>• Una vez despachado, te informamos el número de seguimiento</li>
            <li>• A partir del despacho, la transportista es responsable de plazos y estado del paquete</li>
            <li>• Los tiempos de entrega varían según la zona de destino</li>
          </ul>
        </div>

        {/* Retiro en local */}
        <div className="bg-white border border-[#E0D4C4] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🏠</span>
            <h2 className="text-xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>Retiro en local</h2>
          </div>
          <p className="text-[#3D2B1F] leading-relaxed mb-2">
            Podés retirar tu compra sin costo de envío directamente en nuestro local:
          </p>
          <p className="text-sm font-semibold text-[#2C1A10] mb-1">Av. Caveri 1481, Moreno, Buenos Aires</p>
          <p className="text-sm text-[#A0724A]">Lunes a Sábados: 9:00 - 13:00 hs | 17:15 - 20:15 hs</p>
          <p className="text-sm text-[#3D2B1F] mt-3">Coordiná el retiro por WhatsApp antes de venir.</p>
        </div>

        {/* Consideraciones */}
        <div className="bg-[#F7F3EE] border border-[#E0D4C4] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#2C1A10] mb-3">Consideraciones generales</h2>
          <ul className="text-sm text-[#3D2B1F] space-y-2">
            <li>• Los productos a pedido o con medidas especiales pueden requerir mayor tiempo de preparación</li>
            <li>• En caso de demoras por parte de la transportista, no somos responsables de los tiempos</li>
            <li>• Ante cualquier inconveniente con la entrega, comunicarte con nosotros inmediatamente</li>
          </ul>
        </div>

        <div className="text-center pt-4">
          <a
            href="https://wa.me/5491126917777?text=Hola!%20Tengo%20una%20consulta%20sobre%20env%C3%ADos"
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
