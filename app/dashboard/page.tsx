import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/dashboard/StatCard";
import { EstadoBadge } from "@/components/dashboard/EstadoBadge";
import {
  IconArrowRight,
  IconChart,
  IconCheck,
  IconDoc,
  IconPlus,
  IconSend,
} from "@/components/ui/icons";
import {
  cotizacionesDemo,
  estadisticasDemo,
  usuarioDemo,
} from "@/lib/demo";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  const stats = estadisticasDemo;

  return (
    <div className="space-y-8">
      {/* Saludo + CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Hola, {usuarioDemo.nombre} 👋
          </h1>
          <p className="mt-1 text-ink-500">
            Este es un resumen de tus cotizaciones.
          </p>
        </div>
        <Link
          href="/dashboard/cotizaciones/nueva"
          className="btn-primary btn-lg w-full sm:w-auto"
        >
          <IconPlus width={18} height={18} />
          Nueva cotización
        </Link>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard label="Creadas" value={String(stats.creadas)} icon={IconDoc} />
        <StatCard
          label="Enviadas"
          value={String(stats.enviadas)}
          icon={IconSend}
        />
        <StatCard
          label="Aceptadas"
          value={String(stats.aceptadas)}
          icon={IconCheck}
          accent
        />
        <StatCard
          label="Total cotizado"
          value={formatCurrency(stats.totalCotizado)}
          icon={IconChart}
        />
      </div>

      {/* Últimas cotizaciones */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">
            Últimas cotizaciones
          </h2>
          <span className="chip bg-ink-100 text-ink-500">Datos de ejemplo</span>
        </div>

        {/* Tabla en desktop */}
        <div className="card hidden overflow-hidden sm:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
              <tr>
                <th className="px-5 py-3 font-medium">Folio</th>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">Servicio</th>
                <th className="px-5 py-3 text-right font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {cotizacionesDemo.map((c) => (
                <tr key={c.id} className="transition-colors hover:bg-ink-50/50">
                  <td className="px-5 py-3.5 font-medium text-ink-900">
                    {c.folio}
                  </td>
                  <td className="px-5 py-3.5 text-ink-700">{c.cliente}</td>
                  <td className="px-5 py-3.5 text-ink-600">{c.servicio}</td>
                  <td className="px-5 py-3.5 text-right font-semibold text-ink-900">
                    {formatCurrency(c.total)}
                  </td>
                  <td className="px-5 py-3.5">
                    <EstadoBadge estado={c.estado} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tarjetas en móvil */}
        <div className="space-y-3 sm:hidden">
          {cotizacionesDemo.map((c) => (
            <div key={c.id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-ink-400">{c.folio}</p>
                  <p className="mt-0.5 truncate font-semibold text-ink-900">
                    {c.cliente}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-ink-500">
                    {c.servicio}
                  </p>
                </div>
                <EstadoBadge estado={c.estado} />
              </div>
              <div className="mt-3 border-t border-ink-100 pt-3 text-right">
                <span className="text-lg font-bold text-ink-900">
                  {formatCurrency(c.total)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/dashboard/cotizaciones/nueva"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
        >
          Crear una nueva cotización
          <IconArrowRight width={16} height={16} />
        </Link>
      </section>
    </div>
  );
}
