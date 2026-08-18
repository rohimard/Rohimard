"use server";

import { revalidatePath } from "next/cache";
import { getDataContext } from "@/lib/data/context";
import type { ActionResult } from "@/lib/types";

export interface ProfileInput {
  business_name: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  currency: string;
  tax_rate: number;
  quote_prefix: string;
}

const DEMO_MSG =
  "Estás en modo demo. Configura Supabase para guardar cambios reales.";

export async function updateProfileAction(
  input: ProfileInput,
): Promise<ActionResult> {
  const ctx = await getDataContext();
  if (ctx.demo) return { ok: false, error: DEMO_MSG };

  const taxRate = Number.isFinite(input.tax_rate)
    ? Math.max(0, Math.min(100, input.tax_rate))
    : 0;

  const { error } = await ctx.supabase
    .from("profiles")
    .update({
      business_name: input.business_name.trim(),
      full_name: input.full_name.trim(),
      phone: input.phone.trim(),
      email: input.email.trim(),
      address: input.address.trim(),
      currency: input.currency,
      tax_rate: taxRate,
      quote_prefix: input.quote_prefix.trim() || "COT-",
    })
    .eq("id", ctx.user.id);

  if (error) {
    console.error("[updateProfileAction]", error.message);
    return { ok: false, error: "No se pudo guardar el perfil. Inténtalo otra vez." };
  }

  revalidatePath("/dashboard/configuracion");
  revalidatePath("/dashboard");
  return { ok: true, data: undefined };
}
