import type { Metadata } from "next";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { Reveal } from "@/components/motion/Reveal";
import { FloralDivider } from "@/components/decorative/Ornaments";

export const metadata: Metadata = {
  title: "Productos",
  description: "Momentia Esencial, Momentia Historia y Momentia Corporate: nuestras líneas de regalos personalizados con experiencia digital.",
  alternates: { canonical: "/productos" },
};

export default function ProductosPage() {
  return (
    <>
      <section className="bg-crema-50 py-20 text-center lg:py-24">
        <div className="container-momentia">
          <Reveal>
            <span className="eyebrow">Catálogo</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="heading-display mt-4 text-balance text-4xl sm:text-5xl">Nuestras experiencias</h1>
          </Reveal>
          <Reveal delay={0.2}>
            <FloralDivider className="mt-6" />
          </Reveal>
        </div>
      </section>
      <FeaturedProducts />
    </>
  );
}
