"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_NAME } from "@/lib/site-config";
import { Button } from "@/components/ui/button";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError(data.error ?? "Error al iniciar sesión");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-wood-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-serif text-xl font-medium text-wood-900">{SITE_NAME}</h1>
          <p className="text-sm text-wood-500">Panel de administración</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-wood-200 bg-white p-6 shadow-sm space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-wood-700">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full rounded-md border border-wood-200 bg-wood-50 px-3 py-2 text-wood-900 focus:outline-none focus:ring-1 focus:ring-wood-400"
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
}
