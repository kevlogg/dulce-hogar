import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cambios y Devoluciones | Dulce Hogar",
  description: "Política de cambios y devoluciones de Dulce Hogar. Conocé los plazos y condiciones.",
};

export default function CambiosYDevoluciones() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-16">
      <div className="mb-8">
        <Link href="/" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors">← Volver al inicio</Link>
        <p className="text-[#C9A87C] text-xs tracking-widest uppercase font-semibold mt-4 mb-2">Dulce Hogar</p>
        <h1 className="text-3xl md:text-4xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>
          Cambios y Devoluciones
        </h1>
      </div>

      <div className="space-y-6">
        {/* General */}
        <div className="bg-white border border-[#E0D4C4] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔄</span>
            <h2 className="text-xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>Cambios y devoluciones generales</h2>
          </div>
          <p className="text-[#3D2B1F] leading-relaxed mb-4">
            Podés solicitar un cambio o devolución dentro de los <strong>14 días corridos</strong> desde la fecha de recepción del producto, siempre que se cumplan las siguientes condiciones:
          </p>
          <ul className="text-sm text-[#3D2B1F] space-y-2">
            <li>• El producto se encuentra en perfecto estado y sin uso</li>
            <li>• El embalaje original está completo e intacto</li>
            <li>• Presentás el comprobante de compra</li>
          </ul>
          <p className="text-sm text-[#A0724A] mt-4">
            Los cambios y devoluciones se gestionan en nuestro local de <strong>Av. Caveri 1481, Moreno</strong>. Los gastos de traslado corren por cuenta del comprador.
          </p>
        </div>

        {/* Defectos de fabrica */}
        <div className="bg-white border border-[#E0D4C4] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔧</span>
            <h2 className="text-xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>Defectos de fábrica</h2>
          </div>
          <p className="text-[#3D2B1F] leading-relaxed mb-4">
            Si recibís un producto con defecto de fabricación o daño durante el transporte, seguí estos pasos:
          </p>
          <ol className="text-sm text-[#3D2B1F] space-y-2 list-decimal list-inside">
            <li>Tomá fotos claras del defecto desde varios ángulos</li>
            <li>Enviá las imágenes junto al número de pedido a <strong>dulcehogar.dye@gmail.com</strong> o por WhatsApp</li>
            <li>Nuestro equipo te responde en un plazo máximo de <strong>5 días hábiles</strong> con la solución: reparación, reposición o devolución</li>
          </ol>
        </div>

        {/* Productos a medida */}
        <div className="bg-[#FFF8F0] border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📐</span>
            <h2 className="text-xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>Productos personalizados o a medida</h2>
          </div>
          <p className="text-[#3D2B1F] leading-relaxed">
            Los productos fabricados con medidas especiales o personalizaciones específicas <strong>no admiten cambios ni devoluciones</strong>, salvo que se compruebe un defecto de fabricación.
          </p>
        </div>

        {/* Contacto */}
        <div className="bg-[#F7F3EE] border border-[#E0D4C4] rounded-2xl p-6">
          <h2 className="text-lg font-bold text-[#2C1A10] mb-3">¿Tenés alguna duda?</h2>
          <p className="text-sm text-[#3D2B1F] mb-1">Lunes a Sábados, 9:00 - 13:00 hs | 17:15 - 20:15 hs</p>
          <p className="text-sm text-[#3D2B1F]">WhatsApp: +54 9 11 2691-7777</p>
          <p className="text-sm text-[#3D2B1F]">Email: dulcehogar.dye@gmail.com</p>
        </div>

        <div className="text-center pt-4">
          <a
            href="https://wa.me/5491126917777?text=Hola!%20Quiero%20consultar%20sobre%20cambios%20o%20devoluciones"
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
