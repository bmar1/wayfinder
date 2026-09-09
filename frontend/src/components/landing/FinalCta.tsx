import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Horizontal closing band: headline and the single CTA sit on one baseline
 * rather than stacked and centred, which keeps it distinct from the hero and
 * from every section above. The required trust footnote sits below its own
 * rule, where it reads as a standing disclaimer instead of marketing copy.
 */
export function FinalCta() {
  return (
    <section className="border-t border-line bg-cream-deep/70">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-24">
        <Reveal>
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
            <h2 className="max-w-[20ch] font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-espresso sm:text-4xl lg:text-5xl">
              See what’s halal near you tonight.
            </h2>
            <div className="shrink-0">
              <Button href="/map">Open map</Button>
            </div>
          </div>
        </Reveal>

        <p className="mt-16 max-w-[54ch] border-t border-line pt-6 font-serif text-sm leading-relaxed text-espresso-soft sm:mt-20">
          Dietary labels can change. Always confirm with the restaurant if it
          matters for your practice.
        </p>
      </div>
    </section>
  );
}
