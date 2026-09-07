import Link from "next/link";
import { BOX_LINES } from "@/lib/types";
import { formatSoles } from "@/lib/format";
import { IconArrowRight } from "@/components/ui/icons";

const items = [
  {
    key: "esencial" as const,
    includes: ["Set de belleza premium", "Mensaje y foto personalizados", "QR con experiencia digital"],
  },
  {
    key: "historia" as const,
    includes: ["Selección premium ampliada", "Carta digital y playlist", "Galería de fotos y video especial"],
  },
  {
    key: "corporate" as const,
    includes: ["Diseño institucional", "Mensaje de equipo", "Ideal para fechas y logros"],
  },
];

export function ProductLines() {
  return (
    <section id="tienda" className="py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Nuestras líneas</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Una caja para cada momento.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {items.map(({ key, includes }) => {
            const line = BOX_LINES[key];
            return (
              <div
                key={key}
                className="card flex flex-col p-7 transition-shadow hover:shadow-card"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                  Momentia
                </span>
                <h3 className="mt-1 font-serif text-2xl font-bold text-maroon-600">
                  {line.name.replace("Momentia ", "")}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">
                  {line.tagline}
                </p>

                <ul className="mt-5 space-y-2 text-sm text-ink-700">
                  {includes.map((i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                      {i}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex items-center justify-between border-t border-ink-100 pt-5">
                  <div>
                    <p className="text-xs text-ink-500">Desde</p>
                    <p className="text-xl font-bold text-ink-900">
                      {formatSoles(line.priceFrom)}
                    </p>
                  </div>
                  <Link
                    href={`/tienda#${key}`}
                    className="btn-primary"
                  >
                    Ver detalles
                    <IconArrowRight width={16} height={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
