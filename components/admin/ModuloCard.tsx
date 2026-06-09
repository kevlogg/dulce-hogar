import { Download, Clock } from "lucide-react"
import type { Modulo } from "@/lib/academia"

export function ModuloCard({ modulo }: { modulo: Modulo }) {
  const numero = String(modulo.numero).padStart(2, "0")

  return (
    <div className="flex flex-col rounded-lg border border-wood-200 bg-white p-6 gap-4">
      <div className="flex items-start justify-between gap-3">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-wood-100 text-xs font-medium text-wood-700">
          {numero}
        </span>
        <div className="flex items-center gap-1 text-xs text-wood-500">
          <Clock className="h-3.5 w-3.5" />
          {modulo.duracion}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="font-medium leading-snug text-wood-900">{modulo.titulo}</p>
        <p className="text-sm text-wood-600">{modulo.descripcion}</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {modulo.temas.map((tema) => (
          <span
            key={tema}
            className="rounded-full border border-wood-200 bg-wood-50 px-2.5 py-0.5 text-xs text-wood-600"
          >
            {tema}
          </span>
        ))}
      </div>

      <a
        href={modulo.pdf}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex items-center gap-1.5 self-start rounded-md bg-wood-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-wood-900"
      >
        <Download className="h-4 w-4" />
        Descargar PDF
      </a>
    </div>
  )
}
