import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config";

/**
 * Cliente de Supabase para Server Components / Server Actions.
 * No hay autenticación en Momentia (no se necesita login para crear una
 * experiencia), así que basta un cliente simple con la llave anónima.
 * Devuelve `null` si aún no hay credenciales (modo demo).
 */
export function getSupabaseServerClient() {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
