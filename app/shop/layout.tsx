import { CartProvider } from "@/components/shop/CartProvider";
import { PromoBanner } from "@/components/shop/PromoBanner";
import Link from "next/link";

export const metadata = {
  title: "Dulce Hogar | Tienda",
  description: "Muebles y decoración premium",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-[#F7F3EE] flex flex-col">
        <header className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/shop" className="text-2xl font-bold text-[#2C1A10]">
              Dulce Hogar
            </Link>
            <Link href="/shop/carrito" className="text-[#C9A87C]">Carrito</Link>
          </div>
        </header>

        <PromoBanner />

        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          {children}
        </main>

        <footer className="bg-[#2C1A10] text-white">
          <div className="max-w-6xl mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Contacto */}
              <div>
                <h3 className="text-[#C9A87C] font-bold mb-4">Contacto</h3>
                <p className="text-sm mb-2">
                  <strong>Teléfono:</strong> +54 9 11 2691-7777
                </p>
                <p className="text-sm mb-2">
                  <strong>Email:</strong> Dulcehogar.dye@gmail.com
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
            </div>

            <div className="border-t border-[#C9A87C] pt-6 text-center">
              <p className="text-sm text-gray-400">
                © 2025 Dulce Hogar | Diseño & Estilo — Muebles y Decoración Premium
              </p>
            </div>
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
