import { PlanWidget } from "@/components/admin/PlanWidget";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-serif text-2xl font-medium text-wood-900">Dashboard</h1>
      <p className="mt-1 text-sm text-wood-500">Bienvenido al panel de administración.</p>

      <div className="mt-6">
        <PlanWidget />
      </div>
    </div>
  );
}
