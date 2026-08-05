import Link from "next/link";
import { getDb } from "@/lib/db";
import { computeMetrics, sortByRecent } from "@/lib/metrics";
import { eur, haceCuanto, canalLabel } from "@/lib/format";
import { CanalBadge, EstadoBadge } from "@/components/badges";

export const dynamic = "force-dynamic";

function Stat({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent ?? "text-slate-900"}`}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400">{hint}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const db = getDb();
  const m = computeMetrics(db);
  const recientes = sortByRecent(db.orders).slice(0, 6);
  const incidencias = db.orders.filter((o) => o.status === "incidencia");
  const maxCanal = Math.max(...m.porCanal.map((c) => c.count), 1);

  // Estimación de ahorro en soporte: cada aviso proactivo evita ~1 ticket WISMO
  // ("¿dónde está mi pedido?"), con coste medio ~3,5 € por ticket.
  const ticketsEvitados = m.notificacionesEnviadas;
  const ahorroSoporte = ticketsEvitados * 3.5;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Panel</h1>
        <p className="mt-1 text-sm text-slate-500">
          Todos tus pedidos, de todos los canales, en un solo sitio.
        </p>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Pedidos hoy" value={String(m.pedidosHoy)} />
        <Stat
          label="Pendientes de envío"
          value={String(m.pendientesEnvio)}
          accent={m.pendientesEnvio > 0 ? "text-brand-700" : undefined}
          hint="pendiente + preparando"
        />
        <Stat
          label="Incidencias"
          value={String(m.incidencias)}
          accent={m.incidencias > 0 ? "text-red-600" : "text-emerald-600"}
          hint="requieren atención"
        />
        <Stat label="En camino" value={String(m.enCamino)} hint="enviado + en tránsito" />
        <Stat label="Ingresos" value={eur(m.ingresos)} hint="pedidos no cancelados" />
        <Stat label="Ticket medio" value={eur(m.ticketMedio)} />
        <Stat
          label="Devoluciones abiertas"
          value={String(m.devolucionesAbiertas)}
          accent={m.devolucionesAbiertas > 0 ? "text-amber-600" : undefined}
        />
        <Stat
          label="Tracking proactivo"
          value={`${m.tasaProactiva}%`}
          accent="text-emerald-600"
          hint="pedidos avisados sin preguntar"
        />
      </section>

      {/* Valor: reducción de WISMO */}
      <section className="card overflow-hidden">
        <div className="flex flex-col gap-4 bg-gradient-to-r from-brand-600 to-brand-500 p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-medium opacity-90">Impacto en soporte</div>
            <div className="mt-1 text-2xl font-bold">
              {ticketsEvitados} avisos proactivos enviados
            </div>
            <div className="mt-1 text-sm opacity-90">
              Estimación de ~{eur(ahorroSoporte)} ahorrados en tickets de “¿dónde está mi pedido?”
            </div>
          </div>
          <Link
            href="/pedidos"
            className="btn bg-white/15 text-white hover:bg-white/25"
          >
            Ver pedidos →
          </Link>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reparto por canal */}
        <section className="card p-5 lg:col-span-1">
          <h2 className="text-sm font-semibold text-slate-700">Pedidos por canal</h2>
          <div className="mt-4 space-y-3">
            {m.porCanal.map((c) => (
              <div key={c.channel}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-600">{canalLabel[c.channel]}</span>
                  <span className="font-medium text-slate-500">{c.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-brand-500"
                    style={{ width: `${(c.count / maxCanal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Incidencias que requieren acción */}
        <section className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Incidencias abiertas</h2>
            <span className="badge bg-red-100 text-red-800">{incidencias.length}</span>
          </div>
          {incidencias.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">Sin incidencias. Todo bajo control. 🎉</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-100">
              {incidencias.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/pedidos/${o.id}`}
                    className="flex items-center justify-between py-2.5 hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-slate-800">
                        {o.customer.name} · {o.id}
                      </div>
                      <div className="truncate text-xs text-slate-400">
                        {o.timeline[o.timeline.length - 1]?.note}
                      </div>
                    </div>
                    <CanalBadge channel={o.channel} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Pedidos recientes */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Pedidos recientes</h2>
          <Link href="/pedidos" className="text-xs font-medium text-brand-600 hover:underline">
            Ver todos
          </Link>
        </div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-medium">Pedido</th>
                <th className="pb-2 font-medium">Cliente</th>
                <th className="pb-2 font-medium">Canal</th>
                <th className="pb-2 font-medium">Estado</th>
                <th className="pb-2 text-right font-medium">Total</th>
                <th className="pb-2 text-right font-medium">Creado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recientes.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="py-2.5">
                    <Link href={`/pedidos/${o.id}`} className="font-medium text-brand-700 hover:underline">
                      {o.id}
                    </Link>
                  </td>
                  <td className="py-2.5 text-slate-700">{o.customer.name}</td>
                  <td className="py-2.5">
                    <CanalBadge channel={o.channel} />
                  </td>
                  <td className="py-2.5">
                    <EstadoBadge status={o.status} />
                  </td>
                  <td className="py-2.5 text-right font-medium text-slate-700">{eur(o.total)}</td>
                  <td className="py-2.5 text-right text-xs text-slate-400">{haceCuanto(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
