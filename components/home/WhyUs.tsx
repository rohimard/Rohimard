import {
  IconGift,
  IconQr,
  IconSparkle,
  IconTruck,
  IconHeart,
} from "@/components/ui/icons";

const items = [
  { icon: IconGift, title: "Regalo físico personalizado", text: "Productos premium seleccionados para cada línea." },
  { icon: IconQr, title: "Experiencia digital exclusiva (QR)", text: "Un código único dentro de cada caja, solo para esa persona." },
  { icon: IconSparkle, title: "Diseños y materiales premium", text: "Empaques ornamentales pensados al detalle." },
  { icon: IconTruck, title: "Entrega puntual y segura", text: "Lima, Callao y envíos a todo el Perú." },
  { icon: IconHeart, title: "Hecho con amor en cada detalle", text: "Cada caja se arma pensando en un momento único." },
];

export function WhyUs() {
  return (
    <section className="bg-maroon-50/50 py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Lo que nos hace únicos</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            No es solo una caja, es un momento que continúa.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((it) => (
            <div key={it.title} className="card p-6 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-maroon-600 text-cream-50 shadow-soft">
                <it.icon />
              </span>
              <h3 className="mt-4 text-sm font-semibold text-ink-900">
                {it.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-600">
                {it.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
