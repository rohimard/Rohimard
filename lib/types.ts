export type BoxLine = "esencial" | "historia" | "corporate";

export const BOX_LINES: Record<
  BoxLine,
  { name: string; tagline: string; priceFrom: number }
> = {
  esencial: {
    name: "Momentia Esencial",
    tagline: "Belleza esencial, grandes emociones.",
    priceFrom: 89,
  },
  historia: {
    name: "Momentia Historia",
    tagline: "Tu historia merece ser contada.",
    priceFrom: 139,
  },
  corporate: {
    name: "Momentia Corporate",
    tagline: "Fortalece vínculos, inspira equipos.",
    priceFrom: 89,
  },
};

/** Experiencia digital personalizada asociada al QR de una caja. */
export interface Experience {
  slug: string;
  boxLine: BoxLine;
  senderName: string;
  recipientName: string;
  message: string;
  letter: string;
  photos: string[];
  videoUrl: string | null;
  playlistUrl: string | null;
  createdAt: string;
  /** Solo se genera en modo demo (sin Supabase) para permitir re-editar desde el mismo navegador. */
  editToken?: string;
}

export type NewExperienceInput = Omit<Experience, "createdAt">;
