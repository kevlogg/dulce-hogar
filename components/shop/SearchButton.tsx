"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export function SearchButton() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); setQuery(""); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    setQuery("");
    router.push(q ? `/productos?q=${encodeURIComponent(q)}` : "/productos");
  }

  return (
    <div className="relative flex items-center">
      {open ? (
        <form onSubmit={submit} className="flex items-center gap-1">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="w-44 sm:w-56 border border-[#C9A87C] rounded-full px-3 py-1.5 text-sm text-[#2C1A10] focus:outline-none focus:ring-1 focus:ring-[#C9A87C] bg-white"
          />
          <button type="submit" className="p-1.5 text-[#2C1A10] hover:text-[#C9A87C] transition-colors">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
          <button type="button" onClick={() => { setOpen(false); setQuery(""); }} className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none">
            ✕
          </button>
        </form>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="p-2 text-[#2C1A10] hover:text-[#C9A87C] transition-colors"
          aria-label="Buscar"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
            <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </button>
      )}
    </div>
  );
}
