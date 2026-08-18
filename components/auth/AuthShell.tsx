import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { QuoteMockup } from "@/components/site/QuoteMockup";
import { IconArrowRight } from "@/components/ui/icons";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      {/* Panel del formulario */}
      <div className="flex flex-col px-5 py-6 sm:px-8">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-sm font-medium text-ink-500 hover:text-ink-900"
          >
            ← Volver
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* Panel de marca (solo desktop) */}
      <div className="relative hidden overflow-hidden bg-ink-900 lg:block">
        <div
          className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-brand-600/40 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative flex h-full flex-col justify-center px-12">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
            <IconArrowRight width={14} height={14} />
            CotizaPro
          </span>
          <h2 className="mt-6 max-w-md text-3xl font-bold leading-tight text-white">
            Presupuestos que transmiten profesionalismo.
          </h2>
          <p className="mt-3 max-w-sm text-white/60">
            Crea, genera el PDF y comparte con tu cliente en menos de un minuto.
          </p>
          <div className="mt-10 max-w-sm">
            <QuoteMockup />
          </div>
        </div>
      </div>
    </div>
  );
}
