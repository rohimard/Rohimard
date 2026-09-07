import { Reveal } from "@/components/motion/Reveal";
import { FloralDivider } from "@/components/decorative/Ornaments";

export function StorySection({ story }: { story: string }) {
  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-crema-50">
      <Reveal>
        <span className="eyebrow !text-dorado-200">Nuestra historia</span>
      </Reveal>
      <Reveal delay={0.15}>
        <FloralDivider className="my-6 opacity-70" />
      </Reveal>
      <Reveal delay={0.25}>
        <p className="mx-auto max-w-lg text-balance font-serif text-xl leading-relaxed text-crema-50 sm:text-2xl">
          {story}
        </p>
      </Reveal>
    </section>
  );
}
