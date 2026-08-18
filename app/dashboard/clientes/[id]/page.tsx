import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClienteForm } from "@/components/dashboard/ClienteForm";
import { getDataContext } from "@/lib/data/context";
import { getClient } from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "Editar cliente",
};

export default async function EditarClientePage({
  params,
}: {
  params: { id: string };
}) {
  const ctx = await getDataContext();
  const client = await getClient(ctx, params.id);
  if (!client) notFound();

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
          Editar cliente
        </h1>
      </div>
      <ClienteForm initial={client} demo={ctx.demo} />
    </div>
  );
}
