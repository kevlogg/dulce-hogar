"use client";

import { useEffect, useRef } from "react";

const COLORS = [
  "#74AADB", "#74AADB", "#74AADB",
  "#FFFFFF", "#FFFFFF",
  "#5A96CC", "#A8D4F5",
  "#003DA5",
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  width: number;
  height: number;
  angle: number;
  spin: number;
  opacity: number;
  decay: number;
}

function createParticle(originX: number, originY: number, spread: number): Particle {
  const angle = (-90 + (Math.random() - 0.5) * spread) * (Math.PI / 180);
  const speed = 18 + Math.random() * 22;
  return {
    x: originX,
    y: originY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: 16 + Math.random() * 18,
    height: 8 + Math.random() * 8,
    angle: Math.random() * 360,
    spin: (Math.random() - 0.5) * 8,
    opacity: 1,
    decay: 0.006 + Math.random() * 0.004,
  };
}

export function ConfettiCannon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles: Particle[] = [];
    const W = canvas.width;
    const H = canvas.height;

    // Two cannons: bottom-left and bottom-right
    const guns = [
      { x: W * 0.15, spread: 70 },
      { x: W * 0.85, spread: 70 },
      { x: W * 0.5,  spread: 50 },
    ];

    // Burst: fire 180 particles total
    for (const gun of guns) {
      for (let i = 0; i < 60; i++) {
        particles.push(createParticle(gun.x, H, gun.spread));
      }
    }

    const gravity = 0.25;
    let frame = 0;
    let raf: number;

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.spin;
        p.opacity -= p.decay;

        if (p.opacity <= 0) { particles.splice(i, 1); continue; }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
        ctx.restore();
      }

      frame++;
      if (particles.length > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        canvas.style.pointerEvents = "none";
        canvas.style.opacity = "0";
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[9999] pointer-events-none"
      aria-hidden="true"
    />
  );
}
