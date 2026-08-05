import Link from "next/link";
import { getDb } from "@/lib/db";
import { eur, fechaCorta } from "@/lib/format";
import { DevolucionBadge } from "@/components/badges";
import ReturnActions from "@/components/ReturnActions";

export const dynamic = "force-dynamic";

export default function DevolucionesPage() {
  const db = getDb();
  const returns = [...db.returns].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  );

  const abiertas = returns.filter((r) => !["reembolsada", "rechazada"].includes(r.status));
  const totalReembolsos = returns
    .filter((r) => r.status === "reembolsada")
    .reduce((s, r) => s + r.refundAmount, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Devoluciones</h1>
        <p className="mt-1 text-sm text-slate-500">
          {abiertas.length} abiertas · {eur(totalReembolsos)} reembolsados
        </p>
      </header>

      <section className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3 font-medium">Devolución</th>
              <th className="px-4 py-3 font-medium">Pedido</th>
              <th className="px-4 py-3 font-medium">Motivo</th>
              <th className="px-4 py-3 font-medium">Resolución</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 text-right font-medium">Importe</th>
              <th className="px-4 py-3 text-right font-medium">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {returns.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800">{r.id}</div>
                  <div className="text-xs text-slate-400">{fechaCorta(r.createdAt)}</div>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/pedidos/${r.orderId}`} className="text-brand-700 hover:underline">
                    {r.orderId}
                  </Link>
                </td>
                <td className="px-4 py-3 max-w-[220px] text-slate-600">{r.reason}</td>
                <td className="px-4 py-3 capitalize text-slate-600">{r.resolution}</td>
                <td className="px-4 py-3">
                  <DevolucionBadge status={r.status} />
                </td>
                <td className="px-4 py-3 text-right font-medium text-slate-700">{eur(r.refundAmount)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <ReturnActions returnId={r.id} status={r.status} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <p className="text-xs text-slate-400">
        En producción, el cliente iniciaría la devolución desde un portal de autoservicio con su
        email + nº de pedido, y estas reglas aprobarían o rechazarían automáticamente según la
        política de la tienda.
      </p>
    </div>
  );
}
