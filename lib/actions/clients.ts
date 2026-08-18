"use server";

import { revalidatePath } from "next/cache";
import { getDataContext } from "@/lib/data/context";
import type { ActionResult } from "@/lib/types";

export interface ClientInput {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const DEMO_MSG =
  "Estás en modo demo. Configura Supabase para guardar clientes reales.";

function validate(input: ClientInput): string | null {
  if (!input.name.trim()) return "El nombre del cliente es obligatorio.";
  return null;
}

export async function createClientAction(
  input: ClientInput,
): Promise<ActionResult<{ id: string }>> {
  const ctx = await getDataContext();
  if (ctx.demo) return { ok: false, error: DEMO_MSG };

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  const { data, error } = await ctx.supabase
    .from("clients")
    .insert({
      user_id: ctx.user.id,
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      address: input.address.trim(),
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createClientAction]", error?.message);
    return { ok: false, error: "No se pudo guardar el cliente. Inténtalo otra vez." };
  }

  revalidatePath("/dashboard/clientes");
  return { ok: true, data: { id: data.id as string } };
}

export async function updateClientAction(
  id: string,
  input: ClientInput,
): Promise<ActionResult> {
  const ctx = await getDataContext();
  if (ctx.demo) return { ok: false, error: DEMO_MSG };

  const invalid = validate(input);
  if (invalid) return { ok: false, error: invalid };

  const { error } = await ctx.supabase
    .from("clients")
    .update({
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      address: input.address.trim(),
    })
    .eq("id", id);

  if (error) {
    console.error("[updateClientAction]", error.message);
    return { ok: false, error: "No se pudo actualizar el cliente." };
  }

  revalidatePath("/dashboard/clientes");
  return { ok: true, data: undefined };
}

export async function deleteClientAction(id: string): Promise<ActionResult> {
  const ctx = await getDataContext();
  if (ctx.demo) return { ok: false, error: DEMO_MSG };

  const { error } = await ctx.supabase.from("clients").delete().eq("id", id);
  if (error) {
    console.error("[deleteClientAction]", error.message);
    return { ok: false, error: "No se pudo eliminar el cliente." };
  }

  revalidatePath("/dashboard/clientes");
  return { ok: true, data: undefined };
}
