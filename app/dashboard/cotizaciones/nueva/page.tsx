import type { Metadata } from "next";
import Link from "next/link";
import { NuevaCotizacionForm } from "@/components/cotizacion/NuevaCotizacionForm";

export const metadata: Metadata = {
  title: "Nueva cotización",
};

export default function NuevaCotizacionPage() {
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

      <NuevaCotizacionForm />
    </div>
  );
}
