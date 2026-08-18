import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-ink-50/50">
      <div className="container-page flex flex-col items-center gap-6 py-10 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          <Logo />
          <p className="max-w-xs text-center text-sm text-ink-500 sm:text-left">
            Cotizaciones profesionales para trabajadores independientes y
            pequeños negocios.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-600">
          <Link href="/login" className="hover:text-ink-900">
            Iniciar sesión
          </Link>
          <Link href="/register" className="hover:text-ink-900">
            Crear cuenta
          </Link>
          <a href="#como-funciona" className="hover:text-ink-900">
            Cómo funciona
          </a>
        </div>
      </div>
      <div className="border-t border-ink-100 py-5">
        <p className="container-page text-center text-xs text-ink-400">
          © {new Date().getFullYear()} CotizaPro. Hecho para quienes trabajan
          por su cuenta.
        </p>
      </div>
    </footer>
  );
}
