import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { BOX_LINES, type BoxLine } from "@/lib/types";
import { formatSoles } from "@/lib/format";
import { IconArrowRight, IconQr } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Elige la caja Momentia perfecta: Esencial, Historia o Corporate. Todas incluyen una experiencia digital exclusiva por QR.",
};

const detail: Record<
  BoxLine,
  { includes: string[]; idealFor: string }
> = {
  esencial: {
    includes: [
      "Set de belleza premium (maquillaje y brochas)",
      "Empaque ornamental con cinta y tarjeta",
      "Mensaje y foto personalizados",
      "QR con experiencia digital básica",
    ],
    idealFor: "Cumpleaños, aniversarios y detalles espontáneos.",
  },
  historia: {
    includes: [
      "Selección premium ampliada",
      "Galería de fotos y video especial",
      "Playlist personalizada",
      "Carta digital completa",
      "QR con experiencia digital completa",
    ],
    idealFor: "Momentos que merecen contarse: pedidas, bodas, reencuentros.",
  },
  corporate: {
    includes: [
      "Diseño institucional personalizable",
      "Mensaje de equipo o de la empresa",
      "Ideal para varios destinatarios a la vez",
      "QR con experiencia digital de marca",
    ],
    idealFor: "Fechas especiales, logros de equipo y clientes clave.",
  },
};

export default function TiendaPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <main className="flex-1">
        <section className="border-b border-maroon-100/70 py-14 text-center">
          <div className="container-page">
            <span className="eyebrow">
              <IconQr width={14} height={14} />
              Cada caja incluye su experiencia digital
            </span>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink-900 sm:text-5xl">
              Nuestras líneas
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-ink-600">
              Elige la caja y personalízala en un solo paso: cuéntanos para
              quién es y arma su experiencia digital.
            </p>
          </div>
        </section>

        <section className="py-16">
          <div className="container-page space-y-10">
            {(Object.keys(BOX_LINES) as BoxLine[]).map((key) => {
              const line = BOX_LINES[key];
              const d = detail[key];
              return (
                <div
                  key={key}
                  id={key}
                  className="card grid gap-8 p-8 scroll-mt-24 lg:grid-cols-[1.2fr_1fr] lg:p-10"
                >
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wide text-gold-600">
                      Momentia
                    </span>
                    <h2 className="mt-1 font-serif text-3xl font-bold text-maroon-600">
                      {line.name.replace("Momentia ", "")}
                    </h2>
                    <p className="mt-2 text-ink-600">{line.tagline}</p>

                    <ul className="mt-6 space-y-2.5 text-sm text-ink-700">
                      {d.includes.map((i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />
                          {i}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-6 text-sm text-ink-500">
                      <span className="font-semibold text-ink-700">Ideal para: </span>
                      {d.idealFor}
                    </p>
                  </div>

                  <div className="flex flex-col justify-between rounded-2xl bg-maroon-50/60 p-6">
                    <div>
                      <p className="text-sm text-ink-500">Precio desde</p>
                      <p className="mt-1 font-serif text-4xl font-bold text-maroon-700">
                        {formatSoles(line.priceFrom)}
                      </p>
                      <p className="mt-2 text-xs text-ink-500">
                        Incluye caja física + experiencia digital con QR.
                      </p>
                    </div>
                    <Link
                      href={`/crear?linea=${key}`}
                      className="btn-primary btn-lg mt-6 w-full"
                    >
                      Personalizar esta caja
                      <IconArrowRight width={18} height={18} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
