import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="text-5xl">🐙</div>
      <h1 className="mt-4 text-xl font-bold text-slate-900">No encontramos eso</h1>
      <p className="mt-1 text-sm text-slate-500">
        El pedido o la página que buscas no existe.
      </p>
      <Link href="/" className="btn-primary mt-5">
        Volver al panel
      </Link>
    </div>
  );
}
