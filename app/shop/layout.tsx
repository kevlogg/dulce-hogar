import { CartProvider } from "@/components/shop/CartProvider";
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
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8">
          {children}
        </main>
        <footer className="bg-[#2C1A10] text-white text-center py-4">
          <p className="text-sm">© 2025 Dulce Hogar</p>
        </footer>
      </div>
    </CartProvider>
  );
}
