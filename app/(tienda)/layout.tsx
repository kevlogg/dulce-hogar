import { CartProvider } from "@/components/shop/CartProvider";
import { PromoBanner } from "@/components/shop/PromoBanner";
import { CountdownBanner } from "@/components/shop/CountdownBanner";
import { CartNavIcon } from "@/components/shop/CartNavIcon";
import { MobileNav } from "@/components/shop/MobileNav";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Dulce Hogar",
    default: "Dulce Hogar | Muebles y Decoración en Moreno, Buenos Aires",
  },
  description:
    "Muebles y decoración de diseño en Moreno, Buenos Aires. Sofás, sillones, mesas, textiles y más. Envíos a todo el país con Andreani y Vía Cargo.",
  openGraph: {
    locale: "es_AR",
    siteName: "Dulce Hogar",
  },
};

export default function TiendaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F7F3EE] flex flex-col">
        <CountdownBanner />
        <header className="sticky top-0 z-50">
          <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <div className="hidden sm:flex flex-col gap-1.5">
                <div className="w-6 h-2 sm:w-8 sm:h-2.5 rounded-sm bg-[#74AADB]" />
                <div className="w-6 h-2 sm:w-8 sm:h-2.5 rounded-sm bg-[#74AADB]" />
              </div>
              <div className="flex flex-col items-center">
                <Image
                  src="/logo.png"
                  alt="Dulce Hogar"
                  width={360}
                  height={128}
                  className="h-14 sm:h-20 md:h-24 w-auto object-contain"
                  priority
                />
                <div className="flex items-start gap-1 mt-0.5">
                  <span className="text-[#F0C040] text-[8px] sm:text-[10px] leading-none">★</span>
                  <span className="text-[#F0C040] text-[8px] sm:text-[10px] leading-none translate-y-0.5 sm:translate-y-1">★</span>
                  <span className="text-[#F0C040] text-[8px] sm:text-[10px] leading-none">★</span>
                </div>
              </div>
              <div className="hidden sm:flex flex-col gap-1.5">
                <div className="w-6 h-2 sm:w-8 sm:h-2.5 rounded-sm bg-[#74AADB]" />
                <div className="w-6 h-2 sm:w-8 sm:h-2.5 rounded-sm bg-[#74AADB]" />
              </div>
            </Link>

            {/* Nav desktop */}
            <nav className="hidden md:flex items-center gap-6 flex-1 justify-center">
              {[
                { label: "Inicio", href: "/#inicio" },
                { label: "Nosotros", href: "/nosotros" },
                { label: "Categorías", href: "/#categorias" },
                { label: "Productos", href: "/productos" },
                { label: "Ventas x Mayor", href: "/mayoristas" },
                { label: "Envíos", href: "/#envios" },
                { label: "Contacto", href: "/#contacto" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-[#3D2B1F] hover:text-[#C9A87C] transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <CartNavIcon />
              <MobileNav />
            </div>
          </div>
          </div>
          <PromoBanner />
        </header>

        <main className="flex-1 w-full">
          {children}
        </main>

        <footer className="bg-[#2C1A10] text-white">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-8">
              {/* Contacto */}
              <div>
                <h3 className="text-[#C9A87C] font-bold mb-4">Contacto</h3>
                <p className="text-sm mb-2">
                  <strong>Teléfono:</strong> +54 9 11 2691-7777
                </p>
                <p className="text-sm mb-2">
                  <strong>Email:</strong> dulcehogar.dye@gmail.com
                </p>
                <p className="text-sm">
                  <strong>Horario:</strong> 9:00 - 13:00 | 17:15 - 20:15 hs
                </p>
              </div>

              {/* Envíos */}
              <div>
                <h3 className="text-[#C9A87C] font-bold mb-4">Envíos</h3>
                <ul className="text-sm space-y-2">
                  <li>• Flete a domicilio GBA y CABA</li>
                  <li>• Vía Cargo y Andreani</li>
                  <li>• Envíos a todo el país</li>
                </ul>
              </div>

              {/* Ubicación */}
              <div>
                <h3 className="text-[#C9A87C] font-bold mb-4">Ubicación</h3>
                <p className="text-sm mb-2">
                  Av. Caveri 1481<br />
                  Moreno, Buenos Aires 1744
                </p>
                <p className="text-sm text-gray-400">
                  Tienda física abierta en horario de atención
                </p>
              </div>

              {/* Mini mapa */}
              <div>
                <h3 className="text-[#C9A87C] font-bold mb-4 opacity-0 select-none">-</h3>
                <a
                  href="https://www.google.com/maps/place/Dulce+Hogar+Dise%C3%B1o+%26+Estilo/@-34.5816184,-58.7536031,17.25z/data=!4m6!3m5!1s0x43c32d13b1f30a19:0x7f4d669db8bb3a!8m2!3d-34.5815039!4d-58.7528469!16s%2Fg%2F11mcz3wqw2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block relative rounded-xl overflow-hidden group"
                  style={{ height: "110px" }}
                >
                  <iframe
                    src="https://maps.google.com/maps?q=-34.5815039,-58.7528469&z=16&output=embed"
                    className="w-full h-full border-0 pointer-events-none"
                    loading="lazy"
                    title="Ubicación Dulce Hogar"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-end justify-center pb-2">
                    <span className="bg-white text-[#2C1A10] text-xs font-semibold px-3 py-1 rounded-full shadow translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all">
                      Ver en Google Maps
                    </span>
                  </div>
                </a>
              </div>
            </div>

            <div className="border-t border-[#C9A87C] pt-6 text-center">
              <p className="text-sm text-gray-400">
                <a href="/admin" className="hover:text-white transition-colors">©</a> 2025 Dulce Hogar | Diseño &amp; Estilo — Muebles y Decoración Premium
              </p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
