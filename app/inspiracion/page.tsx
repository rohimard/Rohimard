import type { Metadata } from "next";
import Link from "next/link";
import { Heart, Cake, Users2, HandHeart, Building2, Sparkles, Flower2 } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { FloralDivider } from "@/components/decorative/Ornaments";
import type { Occasion } from "@/lib/types";

const CATEGORIES: { icon: typeof Heart; label: string; occasion: Occasion; gradient: string }[] = [
  { icon: Heart, label: "Amor", occasion: "pareja", gradient: "from-rubi-500 to-borgona-700" },
  { icon: Cake, label: "Cumpleaños", occasion: "cumpleanos", gradient: "from-dorado-400 to-rubi-500" },
  { icon: Flower2, label: "Mamá", occasion: "mama", gradient: "from-rosa-300 to-rubi-500" },
  { icon: Users2, label: "Amistad", occasion: "amistad", gradient: "from-borgona-500 to-rubi-600" },
  { icon: HandHeart, label: "Gratitud", occasion: "agradecimiento", gradient: "from-dorado-300 to-borgona-600" },
  { icon: Building2, label: "Empresas", occasion: "empresa", gradient: "from-borgona-700 to-borgona-900" },
  { icon: Sparkles, label: "Momentos especiales", occasion: "otra", gradient: "from-rosa-200 to-dorado-400" },
];

export const metadata: Metadata = {
  title: "Inspiración",
  description: "Explora ideas de regalos personalizados por ocasión: amor, cumpleaños, mamá, amistad, gratitud y empresas.",
  alternates: { canonical: "/inspiracion" },
};

export default function InspiracionPage() {
  return (
    <section className="bg-crema-50 py-20 lg:py-28">
      <div className="container-momentia">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="eyebrow">Inspiración</span>
          <h1 className="heading-display mt-3 text-balance text-4xl sm:text-5xl">
            Ideas para cada historia
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-ink/65 sm:text-base">
            Cada categoría es un punto de partida. Tu Momentia siempre termina siendo única.
          </p>
          <FloralDivider className="mt-6" />
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((cat) => (
            <StaggerItem key={cat.label}>
              <Link
                href={`/crear?ocasion=${cat.occasion}`}
                className={`group relative flex h-48 flex-col items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br ${cat.gradient} text-crema-50 shadow-soft transition-transform duration-300 hover:-translate-y-1`}
              >
                <cat.icon className="h-9 w-9 transition-transform duration-300 group-hover:scale-110" strokeWidth={1.4} />
                <span className="font-serif text-xl">{cat.label}</span>
                <span className="absolute bottom-4 text-xs uppercase tracking-[0.2em] opacity-0 transition-opacity group-hover:opacity-80">
                  Crear en esta categoría
                </span>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
