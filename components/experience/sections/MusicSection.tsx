import { Music2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import type { ExperienceMusicData } from "@/lib/types/experience";

export function MusicSection({ music }: { music: ExperienceMusicData }) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-crema-50">
      <Reveal>
        <span className="eyebrow !text-dorado-200">Nuestra canción</span>
      </Reveal>

      {music.spotifyEmbedUrl ? (
        <Reveal delay={0.15} className="mt-6 w-full max-w-sm">
          <iframe
            src={music.spotifyEmbedUrl}
            width="100%"
            height="152"
            style={{ borderRadius: 16 }}
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            title="Reproductor de Spotify"
          />
        </Reveal>
      ) : (
        <Reveal delay={0.15}>
          <div className="mt-6 flex flex-col items-center gap-3 rounded-2xl border border-dorado-200/30 bg-blanco/5 px-8 py-8">
            <Music2 className="h-8 w-8 text-dorado-200" strokeWidth={1.4} />
            <p className="font-script text-2xl text-dorado-200">{music.title ?? "Una canción especial"}</p>
            {music.artist && <p className="text-sm text-crema-100/70">{music.artist}</p>}
          </div>
        </Reveal>
      )}
    </section>
  );
}
