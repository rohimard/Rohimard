import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { eur, fecha, canalLabel, estadoLabel } from "@/lib/format";
import { CanalBadge, EstadoBadge } from "@/components/badges";
import { nextStatusLabel } from "@/lib/orderFlow";
import OrderActions from "@/components/OrderActions";

export const dynamic = "force-dynamic";

const canalCanal: Record<string, string> = {
  sistema: "Sistema",
  email: "Email",
  whatsapp: "WhatsApp",
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const db = getDb();
  const order = db.orders.find((o) => o.id === params.id);
  if (!order) notFound();

  const devoluciones = db.returns.filter((r) => r.orderId === order.id);
  const nextLabel = nextStatusLabel(order.status);
  const canNotify = !["cancelado"].includes(order.status);
  const timeline = [...order.timeline].reverse();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/pedidos" className="text-xs font-medium text-brand-600 hover:underline">
          ← Volver a pedidos
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900">{order.id}</h1>
          <EstadoBadge status={order.status} />
          <CanalBadge channel={order.channel} />
          {order.flags.map((f) => (
            <span key={f} className="badge bg-slate-100 text-slate-600">
              #{f}
            </span>
          ))}
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {canalLabel[order.channel]} · ref. {order.externalRef} · {fecha(order.createdAt)}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Artículos */}
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Artículos</h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-slate-100">
                {order.items.map((it) => (
                  <tr key={it.sku}>
                    <td className="py-2.5">
                      <div className="font-medium text-slate-800">{it.name}</div>
                      <div className="text-xs text-slate-400">{it.sku}</div>
                    </td>
                    <td className="py-2.5 text-center text-slate-500">×{it.qty}</td>
                    <td className="py-2.5 text-right text-slate-700">{eur(it.price * it.qty)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-slate-200">
                  <td colSpan={2} className="pt-3 text-right text-sm font-medium text-slate-500">
                    Total
                  </td>
                  <td className="pt-3 text-right text-base font-bold text-slate-900">{eur(order.total)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Timeline de seguimiento */}
          <section className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-slate-700">Seguimiento</h2>
            <ol className="relative space-y-4 border-l border-slate-200 pl-5">
              {timeline.map((ev, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[26px] top-1 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-brand-500" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-slate-800">
                      {estadoLabel[ev.status]}
                    </span>
                    {ev.channel && ev.channel !== "sistema" && (
                      <span className="badge bg-emerald-100 text-emerald-700">
                        aviso · {canalCanal[ev.channel]}
                      </span>
                    )}
                    <span className="text-xs text-slate-400">{fecha(ev.at)}</span>
                  </div>
                  <div className="text-sm text-slate-500">{ev.note}</div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-6">
          {/* Acciones */}
          <section className="card p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Acciones</h2>
            <OrderActions orderId={order.id} nextLabel={nextLabel} canNotify={canNotify} />
            {!nextLabel && (
              <p className="mt-2 text-xs text-slate-400">
                Este pedido está en un estado final.
              </p>
            )}
          </section>

          {/* Cliente */}
          <section className="card p-5 text-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Cliente</h2>
            <div className="space-y-1 text-slate-600">
              <div className="font-medium text-slate-800">{order.customer.name}</div>
              <div>{order.customer.email}</div>
              {order.customer.phone && <div>{order.customer.phone}</div>}
            </div>
          </section>

          {/* Envío */}
          <section className="card p-5 text-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Envío</h2>
            <dl className="space-y-2 text-slate-600">
              <div className="flex justify-between">
                <dt className="text-slate-400">Método</dt>
                <dd className="capitalize">{order.shipping.method}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Transportista</dt>
                <dd>{order.shipping.carrier ?? "—"}</dd>
              </div>
              {order.shipping.trackingNumber && (
                <div className="flex justify-between">
                  <dt className="text-slate-400">Tracking</dt>
                  <dd className="font-mono text-xs">{order.shipping.trackingNumber}</dd>
                </div>
              )}
              <div className="pt-1 text-slate-600">
                {order.shipping.address}
                <br />
                {order.shipping.city} · {order.customer.country}
              </div>
            </dl>
          </section>

          {/* Devoluciones asociadas */}
          {devoluciones.length > 0 && (
            <section className="card p-5 text-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-700">Devoluciones</h2>
              <ul className="space-y-2">
                {devoluciones.map((r) => (
                  <li key={r.id} className="flex items-center justify-between">
                    <Link href="/devoluciones" className="text-brand-700 hover:underline">
                      {r.id}
                    </Link>
                    <span className="text-slate-500">{eur(r.refundAmount)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
