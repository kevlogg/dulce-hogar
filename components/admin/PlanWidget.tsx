"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, AlertTriangle, CreditCard } from "lucide-react";

interface Config {
  plan_type: "monthly" | "one_time";
  monthly_amount: number;
  monthly_next_date: string;
  maintenance_amount: number;
  maintenance_next_date?: string;
}

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

export function PlanWidget() {
  const [config, setConfig] = useState<Config | null>(null);

  useEffect(() => {
    fetch("/api/admin/billing")
      .then((r) => r.json())
      .then((d) => { if (d.config) setConfig(d.config); })
      .catch(() => {});
  }, []);

  if (!config) return null;

  const isMonthly = config.plan_type === "monthly";
  const nextDate = isMonthly ? config.monthly_next_date : config.maintenance_next_date;
  const nextAmount = isMonthly ? config.monthly_amount : config.maintenance_amount;
  const days = daysUntil(nextDate);
  const isOverdue = days < 0;
  const isDueSoon = days >= 0 && days <= 7;
  const urgent = isOverdue || isDueSoon;

  return (
    <Link
      href="/admin/plan"
      className={`block rounded-lg border p-5 transition hover:shadow-md ${
        urgent ? "border-amber-300 bg-amber-50" : "border-wood-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {urgent ? (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          ) : (
            <CreditCard className="h-4 w-4 text-wood-500" />
          )}
          <p className="text-sm font-medium text-wood-700">Mi Plan</p>
        </div>
        <span className="text-xs text-wood-400">Ver detalle →</span>
      </div>
      {nextDate ? (
        <div className="mt-3 flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 text-wood-400" />
          <p className="text-sm text-wood-700">
            Próximo pago: <strong>{nextDate}</strong> — {formatARS(nextAmount)}
          </p>
        </div>
      ) : null}
      {days !== Infinity && (
        <p className={`mt-1 text-xs font-medium ${isOverdue ? "text-red-600" : isDueSoon ? "text-amber-600" : "text-wood-400"}`}>
          {isOverdue
            ? `Vencido hace ${Math.abs(days)} días`
            : days === 0
            ? "Vence hoy"
            : `Vence en ${days} días`}
        </p>
      )}
    </Link>
  );
}
