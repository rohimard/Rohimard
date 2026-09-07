import { z } from "zod";

export const experienceFormSchema = z.object({
  id: z.string().optional(),
  orderId: z.string().optional(),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo minúsculas, números y guiones"),
  recipientName: z.string().min(1, "Ingresa el nombre de quien recibe el regalo"),
  senderName: z.string().optional(),
  introMessage: z.string().min(1),
  welcomeMessage: z.string().optional(),
  story: z.string().optional(),
  letter: z.string().optional(),
  finalMessage: z.string().min(1),
  privacy: z.enum(["public", "private", "temporal"]),
  pin: z.string().optional(),
  expiresAt: z.string().optional(),
  status: z.enum(["borrador", "publicada", "archivada"]),
  musicOption: z.enum(["cancion", "playlist", "spotify", "sin_musica"]),
  musicTitle: z.string().optional(),
  musicArtist: z.string().optional(),
  musicUrl: z.string().optional(),
  musicSpotifyEmbedUrl: z.string().optional(),
});

export type ExperienceFormInput = z.infer<typeof experienceFormSchema>;
