import { Instagram, Heart, MessageCircle } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { Reveal } from "@/components/motion/Reveal";

const TILES = [
  { icon: Heart, label: "Amor" },
  { icon: MessageCircle, label: "Agradecimiento" },
  { icon: Instagram, label: "Momentos" },
];

export function SocialSection() {
  return (
    <section className="bg-crema-50 py-20 lg:py-24">
      <div className="container-momentia">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="eyebrow">Síguenos</span>
          <h2 className="heading-display mt-3 text-3xl sm:text-4xl">{siteConfig.social.instagramHandle}</h2>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-ink/65">
            🎁 Regalos personalizados · ❤️ Creamos momentos que permanecen · 📱 Experiencias
            digitales únicas · 📍 {siteConfig.location}
          </p>
        </Reveal>

        <Reveal delay={0.15} className="mt-10 grid grid-cols-3 gap-3 sm:gap-5">
          {TILES.map((tile) => (
            <div
              key={tile.label}
              className="flex aspect-square flex-col items-center justify-center gap-3 rounded-2xl bg-gradient-to-br from-rubi-500 via-borgona-600 to-borgona-800 text-crema-50 shadow-soft"
            >
              <tile.icon className="h-7 w-7" strokeWidth={1.5} />
              <span className="text-xs font-medium tracking-wide">{tile.label}</span>
            </div>
          ))}
        </Reveal>

        <Reveal delay={0.25} className="mt-8 text-center">
          <a
            href={siteConfig.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-borgona-700 underline underline-offset-4"
          >
            <Instagram className="h-4 w-4" /> Ver más en Instagram
          </a>
        </Reveal>
      </div>
    </section>
  );
}
