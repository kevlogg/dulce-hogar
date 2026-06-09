import { MODULOS } from "@/lib/academia"
import { ModuloCard } from "@/components/admin/ModuloCard"

export default function AcademiaPage() {
  return (
    <div className="max-w-5xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-wood-900">Academia</h1>
        <p className="mt-1 text-sm text-wood-500">Recursos para potenciar tu negocio.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MODULOS.map((modulo) => (
          <ModuloCard key={modulo.numero} modulo={modulo} />
        ))}
      </div>
    </div>
  )
}
