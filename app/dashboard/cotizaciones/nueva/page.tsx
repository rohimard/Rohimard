import type { Metadata } from "next";
import Link from "next/link";
import { NuevaCotizacionForm } from "@/components/cotizacion/NuevaCotizacionForm";
import { getDataContext } from "@/lib/data/context";
import { getProfile, listClients } from "@/lib/data/queries";
import { currencySymbol } from "@/lib/format";

export const metadata: Metadata = {
  title: "Nueva cotización",
};

export default async function NuevaCotizacionPage() {
  const ctx = await getDataContext();
  const [profile, clients] = await Promise.all([
    getProfile(ctx),
    listClients(ctx),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Volver al dashboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Nueva cotización
        </h1>
        <p className="mt-1 text-ink-500">
          Completa los datos y observa el total actualizarse en tiempo real.
        </p>
      </div>

      {ctx.demo && (
        <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <strong className="font-semibold">Modo demo:</strong> los datos están
          precargados como ejemplo. Configura Supabase para guardar cotizaciones
          reales.
        </div>
      )}

      <NuevaCotizacionForm
        clients={clients}
        defaultTaxRate={profile.tax_rate ?? 0}
        symbol={currencySymbol(profile.currency)}
        demo={ctx.demo}
      />
    </div>
  );
}
