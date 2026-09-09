import {
  MagnifyingGlass,
  ShieldCheck,
  NotePencil,
  MapTrifold,
} from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

const STOPS = [
  {
    icon: MagnifyingGlass,
    title: "Discover",
    body: "Candidate places come in from Google Places and Zabihah, so nothing near you gets missed.",
    className: "md:col-span-7 bg-cream-deep/80",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    body: "Zabihah’s own data is the only source that can mark a place Verified halal.",
    className: "md:col-span-5 bg-harbour text-on-harbour",
    invert: true,
  },
  {
    icon: NotePencil,
    title: "Enrich",
    body: "Restaurant sites, menus, and local confirmations move places to Likely, honestly labeled.",
    className: "md:col-span-5 bg-cream border border-line",
  },
  {
    icon: MapTrifold,
    title: "Search",
    body: "Filter on the map or in plain language. Halal search shows Verified and Likely, never a guess.",
    className: "md:col-span-7 bg-cream-deep/80",
  },
];

/**
 * Four-cell bento with mixed fills so the pipeline has visual weight, not a
 * staircase of empty cream. Sequence is still Discover -> Verify -> Enrich
 * -> Search. No step numbers.
 */
export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 bg-cream">
      <div className="mx-auto max-w-[1400px] px-6 py-20 sm:px-10 sm:py-24">
        <Reveal>
          <h2 className="max-w-[18ch] font-display text-3xl font-extrabold leading-tight tracking-tight text-espresso sm:text-4xl lg:text-5xl">
            How a place gets its label.
          </h2>
          <p className="mt-5 max-w-[52ch] font-serif text-lg leading-relaxed text-espresso-soft">
            Every pin on the map has been through this pipeline. Nothing is
            marked Verified by a review, a vibe, or a guess.
          </p>
        </Reveal>

        <StaggerGroup
          as="ol"
          className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-5"
          staggerDelay={0.1}
        >
          {STOPS.map((stop) => {
            const Icon = stop.icon;
            const invert = Boolean(stop.invert);
            return (
              <StaggerItem
                key={stop.title}
                as="li"
                className={`rounded-[var(--radius-panel)] p-8 sm:p-10 ${stop.className}`}
              >
                <span
                  className={`flex items-center gap-3 ${invert ? "text-on-harbour" : "text-harbour"}`}
                >
                  <Icon size={26} weight="bold" />
                  <h3
                    className={`font-display text-2xl font-bold tracking-tight ${invert ? "text-on-harbour" : "text-espresso"}`}
                  >
                    {stop.title}
                  </h3>
                </span>
                <p
                  className={`mt-4 max-w-[46ch] font-serif text-base leading-relaxed ${invert ? "text-on-harbour/85" : "text-espresso-soft"}`}
                >
                  {stop.body}
                </p>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
