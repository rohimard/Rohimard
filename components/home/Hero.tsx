import Link from "next/link";
import { GiftBoxArt } from "./GiftBoxArt";
import { IconArrowRight, IconQr } from "@/components/ui/icons";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-8 lg:py-24">
        <div className="animate-fade-up text-center lg:text-left">
          <span className="eyebrow">
            <IconQr width={14} height={14} />
            Regalo físico + experiencia digital
          </span>
          <h1 className="mt-5 text-balance text-4xl font-bold leading-[1.1] tracking-tight text-ink-900 sm:text-5xl lg:text-6xl">
            Regalos que{" "}
            <span className="script-accent text-5xl sm:text-6xl lg:text-7xl">
              continúan
            </span>{" "}
            después de abrirlos.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg text-ink-600 lg:mx-0">
            Cada caja Momentia esconde un código QR único. Al escanearlo, la
            persona que la recibe descubre fotos, un video, una playlist y
            una carta hechos solo para ella.
          </p>
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link href="/tienda" className="btn-primary btn-lg">
              Descubre nuestras cajas
              <IconArrowRight width={18} height={18} />
            </Link>
            <Link href="/crear" className="btn-secondary btn-lg">
              Crear mi regalo personalizado
            </Link>
          </div>
          <div className="mt-8 text-sm text-ink-500 lg:text-left">
            Envíos a Lima y Callao · a todo el Perú
          </div>
        </div>

        <div className="animate-fade-up [animation-delay:150ms]">
          <GiftBoxArt />
        </div>
      </div>
    </section>
  );
}
