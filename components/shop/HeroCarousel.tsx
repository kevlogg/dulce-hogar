"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const SLIDES = [
  { src: "/hero-1.png", alt: "Mesa comedor", href: "/productos/HhU8g9SHFmnhqb8PGrdY" },
  { src: "/hero-2.png", alt: "Sofá Chesterfield", href: "/productos/MN4NIEhcb1qJVlOJDrkq" },
  { src: "/hero-3.png", alt: "Mecedora Viral", href: "/productos/zD0UV9Xa7V5LgpvJgFvd" },
  { src: "/hero-4.png", alt: "Hamaca Jamaica", href: "/productos/8hJeUae5CazAyrSSFRtz" },
  { src: "/hero-5.png", alt: "Mecedora Viral", href: "/productos/zD0UV9Xa7V5LgpvJgFvd" },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % SLIDES.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <section
      id="inicio"
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(240px, 60vw, calc(100vh - 8rem))" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {SLIDES.map((slide, i) => (
        <Link
          key={slide.src}
          href={slide.href}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
          tabIndex={i === current ? 0 : -1}
        >
          <img
            src={slide.src}
            alt={slide.alt}
            className="w-full h-full object-cover"
          />
        </Link>
      ))}

      {/* Flechas */}
      <button
        onClick={(e) => { e.preventDefault(); prev(); }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all text-xl"
        aria-label="Anterior"
      >
        ‹
      </button>
      <button
        onClick={(e) => { e.preventDefault(); next(); }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-black/20 hover:bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center transition-all text-xl"
        aria-label="Siguiente"
      >
        ›
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all ${
              i === current ? "w-6 h-2.5 bg-white" : "w-2.5 h-2.5 bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
