/**
 * Configuración de Supabase.
 *
 * La app funciona sin Supabase (modo demo). Cuando defines las variables
 * de entorno, el login/registro reales se activan automáticamente.
 *
 * Variables necesarias (archivo .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** True cuando las credenciales de Supabase están presentes. */
export const isSupabaseConfigured =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
