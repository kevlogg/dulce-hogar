"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, AlertCircle, Download, Save } from "lucide-react";

interface IPCRecord {
  id: string;
  month: string;
  factor: number;
}

interface SeedData {
  month: string;
  factor: number;
}

const SEED_DATA: SeedData[] = [
  { month: "2026-01", factor: 1.0268 },
  { month: "2026-02", factor: 1.0187 },
  { month: "2026-03", factor: 1.0142 },
  { month: "2026-04", factor: 1.0156 },
  { month: "2026-05", factor: 1.0173 },
  { month: "2026-06", factor: 1.0195 },
];

export function IPCManager() {
  const [records, setRecords] = useState<IPCRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMonth, setNewMonth] = useState("");
  const [newFactor, setNewFactor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [seedLoading, setSeedLoading] = useState(false);
  const [useLocal, setUseLocal] = useState(false);

  useEffect(() => {
    loadRecords();
    checkLocalStorage();
  }, []);

  function checkLocalStorage() {
    const stored = localStorage.getItem("ipc_records");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (Array.isArray(data) && data.length > 0) {
          setUseLocal(true);
        }
      } catch (e) {
        console.error("Error parsing stored IPC records");
      }
    }
  }

  async function loadRecords() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/ipc");
      const data = await res.json();
      if (data.records && data.records.length > 0) {
        setRecords(data.records);
        setUseLocal(false);
      } else {
        // Si no hay datos en Firestore, intentar cargar del localStorage
        const stored = localStorage.getItem("ipc_records");
        if (stored) {
          try {
            const localRecords = JSON.parse(stored);
            setRecords(localRecords);
            setUseLocal(true);
          } catch (e) {
            // No hay datos ni locales
          }
        }
      }
    } catch (e) {
      // Si falla la conexión, usar localStorage
      const stored = localStorage.getItem("ipc_records");
      if (stored) {
        try {
          const localRecords = JSON.parse(stored);
          setRecords(localRecords);
          setUseLocal(true);
        } catch (e) {
          setError("Error al cargar registros IPC");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!newMonth || !newFactor) {
      setError("Completa mes y factor");
      return;
    }

    try {
      setSubmitting(true);
      const newRecord: IPCRecord = {
        id: newMonth,
        month: newMonth,
        factor: parseFloat(newFactor)
      };

      // Intentar guardar en Firestore
      const res = await fetch("/api/admin/ipc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month: newMonth,
          factor: parseFloat(newFactor)
        })
      });

      let savedInFirestore = false;
      if (res.ok) {
        savedInFirestore = true;
        setUseLocal(false);
      }

      // Siempre guardar también en localStorage como respaldo
      const updatedRecords = [newRecord, ...records];
      localStorage.setItem("ipc_records", JSON.stringify(updatedRecords));
      setRecords(updatedRecords);

      setNewMonth("");
      setNewFactor("");
      setError("");
      setSuccess(savedInFirestore ? "✅ Guardado en Firestore" : "✅ Guardado localmente (sin Firestore)");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError("Error al guardar");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este registro?")) return;

    try {
      // Intentar eliminar de Firestore
      await fetch(`/api/admin/ipc/${id}`, { method: "DELETE" }).catch(() => {});

      // Eliminar del localStorage
      const updated = records.filter(r => r.id !== id);
      localStorage.setItem("ipc_records", JSON.stringify(updated));
      setRecords(updated);
    } catch (e) {
      setError("Error al eliminar");
    }
  }

  async function handleLoadSeed() {
    if (!confirm(`¿Cargar los 6 últimos meses de IPC?\n\nEstos datos se guardarán ${useLocal || records.length === 0 ? "localmente" : "en Firestore"}.`)) return;

    try {
      setSeedLoading(true);

      // Intentar cargar en Firestore
      const res = await fetch("/api/admin/ipc/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: false })
      });

      let savedInFirestore = false;
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          savedInFirestore = true;
        }
      }

      // Convertir seed data a registros
      const seedRecords: IPCRecord[] = SEED_DATA.map((d, i) => ({
        id: `${i}-${d.month}`,
        month: d.month,
        factor: d.factor
      }));

      // Guardar en localStorage
      localStorage.setItem("ipc_records", JSON.stringify(seedRecords));
      setRecords(seedRecords);
      setUseLocal(!savedInFirestore);

      const accumulated = SEED_DATA.reduce((acc, d) => acc * d.factor, 1);
      setSuccess(`✅ ${SEED_DATA.length} registros cargados\nFactor acumulado: +${((accumulated - 1) * 100).toFixed(2)}%`);
      setTimeout(() => setSuccess(""), 4000);
    } catch (e) {
      setError("Error al cargar datos iniciales");
    } finally {
      setSeedLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-wood-200 bg-white p-6 space-y-6">
      <div>
        <h2 className="font-medium text-wood-900">Registros IPC Mensuales</h2>
        <p className="text-sm text-wood-500 mt-1">
          Ingresa el factor mensual del IPC (componente Servicios) del INDEC.
        </p>
        {useLocal && (
          <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
            ⚠️ Guardando localmente (sin Firestore conectado). Se sincronizará cuando conectes un Firebase.
          </p>
        )}
      </div>

      {error && (
        <div className="flex gap-2 rounded-md bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex gap-2 rounded-md bg-green-50 p-3 text-sm text-green-700">
          <Save className="h-4 w-4 shrink-0 mt-0.5" />
          <span className="whitespace-pre-line">{success}</span>
        </div>
      )}

      {records.length === 0 && !loading && (
        <button
          onClick={handleLoadSeed}
          disabled={seedLoading}
          className="flex items-center justify-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-base font-semibold text-white hover:bg-blue-700 disabled:opacity-50 w-full shadow-md"
        >
          <Download className="h-5 w-5" />
          {seedLoading ? "Cargando..." : "📥 Cargar datos iniciales (últimos 6 meses)"}
        </button>
      )}

      <form onSubmit={handleAddRecord} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-wood-700 mb-1">
              Mes (YYYY-MM)
            </label>
            <input
              type="text"
              placeholder="2026-07"
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              className="w-full rounded-md border border-wood-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wood-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-wood-700 mb-1">
              Factor (ej: 1.025)
            </label>
            <input
              type="number"
              step="0.001"
              placeholder="1.025"
              value={newFactor}
              onChange={(e) => setNewFactor(e.target.value)}
              className="w-full rounded-md border border-wood-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wood-500"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-wood-800 px-3 py-2 text-sm font-medium text-white hover:bg-wood-900 disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {submitting ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </div>
      </form>

      <div className="space-y-2">
        <p className="text-xs uppercase font-medium text-wood-600">
          Últimos 12 meses {useLocal && "📱 (Local)"}
        </p>
        {loading ? (
          <p className="text-sm text-wood-500">Cargando...</p>
        ) : records.length === 0 ? (
          <p className="text-sm text-wood-500">Sin registros IPC. Carga los datos iniciales arriba.</p>
        ) : (
          <div className="space-y-2">
            {records.slice(0, 12).map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-md bg-wood-50 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-wood-900">{record.month}</p>
                  <p className="text-sm text-wood-600">
                    Factor: {record.factor.toFixed(4)} ({((record.factor - 1) * 100).toFixed(2)}%)
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(record.id)}
                  className="rounded-md p-2 text-wood-600 hover:bg-red-100 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
