import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { CouponForm } from "@/components/admin/CouponForm";
import { CouponToggle } from "@/components/admin/CouponToggle";

export const metadata = { title: "Cupones", robots: { index: false, follow: false } };

export default async function AdminCouponsPage() {
  if (!isSupabaseConfigured) {
    return <div className="card-premium p-8 text-center text-ink/60">Configura Supabase para gestionar cupones.</div>;
  }

  const supabase = createClient();
  const { data: coupons } = await supabase.from("coupons").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl">Cupones</h1>
        <p className="mt-1 text-sm text-ink/60">Códigos de descuento para campañas y clientes especiales.</p>
      </div>

      <CouponForm />

      <div className="card-premium overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/5 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="px-6 py-3">Código</th>
              <th className="px-6 py-3">Descuento</th>
              <th className="px-6 py-3">Usos</th>
              <th className="px-6 py-3">Expira</th>
              <th className="px-6 py-3">Activo</th>
            </tr>
          </thead>
          <tbody>
            {(!coupons || coupons.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-ink/40">
                  Todavía no hay cupones.
                </td>
              </tr>
            )}
            {coupons?.map((c) => (
              <tr key={c.id} className="border-b border-ink/5 last:border-0">
                <td className="px-6 py-3 font-semibold text-borgona-700">{c.code}</td>
                <td className="px-6 py-3 text-ink/70">
                  {c.discount_type === "percentage" ? `${c.discount_value}%` : `S/ ${c.discount_value}`}
                </td>
                <td className="px-6 py-3 text-ink/70">
                  {c.used_count}
                  {c.max_uses ? ` / ${c.max_uses}` : ""}
                </td>
                <td className="px-6 py-3 text-ink/50">
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString("es-PE") : "—"}
                </td>
                <td className="px-6 py-3">
                  <CouponToggle id={c.id} active={c.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
