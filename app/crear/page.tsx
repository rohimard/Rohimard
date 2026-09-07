import type { Metadata } from "next";
import { ConfiguratorShell } from "@/components/configurator/ConfiguratorShell";
import { getProductBySlug } from "@/lib/data/products";
import { OCCASIONS, type Occasion, type ProductSlug } from "@/lib/types";
import { FloralDivider } from "@/components/decorative/Ornaments";

export const metadata: Metadata = {
  title: "Crea tu Momentia",
  description: "Personaliza tu regalo paso a paso: ocasión, experiencia, historia, recuerdos, música y entrega.",
  alternates: { canonical: "/crear" },
};

export default function CrearPage({ searchParams }: { searchParams: { producto?: string; ocasion?: string } }) {
  const initialProduct = getProductBySlug(searchParams.producto ?? "")?.slug as ProductSlug | undefined;
  const initialOccasion = OCCASIONS.find((o) => o.value === searchParams.ocasion)?.value as Occasion | undefined;

  return (
    <section className="bg-crema-50/40 py-14 sm:py-20">
      <div className="container-momentia max-w-4xl">
        <div className="mb-10 text-center">
          <span className="eyebrow">El corazón de MOMENTIA</span>
          <h1 className="heading-display mt-3 text-3xl sm:text-4xl">Crea tu Momentia</h1>
          <FloralDivider className="mt-5" />
        </div>

        <ConfiguratorShell initialProduct={initialProduct} initialOccasion={initialOccasion} />
      </div>
    </section>
  );
}
