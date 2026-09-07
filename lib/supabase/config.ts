export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** true cuando el proyecto tiene Supabase configurado (fuera de "modo demo"). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/** true cuando además existe la Service Role Key (necesaria para admin/experiencias). */
export const isSupabaseAdminConfigured = Boolean(supabaseUrl && supabaseServiceRoleKey);
