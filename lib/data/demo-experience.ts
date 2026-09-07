import type { ExperienceData } from "@/lib/types/experience";

// Contenido de respaldo para /m/demo cuando Supabase no está configurado.
// En producción esta misma experiencia vive en la tabla `digital_experiences`
// (ver supabase/migrations/0004_seed.sql) y se gestiona desde /admin/experiencias.
export const DEMO_EXPERIENCE: ExperienceData = {
  recipientName: "Ana",
  senderName: "Carlos",
  introMessage: "Hay algo que quiero que recuerdes...",
  welcomeMessage:
    "Feliz de compartir contigo un pedacito de nuestra historia. Esto es solo el comienzo.",
  story:
    "Nos conocimos un martes cualquiera que terminó no siendo tan cualquiera. Desde entonces, cada momento contigo se ha convertido en una razón para sonreír.",
  letter:
    "Querida Ana:\n\nHay cosas que no caben dentro de una caja. Esta es una de ellas. Gracias por cada risa, cada silencio cómodo y cada plan improvisado.\n\nCon todo mi cariño,\nCarlos",
  finalMessage: "Este regalo termina aquí. El momento, no. ❤️",
  coverImageUrl: null,
  media: [
    { id: "1", url: "", type: "photo", caption: "El día que todo empezó" },
    { id: "2", url: "", type: "photo", caption: "Nuestro primer viaje" },
    { id: "3", url: "", type: "photo", caption: "Tantas risas juntos" },
    { id: "4", url: "", type: "photo", caption: "Este momento, para siempre" },
  ],
  music: {
    option: "spotify",
    title: "Perfect",
    artist: "Ed Sheeran",
    url: null,
    spotifyEmbedUrl: "https://open.spotify.com/embed/track/0tgVpDi06FyKpA1z0VMD4v",
  },
};
