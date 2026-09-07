"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { verifyPin } from "@/lib/utils/pin";
import { DEMO_EXPERIENCE } from "@/lib/data/demo-experience";
import type { ExperienceData, ExperienceMediaItem, ExperienceResolution } from "@/lib/types/experience";

const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hora

export async function resolveExperience(slug: string, pin?: string): Promise<ExperienceResolution> {
  if (!isSupabaseAdminConfigured) {
    if (slug === "demo") return { status: "ok", data: DEMO_EXPERIENCE };
    return { status: "not_found" };
  }

  const supabase = createAdminClient();

  const { data: experience, error } = await supabase
    .from("digital_experiences")
    .select("*")
    .eq("slug", slug)
    .eq("status", "publicada")
    .maybeSingle();

  if (error || !experience) {
    if (slug === "demo") return { status: "ok", data: DEMO_EXPERIENCE };
    return { status: "not_found" };
  }

  if (experience.privacy === "temporal" && experience.expires_at) {
    if (new Date(experience.expires_at).getTime() < Date.now()) {
      return { status: "expired" };
    }
  }

  if (experience.privacy === "private") {
    if (!pin) return { status: "needs_pin" };
    if (!experience.pin_hash || !verifyPin(pin, experience.pin_hash)) {
      return { status: "needs_pin", error: "El código PIN no es correcto." };
    }
  }

  const [{ data: mediaRows }, { data: musicRows }] = await Promise.all([
    supabase
      .from("experience_media")
      .select("*")
      .eq("experience_id", experience.id)
      .order("sort_order", { ascending: true }),
    supabase.from("experience_music").select("*").eq("experience_id", experience.id).limit(1),
  ]);

  const media: ExperienceMediaItem[] = await Promise.all(
    (mediaRows ?? []).map(async (row) => {
      const { data: signed } = await supabase.storage
        .from("experience-media")
        .createSignedUrl(row.url, SIGNED_URL_TTL_SECONDS);
      return {
        id: row.id,
        url: signed?.signedUrl ?? "",
        type: row.type,
        caption: row.caption,
      };
    }),
  );

  const musicRow = musicRows?.[0];

  const data: ExperienceData = {
    recipientName: experience.recipient_name,
    senderName: experience.sender_name,
    introMessage: experience.intro_message,
    welcomeMessage: experience.welcome_message,
    story: experience.story,
    letter: experience.letter,
    finalMessage: experience.final_message,
    coverImageUrl: experience.cover_image_url,
    media,
    music: musicRow
      ? {
          option: musicRow.option,
          title: musicRow.title,
          artist: musicRow.artist,
          url: musicRow.url,
          spotifyEmbedUrl: musicRow.spotify_embed_url,
        }
      : null,
  };

  void supabase
    .from("digital_experiences")
    .update({ view_count: experience.view_count + 1 })
    .eq("id", experience.id)
    .then(() => undefined);

  return { status: "ok", data };
}
