import Link from "next/link";
import { Heart } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";

export function FinalSection({ message }: { message: string }) {
  const [firstLine, ...rest] = message.split("\n").filter(Boolean);
  const secondLine = rest.join(" ");

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-crema-50">
      <Reveal>
        <Heart className="mx-auto h-8 w-8 fill-rosa-200 text-rosa-200" />
      </Reveal>
      <Reveal delay={0.2}>
        <h2 className="heading-display mt-6 text-balance text-3xl text-blanco sm:text-4xl">{firstLine}</h2>
      </Reveal>
      {secondLine && (
        <Reveal delay={0.35}>
          <p className="mt-3 font-script text-3xl text-dorado-200">{secondLine}</p>
        </Reveal>
      )}

      <Reveal delay={0.6}>
        <Link href="/" className="mt-14 text-xs uppercase tracking-[0.25em] text-crema-100/50 hover:text-dorado-200">
          Creado con MOMENTIA
        </Link>
      </Reveal>
    </section>
  );
}
