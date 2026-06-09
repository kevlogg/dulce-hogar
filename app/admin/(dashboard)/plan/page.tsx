"use client";

import { useEffect, useState, useCallback } from "react";
import { Copy, Check, AlertTriangle, Clock, CreditCard, Info } from "lucide-react";
import { CardPaymentModal } from "@/components/admin/CardPaymentModal";

interface BillingConfig {
  plan_type: "monthly" | "one_time";
  monthly_amount: number;
  monthly_annual_increase_pct: number;
  monthly_next_date: string;
  one_time_amount: number;
  one_time_paid_date?: string;
  maintenance_amount: number;
  maintenance_next_date?: string;
  variable_increase_min: number;
  variable_increase_max: number;
  cbu: string;
  alias: string;
  developer_name: string;
  developer_whatsapp: string;
  mp_card_last_four?: string;
  mp_card_brand?: string;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  concept: string;
  confirmed: boolean;
}

interface IPCEstimate {
  hasData: boolean;
  factor: number;
  cumulativeFactor: number;
  currentAmount: number;
  estimatedAmount: number;
  difference: number;
  monthsUsed: string[];
}

const DEFAULT_CONFIG: BillingConfig = {
  plan_type: "monthly",
  monthly_amount: 25000,
  monthly_annual_increase_pct: 25,
  monthly_next_date: "",
  one_time_amount: 190000,
  maintenance_amount: 35000,
  variable_increase_min: 15,
  variable_increase_max: 40,
  cbu: "",
  alias: "",
  developer_name: "Kevin Loggia",
  developer_whatsapp: "",
};

function formatARS(n: number) {
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
}

function daysUntil(dateStr?: string): number {
  if (!dateStr) return Infinity;
  const target = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function brandLabel(brand: string): string {
  const labels: Record<string, string> = {
    visa: "Visa",
    master: "Mastercard",
    debit_visa: "Visa Debito",
    debit_master: "Mastercard Debito",
    amex: "Amex",
    naranja: "Naranja",
    cabal: "Cabal",
  };
  return labels[brand] ?? brand.charAt(0).toUpperCase() + brand.slice(1);
}

export default function AdminPlanPage() {
  const [config, setConfig] = useState<BillingConfig>(DEFAULT_CONFIG);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [monthlyEstimate, setMonthlyEstimate] = useState<IPCEstimate | null>(null);
  const [oneTimeEstimate, setOneTimeEstimate] = useState<IPCEstimate | null>(null);
  const [maintenanceEstimate, setMaintenanceEstimate] = useState<IPCEstimate | null>(null);

  const calculateEstimates = useCallback(async (cfg: BillingConfig) => {
    try {
      if (cfg.monthly_next_date) {
        const res = await fetch("/api/admin/ipc/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nextPaymentDate: cfg.monthly_next_date,
            currentAmount: cfg.monthly_amount,
            planType: "monthly"
          })
        });
        const data = await res.json();
        setMonthlyEstimate(data);
      }

      if (cfg.maintenance_next_date) {
        const res = await fetch("/api/admin/ipc/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nextPaymentDate: cfg.maintenance_next_date,
            currentAmount: cfg.maintenance_amount,
            planType: "maintenance"
          })
        });
        const data = await res.json();
        setMaintenanceEstimate(data);
      }
    } catch (e) {
      console.error("Error calculating estimates:", e);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    const [cfgRes, payRes] = await Promise.all([
      fetch("/api/admin/billing"),
      fetch("/api/admin/billing/payments"),
    ]);
    const cfgJson = await cfgRes.json();
    const payJson = await payRes.json();
    if (cfgJson.config) {
      const newConfig = { ...DEFAULT_CONFIG, ...cfgJson.config };
      setConfig(newConfig);
      calculateEstimates(newConfig);
    }
    if (payJson.payments) setPayments(payJson.payments);
    setLoading(false);
  }, [calculateEstimates]);

  useEffect(() => { load(); }, [load]);

  function copyCBU() {
    navigator.clipboard.writeText(config.cbu);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePaymentSuccess(_data: { cardLastFour: string; cardBrand: string; pending?: boolean }) {
    setModalOpen(false);
    load();
  }

  const isMonthly = config.plan_type === "monthly";
  const nextDate = isMonthly ? config.monthly_next_date : config.maintenance_next_date;
  const nextAmount = isMonthly ? config.monthly_amount : config.maintenance_amount;
  const days = daysUntil(nextDate);
  const isOverdue = days < 0;
  const isDueSoon = days >= 0 && days <= 7;

  if (loading) return <p className="text-wood-500">Cargando...</p>;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-medium text-wood-900">Mi Plan</h1>
        <p className="mt-1 text-sm text-wood-500">Detalle del acuerdo de servicio y condiciones.</p>
      </div>

      {nextDate && (isOverdue || isDueSoon) && (
        <div className={`flex items-start gap-3 rounded-lg p-4 ${isOverdue ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
          <AlertTriangle className={`mt-0.5 h-5 w-5 shrink-0 ${isOverdue ? "text-red-500" : "text-amber-500"}`} />
          <div>
            <p className={`font-medium ${isOverdue ? "text-red-800" : "text-amber-800"}`}>
              {isOverdue
                ? `Pago vencido hace ${Math.abs(days)} dias`
                : days === 0
                ? "El pago vence hoy"
                : `El pago vence en ${days} dias`}
            </p>
            <p className={`text-sm ${isOverdue ? "text-red-600" : "text-amber-600"}`}>
              {formatARS(nextAmount)} — {nextDate}
            </p>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-wood-200 bg-white p-6 space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-wood-600" />
          <h2 className="font-medium text-wood-900">Plan activo</h2>
        </div>

        <div className="flex flex-wrap gap-6">
          <div>
            <p className="text-xs text-wood-500 uppercase tracking-wide">Inicio del proyecto</p>
            <p className="font-medium text-wood-900">11/05/2026</p>
          </div>
          <div>
            <p className="text-xs text-wood-500 uppercase tracking-wide">Tipo</p>
            <p className="font-medium text-wood-900">{isMonthly ? "Mensual" : "Pago unico + mantenimiento"}</p>
          </div>
          {isMonthly ? (
            <>
              <div>
                <p className="text-xs text-wood-500 uppercase tracking-wide">Monto actual</p>
                <p className="font-medium text-wood-900">{formatARS(config.monthly_amount)}/mes</p>
              </div>
              <div>
                <p className="text-xs text-wood-500 uppercase tracking-wide">Aumento anual</p>
                <p className="font-medium text-wood-900">{config.monthly_annual_increase_pct}%</p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-xs text-wood-500 uppercase tracking-wide">Pago unico abonado</p>
                <p className="font-medium text-wood-900">{formatARS(config.one_time_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-wood-500 uppercase tracking-wide">Mantenimiento anual</p>
                <p className="font-medium text-wood-900">{formatARS(config.maintenance_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-wood-500 uppercase tracking-wide">Aumento variable</p>
                <p className="font-medium text-wood-900">{config.variable_increase_min}–{config.variable_increase_max}%</p>
              </div>
            </>
          )}
        </div>

        {nextDate && (
          <div className="flex items-center gap-2 rounded-md bg-wood-50 px-4 py-3">
            <Clock className="h-4 w-4 text-wood-600 shrink-0" />
            <span className="text-sm text-wood-700">
              {isMonthly ? "Proximo pago:" : "Proximo mantenimiento:"} <strong>{nextDate}</strong> — {formatARS(nextAmount)}
              {days !== Infinity && (
                <span className={`ml-2 font-medium ${isOverdue ? "text-red-600" : isDueSoon ? "text-amber-600" : "text-wood-500"}`}>
                  ({isOverdue ? `vencido hace ${Math.abs(days)} dias` : days === 0 ? "hoy" : `en ${days} dias`})
                </span>
              )}
            </span>
          </div>
        )}

        <div className="rounded-md border border-wood-200 p-4 space-y-3">
          <p className="text-sm font-medium text-wood-700">Forma de pago — {config.developer_name}</p>

          {config.mp_card_last_four ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span className="text-sm text-wood-800">
                  {config.mp_card_brand ? brandLabel(config.mp_card_brand) : "Tarjeta"} ****{config.mp_card_last_four}
                </span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  Cobro automatico activo
                </span>
              </div>
              <p className="text-xs text-wood-500">El cobro se realizara automaticamente el dia 11 de cada mes.</p>
              <button
                onClick={() => setModalOpen(true)}
                className="text-xs text-wood-400 underline hover:text-wood-600"
              >
                Cambiar tarjeta
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {config.cbu && (
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-wood-800">{config.cbu}</p>
                  <button
                    onClick={copyCBU}
                    className="flex items-center gap-1 rounded bg-wood-100 px-2 py-1 text-xs text-wood-700 hover:bg-wood-200"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    {copied ? "Copiado" : "Copiar CBU"}
                  </button>
                </div>
              )}
              {config.alias && <p className="text-xs text-wood-500">Alias: {config.alias}</p>}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-md bg-wood-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-wood-900"
                >
                  <CreditCard className="h-4 w-4" />
                  Pagar con tarjeta
                </button>
                {config.developer_whatsapp && (
                  <a
                    href={`https://wa.me/${config.developer_whatsapp}?text=${encodeURIComponent(`Hola Kevin, te paso el comprobante de pago del plan (${nextDate ?? ""}).`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Enviar comprobante por WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {(monthlyEstimate?.hasData || maintenanceEstimate?.hasData) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            <h2 className="font-medium text-blue-900">Estimado de próximo ajuste IPC</h2>
          </div>
          <p className="text-sm text-blue-700">
            Basado en los últimos 6 meses de variación del componente Servicios del IPC (INDEC), estos serían tus valores estimados en el próximo ajuste:
          </p>
          <div className="space-y-3">
            {monthlyEstimate?.hasData && (
              <div className="rounded-md bg-white p-3 space-y-1">
                <p className="text-sm font-medium text-wood-900">Plan mensual</p>
                <p className="text-xs text-wood-600">Valor actual: {formatARS(monthlyEstimate.currentAmount)}</p>
                <p className="text-sm font-medium text-blue-700">
                  Estimado: {formatARS(monthlyEstimate.estimatedAmount)}
                  <span className="text-xs text-blue-600 ml-1">
                    (+{monthlyEstimate.difference > 0 ? "+" : ""}{monthlyEstimate.difference.toLocaleString("es-AR")})
                  </span>
                </p>
                <p className="text-xs text-wood-500">Factor acumulado: {(monthlyEstimate.cumulativeFactor * 100).toFixed(2)}%</p>
              </div>
            )}
            {maintenanceEstimate?.hasData && (
              <div className="rounded-md bg-white p-3 space-y-1">
                <p className="text-sm font-medium text-wood-900">Mantenimiento</p>
                <p className="text-xs text-wood-600">Valor actual: {formatARS(maintenanceEstimate.currentAmount)}</p>
                <p className="text-sm font-medium text-blue-700">
                  Estimado: {formatARS(maintenanceEstimate.estimatedAmount)}
                  <span className="text-xs text-blue-600 ml-1">
                    (+{maintenanceEstimate.difference > 0 ? "+" : ""}{maintenanceEstimate.difference.toLocaleString("es-AR")})
                  </span>
                </p>
                <p className="text-xs text-wood-500">Factor acumulado: {(maintenanceEstimate.cumulativeFactor * 100).toFixed(2)}%</p>
              </div>
            )}
          </div>
          <p className="text-xs text-blue-600 border-t border-blue-200 pt-3">
            Este estimado se basa en los últimos 6 meses de datos IPC disponibles. El valor final se confirmará en la fecha de ajuste.
          </p>
        </div>
      )}

      <div className="rounded-lg border border-wood-200 bg-white p-6 space-y-5">
        <div className="flex items-center gap-2">
          <Info className="h-5 w-5 text-wood-600" />
          <h2 className="font-medium text-wood-900">Condiciones del acuerdo</h2>
        </div>
        <div className="space-y-4 text-sm text-wood-700">
          <div>
            <p className="font-medium text-wood-900 mb-1">Plan mensual</p>
            <ul className="space-y-1 list-disc list-inside text-wood-600">
              <li>Pago mensual fijo de {formatARS(25000)}.</li>
              <li>El precio se ajusta cada 6 meses por la variacion del componente Servicios del IPC publicado por INDEC en los 6 meses anteriores a la fecha de ajuste. El aumento se calcula multiplicando los factores mensuales (no sumando).</li>
              <li>El servicio incluye hosting, actualizaciones de seguridad y soporte tecnico ante errores o caidas.</li>
              <li>Cualquier modificacion, nueva seccion o desarrollo adicional se presupuesta por separado, ya que implica tiempo de desarrollo.</li>
            </ul>
          </div>
          <div className="border-t border-wood-100 pt-4">
            <p className="font-medium text-wood-900 mb-1">Plan pago unico</p>
            <ul className="space-y-1 list-disc list-inside text-wood-600">
              <li>Pago unico de {formatARS(190000)} que cubre el desarrollo completo.</li>
              <li>El precio se ajusta cada 6 meses por la variacion del componente Servicios del IPC publicado por INDEC en los 6 meses anteriores a la fecha de ajuste. El aumento se calcula multiplicando los factores mensuales (no sumando).</li>
              <li>Incluye un mantenimiento cada 6 meses de {formatARS(35000)}, tambien sujeto a ajuste por IPC cada 6 meses.</li>
              <li>El mantenimiento cubre actualizaciones de seguridad y correccion de errores del sistema existente.</li>
              <li>Cualquier modificacion, nueva seccion o desarrollo adicional se presupuesta por separado, ya que implica tiempo de desarrollo.</li>
            </ul>
          </div>
          <p className="text-xs text-wood-400 border-t border-wood-100 pt-4">
            Ante cualquier consulta sobre el plan, comunicarse directamente con {config.developer_name || "el desarrollador"}.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-wood-200 bg-white">
        <div className="border-b border-wood-200 px-6 py-4">
          <h2 className="font-medium text-wood-900">Historial de pagos</h2>
        </div>
        {payments.length === 0 ? (
          <p className="p-6 text-center text-sm text-wood-500">Sin pagos registrados.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-wood-50">
              <tr>
                <th className="px-6 py-3 font-medium text-wood-700">Fecha</th>
                <th className="px-6 py-3 font-medium text-wood-700">Concepto</th>
                <th className="px-6 py-3 font-medium text-wood-700">Monto</th>
                <th className="px-6 py-3 font-medium text-wood-700">Estado</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-wood-100">
                  <td className="px-6 py-3 text-wood-700">{p.date}</td>
                  <td className="px-6 py-3 text-wood-800">{p.concept}</td>
                  <td className="px-6 py-3 font-medium text-wood-900">{formatARS(p.amount)}</td>
                  <td className="px-6 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${p.confirmed ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.confirmed ? "Confirmado" : "Pendiente"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CardPaymentModal
        open={modalOpen}
        amount={config.monthly_amount}
        onClose={() => setModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
