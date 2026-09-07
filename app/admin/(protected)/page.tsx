import Link from "next/link";
import { ShoppingBag, Clock, PackageCheck, Sparkles, TrendingUp, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { StatCard } from "@/components/admin/StatCard";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/utils/currency";
import type { OrderRow } from "@/lib/types/database";

export const metadata = { title: "Dashboard", robots: { index: false, follow: false } };

export default async function AdminDashboardPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="card-premium p-8">
        <h1 className="heading-display text-2xl">Configura Supabase</h1>
        <p className="mt-2 max-w-xl text-sm text-ink/65">
          Define <code className="rounded bg-crema-100 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code>,{" "}
          <code className="rounded bg-crema-100 px-1.5 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> y{" "}
          <code className="rounded bg-crema-100 px-1.5 py-0.5">SUPABASE_SERVICE_ROLE_KEY</code> para activar el panel
          con datos reales. Revisa <code className="rounded bg-crema-100 px-1.5 py-0.5">supabase/README.md</code>.
        </p>
      </div>
    );
  }

  const supabase = createClient();

  const [{ data: orders }, { count: experienceCount }] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(200),
    supabase.from("digital_experiences").select("*", { count: "exact", head: true }),
  ]);

  const rows: OrderRow[] = orders ?? [];
  const nuevos = rows.filter((o) => o.status === "nuevo").length;
  const enProceso = rows.filter((o) => !["entregado", "cancelado", "nuevo"].includes(o.status)).length;
  const entregados = rows.filter((o) => o.status === "entregado").length;
  const ingresos = rows.filter((o) => o.status !== "cancelado").reduce((sum, o) => sum + Number(o.total), 0);

  const recientes = rows.slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="heading-display text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-ink/60">Resumen general de MOMENTIA.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard icon={ShoppingBag} label="Pedidos nuevos" value={String(nuevos)} />
        <StatCard icon={Clock} label="En proceso" value={String(enProceso)} accent="dorado" />
        <StatCard icon={PackageCheck} label="Entregados" value={String(entregados)} accent="rubi" />
        <StatCard icon={TrendingUp} label="Ingresos" value={formatCurrency(ingresos)} />
        <StatCard icon={Sparkles} label="Experiencias creadas" value={String(experienceCount ?? 0)} accent="dorado" />
      </div>

      <div className="card-premium overflow-hidden">
        <div className="flex items-center justify-between border-b border-ink/5 p-6">
          <h2 className="heading-display text-xl">Pedidos recientes</h2>
          <Link href="/admin/pedidos" className="flex items-center gap-1 text-sm font-semibold text-borgona-700">
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink/5 text-left text-xs uppercase tracking-wide text-ink/40">
                <th className="px-6 py-3">Pedido</th>
                <th className="px-6 py-3">Cliente</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recientes.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-ink/40">
                    Todavía no hay pedidos.
                  </td>
                </tr>
              )}
              {recientes.map((order) => (
                <tr key={order.id} className="border-b border-ink/5 last:border-0 hover:bg-crema-50/60">
                  <td className="px-6 py-3">
                    <Link href={`/admin/pedidos/${order.id}`} className="font-semibold text-borgona-700">
                      {order.order_number}
                    </Link>
                  </td>
                  <td className="px-6 py-3 text-ink/70">{order.customer_name}</td>
                  <td className="px-6 py-3 text-ink/70">{formatCurrency(Number(order.total))}</td>
                  <td className="px-6 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
