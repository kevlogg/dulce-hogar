"use client";

import { useState } from "react";

const REVIEWS = [
  {
    name: "Maria Díaz",
    text: "Es precioso, muy cómodo a la vista y con una terminación impecable ✨ Ideal para darle un toque distinguido a cualquier sala. Excelente trabajo.",
    date: "hace 53 minutos",
  },
  {
    name: "Vanesa Ancamil",
    text: "Lo principal de este lugar es la excelente atención de los chicos! Todas tus dudas responden, hacen presupuestos acorde a tu necesidad y siempre predispuestos y con mucha buena onda. Las cosas bellísimas!!!",
    date: "Hace 4 horas",
  },
  {
    name: "Anahi",
    text: "Cuando me mudé hace 1 año, lo primero que compré para la casa nueva fueron las sillas para la barra. Me asesoró Flor y no quedan dudas de que fue la mejor elección. También compré veladores y una manta.",
    date: "Hace 8 horas",
  },
  {
    name: "Liz Flores",
    text: "Muy buena atención, muy recomendable. Fueron súper amables, el producto llegó bien a tiempo y forma.",
    date: "Hace 21 horas",
  },
  {
    name: "Karina Kayser",
    text: "Muy buena atención, el sillón de 10 excelente calidad, estoy muy contenta 🥰 Súper recomendable.",
    date: "Hace 1 día",
  },
  {
    name: "Nicolás Yulán",
    text: "Ya compramos varios de sus productos y son de muy buena calidad. Super recomendables para re-diseñar/decorar tu hogar! Además de la excelente atención que te brindan asesorándote y siempre con buena onda! 🙌",
    date: "Hace 1 día",
  },
  {
    name: "Norma Maier",
    text: "Excelente, me llegó todo. Los chicos una atención especial. La calidad todo perfecto y la confianza, me comuniqué y a los días tenía mi pedido en mi hogar.",
    date: "Hace 2 días",
  },
  {
    name: "mariana Zani",
    text: "Excelente atención, todo muy rápido. Compré un sillón chester con camastro, hermoso. Tienen buenos precios.",
    date: "Hace 2 días",
  },
  {
    name: "Maria Miguels",
    text: "Los sigo desde el primer momento que estuvieron en TikTok. Excelentes los vivos que hacen y la atención que tienen para sus clientes. Soy una de las primeras clientas en TikTok.",
    date: "Hace 23 horas",
  },
];

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function ReviewCard({ r }: { r: typeof REVIEWS[0] }) {
  const initials = r.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="w-72 shrink-0 bg-white p-5 rounded-2xl shadow-sm border border-[#E0D4C4] flex flex-col mx-3">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full bg-[#C9A87C]/20 flex items-center justify-center text-[#2C1A10] font-bold text-xs shrink-0">
          {initials}
        </div>
        <div className="min-w-0">
          <div className="font-bold text-[#2C1A10] text-sm leading-tight truncate">{r.name}</div>
          <div className="text-[10px] text-[#A0724A]">{r.date}</div>
        </div>
        <GoogleIcon />
      </div>
      <div className="text-[#F4B400] text-xs mb-2">★★★★★</div>
      <p className="text-[#3D2B1F] text-sm leading-relaxed flex-1">{r.text}</p>
    </div>
  );
}

const track = [...REVIEWS, ...REVIEWS];

export function TestimonialsCarousel() {
  const [paused, setPaused] = useState(false);

  const animStyle = {
    animation: "reviews-ticker 40s linear infinite",
    animationPlayState: paused ? "paused" : "running",
  };

  return (
    <div
      className="overflow-hidden cursor-pointer select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <div className="flex" style={animStyle}>
        {track.map((r, i) => (
          <ReviewCard key={i} r={r} />
        ))}
      </div>

      <style jsx>{`
        @keyframes reviews-ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
