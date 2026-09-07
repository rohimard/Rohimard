import type { Experience } from "./types";

/**
 * Experiencia de ejemplo, siempre disponible en /ana, para que cualquiera
 * pueda ver cómo luce la página que recibe quien escanea el QR sin tener
 * que crear una primero.
 */
export const DEMO_EXPERIENCE: Experience = {
  slug: "ana",
  boxLine: "historia",
  senderName: "Carlos",
  recipientName: "Ana",
  message:
    "Hay momentos que se convierten en recuerdos y recuerdos que duran para siempre. Este es uno de ellos, hecho para ti.",
  letter:
    "Ana:\n\nDesde el día que te conocí supe que ibas a llenar de color mis días más grises. Esta caja tiene lo esencial para consentirte, pero lo que de verdad quiero regalarte está aquí: cada foto, cada canción y cada palabra que hemos compartido.\n\nGracias por ser mi persona favorita.\n\nCon todo mi cariño,\nCarlos",
  photos: [],
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  playlistUrl: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
  createdAt: new Date("2026-02-14T12:00:00Z").toISOString(),
};

export const DEMO_EXPERIENCES: Record<string, Experience> = {
  ana: DEMO_EXPERIENCE,
};
