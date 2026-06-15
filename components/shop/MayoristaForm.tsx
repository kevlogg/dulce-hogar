"use client";

import { useState } from "react";

type Estado = "idle" | "enviando" | "ok" | "error";

export function MayoristaForm() {
  const [estado, setEstado] = useState<Estado>("idle");
  const [form, setForm] = useState({
    nombre: "",
    negocio: "",
    telefono: "",
    email: "",
    monto: "",
    mensaje: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setEstado("enviando");
    try {
      const res = await fetch("/api/contacto/mayoristas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setEstado(res.ok ? "ok" : "error");
    } catch {
      setEstado("error");
    }
  }

  if (estado === "ok") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-8 text-center">
        <p className="text-2xl mb-2">✅</p>
        <p className="font-bold text-green-800 mb-1">¡Solicitud enviada!</p>
        <p className="text-sm text-green-700">Nos ponemos en contacto a la brevedad.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[#E0D4C4] p-5 space-y-3">
      <p className="text-xs text-[#A0724A] font-semibold uppercase tracking-wide mb-1">📋 Solicitud mayorista</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[#3D2B1F] block mb-1">
            Nombre y apellido <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={form.nombre}
            onChange={(e) => set("nombre", e.target.value)}
            placeholder="Juan García"
            className="w-full border border-[#E0D4C4] rounded-xl px-3 py-2.5 text-sm text-[#2C1A10] placeholder-[#C0B0A0] focus:outline-none focus:border-[#C9A87C]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#3D2B1F] block mb-1">Negocio / Local</label>
          <input
            type="text"
            value={form.negocio}
            onChange={(e) => set("negocio", e.target.value)}
            placeholder="Nombre del local"
            className="w-full border border-[#E0D4C4] rounded-xl px-3 py-2.5 text-sm text-[#2C1A10] placeholder-[#C0B0A0] focus:outline-none focus:border-[#C9A87C]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#3D2B1F] block mb-1">
            Teléfono <span className="text-red-400">*</span>
          </label>
          <input
            type="tel"
            required
            value={form.telefono}
            onChange={(e) => set("telefono", e.target.value)}
            placeholder="+54 9 11 0000-0000"
            className="w-full border border-[#E0D4C4] rounded-xl px-3 py-2.5 text-sm text-[#2C1A10] placeholder-[#C0B0A0] focus:outline-none focus:border-[#C9A87C]"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-[#3D2B1F] block mb-1">
            Email <span className="text-red-400">*</span>
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="tu@email.com"
            className="w-full border border-[#E0D4C4] rounded-xl px-3 py-2.5 text-sm text-[#2C1A10] placeholder-[#C0B0A0] focus:outline-none focus:border-[#C9A87C]"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[#3D2B1F] block mb-1">Monto estimado del pedido</label>
        <select
          value={form.monto}
          onChange={(e) => set("monto", e.target.value)}
          className="w-full border border-[#E0D4C4] rounded-xl px-3 py-2.5 text-sm text-[#2C1A10] focus:outline-none focus:border-[#C9A87C] bg-white"
        >
          <option value="">Seleccioná un rango</option>
          <option value="$400.000 - $600.000">$400.000 - $600.000</option>
          <option value="$600.000 - $1.200.000">$600.000 - $1.200.000</option>
          <option value="$1.200.000 - $2.500.000">$1.200.000 - $2.500.000</option>
          <option value="Más de $2.500.000">Más de $2.500.000</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-[#3D2B1F] block mb-1">Mensaje / consulta</label>
        <textarea
          value={form.mensaje}
          onChange={(e) => set("mensaje", e.target.value)}
          placeholder="Contanos qué productos te interesan o cualquier consulta..."
          rows={3}
          className="w-full border border-[#E0D4C4] rounded-xl px-3 py-2.5 text-sm text-[#2C1A10] placeholder-[#C0B0A0] focus:outline-none focus:border-[#C9A87C] resize-none"
        />
      </div>

      {estado === "error" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
          Hubo un error al enviar. Intentá de nuevo o escribinos por WhatsApp.
        </p>
      )}

      <button
        type="submit"
        disabled={estado === "enviando"}
        className="w-full bg-[#2C1A10] text-white py-3 rounded-full font-semibold hover:bg-[#A0724A] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {estado === "enviando" ? "Enviando..." : "Enviar solicitud"}
      </button>
    </form>
  );
}
