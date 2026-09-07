import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ProductQuickEdit } from "@/components/admin/ProductQuickEdit";

export const metadata = { title: "Productos", robots: { index: false, follow: false } };

export default async function AdminProductsPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="card-premium p-8 text-center text-ink/60">
        Configura Supabase para administrar el catálogo. Mientras tanto, el sitio público usa el
        contenido de <code className="rounded bg-crema-100 px-1.5 py-0.5">lib/data/products.ts</code>.
      </div>
    );
  }

  const supabase = createClient();
  const { data: products } = await supabase.from("products").select("*").order("sort_order", { ascending: true });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl">Productos</h1>
        <p className="mt-1 text-sm text-ink/60">Precio, disponibilidad y destacado de cada línea.</p>
      </div>

      <div className="card-premium overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-ink/5 text-left text-xs uppercase tracking-wide text-ink/40">
              <th className="px-6 py-3">Producto</th>
              <th className="px-6 py-3">Precio desde (S/)</th>
              <th className="px-6 py-3">Activo</th>
              <th className="px-6 py-3">Destacado</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {products?.map((product) => (
              <ProductQuickEdit key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
