"use client";

import { createClient } from "@supabase/supabase-js";
import {
  SUPABASE_ANON_KEY,
  SUPABASE_URL,
  isSupabaseConfigured,
} from "./config";

/**
 * Cliente de Supabase para el navegador (usado para subir fotos al bucket
 * público `experiencias`). Devuelve `null` si aún no se configuraron las
 * credenciales, lo que activa el modo demo (localStorage).
 */
export function getSupabaseBrowserClient() {
  if (!isSupabaseConfigured) return null;
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
