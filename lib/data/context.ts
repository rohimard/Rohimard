import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type DataContext =
  | { demo: true; supabase: null; user: null }
  | { demo: false; supabase: SupabaseClient; user: User };

/**
 * Contexto de datos para Server Components / Server Actions.
 * - Sin Supabase configurado → modo demo.
 * - Con Supabase pero sin sesión → redirige a /login.
 * - Con sesión → devuelve el cliente y el usuario reales.
 */
export async function getDataContext(): Promise<DataContext> {
  const supabase = getSupabaseServerClient();
  if (!supabase || !isSupabaseConfigured) {
    return { demo: true, supabase: null, user: null };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { demo: false, supabase, user };
}
