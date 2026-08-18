import Link from "next/link";
import { Logo } from "@/components/ui/Logo";

export default function NotFound() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="text-center">
        <Logo className="justify-center" />
        <p className="mt-8 text-sm font-semibold text-brand-600">Error 404</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-900">
          Página no encontrada
        </h1>
        <p className="mt-2 text-ink-500">
          La página que buscas no existe o fue movida.
        </p>
        <Link href="/" className="btn-primary mt-6">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
