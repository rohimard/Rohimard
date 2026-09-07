"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminProfile } from "@/lib/data/admin";
import { z } from "zod";

const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.coerce.number().positive(),
  maxUses: z.coerce.number().int().positive().optional(),
  expiresAt: z.string().optional(),
});

export async function createCoupon(input: unknown) {
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = couponSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0]?.message };

  const data = parsed.data;
  const supabase = createClient();
  const { error } = await supabase.from("coupons").insert({
    code: data.code,
    discount_type: data.discountType,
    discount_value: data.discountValue,
    max_uses: data.maxUses ?? null,
    expires_at: data.expiresAt || null,
  });

  if (error) return { success: false, error: error.code === "23505" ? "Ese código ya existe." : error.message };

  revalidatePath("/admin/cupones");
  return { success: true };
}

export async function toggleCoupon(id: string, active: boolean) {
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false };

  const supabase = createClient();
  await supabase.from("coupons").update({ active }).eq("id", id);
  revalidatePath("/admin/cupones");
  return { success: true };
}
