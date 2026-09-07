import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";

export function LaunchCampaign() {
  return (
    <section className="relative overflow-hidden bg-borgona-700 py-20 text-crema-50 lg:py-24">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-rubi-500/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-dorado-300/20 blur-3xl" />
      </div>

      <div className="container-momentia relative flex flex-col items-center text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-dorado-300/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-dorado-200">
            <Sparkles className="h-3.5 w-3.5" /> Los primeros 20 Momentia
          </span>
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="heading-display mt-6 max-w-2xl text-balance text-3xl text-blanco sm:text-4xl">
            Estamos creando algo diferente. Y queremos que seas de los primeros en vivirlo.
          </h2>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-5 max-w-lg text-balance text-crema-100/85">
            Las primeras experiencias incluyen un detalle digital especial, de regalo.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <Button asChild variant="gold" size="lg" className="mt-8">
            <Link href="/crear">Quiero ser de los primeros</Link>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
