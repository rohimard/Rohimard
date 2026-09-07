import type { Metadata } from "next";
import Link from "next/link";
import { Gift, MessageSquareHeart, PackageCheck, Truck, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/Reveal";
import { FloralDivider } from "@/components/decorative/Ornaments";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "Descubre cómo creamos tu Momentia: elige, personaliza, creamos, entregamos y descubre la experiencia digital.",
  alternates: { canonical: "/como-funciona" },
};

const STEPS = [
  { icon: Gift, title: "Elige", text: "Elige la experiencia perfecta entre Esencial, Historia o Corporate." },
  { icon: MessageSquareHeart, title: "Personaliza", text: "Cuéntanos tu historia: nombres, mensaje, carta, fotos, video y música." },
  { icon: PackageCheck, title: "Creamos", text: "Nuestro equipo prepara cada detalle a mano y genera tu código QR único." },
  { icon: Truck, title: "Entregamos", text: "Tu Momentia llega a su destino en la fecha y hora que coordinemos." },
  { icon: ScanLine, title: "Descubre", text: "Escanea el QR y revive el momento las veces que quieras." },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <section className="bg-crema-50 py-20 text-center lg:py-24">
        <div className="container-momentia">
          <Reveal>
            <span className="eyebrow">Paso a paso</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="heading-display mt-4 text-balance text-4xl sm:text-5xl">Cómo funciona MOMENTIA</h1>
          </Reveal>
          <Reveal delay={0.2}>
            <FloralDivider className="mt-6" />
          </Reveal>
        </div>
      </section>

      <section className="bg-blanco py-20 lg:py-28">
        <div className="container-momentia mx-auto max-w-3xl">
          <div className="relative space-y-14 before:absolute before:left-8 before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-gradient-to-b before:from-dorado-300 before:via-borgona-200 before:to-transparent sm:before:left-10">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.05}>
                <div className="relative flex gap-6 pl-0 sm:gap-8">
                  <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-borgona-50 text-borgona-700 shadow-soft sm:h-20 sm:w-20">
                    <step.icon className="h-7 w-7" strokeWidth={1.5} />
                  </div>
                  <div className="pt-2">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-dorado-500">
                      Paso {i + 1}
                    </span>
                    <h3 className="heading-display mt-1 text-2xl">{step.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/65 sm:text-base">{step.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.3} className="mt-16 text-center">
            <Button asChild size="lg">
              <Link href="/crear">Crear mi Momentia</Link>
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
