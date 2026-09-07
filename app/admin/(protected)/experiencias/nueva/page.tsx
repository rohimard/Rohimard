import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ExperienceForm } from "@/components/admin/ExperienceForm";
import type { ExperienceFormInput } from "@/lib/validations/experience";

export const metadata = { title: "Nueva experiencia", robots: { index: false, follow: false } };

const DIACRITICS_REGEX = new RegExp("[\\u0300-\\u036f]", "g");

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default async function NewExperiencePage({ searchParams }: { searchParams: { order_id?: string } }) {
  let initial: ExperienceFormInput = {
    slug: "",
    recipientName: "",
    senderName: "",
    introMessage: "Hay algo que quiero que recuerdes...",
    welcomeMessage: "",
    story: "",
    letter: "",
    finalMessage: "Este regalo termina aquí. El momento, no. ❤️",
    privacy: "public",
    pin: "",
    expiresAt: "",
    status: "borrador",
    musicOption: "sin_musica",
    musicTitle: "",
    musicArtist: "",
    musicUrl: "",
    musicSpotifyEmbedUrl: "",
    orderId: searchParams.order_id,
  };

  if (isSupabaseConfigured && searchParams.order_id) {
    const supabase = createClient();
    const { data: order } = await supabase.from("orders").select("*").eq("id", searchParams.order_id).maybeSingle();
    if (order) {
      initial = {
        ...initial,
        slug: slugify(`${order.recipient_name ?? "momentia"}-${order.sender_name ?? ""}`).slice(0, 40) || "nueva-momentia",
        recipientName: order.recipient_name ?? "",
        senderName: order.sender_name ?? "",
        welcomeMessage: order.message ?? "",
        letter: order.letter ?? "",
        musicOption: order.music_option,
        musicTitle: order.music_option === "cancion" ? order.music_value ?? "" : "",
        musicSpotifyEmbedUrl: order.music_option === "spotify" ? order.music_value ?? "" : "",
      };
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="heading-display text-3xl">Nueva experiencia</h1>
        <p className="mt-1 text-sm text-ink/60">Crea la experiencia digital que se descubrirá al escanear el QR.</p>
      </div>
      <ExperienceForm initial={initial} />
    </div>
  );
}
