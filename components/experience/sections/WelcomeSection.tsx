import { Reveal } from "@/components/motion/Reveal";
import { HeartLine } from "@/components/decorative/Ornaments";

export function WelcomeSection({ message, senderName }: { message: string; senderName: string | null }) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-crema-50">
      <Reveal>
        <HeartLine className="mx-auto h-6 w-6 text-rosa-200" />
      </Reveal>
      <Reveal delay={0.15}>
        <h2 className="heading-display mt-6 text-2xl text-blanco sm:text-3xl">Mensaje de bienvenida</h2>
      </Reveal>
      <Reveal delay={0.3}>
        <p className="mx-auto mt-6 max-w-md text-balance text-lg leading-relaxed text-crema-100/90 sm:text-xl">
          {message}
        </p>
      </Reveal>
      {senderName && (
        <Reveal delay={0.45}>
          <p className="mt-6 font-script text-2xl text-dorado-200">— {senderName}</p>
        </Reveal>
      )}
    </section>
  );
}
