"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminProfile } from "@/lib/data/admin";
import type { OrderStatusType } from "@/lib/types/database";

export async function updateOrderStatus(orderId: string, status: OrderStatusType) {
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: "No autorizado." };

  const supabase = createClient();
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin");
  return { success: true };
}
