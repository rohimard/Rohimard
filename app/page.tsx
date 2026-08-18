import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { QuoteMockup } from "@/components/site/QuoteMockup";
import {
  IconArrowRight,
  IconBolt,
  IconChart,
  IconClock,
  IconDoc,
  IconPlay,
  IconSend,
  IconShield,
} from "@/components/ui/icons";

const problemas = [
  {
    icon: IconClock,
    title: "Presupuestos hechos a mano",
    text: "Perder la tarde con una calculadora, papel y WhatsApp para armar un solo presupuesto.",
  },
  {
    icon: IconDoc,
    title: "Documentos poco profesionales",
    text: "Fotos de una libreta o mensajes sueltos que no transmiten confianza al cliente.",
  },
  {
    icon: IconSend,
    title: "Clientes sin seguimiento",
    text: "Cotizaciones que se envían y se olvidan, sin saber si el cliente las vio o aceptó.",
  },
];

const soluciones = [
  {
    icon: IconBolt,
    title: "Crea cotizaciones rápido",
    text: "Agrega cliente, servicio e ítems. Los totales se calculan solos mientras escribes.",
  },
  {
    icon: IconDoc,
    title: "Genera un PDF profesional",
    text: "Un documento limpio y con tu nombre, listo para descargar en segundos.",
  },
  {
    icon: IconChart,
    title: "Comparte y da seguimiento",
    text: "Envíalo a tu cliente y lleva el control de lo pendiente, enviado y aceptado.",
  },
];

const pasos = [
  {
    n: "01",
    title: "Crea tu cotización",
    text: "Escribe los datos del cliente y agrega los ítems del trabajo.",
  },
  {
    n: "02",
    title: "Genera el PDF",
    text: "Obtén un presupuesto profesional con tu marca en un toque.",
  },
  {
    n: "03",
    title: "Envíala a tu cliente",
    text: "Compártela por WhatsApp o correo y controla su estado.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
          <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-8 lg:py-24">
            <div className="animate-fade-up text-center lg:text-left">
              <span className="eyebrow">
                <IconBolt width={14} height={14} />
                Cotiza en menos de 60 segundos
              </span>
              <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.08] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
                Crea cotizaciones profesionales en{" "}
                <span className="text-brand-600">menos de 60 segundos.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-ink-600 lg:mx-0">
                Calcula precios, genera presupuestos y compártelos con tus
                clientes desde cualquier dispositivo.
              </p>
              <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link href="/register" className="btn-primary btn-lg">
                  Crear mi primera cotización
                  <IconArrowRight width={18} height={18} />
                </Link>
                <a href="#como-funciona" className="btn-secondary btn-lg">
                  <IconPlay width={16} height={16} />
                  Ver cómo funciona
                </a>
              </div>
              <div className="mt-8 flex items-center justify-center gap-2 text-sm text-ink-500 lg:justify-start">
                <IconShield width={16} height={16} className="text-accent-600" />
                Sin tarjeta de crédito · Listo para tu teléfono
              </div>
            </div>

            <div className="animate-fade-up [animation-delay:150ms]">
              <QuoteMockup />
            </div>
          </div>
        </section>

        {/* PROBLEMA */}
        <section id="problema" className="border-t border-ink-100 py-20">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">El problema</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                Deja de perder tiempo haciendo presupuestos.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {problemas.map((p) => (
                <div key={p.title} className="card p-6">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-100 text-ink-500">
                    <p.icon />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink-900">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUCIÓN */}
        <section id="solucion" className="bg-ink-50/60 py-20">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">La solución</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                Todo lo que necesitas para enviar una cotización profesional.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {soluciones.map((s) => (
                <div
                  key={s.title}
                  className="card p-6 transition-shadow hover:shadow-card"
                >
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-600 text-white shadow-soft">
                    <s.icon />
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-ink-900">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                    {s.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como-funciona" className="py-20">
          <div className="container-page">
            <div className="mx-auto max-w-2xl text-center">
              <span className="eyebrow">Cómo funciona</span>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                Tres pasos. Un minuto. Listo.
              </h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {pasos.map((p, i) => (
                <div key={p.n} className="relative">
                  {i < pasos.length - 1 && (
                    <div
                      className="absolute left-[3.25rem] top-6 hidden h-px w-[calc(100%-2rem)] bg-gradient-to-r from-ink-200 to-transparent md:block"
                      aria-hidden
                    />
                  )}
                  <div className="flex items-baseline gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-ink-200 bg-white text-lg font-bold text-brand-600 shadow-soft">
                      {p.n}
                    </span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-ink-900">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="pb-20">
          <div className="container-page">
            <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-16 text-center shadow-glow sm:px-12">
              <div
                className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-600/30 blur-3xl"
                aria-hidden
              />
              <div
                className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl"
                aria-hidden
              />
              <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Tu próximo presupuesto puede estar listo en menos de un minuto.
              </h2>
              <div className="relative mt-8">
                <Link
                  href="/register"
                  className="btn-lg inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 font-semibold text-ink-900 shadow-soft transition-transform hover:scale-[1.02]"
                >
                  Crear mi primera cotización
                  <IconArrowRight width={18} height={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
