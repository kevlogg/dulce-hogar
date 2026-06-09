"use client";

// La protección real la maneja el middleware (JWT cookie).
// Este componente existe por compatibilidad con el layout — simplemente renderiza.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
