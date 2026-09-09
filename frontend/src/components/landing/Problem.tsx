import Image from "next/image";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Split: copy on the left, a real Toronto street photograph on the right.
 * Distinct from the hero overlay and from the phone mockup that follows.
 * Mobile stacks copy then image.
 */
export function Problem() {
  return (
    <section id="problem" className="scroll-mt-16 bg-cream">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-stretch gap-10 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-12 lg:gap-16">
        <Reveal className="flex flex-col justify-center lg:col-span-5">
          <h2 className="max-w-[16ch] font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-espresso sm:text-4xl lg:text-5xl">
            Google Maps was never built for this.
          </h2>
          <p className="mt-6 max-w-[48ch] font-serif text-lg leading-relaxed text-espresso-soft">
            Halal shows up as a review keyword or a tag anyone can leave.
            Filter for it and you still get places nobody has checked.
          </p>
          <p className="mt-5 max-w-[48ch] font-serif text-lg leading-relaxed text-espresso-soft">
            That is a guess dressed as a result. If the answer matters for
            your practice, a guess is not enough.
          </p>
        </Reveal>

        <Reveal delay={0.1} className="lg:col-span-7">
          <div className="relative min-h-[22rem] overflow-hidden rounded-[var(--radius-panel)] sm:min-h-[28rem] lg:h-full lg:min-h-[32rem]">
            <Image
              src="/problem.jpg"
              alt="A Toronto street of independent shops and restaurants on a bright day."
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
