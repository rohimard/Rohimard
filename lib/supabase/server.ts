import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import type { Database } from "@/lib/types/database";

/** Cliente de Supabase para Server Components / Server Actions (respeta RLS, sesión del usuario). */
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Se puede ignorar si se llama desde un Server Component (no hay respuesta que mutar).
        }
      },
    },
  });
}
