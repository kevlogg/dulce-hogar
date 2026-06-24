"use client";

import { useState } from "react";

const items = [
  { icon: "🛋️", text: "PROMO MUNDIAL — descuento en sofás y combos mesa + sillas" },
  { icon: "🚚", text: "ENVÍO GRATIS en compras superiores a $299.000" },
  { icon: "💳", text: "3 Y 6 CUOTAS FIJAS sin interés" },
  { icon: "💵", text: "25% DE DESCUENTO pagando en efectivo" },
  { icon: "🚚", text: "FLETE A DOMICILIO en GBA y CABA" },
  { icon: "📦", text: "ENVÍOS A TODO EL PAÍS por Vía Cargo y Andreani" },
];

const ticker = [...items, ...items];

function SolDeMayo() {
  return (
    <svg
      className="mx-6 shrink-0"
      width="18"
      height="18"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Rayos rectos */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="50" y1="14"
          x2="50" y2="6"
          stroke="#F0C040"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      {/* Rayos ondulados (entre los rectos) */}
      {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
        <line
          key={deg}
          x1="50" y1="16"
          x2="50" y2="9"
          stroke="#F0C040"
          strokeWidth="2.5"
          strokeLinecap="round"
          transform={`rotate(${deg} 50 50)`}
        />
      ))}
      {/* Círculo central */}
      <circle cx="50" cy="50" r="20" fill="#F0C040" stroke="#D4A820" strokeWidth="1.5" />
      {/* Cara */}
      <circle cx="43" cy="46" r="2.5" fill="#8B6914" />
      <circle cx="57" cy="46" r="2.5" fill="#8B6914" />
      <path d="M43 56 Q50 62 57 56" stroke="#8B6914" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function TickerTrack({ paused }: { paused: boolean }) {
  const style = {
    animation: "ticker 30s linear infinite",
    animationPlayState: paused ? "paused" : "running",
    willChange: "transform",
  };
  const track = (
    <div className="flex shrink-0" style={style}>
      {ticker.map((item, i) => (
        <div key={i} className="flex items-center shrink-0">
          <span className="text-sm mr-2">{item.icon}</span>
          <span className="text-[#1a1a1a] text-xs font-bold tracking-wide whitespace-nowrap uppercase">
            {item.text}
          </span>
          <SolDeMayo />
        </div>
      ))}
    </div>
  );
  return <>{track}{track}</>;
}

export function PromoBanner() {
  const [paused, setPaused] = useState(false);

  return (
    <div className="select-none overflow-hidden">
      {/* Franja superior — celeste */}
      <div className="h-3 bg-[#74AADB]" />

      {/* Franja del medio — blanca con ticker */}
      <div
        className="bg-white py-2 overflow-hidden cursor-pointer"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        <div className="flex">
          <TickerTrack paused={paused} />
        </div>
      </div>

      {/* Franja inferior — celeste */}
      <div className="h-3 bg-[#74AADB]" />

      <style jsx>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </div>
  );
}
