import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AuthGuard } from "@/components/admin/AuthGuard";

/** Admin usa Firebase; no prerender en build (Vercel sin credenciales). */
export const dynamic = "force-dynamic";

export default function AdminDashboardLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex bg-wood-50">
        <AdminSidebar />
        <div className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
