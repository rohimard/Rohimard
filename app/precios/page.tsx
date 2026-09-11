import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { IconCheck, IconSparkles } from "@/components/ui/icons";
import { AI_MONTHLY_CREDITS, CHECKOUT_URL, PRO_PRICE_USD } from "@/lib/ai/config";

export const metadata: Metadata = {
  title: "Precios",
  description:
    "CotizaPro: empieza gratis y pasa a Pro cuando necesites más cotizaciones con IA.",
};

interface Plan {
  nombre: string;
  precio: string;
  periodo: string;
  descripcion: string;
  features: string[];
  cta: { label: string; href: string };
  destacado?: boolean;
}

const planes: Plan[] = [
  {
    nombre: "Gratis",
    precio: "$0",
    periodo: "para siempre",
    descripcion: "Para probar el flujo completo sin tarjeta.",
    features: [
      "Cotizaciones ilimitadas a mano",
      "Clientes ilimitados",
      `${AI_MONTHLY_CREDITS.free} desgloses con IA al mes`,
      "Numeración automática",
      "Perfil del negocio y moneda",
    ],
    cta: { label: "Crear cuenta gratis", href: "/register" },
  },
  {
    nombre: "Pro",
    precio: `$${PRO_PRICE_USD}`,
    periodo: "al mes",
    descripcion: "Para quien cotiza todas las semanas y quiere cerrar más rápido.",
    features: [
      "Todo lo del plan Gratis",
      `${AI_MONTHLY_CREDITS.pro} desgloses con IA al mes`,
      "Precios sugeridos por zona y oficio",
      "Prioridad en el asistente",
      "Soporte por WhatsApp",
    ],
    cta: {
      label: CHECKOUT_URL ? "Pasar a Pro" : "Quiero Pro",
      href: CHECKOUT_URL || "mailto:hola@cotizapro.app?subject=Quiero%20el%20plan%20Pro",
    },
    destacado: true,
  },
];

export default function PreciosPage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">
            <IconSparkles width={16} height={16} />
            Con asistente de IA
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Un precio que se paga con una sola cotización
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-ink-500">
            Empieza gratis. Cuando el asistente te ahorre la primera tarde de
            cálculos, pasa a Pro.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {planes.map((plan) => (
            <div
              key={plan.nombre}
              className={`card flex flex-col p-6 sm:p-8 ${
                plan.destacado ? "ring-2 ring-brand-600" : ""
              }`}
            >
              {plan.destacado && (
                <span className="mb-4 self-start rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                  Recomendado
                </span>
              )}
              <h2 className="text-lg font-semibold text-ink-900">{plan.nombre}</h2>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-4xl font-bold tracking-tight text-ink-900">
                  {plan.precio}
                </span>
                <span className="pb-1 text-sm text-ink-500">{plan.periodo}</span>
              </div>
              <p className="mt-3 text-sm text-ink-500">{plan.descripcion}</p>

              <ul className="mt-6 flex-1 space-y-3 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-ink-600">
                    <IconCheck
                      width={18}
                      height={18}
                      className="mt-0.5 shrink-0 text-brand-600"
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.cta.href}
                className={`btn-lg mt-7 w-full ${
                  plan.destacado ? "btn-primary" : "btn-ghost ring-1 ring-inset ring-ink-200"
                }`}
              >
                {plan.cta.label}
              </Link>
            </div>
          ))}
        </div>

        <div className="card mt-8 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-ink-900">Preguntas rápidas</h2>
          <dl className="mt-5 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="font-medium text-ink-900">
                ¿Qué es un &ldquo;desglose con IA&rdquo;?
              </dt>
              <dd className="mt-1 text-sm text-ink-500">
                Describes el trabajo en una frase y la app te devuelve los ítems
                con cantidades y precios sugeridos, listos para ajustar.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink-900">
                ¿Los precios que sugiere son exactos?
              </dt>
              <dd className="mt-1 text-sm text-ink-500">
                Son una estimación de mercado para tu zona y oficio. Siempre los
                revisas y ajustas antes de enviar la cotización.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink-900">
                ¿Puedo seguir cotizando a mano?
              </dt>
              <dd className="mt-1 text-sm text-ink-500">
                Sí. Las cotizaciones manuales son ilimitadas en los dos planes;
                la cuota solo aplica al asistente.
              </dd>
            </div>
            <div>
              <dt className="font-medium text-ink-900">¿Puedo cancelar?</dt>
              <dd className="mt-1 text-sm text-ink-500">
                Cuando quieras. Al cancelar vuelves al plan Gratis y conservas
                todas tus cotizaciones y clientes.
              </dd>
            </div>
          </dl>
        </div>
      </main>
      <Footer />
    </>
  );
}
