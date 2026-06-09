"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  Star,
  CreditCard,
  BookOpen,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SITE_NAME } from "@/lib/site-config";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  // Agregar secciones del cliente aquí:
  { href: "/admin/seccion-1", label: "Sección 1", icon: Folder },
  { href: "/admin/seccion-2", label: "Sección 2", icon: Star },
  { href: "/admin/plan", label: "Mi Plan", icon: CreditCard },
  { href: "/admin/academia", label: "Academia", icon: BookOpen },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-56 shrink-0 border-r border-wood-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-wood-200 px-4">
        <span className="font-medium text-wood-900">{SITE_NAME}</span>
      </div>
      <nav className="p-2">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition",
                isActive
                  ? "bg-wood-100 font-medium text-wood-900"
                  : "text-wood-600 hover:bg-wood-50 hover:text-wood-800"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-wood-200 p-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-wood-600 hover:bg-wood-50 hover:text-wood-800"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
