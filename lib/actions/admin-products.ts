"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminProfile } from "@/lib/data/admin";

export async function updateProduct(
  id: string,
  data: { priceFrom: number; active: boolean; featured: boolean },
) {
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: "No autorizado." };

  const supabase = createClient();
  const { error } = await supabase
    .from("products")
    .update({ price_from: data.priceFrom, active: data.active, featured: data.featured })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/productos");
  return { success: true };
}
