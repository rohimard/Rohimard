"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminProfile } from "@/lib/data/admin";

export async function updateSetting(key: string, value: Record<string, unknown>) {
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: "No autorizado." };

  const supabase = createClient();
  const { error } = await supabase.from("settings").upsert({ key, value });
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/configuracion");
  return { success: true };
}
