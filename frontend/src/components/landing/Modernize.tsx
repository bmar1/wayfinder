import Image from "next/image";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup, StaggerItem } from "@/components/motion/StaggerGroup";

const TIERS = [
  {
    status: "verified" as const,
    subtitle: "Confirmed with Zabihah data.",
  },
  {
    status: "likely" as const,
    subtitle: "Based on public info or community, not Zabihah-verified.",
  },
  {
    status: "unchecked" as const,
    subtitle: "We have not confirmed this place for halal.",
  },
  {
    status: "false" as const,
    subtitle: "Marked as not halal.",
  },
];

/**
 * How the product modernizes the problem: a real map UI in a phone frame
 * beside the four status labels. The screenshot is a product preview, not a
 * div-built fake dashboard. Reverse of the problem split so the two
 * image+text sections do not share a silhouette.
 */
export function Modernize() {
  return (
    <section id="modernize" className="scroll-mt-16 border-y border-line bg-cream-deep/70">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-14 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-12 lg:gap-16">
        <Reveal className="order-2 flex justify-center lg:order-1 lg:col-span-5">
          <div className="w-[min(100%,19.5rem)] rounded-[2.1rem] border-[10px] border-espresso bg-espresso p-1 shadow-[0_28px_70px_rgba(59,42,34,0.22)]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-[1.4rem] bg-cream">
              <Image
                src="/map-phone.png"
                alt="Wayfinder map on a phone, with Verified, Likely, and Unchecked pins over downtown Toronto and a selected place card for Lahore Grill."
                fill
                sizes="320px"
                className="object-cover object-top"
              />
            </div>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2 lg:col-span-7">
          <Reveal>
            <h2 className="max-w-[18ch] font-display text-3xl font-extrabold leading-[1.08] tracking-tight text-espresso sm:text-4xl lg:text-5xl">
              Honest labels on a live map.
            </h2>
            <p className="mt-5 max-w-[48ch] font-serif text-lg leading-relaxed text-espresso-soft">
              Wayfinder keeps Google Places for what is nearby, then overlays
              a status you can actually trust. Verified is earned. Everything
              else stays named for what it is.
            </p>
          </Reveal>

          <StaggerGroup
            as="ul"
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
            staggerDelay={0.08}
          >
            {TIERS.map((tier) => (
              <StaggerItem key={tier.status} as="li">
                <div className="h-full rounded-[var(--radius-panel)] bg-cream p-6">
                  <StatusBadge status={tier.status} />
                  <p className="mt-4 max-w-[32ch] font-serif text-[15px] leading-relaxed text-espresso-soft">
                    {tier.subtitle}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}
