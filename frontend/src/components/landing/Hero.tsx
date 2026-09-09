"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Button } from "@/components/ui/Button";
import { DURATION, EASE_ENTER } from "@/lib/motion";

/**
 * Full-bleed hero: one landscape photograph carrying the whole plane, with
 * the copy overlaid in the cloud bank to the left of the tower. The previous
 * split column put a portrait frame beside the text and read as two
 * unrelated halves on wide screens.
 *
 * The scrim is directional rather than a flat wash, so the frame stays a
 * photograph: it deepens under the text and clears entirely over the tower.
 * Cascade-in is feedback, confirming the page is ready rather than mid-load.
 */
export function Hero() {
  const cascade = (delay: number) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DURATION.page, ease: EASE_ENTER, delay },
  });

  return (
    <section className="relative flex min-h-[calc(100dvh-4rem)] items-end overflow-hidden bg-ink lg:items-center">
      <Image
        src="/hero.png"
        alt="Toronto at dusk from the harbour, the CN Tower disappearing into low cloud above a lit downtown skyline."
        fill
        priority
        sizes="100vw"
        className="object-cover object-center lg:object-top"
      />

      {/* Deepens toward the copy, clears over the tower. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/10 lg:bg-gradient-to-r lg:from-ink/90 lg:via-ink/45 lg:to-transparent"
      />

      <div className="relative z-10 w-full px-6 pb-16 pt-24 sm:px-10 lg:px-14 lg:pb-0 lg:pt-0 xl:px-20">
        <div className="max-w-[36rem]">
          <motion.h1
            {...cascade(0.04)}
            className="font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-on-ink sm:text-5xl lg:text-6xl"
          >
            Know it’s halal before you go.
          </motion.h1>

          <motion.p
            {...cascade(0.12)}
            className="mt-6 max-w-[42ch] font-serif text-lg leading-relaxed text-on-ink/85 sm:text-xl"
          >
            Wayfinder maps halal-friendly places across Toronto and tells you
            where every status came from.
          </motion.p>

          <motion.div
            {...cascade(0.2)}
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <Button href="/map">Open map</Button>
            <Button href="#problem" variant="ghost">
              The problem
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
