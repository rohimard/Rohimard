import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { OrderStatusBadge } from "@/components/admin/StatusBadge";
import { formatCurrency } from "@/lib/utils/currency";
import type { OrderStatusType } from "@/lib/types/database";

export const metadata = { title: "Pedidos", robots: { index: false, follow: false } };

export default async function AdminOrdersPage({ searchParams }: { searchParams: { estado?: string } }) {
  if (!isSupabaseConfigured) {
    return <EmptyState />;
  }

  const supabase = createClient();
  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (searchParams.estado) query = query.eq("status", searchParams.estado as OrderStatusType);
  const { data: orders } = await query;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl">Pedidos</h1>
        <p className="mt-1 text-sm text-ink/60">Gestiona el estado de cada Momentia, desde nuevo hasta entregado.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterLink label="Todos" active={!searchParams.estado} href="/admin/pedidos" />
        {["nuevo", "pago_pendiente", "confirmado", "en_produccion", "listo", "enviado", "entregado", "cancelado"].map(
          (s) => (
            <FilterLink key={s} label={s.replace("_", " ")} active={searchParams.estado === s} href={`/admin/pedidos?estado=${s}`} />
          ),
        )}
      </div>

      <div className="card-premium overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/5 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="px-6 py-3">Pedido</th>
              <th className="px-6 py-3">Cliente</th>
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Fecha</th>
              <th className="px-6 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {(!orders || orders.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-ink/40">
                  No hay pedidos con este filtro.
                </td>
              </tr>
            )}
            {orders?.map((order) => (
              <tr key={order.id} className="border-b border-ink/5 last:border-0 hover:bg-crema-50/60">
                <td className="px-6 py-3">
                  <Link href={`/admin/pedidos/${order.id}`} className="font-semibold text-borgona-700">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-6 py-3 text-ink/70">{order.customer_name}</td>
                <td className="px-6 py-3 text-ink/70">{order.recipient_name}</td>
                <td className="px-6 py-3 text-ink/70">{formatCurrency(Number(order.total))}</td>
                <td className="px-6 py-3 text-ink/50">{new Date(order.created_at).toLocaleDateString("es-PE")}</td>
                <td className="px-6 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
        active ? "bg-borgona-600 text-blanco" : "bg-blanco text-ink/60 hover:bg-borgona-50"
      }`}
    >
      {label}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="card-premium p-8 text-center text-ink/60">
      Configura Supabase para gestionar pedidos reales.
    </div>
  );
}
