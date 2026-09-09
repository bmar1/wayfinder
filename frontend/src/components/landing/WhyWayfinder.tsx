import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

const ROWS = [
  {
    topic: "Where Verified comes from",
    google: "A review keyword or a tag anyone can add.",
    wayfinder: "Zabihah’s own data, and nothing else.",
  },
  {
    topic: "What a halal filter returns",
    google: "Places nobody has checked, mixed in with the rest.",
    wayfinder: "Verified and Likely only. Unchecked stays out.",
  },
  {
    topic: "How uncertainty is shown",
    google: "One tag that looks finished either way.",
    wayfinder: "Likely, Unchecked, and False, each named plainly.",
  },
];

/**
 * Colour-block comparison after the pipeline. Rows fill the empty middle
 * that a two-paragraph split left behind. One dark surface, still the same
 * theme family as the hero scrim.
 */
export function WhyWayfinder() {
  return (
    <section id="why-wayfinder" className="scroll-mt-16 bg-ink text-on-ink">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-24">
        <Reveal>
          <h2 className="max-w-[20ch] font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Why this is better than a Google Maps filter.
          </h2>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="mt-14 hidden grid-cols-12 gap-8 border-b border-on-ink/15 pb-4 md:grid">
            <p className="col-span-4 font-display text-sm font-semibold text-ink-soft">
              Compared
            </p>
            <p className="col-span-4 font-display text-sm font-semibold text-ink-soft">
              Google Maps
            </p>
            <p className="col-span-4 font-display text-sm font-semibold text-on-ink">
              Wayfinder
            </p>
          </div>
        </Reveal>

        <StaggerGroup
          as="ul"
          className="divide-y divide-on-ink/15 border-b border-on-ink/15 md:mt-0"
          staggerDelay={0.08}
        >
          {ROWS.map((row) => (
            <StaggerItem key={row.topic} as="li">
              <div className="grid grid-cols-1 gap-6 py-8 md:grid-cols-12 md:gap-8 md:py-10">
                <p className="font-display text-lg font-bold md:col-span-4">
                  {row.topic}
                </p>
                <div className="md:col-span-4">
                  <p className="mb-1 font-display text-sm font-semibold text-ink-soft md:hidden">
                    Google Maps
                  </p>
                  <p className="font-serif text-base leading-relaxed text-ink-soft">
                    {row.google}
                  </p>
                </div>
                <div className="md:col-span-4">
                  <p className="mb-1 font-display text-sm font-semibold text-on-ink md:hidden">
                    Wayfinder
                  </p>
                  <p className="font-serif text-base leading-relaxed text-on-ink">
                    {row.wayfinder}
                  </p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal delay={0.08}>
          <p className="mt-14 max-w-[26ch] font-display text-3xl font-extrabold leading-[1.1] tracking-tight text-harbour-bright sm:text-4xl">
            Only Zabihah data can mark a place Verified.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
