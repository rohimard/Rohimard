import Link from "next/link";
import { IconArrowRight } from "@/components/ui/icons";

export function CtaSection() {
  return (
    <section className="pb-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-maroon-800 px-6 py-16 text-center shadow-glow sm:px-12">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-rose-500/30 blur-3xl"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-gold-400/20 blur-3xl"
            aria-hidden
          />
          <h2 className="relative mx-auto max-w-2xl text-balance text-3xl font-bold tracking-tight text-cream-50 sm:text-4xl">
            Crea hoy un regalo que continúa después de abrirlo.
          </h2>
          <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/crear"
              className="btn-lg inline-flex items-center justify-center gap-2 rounded-full bg-cream-50 px-7 font-semibold text-maroon-700 shadow-soft transition-transform hover:scale-[1.02]"
            >
              Crear mi regalo personalizado
              <IconArrowRight width={18} height={18} />
            </Link>
            <Link
              href="/tienda"
              className="btn-lg inline-flex items-center justify-center gap-2 rounded-full border border-cream-50/40 px-7 font-semibold text-cream-50 hover:bg-cream-50/10"
            >
              Ver nuestras cajas
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
