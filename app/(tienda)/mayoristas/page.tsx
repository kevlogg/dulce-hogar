import type { Metadata } from "next";
import Link from "next/link";
import { MayoristaForm } from "@/components/shop/MayoristaForm";

export const metadata: Metadata = {
  title: "Venta Mayorista | Dulce Hogar",
  description:
    "Canal mayorista de Dulce Hogar para revendedores y profesionales del rubro. Mínimo $400.000 + IVA. Envíos a todo el país.",
};

export default function MayoristasPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 md:py-16">
      <Link href="/" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors mb-6 inline-block">
        ← Volver al inicio
      </Link>

      {/* Encabezado */}
      <div className="bg-[#2C1A10] text-white rounded-2xl px-6 py-6 mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#C9A87C] mb-1">Canal exclusivo</p>
        <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Ventas por mayor
        </h1>
        <p className="text-sm text-[#E0C89A] leading-relaxed">
          Solo para fines comerciales: revendedores y profesionales del rubro.
        </p>
      </div>

      {/* Grid superior: mínimo + demora */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="bg-white rounded-2xl border border-[#E0D4C4] p-4">
          <p className="text-xs text-[#A0724A] font-semibold uppercase tracking-wide mb-1">Mínimo de compra</p>
          <p className="text-lg font-bold text-[#2C1A10]">$400.000 <span className="text-sm font-normal">+ IVA</span></p>
          <p className="text-xs text-[#A0724A] mt-0.5">15 productos mínimo en surtido</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E0D4C4] p-4">
          <p className="text-xs text-[#A0724A] font-semibold uppercase tracking-wide mb-1">Tiempo de armado</p>
          <p className="text-lg font-bold text-[#2C1A10]">10 días <span className="text-sm font-normal">hábiles</span></p>
          <p className="text-xs text-[#A0724A] mt-0.5">desde la confirmación del pedido</p>
        </div>
      </div>

      {/* Envío y retiro + Pago en un grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Envío */}
        <div className="bg-white rounded-2xl border border-[#E0D4C4] p-4">
          <p className="text-xs text-[#A0724A] font-semibold uppercase tracking-wide mb-2">🚚 Retiro y envíos</p>
          <ul className="text-sm text-[#3D2B1F] space-y-1.5 leading-snug">
            <li>• Retiro en Moreno, Buenos Aires</li>
            <li>• Flete propio a AMBA y CABA</li>
            <li>• Envíos a todo el país por transportes o encomiendas</li>
            <li className="text-[#A0724A] text-xs">El envío es siempre a cargo del cliente.</li>
          </ul>
        </div>

        {/* Pago con tarjeta */}
        <div className="bg-white rounded-2xl border border-[#E0D4C4] p-4">
          <p className="text-xs text-[#A0724A] font-semibold uppercase tracking-wide mb-2">💳 Pago con tarjeta</p>
          <p className="text-sm text-[#3D2B1F] mb-2">VISA o MASTER de cualquier banco.</p>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#F7F3EE] rounded-xl px-3 py-2 text-center">
              <p className="font-bold text-[#2C1A10] text-sm">3 cuotas</p>
              <p className="text-xs text-[#A0724A]">8% recargo</p>
            </div>
            <div className="flex-1 bg-[#F7F3EE] rounded-xl px-3 py-2 text-center">
              <p className="font-bold text-[#2C1A10] text-sm">6 cuotas</p>
              <p className="text-xs text-[#A0724A]">15% recargo</p>
            </div>
          </div>
          <p className="text-xs text-[#A0724A] mt-2">También efectivo al retirar, depósito o transferencia.</p>
        </div>
      </div>

      {/* Descuentos */}
      <div className="bg-white rounded-2xl border border-[#E0D4C4] p-4 mb-6">
        <p className="text-xs text-[#A0724A] font-semibold uppercase tracking-wide mb-3">
          💸 Descuentos por monto — efectivo / transferencia / depósito
        </p>
        <div className="divide-y divide-[#F0E8DC]">
          {[
            { monto: "Mayor a $600.000 + IVA",    descuento: "5% OFF" },
            { monto: "Mayor a $1.200.000 + IVA",  descuento: "10% OFF" },
            { monto: "Mayor a $2.500.000 + IVA",  descuento: "15% OFF" },
          ].map(({ monto, descuento }) => (
            <div key={monto} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-[#3D2B1F]">{monto}</span>
              <span className="text-sm font-bold text-green-700 shrink-0 ml-4">{descuento}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-[#A0724A] mt-2 pt-2 border-t border-[#F0E8DC]">Todos los precios son + IVA.</p>
      </div>

      {/* Formulario */}
      <div className="mb-4">
        <MayoristaForm />
      </div>

      {/* O por WhatsApp */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-[#E0D4C4]" />
        <span className="text-xs text-[#A0724A]">o consultá directo por WhatsApp</span>
        <div className="flex-1 h-px bg-[#E0D4C4]" />
      </div>

      {/* CTA */}
      <a
        href="https://wa.me/5491126917777?text=Hola%21+Quiero+consultar+sobre+compras+mayoristas."
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-full font-semibold hover:bg-[#1ead54] transition-all"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Consultar por WhatsApp
      </a>
      <p className="text-center text-xs text-[#A0724A] mt-2">Cualquier consulta estamos a disposición.</p>
    </div>
  );
}
