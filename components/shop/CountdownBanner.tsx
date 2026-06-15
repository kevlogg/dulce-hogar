"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// 21 de junio 2026 23:59 hora Argentina (UTC-3) = 22 junio 02:59 UTC
const TARGET = new Date("2026-06-22T02:59:00Z");
const PRODUCT_HREF = "/productos/zD0UV9Xa7V5LgpvJgFvd";

function getTimeLeft() {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const min = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const sec = Math.floor((diff % (1000 * 60)) / 1000);
  return { days, hrs, min, sec };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function CountdownBanner() {
  const [visible, setVisible] = useState(false);
  const [time, setTime] = useState(getTimeLeft());

  useEffect(() => {
    if (sessionStorage.getItem("countdown-padre-dismissed")) return;
    if (!getTimeLeft()) return;
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      const t = getTimeLeft();
      setTime(t);
      if (!t) setVisible(false);
    }, 1000);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible || !time) return null;

  return (
    <div className="relative bg-[#74AADB] text-white text-sm select-none">
      <Link
        href={PRODUCT_HREF}
        className="flex items-center justify-center gap-3 sm:gap-5 px-4 py-2.5 hover:bg-[#5A96CC] transition-colors"
      >
        {/* Texto */}
        <span className="hidden sm:flex items-center gap-2 font-semibold whitespace-nowrap">
          🎁 <span>Mecedora Viral — <span className="text-white font-extrabold">ENVÍO GRATIS</span> hasta el 21/6 · Día del Padre</span>
        </span>
        <span className="flex sm:hidden items-center gap-1.5 font-semibold text-xs">
          🎁 Mecedora — <span className="font-extrabold">ENVÍO GRATIS</span> hasta 21/6
        </span>

        {/* Separador */}
        <span className="hidden sm:block text-white/40">·</span>

        {/* Contador */}
        <div className="flex items-center gap-1.5">
          {[
            { v: time.days, label: "DÍAS" },
            { v: time.hrs, label: "HRS" },
            { v: time.min, label: "MIN" },
            { v: time.sec, label: "SEC" },
          ].map(({ v, label }, i) => (
            <div key={label} className="flex items-center gap-1.5">
              {i > 0 && <span className="text-white/60 font-bold text-base leading-none mb-1">:</span>}
              <div className="flex flex-col items-center">
                <span className="bg-[#003DA5] rounded px-1.5 py-0.5 font-mono font-bold text-sm sm:text-base leading-tight min-w-[2rem] text-center">
                  {pad(v)}
                </span>
                <span className="text-[8px] text-white/80 font-semibold mt-0.5 leading-none">{label}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <span className="hidden sm:inline-flex items-center gap-1 bg-[#003DA5] text-white font-bold text-xs px-3 py-1.5 rounded-full hover:bg-[#002d7a] transition-colors whitespace-nowrap">
          Ver Mecedora →
        </span>
      </Link>

      {/* X para cerrar */}
      <button
        onClick={() => {
          sessionStorage.setItem("countdown-padre-dismissed", "1");
          setVisible(false);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors text-lg leading-none"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}
