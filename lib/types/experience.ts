export interface ExperienceMediaItem {
  id: string;
  url: string;
  type: "photo" | "video";
  caption: string | null;
}

export interface ExperienceMusicData {
  option: "cancion" | "playlist" | "spotify" | "sin_musica";
  title: string | null;
  artist: string | null;
  url: string | null;
  spotifyEmbedUrl: string | null;
}

export interface ExperienceData {
  recipientName: string;
  senderName: string | null;
  introMessage: string;
  welcomeMessage: string | null;
  story: string | null;
  letter: string | null;
  finalMessage: string;
  coverImageUrl: string | null;
  media: ExperienceMediaItem[];
  music: ExperienceMusicData | null;
}

export type ExperienceResolution =
  | { status: "not_found" }
  | { status: "expired" }
  | { status: "needs_pin"; error?: string }
  | { status: "ok"; data: ExperienceData };
