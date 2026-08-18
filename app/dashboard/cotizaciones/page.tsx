import type { Metadata } from "next";
import Link from "next/link";
import { EstadoBadge, STATUS_LABELS } from "@/components/dashboard/EstadoBadge";
import { IconDoc, IconPlus } from "@/components/ui/icons";
import { getDataContext } from "@/lib/data/context";
import { getProfile, listQuotes } from "@/lib/data/queries";
import { currencySymbol, formatCurrency, formatDate } from "@/lib/format";
import type { QuoteStatus } from "@/lib/types";

export const metadata: Metadata = {
  title: "Cotizaciones",
};

const STATUSES: QuoteStatus[] = [
  "draft",
  "sent",
  "viewed",
  "accepted",
  "rejected",
];

export default async function CotizacionesPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const ctx = await getDataContext();
  const q = searchParams.q ?? "";
  const status =
    searchParams.status && STATUSES.includes(searchParams.status as QuoteStatus)
      ? searchParams.status
      : "";

  const [profile, quotes] = await Promise.all([
    getProfile(ctx),
    listQuotes(ctx, { search: q, status: status || undefined }),
  ]);
  const symbol = currencySymbol(profile.currency);

  function filterHref(newStatus: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (newStatus) params.set("status", newStatus);
    const s = params.toString();
    return `/dashboard/cotizaciones${s ? `?${s}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Cotizaciones
          </h1>
          <p className="mt-1 text-ink-500">Todas tus cotizaciones.</p>
        </div>
        <Link
          href="/dashboard/cotizaciones/nueva"
          className="btn-primary w-full sm:w-auto"
        >
          <IconPlus width={18} height={18} />
          Nueva cotización
        </Link>
      </div>

      {/* Búsqueda */}
      <form method="get" className="relative max-w-md">
        {status && <input type="hidden" name="status" value={status} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar por número, servicio o cliente…"
          className="input pl-10"
        />
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
      </form>

      {/* Filtros por estado */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        <FilterChip href={filterHref("")} active={!status}>
          Todas
        </FilterChip>
        {STATUSES.map((s) => (
          <FilterChip key={s} href={filterHref(s)} active={status === s}>
            {STATUS_LABELS[s]}
          </FilterChip>
        ))}
      </div>

      {quotes.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-12 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <IconDoc width={26} height={26} />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-ink-900">
            {q || status
              ? "Sin resultados"
              : "Todavía no tienes cotizaciones."}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-ink-500">
            {q || status
              ? "Prueba con otro filtro o búsqueda."
              : "Crea tu primera cotización en menos de un minuto."}
          </p>
          {!q && !status && (
            <Link
              href="/dashboard/cotizaciones/nueva"
              className="btn-primary mt-6"
            >
              <IconPlus width={18} height={18} />
              Crear mi primera cotización
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Tabla desktop */}
          <div className="card hidden overflow-hidden sm:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
                <tr>
                  <th className="px-5 py-3 font-medium">Número</th>
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Servicio</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
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
                    <td className="px-5 py-3.5 text-ink-500">
                      {formatDate(c.created_at)}
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

          {/* Tarjetas móvil */}
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
    </div>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`chip shrink-0 whitespace-nowrap border transition-colors ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-ink-200 bg-white text-ink-600 hover:bg-ink-50"
      }`}
    >
      {children}
    </Link>
  );
}
