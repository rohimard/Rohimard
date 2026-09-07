import { Gift, Heart, Package, Smartphone, HeartHandshake } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { FloralDivider } from "@/components/decorative/Ornaments";

const STEPS = [
  { icon: Gift, title: "Eliges el regalo", text: "Esencial, Historia o Corporate: la línea que mejor cuenta tu momento." },
  { icon: Heart, title: "Personalizas tu historia", text: "Nombres, mensaje, carta, fecha especial y la frase que quieres que perdure." },
  { icon: Package, title: "Creamos tu Momentia", text: "Preparamos cada detalle a mano y generamos tu código QR único." },
  { icon: Smartphone, title: "Escanea el QR", text: "La persona que recibe el regalo descubre una experiencia digital privada." },
  { icon: HeartHandshake, title: "Revive el momento", text: "Fotos, video, música y tu carta, disponibles para siempre que quiera volver." },
];

export function Concept() {
  return (
    <section className="bg-blanco py-20 lg:py-28">
      <div className="container-momentia">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">El concepto</span>
          <h2 className="heading-display mt-3 text-balance text-3xl sm:text-4xl">
            Un regalo. Una historia. <br className="hidden sm:block" />
            Un momento que continúa.
          </h2>
          <FloralDivider className="mt-6" />
        </Reveal>

        <StaggerGroup className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((step, i) => (
            <StaggerItem key={step.title} className="relative flex flex-col items-center text-center">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-crema-100 text-borgona-700 shadow-soft">
                <step.icon className="h-6 w-6" strokeWidth={1.6} />
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-borgona-600 text-[0.7rem] font-bold text-blanco">
                  {i + 1}
                </span>
              </div>
              <h3 className="heading-display mt-5 text-lg">{step.title}</h3>
              <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-ink/65">{step.text}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
