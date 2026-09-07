import {
  IconCamera,
  IconMail,
  IconMusic,
  IconSparkle,
} from "@/components/ui/icons";

const screens = [
  {
    title: "Para ti, mi amor",
    label: "Mensaje personalizado",
    icon: IconSparkle,
    body: (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-rose-100 to-blush-100 px-4 text-center">
        <span className="script-accent text-2xl">Para ti, mi amor</span>
        <p className="text-[11px] leading-relaxed text-maroon-700">
          Hoy quiero recordarte por qué eres tan especial para mí.
        </p>
      </div>
    ),
  },
  {
    title: "Nuestra historia",
    label: "Galería de fotos",
    icon: IconCamera,
    body: (
      <div className="grid h-full grid-cols-2 gap-1 bg-white p-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-md bg-gradient-to-br from-maroon-200 to-gold-300"
          />
        ))}
      </div>
    ),
  },
  {
    title: "Para ti",
    label: "Video especial",
    icon: IconSparkle,
    body: (
      <div className="relative flex h-full flex-col items-center justify-center bg-ink-900 text-cream-50">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-cream-50/15 backdrop-blur">
          <div className="ml-1 h-0 w-0 border-y-8 border-l-[14px] border-y-transparent border-l-cream-50" />
        </div>
        <p className="mt-3 text-[11px] text-cream-100/80">00:55</p>
      </div>
    ),
  },
  {
    title: "Nuestra canción",
    label: "Playlist personalizada",
    icon: IconMusic,
    body: (
      <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-b from-maroon-700 to-maroon-900 text-cream-50">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-cream-50/10">
          <IconMusic width={28} height={28} />
        </span>
        <p className="text-[11px] text-cream-100/80">Nuestra playlist</p>
      </div>
    ),
  },
  {
    title: "Carta para ti",
    label: "Carta digital",
    icon: IconMail,
    body: (
      <div className="flex h-full flex-col items-center justify-center gap-2 bg-cream-50 px-5 text-center">
        <IconMail width={26} height={26} className="text-maroon-500" />
        <p className="text-[11px] leading-relaxed text-ink-700">
          Gracias por cada roce, por cada abrazo, por cada momento que me
          haces feliz.
        </p>
      </div>
    ),
  },
];

export function DigitalExperience() {
  return (
    <section id="experiencia-digital" className="py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Experiencia digital</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Cada regalo incluye una experiencia digital única y personalizada.
          </h2>
          <p className="mt-3 text-ink-600">
            Al escanear el QR de su caja, tu persona especial llega a una
            página hecha solo para ella: <code className="rounded bg-maroon-50 px-1.5 py-0.5 text-maroon-700">momentia.pe/su-nombre</code>
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {screens.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-4">
              <div className="phone-frame">{s.body}</div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-ink-600">
                <s.icon width={14} height={14} className="text-maroon-500" />
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
