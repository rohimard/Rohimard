import type { Metadata } from "next";
import { ConfiguracionForm } from "@/components/dashboard/ConfiguracionForm";
import { getDataContext } from "@/lib/data/context";
import { getProfile } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Configuración",
};

export default async function ConfiguracionPage() {
  const ctx = await getDataContext();
  const profile = await getProfile(ctx);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Configuración
        </h1>
        <p className="mt-1 text-ink-500">
          Los datos de tu negocio aparecerán en tus cotizaciones.
        </p>
      </div>

      <ConfiguracionForm profile={profile} demo={ctx.demo} />
    </div>
  );
}
