export function formatSoles(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Convierte una URL de YouTube o Vimeo en su URL de embed. Si no reconoce el formato, devuelve null. */
export function toEmbedVideoUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
      const shortsMatch = u.pathname.match(/\/shorts\/([\w-]+)/);
      if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;
    }
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace("/", "");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    return null;
  } catch {
    return null;
  }
}

/** Convierte un enlace de Spotify (canción, álbum o playlist) en su URL de embed. */
export function toEmbedSpotifyUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("open.spotify.com")) return null;
    const path = u.pathname.replace(/^\/(intl-[a-z]{2}\/)?/, "/");
    return `https://open.spotify.com/embed${path}`;
  } catch {
    return null;
  }
}
