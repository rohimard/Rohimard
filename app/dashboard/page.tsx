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
import { getDataContext } from "@/lib/data/context";
import { getDashboardStats, getProfile, listQuotes } from "@/lib/data/queries";
import { currencySymbol, formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const ctx = await getDataContext();
  const [profile, stats, quotes] = await Promise.all([
    getProfile(ctx),
    getDashboardStats(ctx),
    listQuotes(ctx, { limit: 5 }),
  ]);

  const symbol = currencySymbol(profile.currency);
  const nombre = profile.full_name || (ctx.demo ? "Carlos" : "");
  const hasQuotes = quotes.length > 0;

  return (
    <div className="space-y-8">
      {/* Saludo + CTA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Hola{nombre ? `, ${nombre}` : ""} 👋
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

      {ctx.demo && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <strong className="font-semibold">Modo demo:</strong> estos son datos
          de ejemplo. Configura Supabase para ver tus cotizaciones reales.
        </div>
      )}

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
          value={formatCurrency(stats.totalCotizado, symbol)}
          icon={IconChart}
        />
      </div>

      {/* Últimas cotizaciones */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-900">
            Últimas cotizaciones
          </h2>
          {hasQuotes && (
            <Link
              href="/dashboard/cotizaciones"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Ver todas
            </Link>
          )}
        </div>

        {!hasQuotes ? (
          <EmptyState />
        ) : (
          <>
            {/* Tabla en desktop */}
            <div className="card hidden overflow-hidden sm:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                  <tr>
                    <th className="px-5 py-3 font-medium">Número</th>
                    <th className="px-5 py-3 font-medium">Cliente</th>
                    <th className="px-5 py-3 font-medium">Servicio</th>
                    <th className="px-5 py-3 text-right font-medium">Total</th>
                    <th className="px-5 py-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {quotes.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-ink-50/50">
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/dashboard/cotizaciones/${c.id}`}
                          className="font-medium text-brand-600 hover:text-brand-700"
                        >
                          {c.quote_number}
                        </Link>
                      </td>
                      <td className="px-5 py-3.5 text-ink-700">
                        {c.client_name ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-ink-600">
                        {c.service_description || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-right font-semibold text-ink-900">
                        {formatCurrency(c.total, symbol)}
                      </td>
                      <td className="px-5 py-3.5">
                        <EstadoBadge estado={c.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Tarjetas en móvil */}
            <div className="space-y-3 sm:hidden">
              {quotes.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/cotizaciones/${c.id}`}
                  className="card block p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-ink-400">
                        {c.quote_number}
                      </p>
                      <p className="mt-0.5 truncate font-semibold text-ink-900">
                        {c.client_name ?? "Sin cliente"}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-ink-500">
                        {c.service_description || "—"}
                      </p>
                    </div>
                    <EstadoBadge estado={c.status} />
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-ink-100 pt-3">
                    <span className="text-xs text-ink-400">
                      {formatDate(c.created_at)}
                    </span>
                    <span className="text-lg font-bold text-ink-900">
                      {formatCurrency(c.total, symbol)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <IconDoc width={26} height={26} />
      </span>
      <h3 className="mt-4 text-lg font-semibold text-ink-900">
        Todavía no tienes cotizaciones.
      </h3>
      <p className="mt-1 max-w-xs text-sm text-ink-500">
        Crea tu primera cotización profesional en menos de un minuto.
      </p>
      <Link
        href="/dashboard/cotizaciones/nueva"
        className="btn-primary btn-lg mt-6"
      >
        <IconPlus width={18} height={18} />
        Crear mi primera cotización
      </Link>
    </div>
  );
}
