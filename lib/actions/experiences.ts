"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DEMO_EXPERIENCES } from "@/lib/demo-data";
import { isValidSlug } from "@/lib/slug";
import type { Experience, NewExperienceInput } from "@/lib/types";

export type CreateExperienceResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

/**
 * Crea una experiencia en Supabase (si está configurado). En modo demo
 * (sin Supabase) esta función solo valida el slug: el guardado real ocurre
 * en el navegador vía `lib/demo-store.ts`, porque no hay dónde persistir
 * datos entre visitantes distintos sin una base de datos.
 */
export async function createExperience(
  input: NewExperienceInput,
): Promise<CreateExperienceResult> {
  if (!isValidSlug(input.slug)) {
    return { ok: false, error: "invalid_slug" };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { ok: true, slug: input.slug };
  }

  const { data: existing } = await supabase
    .from("experiences")
    .select("slug")
    .eq("slug", input.slug)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "slug_taken" };
  }

  const { error } = await supabase.from("experiences").insert({
    slug: input.slug,
    box_line: input.boxLine,
    sender_name: input.senderName,
    recipient_name: input.recipientName,
    message: input.message,
    letter: input.letter,
    photos: input.photos,
    video_url: input.videoUrl,
    playlist_url: input.playlistUrl,
  });

  if (error) {
    return { ok: false, error: "insert_failed" };
  }

  return { ok: true, slug: input.slug };
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
  if (!isValidSlug(slug)) return false;

  const supabase = getSupabaseServerClient();
  if (!supabase) return true; // El modo demo valida disponibilidad en el navegador.

  const { data } = await supabase
    .from("experiences")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();

  return !data;
}

export async function getExperienceBySlug(
  slug: string,
): Promise<Experience | null> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return DEMO_EXPERIENCES[slug] ?? null;
  }

  const { data } = await supabase
    .from("experiences")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!data) return DEMO_EXPERIENCES[slug] ?? null;

  return {
    slug: data.slug,
    boxLine: data.box_line,
    senderName: data.sender_name,
    recipientName: data.recipient_name,
    message: data.message,
    letter: data.letter,
    photos: data.photos ?? [],
    videoUrl: data.video_url,
    playlistUrl: data.playlist_url,
    createdAt: data.created_at,
  };
}
