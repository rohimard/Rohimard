import type { Metadata } from "next";
import Link from "next/link";
import { DeleteClientButton } from "@/components/dashboard/DeleteClientButton";
import { IconPlus, IconUser } from "@/components/ui/icons";
import { getDataContext } from "@/lib/data/context";
import { listClients } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Clientes",
};

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const ctx = await getDataContext();
  const search = searchParams.q ?? "";
  const clients = await listClients(ctx, search);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
            Clientes
          </h1>
          <p className="mt-1 text-ink-500">Tu lista de clientes.</p>
        </div>
        <Link
          href="/dashboard/clientes/nuevo"
          className="btn-primary w-full sm:w-auto"
        >
          <IconPlus width={18} height={18} />
          Nuevo cliente
        </Link>
      </div>

      {/* Búsqueda (server-side vía URL, funciona sin JS) */}
      <form method="get" className="relative max-w-md">
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Buscar por nombre, email o teléfono…"
          className="input pl-10"
        />
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </span>
      </form>

      {clients.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-12 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
            <IconUser width={26} height={26} />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-ink-900">
            {search ? "Sin resultados" : "Todavía no tienes clientes."}
          </h3>
          <p className="mt-1 max-w-xs text-sm text-ink-500">
            {search
              ? "Prueba con otro término de búsqueda."
              : "Agrega tu primer cliente para empezar a cotizar."}
          </p>
          {!search && (
            <Link
              href="/dashboard/clientes/nuevo"
              className="btn-primary mt-6"
            >
              <IconPlus width={18} height={18} />
              Nuevo cliente
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {clients.map((c) => (
            <div key={c.id} className="card flex items-start gap-3 p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 font-semibold text-brand-600">
                {c.name.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink-900">{c.name}</p>
                {c.phone && (
                  <p className="truncate text-sm text-ink-500">{c.phone}</p>
                )}
                {c.email && (
                  <p className="truncate text-sm text-ink-500">{c.email}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Link
                  href={`/dashboard/clientes/${c.id}`}
                  className="rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand-600 hover:bg-brand-50"
                >
                  Editar
                </Link>
                <DeleteClientButton id={c.id} name={c.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
