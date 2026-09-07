import { Reveal } from "@/components/motion/Reveal";
import { Mail } from "lucide-react";

export function LetterSection({ letter }: { letter: string }) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 py-20 text-crema-50">
      <Reveal className="text-center">
        <Mail className="mx-auto h-6 w-6 text-dorado-200" strokeWidth={1.4} />
        <span className="eyebrow mt-3 block !text-dorado-200">Carta para ti</span>
      </Reveal>

      <Reveal delay={0.2} className="mt-8 w-full max-w-md rounded-2xl border border-dorado-200/30 bg-blanco/[0.06] p-8 shadow-card backdrop-blur-sm">
        <p className="whitespace-pre-line text-balance font-serif text-lg leading-relaxed text-crema-50">
          {letter}
        </p>
      </Reveal>
    </section>
  );
}
