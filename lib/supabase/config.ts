/**
 * Configuración de Supabase.
 *
 * Momentia funciona sin Supabase (modo demo): las experiencias creadas en
 * /crear se guardan en el navegador (localStorage) y siguen siendo visibles
 * en /[slug] desde ese mismo dispositivo. Cuando defines las variables de
 * entorno, las experiencias se guardan de verdad en la base de datos y son
 * visibles para cualquiera que escanee el QR.
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
