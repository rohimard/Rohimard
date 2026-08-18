import type { Metadata } from "next";
import Link from "next/link";
import { ClienteForm } from "@/components/dashboard/ClienteForm";
import { getDataContext } from "@/lib/data/context";

export const metadata: Metadata = {
  title: "Nuevo cliente",
};

export default async function NuevoClientePage() {
  const ctx = await getDataContext();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/clientes"
          className="text-sm font-medium text-ink-500 hover:text-ink-900"
        >
          ← Volver a clientes
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          Nuevo cliente
        </h1>
      </div>
      <ClienteForm demo={ctx.demo} />
    </div>
  );
}
