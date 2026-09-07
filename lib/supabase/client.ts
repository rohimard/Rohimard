"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";
import type { Database } from "@/lib/types/database";

/** Cliente de Supabase para uso en Client Components (respeta RLS con el anon key). */
export function createClient() {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
