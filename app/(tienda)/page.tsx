import Link from "next/link";
import { Producto } from "@/lib/types";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { ConfettiCannon } from "@/components/shop/ConfettiCannon";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dulce Hogar | Muebles y Decoración en Moreno, Buenos Aires",
  description:
    "Tienda de muebles y decoración en Moreno, Buenos Aires. Sofás, sillones, mesas, textiles, espejos e iluminación. Envíos a todo el país.",
  alternates: { canonical: "https://dulce-hogar-eight.vercel.app/" },
};

async function getProductos(): Promise<Producto[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/productos`, {
      next: { revalidate: 60 },
    });
    return res.ok ? await res.json() : [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const productos = await getProductos();

  return (
    <div>
      <ConfettiCannon />
      <HeroCarousel />

      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A87C] to-transparent" />

      {/* NUESTRA HISTORIA */}
      <section className="py-12 px-4 md:py-20 bg-[#F7F3EE]" id="nosotros">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16 items-center">
          <div
            className="relative h-80 lg:h-[480px] rounded-2xl overflow-hidden"
            style={{ background: "url('https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop') center/cover no-repeat" }}
          >
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg, rgba(201, 168, 124, 0.6) 0%, rgba(160, 114, 74, 0.5) 100%)" }}>
              <div className="text-center text-white">
                <div className="text-3xl font-light italic mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>Flor &amp; Esteban</div>
                <div className="text-sm opacity-90">Diseñadores de espacios que enamoran</div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[#C9A87C] text-xs tracking-widest uppercase font-semibold mb-3">Nuestra historia</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2C1A10] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              Pasión por el diseño, amor por el hogar
            </h2>
            <p className="text-[#3D2B1F] leading-relaxed mb-4">
              Somos Flor y Esteban, dos apasionados por el diseño y la decoración. Hace años decidimos compartir nuestra pasión transformando espacios en hogares acogedores y hermosos. Cada proyecto es único, cada cliente es especial.
            </p>
            <p className="text-[#3D2B1F] leading-relaxed mb-4">
              Creemos que los muebles y la decoración deben contar historias, generar emociones y crear ambientes donde la familia y los amigos disfruten momentos inolvidables.
            </p>
            <p className="text-[#3D2B1F] leading-relaxed mb-8">
              Nuestro compromiso es simple: que vuestro hogar sea un reflejo de vuestro estilo y que cada rincón transmita calidez, elegancia y buen gusto.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: "Diseño Único", desc: "Cada espacio es diferente" },
                { title: "Calidad Premium", desc: "Materiales y acabados selectos" },
                { title: "Envíos Nacionales", desc: "A todo el país con seguridad" },
                { title: "Asesoramiento", desc: "Personal y especializado" },
              ].map((v) => (
                <div key={v.title} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-[#E0D4C4]">
                  <div className="w-8 h-8 min-w-[2rem] bg-[#C9A87C]/10 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-[#C9A87C]" />
                  </div>
                  <div>
                    <div className="font-bold text-[#2C1A10] text-sm">{v.title}</div>
                    <div className="text-xs text-[#A0724A]">{v.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A87C] to-transparent" />

      {/* CATEGORÍAS */}
      <section className="py-12 px-4 md:py-20 bg-[#EFEBE3]" id="categorias">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-[#C9A87C] text-xs tracking-widest uppercase font-semibold mb-3">Categorías</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2C1A10] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
              Encontrá lo que tu hogar necesita
            </h2>
            <p className="text-[#A0724A]">Explorá nuestra colección de muebles y decoración</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: "Espejos", cat: "ESPEJOS", desc: "Estilo y amplitud para cada ambiente", img: "https://images.unsplash.com/photo-1723810779771-f5895e975ba1?q=85&w=400&h=300&fit=crop" },
              { name: "Mesas & Muebles", cat: "MUEBLES", desc: "Piezas versátiles", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&q=85&w=400&h=300&fit=crop" },
              { name: "Decoración", cat: "DECO", desc: "Accesorios únicos", img: "https://images.unsplash.com/photo-1722078139231-4d1d92a0fd4b?q=85&w=400&h=300&fit=crop" },
              { name: "Textiles", cat: "TEXTILES", desc: "Mantas, almohadones y telas", img: "https://images.unsplash.com/photo-1634665810235-011d663754e7?q=85&w=400&h=300&fit=crop" },
              { name: "Iluminación", cat: "ILUMINACION", desc: "Luces para cada ambiente", img: "https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=85&w=400&h=300&fit=crop" },
              { name: "Exterior", cat: "EXTERIOR", desc: "Espacios al aire libre", img: "https://images.unsplash.com/photo-1602860739945-9a61573cd62d?q=85&w=400&h=300&fit=crop" },
            ].map((cat) => (
              <Link key={cat.name} href={`/productos?cat=${cat.cat}`} className="relative block h-64 rounded-2xl overflow-hidden group cursor-pointer">
                <div className="absolute inset-0" style={{ background: `url('${cat.img}') center/cover no-repeat` }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center transition-all" style={{ background: "linear-gradient(135deg, rgba(44, 26, 16, 0.7) 0%, rgba(160, 114, 74, 0.6) 100%)" }}>
                  <h3 className="text-white text-xl font-bold mb-1">{cat.name}</h3>
                  <p className="text-white/90 text-sm mb-4">{cat.desc}</p>
                  <span className="border-2 border-white text-white px-5 py-1.5 rounded-full text-sm font-medium group-hover:bg-white group-hover:text-[#2C1A10] transition-all">
                    Explorar →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A87C] to-transparent" />

      {/* PRODUCTOS */}
      <section className="py-12 px-4 md:py-20 bg-[#F7F3EE]" id="productos">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-[#C9A87C] text-xs tracking-widest uppercase font-semibold mb-3">Catálogo</p>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Nuestros productos
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
            {productos.slice(0, 6).map((p) => {
              const precioEfectivo = p.precioEfectivo ?? Math.round(p.precio * 0.75);
              return (
                <Link key={p.id} href={`/productos/${p.id}`}>
                  <div className="bg-white rounded-2xl shadow hover:shadow-xl transition-all overflow-hidden group border border-[#E0D4C4]">
                    {p.imagenes?.[0] ? (
                      <div className="h-72 overflow-hidden">
                        <img src={p.imagenes[0]} alt={p.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="h-72 bg-[#EFEBE3] flex items-center justify-center">
                        <span className="text-[#C9A87C] text-5xl">🛋️</span>
                      </div>
                    )}
                    <div className="p-5">
                      <h3 className="font-bold text-[#2C1A10] text-base mb-3 line-clamp-2 leading-snug">{p.nombre}</h3>
                      <div className="flex items-end justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-[#2C1A10] font-bold text-lg">${p.precio.toLocaleString("es-AR")}</p>
                            <p className="text-xs text-[#A0724A]">cuotas</p>
                          </div>
                          <div className="flex items-baseline gap-1.5">
                            <p className="text-green-700 font-bold text-lg">${precioEfectivo.toLocaleString("es-AR")}</p>
                            <p className="text-xs text-green-600 font-medium">efectivo</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 items-end shrink-0">
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">25% OFF</span>
                          <span className="bg-[#FFF3E0] text-[#E65100] text-[10px] font-bold px-1.5 py-0.5 rounded-full">6 cuotas sin interés</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="text-center">
            <Link
              href="/productos"
              className="inline-block bg-[#2C1A10] text-white px-10 py-4 rounded-full font-semibold hover:bg-[#A0724A] transition-all text-lg"
            >
              Ver todos los productos →
            </Link>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A87C] to-transparent" />

      {/* ENVÍOS */}
      <section className="py-12 px-4 md:py-20 bg-[#EFEBE3]" id="envios">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <p className="text-[#C9A87C] text-xs tracking-widest uppercase font-semibold mb-3">Envíos</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#2C1A10]" style={{ fontFamily: "'Playfair Display', serif" }}>
              Llegamos a donde estés
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {[
              { title: "Flete a domicilio", desc: "Entrega segura en GBA y CABA directamente en tu puerta", icon: "🚚" },
              { title: "Vía Cargo & Andreani", desc: "Enviamos a todo el país con los mejores transportistas", icon: "📦" },
              { title: "Seguimiento", desc: "Conocé el estado de tu pedido en todo momento", icon: "📍" },
            ].map((item) => (
              <div key={item.title} className="bg-white p-5 md:p-8 rounded-2xl shadow-sm text-center border border-[#E0D4C4]">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-[#2C1A10] text-lg mb-2">{item.title}</h3>
                <p className="text-[#3D2B1F] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-[#2C1A10] text-white rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Llegamos a todos los rincones de Argentina
            </h3>
            <p className="text-white/80">Desde Moreno, Buenos Aires, enviamos con seguridad y rapidez a cualquier punto del país</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A87C] to-transparent" />

      {/* TESTIMONIOS */}
      <section className="py-12 px-4 md:py-20 bg-[#F7F3EE]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-[#2C1A10] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              Lo que dicen nuestros clientes ❤
            </h2>
            <p className="text-[#A0724A] font-medium">Más de 500 familias ya transformaron su hogar con nosotros</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            {[
              { name: "Julia Sagardoy", badge: "Local Guide", text: "Excelente atención, muy buen asesoramiento. Calidad, seriedad, puntualidad a la hora de entregar." },
              { name: "Maiten Ursi", badge: null, text: "Amooo todo, son unos genios. Excelente atención y tienen los mejores precios 💗" },
              { name: "Esteban Tablonski", badge: null, text: "Excelente atención y hermosos productos! Son unos genios!! Recomiendo 100% a Dulce Hogar Diseño y Estilo!!" },
              { name: "Ariel", badge: null, text: "Muy buenos productos, muy buena atención pero por sobretodo excelentes personas! 🤩" },
              { name: "Karina Baez", badge: null, text: "Además del diseño, excelente calidad y la atención espectacular." },
              { name: "Monica Barchuk", badge: null, text: "Hermosos objetos de decoración o para renovar la casa; además de excelente atención y amabilidad." },
            ].map((t) => (
              <div key={t.name} className="bg-white p-6 rounded-2xl shadow-sm border border-[#E0D4C4] flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#C9A87C]/20 flex items-center justify-center text-[#2C1A10] font-bold text-sm shrink-0">
                    {t.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-[#2C1A10] text-sm leading-tight">{t.name}</div>
                    {t.badge && <div className="text-[10px] text-[#A0724A]">{t.badge}</div>}
                  </div>
                  <div className="ml-auto shrink-0">
                    <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </div>
                </div>
                <div className="text-[#F4B400] text-sm mb-3">★★★★★</div>
                <p className="text-[#3D2B1F] text-sm leading-relaxed flex-1">{t.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <a
              href="https://www.google.com/maps/place/Dulce+Hogar+Dise%C3%B1o+%26+Estilo/@-34.5816184,-58.7536031,17.25z/data=!4m6!3m5!1s0x43c32d13b1f30a19:0x7f4d669db8bb3a!8m2!3d-34.5815039!4d-58.7528469!16s%2Fg%2F11mcz3wqw2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-[#E0D4C4] bg-white text-[#2C1A10] px-6 py-3 rounded-full text-sm font-semibold hover:border-[#C9A87C] transition-all shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Ver todas las reseñas en Google
            </a>
          </div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A87C] to-transparent" />

      {/* CTA */}
      <section className="py-12 px-4 md:py-20 bg-gradient-to-br from-[#2C1A10] to-[#1A0E07] text-center relative overflow-hidden" id="contacto">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A87C] to-transparent" />
        <div className="max-w-2xl mx-auto relative z-10">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
            ¿No sabés qué elegir para tu hogar?
          </h2>
          <p className="text-white/80 text-base md:text-lg mb-8">
            Contanos tus gustos y presupuesto, y te asesoramos para crear el espacio que soñás.
          </p>
          <a
            href="https://wa.me/5491126917777?text=Hola%20Flor%20y%20Esteban!%20Quisiera%20asesoramiento%20para%20decorar%20mi%20hogar"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#25D366] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[#1ead54] hover:-translate-y-1 transition-all shadow-lg"
          >
            💬 Hablar con Flor y Esteban
          </a>
          <div className="mt-6">
            <a
              href="https://www.google.com/maps/place/Dulce+Hogar+Dise%C3%B1o+%26+Estilo/@-34.5816184,-58.7536031,17.25z/data=!4m6!3m5!1s0x43c32d13b1f30a19:0x7f4d669db8bb3a!8m2!3d-34.5815039!4d-58.7528469!16s%2Fg%2F11mcz3wqw2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Moreno, Buenos Aires · Ver en Google Maps
            </a>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A87C] to-transparent" />
      </section>

      {/* WHATSAPP FAB */}
      <a
        href="https://wa.me/5491126917777?text=Hola!%20Me%20gustaría%20conocer%20más%20sobre%20vuestros%20productos"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        title="WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
