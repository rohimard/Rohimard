import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isSupabaseAdminConfigured, supabaseServiceRoleKey, supabaseUrl } from "@/lib/supabase/config";
import type { Database } from "@/lib/types/database";

/**
 * Cliente con la Service Role Key. Ignora RLS por completo.
 *
 * SOLO debe usarse en Server Actions / Route Handlers, nunca en código que
 * llegue al navegador. Se usa para:
 *  - Resolver experiencias digitales aplicando privacidad/PIN/expiración en código.
 *  - El panel /admin (después de verificar `role = 'admin'` en el servidor).
 *  - Generar URLs firmadas para media privada en Storage.
 */
export function createAdminClient() {
  if (!isSupabaseAdminConfigured) {
    throw new Error(
      "Supabase no está configurado con SUPABASE_SERVICE_ROLE_KEY. Revisa .env.local / variables de entorno en Vercel.",
    );
  }

  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
