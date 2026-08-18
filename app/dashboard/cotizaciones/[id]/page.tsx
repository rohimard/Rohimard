import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EstadoBadge } from "@/components/dashboard/EstadoBadge";
import { getDataContext } from "@/lib/data/context";
import { getProfile, getQuoteWithItems } from "@/lib/data/queries";
import { currencySymbol, formatCurrency, formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Detalle de cotización",
};

export default async function CotizacionDetallePage({
  params,
}: {
  params: { id: string };
}) {
  const ctx = await getDataContext();
  const [profile, result] = await Promise.all([
    getProfile(ctx),
    getQuoteWithItems(ctx, params.id),
  ]);
  if (!result) notFound();

  const { quote, client, items } = result;
  const symbol = currencySymbol(profile.currency);

  const fechas = [
    { label: "Creada", value: quote.created_at },
    { label: "Enviada", value: quote.sent_at },
    { label: "Vista", value: quote.viewed_at },
    { label: "Aceptada", value: quote.accepted_at },
    { label: "Rechazada", value: quote.rejected_at },
  ].filter((f) => f.value);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/dashboard/cotizaciones"
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Volver a cotizaciones
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            {quote.quote_number}
          </h1>
          <EstadoBadge estado={quote.status} />
        </div>
      </div>

      {/* Acciones futuras (deshabilitadas en esta fase) */}
      <div className="flex flex-wrap gap-2">
        <FutureButton label="Generar PDF" />
        <FutureButton label="Compartir" />
        <FutureButton label="Enviar seguimiento" />
      </div>
      <p className="-mt-3 text-xs text-ink-400">
        Estas funciones estarán disponibles próximamente.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Cliente */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Cliente
          </h2>
          {client ? (
            <div className="mt-3 space-y-1">
              <p className="font-semibold text-ink-900">{client.name}</p>
              {client.phone && (
                <p className="text-sm text-ink-600">{client.phone}</p>
              )}
              {client.email && (
                <p className="text-sm text-ink-600">{client.email}</p>
              )}
              {client.address && (
                <p className="text-sm text-ink-600">{client.address}</p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-sm text-ink-500">Sin cliente asignado.</p>
          )}
        </section>

        {/* Servicio */}
        <section className="card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Servicio
          </h2>
          <p className="mt-3 text-sm text-ink-700">
            {quote.service_description || "—"}
          </p>
        </section>
      </div>

      {/* Ítems */}
      <section className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-ink-100 bg-ink-50/60 text-xs uppercase tracking-wide text-ink-500">
            <tr>
              <th className="px-4 py-3 font-medium">Descripción</th>
              <th className="px-2 py-3 text-center font-medium">Cant.</th>
              <th className="px-3 py-3 text-right font-medium">Precio</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {items.map((it) => (
              <tr key={it.id}>
                <td className="px-4 py-3 text-ink-800">{it.description || "—"}</td>
                <td className="px-2 py-3 text-center text-ink-500">
                  {it.quantity}
                </td>
                <td className="px-3 py-3 text-right text-ink-600">
                  {formatCurrency(it.unit_price, symbol)}
                </td>
                <td className="px-4 py-3 text-right font-medium text-ink-900">
                  {formatCurrency(it.total, symbol)}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-ink-400">
                  Esta cotización no tiene ítems.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Totales */}
      <section className="card ml-auto max-w-sm p-5">
        <dl className="space-y-2 text-sm">
          <Row label="Subtotal" value={formatCurrency(quote.subtotal, symbol)} />
          <Row label="Descuento" value={`- ${formatCurrency(quote.discount, symbol)}`} />
          <Row label="Impuestos" value={formatCurrency(quote.tax, symbol)} />
        </dl>
        <div className="mt-3 flex items-end justify-between border-t border-ink-100 pt-3">
          <span className="font-semibold text-ink-900">TOTAL</span>
          <span className="text-2xl font-bold tracking-tight text-brand-700">
            {formatCurrency(quote.total, symbol)}
          </span>
        </div>
      </section>

      {/* Fechas */}
      {fechas.length > 0 && (
        <section className="card p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-400">
            Historial
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
            {fechas.map((f) => (
              <div key={f.label}>
                <dt className="text-ink-400">{f.label}</dt>
                <dd className="font-medium text-ink-800">
                  {formatDate(f.value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  );
}

function FutureButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      title="Disponible próximamente"
      className="btn-secondary cursor-not-allowed opacity-60"
    >
      {label}
    </button>
  );
}
