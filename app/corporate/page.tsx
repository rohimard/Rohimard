import type { Metadata } from "next";
import { Cake, Award, HandHeart, PartyPopper, Gift, Users, Star } from "lucide-react";
import { LeadForm } from "@/components/corporate/LeadForm";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { FloralDivider } from "@/components/decorative/Ornaments";

export const metadata: Metadata = {
  title: "Regalos corporativos personalizados",
  description:
    "Creamos experiencias de regalo personalizadas para colaboradores, clientes y momentos importantes de tu empresa. Cotiza tu regalo corporativo en Lima, Perú.",
  alternates: { canonical: "/corporate" },
};

const USE_CASES = [
  { icon: Cake, title: "Cumpleaños", text: "Celebra a tu equipo con un detalle que se sienta personal." },
  { icon: Award, title: "Reconocimientos", text: "Reconoce logros de forma memorable, no genérica." },
  { icon: HandHeart, title: "Bienvenida de colaboradores", text: "El primer día también puede ser inolvidable." },
  { icon: PartyPopper, title: "Aniversarios", text: "Celebra los años junto a tu equipo y tus clientes." },
  { icon: Gift, title: "Navidad", text: "Regalos navideños que se sienten diferentes cada diciembre." },
  { icon: Users, title: "Eventos corporativos", text: "Detalles a la medida de tu próximo evento." },
  { icon: Star, title: "Clientes VIP", text: "Fortalece relaciones comerciales clave con un gesto real." },
];

export default function CorporatePage() {
  return (
    <>
      <section className="bg-gradient-to-b from-borgona-700 to-borgona-800 py-20 text-crema-50 lg:py-28">
        <div className="container-momentia text-center">
          <Reveal>
            <span className="eyebrow !text-dorado-200">MOMENTIA Corporate</span>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="heading-display mt-4 text-balance text-4xl text-blanco sm:text-5xl">
              Regalos que fortalecen relaciones.
            </h1>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="mx-auto mt-5 max-w-xl text-balance text-crema-100/85">
              Creamos experiencias de regalo personalizadas para colaboradores, clientes y momentos
              importantes de tu empresa.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="bg-blanco py-20 lg:py-24">
        <div className="container-momentia">
          <Reveal className="mx-auto max-w-xl text-center">
            <span className="eyebrow">Ocasiones</span>
            <h2 className="heading-display mt-3 text-3xl sm:text-4xl">Para cada momento importante</h2>
            <FloralDivider className="mt-5" />
          </Reveal>

          <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {USE_CASES.map((u) => (
              <StaggerItem key={u.title}>
                <div className="card-premium h-full p-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-borgona-50 text-borgona-700">
                    <u.icon className="h-5 w-5" strokeWidth={1.7} />
                  </div>
                  <h3 className="heading-display mt-4 text-base">{u.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink/60">{u.text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      <section id="contacto" className="bg-crema-50 py-20 lg:py-24">
        <div className="container-momentia max-w-2xl">
          <Reveal className="mb-10 text-center">
            <span className="eyebrow">Cotiza tu proyecto</span>
            <h2 className="heading-display mt-3 text-3xl sm:text-4xl">Solicita tu cotización</h2>
          </Reveal>
          <Reveal delay={0.1}>
            <LeadForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
