import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GiftBoxAnimation } from "@/components/home/GiftBoxAnimation";
import { Reveal } from "@/components/motion/Reveal";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-crema-50 via-blanco to-blanco pb-20 pt-14 sm:pt-20 lg:pb-28 lg:pt-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-rosa-100/60 blur-3xl" />
        <div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-dorado-100/50 blur-3xl" />
      </div>

      <div className="container-momentia relative grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <div className="text-center lg:text-left">
          <Reveal>
            <span className="eyebrow inline-flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5" /> Experiencias de regalo · Lima, Perú
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="heading-display mt-5 text-balance text-4xl leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
              Regalos que continúan
              <br />
              <span className="script-accent text-[1.15em]">después</span> de abrirlos.
            </h1>
          </Reveal>

          <Reveal delay={0.16}>
            <p className="mx-auto mt-6 max-w-lg text-balance text-base leading-relaxed text-ink/70 lg:mx-0 sm:text-lg">
              Transformamos recuerdos, palabras y emociones en una experiencia que puedes
              tocar… y volver a vivir. Un regalo físico. Un código QR. Un momento que no termina.
            </p>
          </Reveal>

          <Reveal delay={0.24}>
            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/crear">
                  Crear mi Momentia <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg" className="w-full sm:w-auto">
                <Link href="/inspiracion">Descubrir experiencias</Link>
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <p className="mt-6 text-sm text-ink/50">
              Hay cosas que no caben dentro de una caja. Tu historia merece ser contada.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="order-first lg:order-last">
          <GiftBoxAnimation />
        </Reveal>
      </div>
    </section>
  );
}
