import { Gift, Smartphone, Camera, Mail, Music, Truck } from "lucide-react";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

const FEATURES = [
  { icon: Gift, title: "Regalo físico personalizado", text: "Cada caja se arma a mano con el detalle que elegiste, cuidando cada textura y color." },
  { icon: Smartphone, title: "Experiencia digital exclusiva", text: "Una página privada, solo para quien la recibe, accesible con un simple escaneo." },
  { icon: Camera, title: "Tus recuerdos", text: "Fotos y videos que cuentan la historia real detrás del regalo." },
  { icon: Mail, title: "Mensajes que permanecen", text: "Cartas y frases que se pueden releer las veces que hagan falta." },
  { icon: Music, title: "Música que cuenta una historia", text: "La canción, playlist o link de Spotify que le da banda sonora al momento." },
  { icon: Truck, title: "Entrega segura", text: "Coordinamos fecha y hora de entrega en Lima, Callao y todo el Perú." },
];

export function WhyDifferent() {
  return (
    <section className="bg-crema-50 py-20 lg:py-28">
      <div className="container-momentia">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="eyebrow">¿Qué hace diferente a MOMENTIA?</span>
          <h2 className="heading-display mt-3 text-balance text-3xl sm:text-4xl">
            No regalamos cosas. <span className="script-accent text-[1.1em]">Creamos momentos.</span>
          </h2>
        </Reveal>

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <StaggerItem key={f.title}>
              <div className="card-premium h-full p-7 transition-transform duration-300 hover:-translate-y-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-borgona-50 text-borgona-700">
                  <f.icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <h3 className="heading-display mt-5 text-lg">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink/65">{f.text}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
