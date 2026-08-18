"use server";

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Cierra la sesión y vuelve a la landing. Seguro también en modo demo. */
export async function signOutAction() {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
