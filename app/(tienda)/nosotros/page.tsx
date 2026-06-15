import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nuestra historia | Dulce Hogar",
  description:
    "Conocé la historia detrás de Dulce Hogar Diseño & Estilo. Dos emprendedores que apostaron por sus sueños y hoy ayudan a que cada casa se sienta más un hogar.",
};

const ARTICLE_URL =
  "https://misionesonline.net/2026/03/28/misiones-renunciaron-y-se-dedican-a-emprender-2/";

async function getOGImage(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" },
    });
    const html = await res.text();
    const match =
      html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/) ??
      html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

export default async function NosotrosPage() {
  const ogImage = await getOGImage(ARTICLE_URL);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 md:py-20">
      <Link href="/" className="text-sm text-[#A0724A] hover:text-[#2C1A10] transition-colors mb-8 inline-block">
        ← Volver al inicio
      </Link>

      {/* Título */}
      <h1
        className="text-3xl md:text-4xl font-bold text-[#2C1A10] mb-2 leading-tight"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        Nuestra historia
      </h1>
      <div className="w-16 h-1 bg-[#C9A87C] rounded-full mb-10" />

      {/* Foto */}
      <div className="w-full rounded-2xl overflow-hidden mb-10 border border-[#E0D4C4] shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/nosotros.png"
          alt="Florencia y Esteban — Dulce Hogar"
          className="w-full h-auto block"
        />
      </div>

      {/* Texto */}
      <div className="space-y-5 text-[#3D2B1F] leading-relaxed text-base md:text-lg">
        <p className="font-semibold text-[#2C1A10] text-xl md:text-2xl" style={{ fontFamily: "'Playfair Display', serif" }}>
          Detrás de cada producto hay una historia.
        </p>
        <p>
          La nuestra comenzó con dos emprendedores que decidieron apostar por sus sueños cuando nada estaba asegurado. Con esfuerzo, sacrificios y muchísimas ganas de salir adelante, fuimos construyendo paso a paso lo que hoy es Dulce Hogar Diseño &amp; Estilo. 🤍
        </p>
        <p>
          Nuestra historia llegó a miles de personas y hasta fue compartida por medios de comunicación, pero lo más importante sigue siendo lo mismo: ayudar a que cada casa se sienta más un hogar.
        </p>
        <p>
          Creemos en el trabajo honesto, en la atención personalizada y en los detalles que transforman los espacios y los momentos. ✨
        </p>
        <p>
          Gracias por acompañarnos en este camino. Cada compra es parte de esta historia que seguimos escribiendo todos los días.
        </p>
      </div>

      {/* Video */}
      <div className="mt-10">
        <div className="relative w-full rounded-2xl overflow-hidden border border-[#E0D4C4] shadow-sm" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src="https://www.dailymotion.com/embed/video/xa3jt26"
            className="absolute inset-0 w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title="Nuestra historia — Dulce Hogar"
          />
        </div>
      </div>

      {/* Nota de prensa — preview estilo WhatsApp */}
      <div className="mt-12">
        <p className="text-xs font-semibold text-[#A0724A] uppercase tracking-widest mb-4">En los medios</p>
        <a
          href={ARTICLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group block bg-white border border-[#E0D4C4] rounded-2xl overflow-hidden hover:border-[#C9A87C] hover:shadow-md transition-all"
        >
          {ogImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={ogImage}
              alt="Nota en Misiones Online"
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4 border-l-4 border-[#C9A87C]">
            <p className="text-[10px] font-semibold text-[#A0724A] uppercase tracking-widest mb-1">
              misionesonline.net
            </p>
            <p className="font-bold text-[#2C1A10] text-sm leading-snug mb-1 group-hover:text-[#A0724A] transition-colors">
              Cansados de sus trabajos en la fuerza, un viaje a Misiones les cambió la vida y se dedicaron a emprender
            </p>
            <p className="text-xs text-[#A0724A] leading-relaxed line-clamp-2">
              Flor y Esteban, después de renunciar a sus trabajos en la fuerza y tomar la valiente decisión de mudarse a Misiones, apostaron por un nuevo comienzo.
            </p>
          </div>
        </a>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <a
          href={ARTICLE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#2C1A10] text-white px-8 py-3.5 rounded-full font-semibold hover:bg-[#A0724A] transition-all"
        >
          Ver nota completa →
        </a>
      </div>
    </div>
  );
}
