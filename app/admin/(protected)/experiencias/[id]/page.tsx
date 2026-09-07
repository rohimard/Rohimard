import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import { ExperienceMediaManager, type ExistingMedia } from "@/components/admin/ExperienceMediaManager";
import type { ExperienceFormInput } from "@/lib/validations/experience";

export const metadata = { title: "Editar experiencia", robots: { index: false, follow: false } };

export default async function EditExperiencePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: experience } = await supabase.from("digital_experiences").select("*").eq("id", params.id).maybeSingle();
  if (!experience) notFound();

  const { data: mediaRows } = await supabase
    .from("experience_media")
    .select("*")
    .eq("experience_id", experience.id)
    .order("sort_order", { ascending: true });

  const { data: musicRows } = await supabase.from("experience_music").select("*").eq("experience_id", experience.id).limit(1);
  const music = musicRows?.[0];

  let media: ExistingMedia[] = [];
  if (isSupabaseAdminConfigured && mediaRows) {
    const admin = createAdminClient();
    media = await Promise.all(
      mediaRows.map(async (row) => {
        const { data } = await admin.storage.from("experience-media").createSignedUrl(row.url, 3600);
        return { id: row.id, url: data?.signedUrl ?? "", type: row.type, caption: row.caption };
      }),
    );
  }

  const initial: ExperienceFormInput = {
    id: experience.id,
    orderId: experience.order_id ?? undefined,
    slug: experience.slug,
    recipientName: experience.recipient_name,
    senderName: experience.sender_name ?? "",
    introMessage: experience.intro_message,
    welcomeMessage: experience.welcome_message ?? "",
    story: experience.story ?? "",
    letter: experience.letter ?? "",
    finalMessage: experience.final_message,
    privacy: experience.privacy,
    pin: "",
    expiresAt: experience.expires_at ? experience.expires_at.slice(0, 16) : "",
    status: experience.status,
    musicOption: music?.option ?? "sin_musica",
    musicTitle: music?.title ?? "",
    musicArtist: music?.artist ?? "",
    musicUrl: music?.url ?? "",
    musicSpotifyEmbedUrl: music?.spotify_embed_url ?? "",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="heading-display text-3xl">/{experience.slug}</h1>
          <p className="mt-1 text-sm text-ink/60">Para {experience.recipient_name}</p>
        </div>
        <a
          href={`/m/${experience.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-semibold text-borgona-700"
        >
          Ver experiencia <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <ExperienceMediaManager experienceId={experience.id} media={media} />
      <ExperienceForm initial={initial} />
    </div>
  );
}
