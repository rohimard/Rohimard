import Link from "next/link";
import { getDb } from "@/lib/db";
import { sortByRecent } from "@/lib/metrics";
import { eur, haceCuanto, canalLabel, estadoLabel } from "@/lib/format";
import { CanalBadge, EstadoBadge } from "@/components/badges";
import type { Channel, OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const canales: Channel[] = ["shopify", "woocommerce", "amazon", "mercadolibre", "instagram"];
const estados: OrderStatus[] = [
  "pendiente",
  "preparando",
  "enviado",
  "en_transito",
  "incidencia",
  "entregado",
  "cancelado",
];

export default function PedidosPage({
  searchParams,
}: {
  searchParams: { canal?: string; estado?: string; q?: string };
}) {
  const db = getDb();
  let orders = sortByRecent(db.orders);

  const { canal, estado, q } = searchParams;
  if (canal) orders = orders.filter((o) => o.channel === canal);
  if (estado) orders = orders.filter((o) => o.status === estado);
  if (q) {
    const needle = q.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.customer.name.toLowerCase().includes(needle) ||
        o.id.toLowerCase().includes(needle) ||
        o.externalRef.toLowerCase().includes(needle)
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pedidos</h1>
          <p className="mt-1 text-sm text-slate-500">
            {orders.length} de {db.orders.length} pedidos
          </p>
        </div>
      </header>

      {/* Filtros (formulario GET, sin JS) */}
      <form className="card flex flex-wrap items-end gap-3 p-4" action="/pedidos" method="get">
        <div className="flex-1 min-w-[180px]">
          <label className="mb-1 block text-xs font-medium text-slate-500">Buscar</label>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cliente, nº de pedido…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Canal</label>
          <select
            name="canal"
            defaultValue={canal ?? ""}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          >
            <option value="">Todos</option>
            {canales.map((c) => (
              <option key={c} value={c}>
                {canalLabel[c]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Estado</label>
          <select
            name="estado"
            defaultValue={estado ?? ""}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-400 focus:outline-none"
          >
            <option value="">Todos</option>
            {estados.map((s) => (
              <option key={s} value={s}>
                {estadoLabel[s]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary">
          Filtrar
        </button>
        {(canal || estado || q) && (
          <Link href="/pedidos" className="btn-ghost">
            Limpiar
          </Link>
        )}
      </form>

      <section className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="px-4 py-3 font-medium">Canal</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Transportista</th>
              <th className="px-4 py-3 text-right font-medium">Total</th>
              <th className="px-4 py-3 text-right font-medium">Creado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/pedidos/${o.id}`} className="font-medium text-brand-700 hover:underline">
                    {o.id}
                  </Link>
                  <div className="text-xs text-slate-400">{o.externalRef}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-slate-700">{o.customer.name}</div>
                  <div className="text-xs text-slate-400">{o.shipping.city} · {o.customer.country}</div>
                </td>
                <td className="px-4 py-3">
                  <CanalBadge channel={o.channel} />
                </td>
                <td className="px-4 py-3">
                  <EstadoBadge status={o.status} />
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {o.shipping.carrier ?? <span className="text-slate-300">—</span>}
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">{eur(o.total)}</td>
                <td className="px-4 py-3 text-right text-xs text-slate-400">{haceCuanto(o.createdAt)}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                  No hay pedidos que coincidan con el filtro.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
