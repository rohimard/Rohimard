import { Reveal } from "@/components/motion/Reveal";
import type { ExperienceMediaItem } from "@/lib/types/experience";

export function VideoSection({ video }: { video: ExperienceMediaItem }) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center text-crema-50">
      <Reveal>
        <span className="eyebrow !text-dorado-200">Video especial</span>
      </Reveal>
      <Reveal delay={0.15} className="mt-6 w-full max-w-sm">
        <div className="overflow-hidden rounded-2xl border border-dorado-200/30 shadow-card">
          <video src={video.url} controls playsInline className="aspect-[9/16] w-full bg-black object-cover" />
        </div>
        {video.caption && <p className="mt-4 text-sm text-crema-100/70">{video.caption}</p>}
      </Reveal>
    </section>
  );
}
