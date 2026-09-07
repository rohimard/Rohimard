"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentAdminProfile } from "@/lib/data/admin";
import { hashPin } from "@/lib/utils/pin";
import { experienceFormSchema, type ExperienceFormInput } from "@/lib/validations/experience";

export interface ActionResult {
  success: boolean;
  error?: string;
  id?: string;
}

export async function saveExperience(input: ExperienceFormInput): Promise<ActionResult> {
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: "No autorizado." };

  const parsed = experienceFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Revisa el formulario." };
  }
  const data = parsed.data;

  if (data.privacy === "private" && !data.pin && !data.id) {
    return { success: false, error: "Define un PIN para experiencias privadas." };
  }

  const supabase = createClient();

  const payload = {
    order_id: data.orderId || null,
    slug: data.slug,
    recipient_name: data.recipientName,
    sender_name: data.senderName || null,
    intro_message: data.introMessage,
    welcome_message: data.welcomeMessage || null,
    story: data.story || null,
    letter: data.letter || null,
    final_message: data.finalMessage,
    privacy: data.privacy,
    status: data.status,
    expires_at: data.privacy === "temporal" && data.expiresAt ? data.expiresAt : null,
    ...(data.pin ? { pin_hash: hashPin(data.pin) } : {}),
  };

  let experienceId = data.id;

  if (experienceId) {
    const { error } = await supabase.from("digital_experiences").update(payload).eq("id", experienceId);
    if (error) return { success: false, error: error.message };
  } else {
    const code = data.slug.toUpperCase().replace(/-/g, "").slice(0, 12) + Math.floor(Math.random() * 900 + 100);
    const { data: inserted, error } = await supabase
      .from("digital_experiences")
      .insert({ ...payload, code })
      .select("id")
      .single();
    if (error) return { success: false, error: error.message };
    experienceId = inserted.id;

    if (data.orderId) {
      await supabase.from("orders").update({ digital_experience_id: experienceId }).eq("id", data.orderId);
    }
  }

  if (data.musicOption !== "sin_musica" || data.id) {
    const { data: existingMusic } = await supabase
      .from("experience_music")
      .select("id")
      .eq("experience_id", experienceId)
      .maybeSingle();

    const musicPayload = {
      experience_id: experienceId,
      option: data.musicOption,
      title: data.musicTitle || null,
      artist: data.musicArtist || null,
      url: data.musicUrl || null,
      spotify_embed_url: data.musicSpotifyEmbedUrl || null,
    };

    if (existingMusic) {
      await supabase.from("experience_music").update(musicPayload).eq("id", existingMusic.id);
    } else {
      await supabase.from("experience_music").insert(musicPayload);
    }
  }

  revalidatePath("/admin/experiencias");
  if (experienceId) revalidatePath(`/admin/experiencias/${experienceId}`);

  return { success: true, id: experienceId };
}

export async function addExperienceMedia(experienceId: string, items: { path: string; type: "photo" | "video"; caption?: string }[]) {
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: "No autorizado." };

  const supabase = createClient();
  const { error } = await supabase.from("experience_media").insert(
    items.map((item, i) => ({
      experience_id: experienceId,
      url: item.path,
      type: item.type,
      caption: item.caption || null,
      sort_order: i,
    })),
  );
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/experiencias/${experienceId}`);
  return { success: true };
}

export async function removeExperienceMedia(mediaId: string, experienceId: string) {
  const admin = await getCurrentAdminProfile();
  if (!admin) return { success: false, error: "No autorizado." };

  const supabase = createClient();
  const { error } = await supabase.from("experience_media").delete().eq("id", mediaId);
  if (error) return { success: false, error: error.message };

  revalidatePath(`/admin/experiencias/${experienceId}`);
  return { success: true };
}

export async function deleteExperienceAndRedirect(experienceId: string) {
  const admin = await getCurrentAdminProfile();
  if (!admin) return;

  const supabase = createClient();
  await supabase.from("digital_experiences").delete().eq("id", experienceId);
  revalidatePath("/admin/experiencias");
  redirect("/admin/experiencias");
}
