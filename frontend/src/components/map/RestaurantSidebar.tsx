"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ImageSquare, X } from "@phosphor-icons/react/dist/ssr";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DURATION, EASE_ENTER } from "@/lib/motion";
import type { DemoRestaurant } from "@/lib/demo-restaurants";

type RestaurantSidebarProps = {
  restaurant: DemoRestaurant | null;
  onClose: () => void;
};

/** Verbatim per docs/frontend/trust-and-disclaimer-copy.md; exempt from the em-dash-free rule. */
const ZABIHAH_ATTRIBUTION = "Data \u00a9 Zabihah \u2014 https://www.zabihah.com";
const NON_VERIFIED_FOOTNOTE =
  "Dietary labels can change. Always confirm with the restaurant if it matters for your practice.";
const LIKELY_DISCLAIMER =
  "Wayfinder does not certify restaurants. \u201cLikely\u201d is inferred from public sources or community tips and can be wrong. Prefer Verified when observance requires certainty.";

/**
 * Detail side bar: hidden by default, slides in only once a restaurant is
 * selected (pin click). Shows a mock image block, the trust disclaimer, and
 * the scrollable menu; closing returns to the plain map.
 */
export function RestaurantSidebar({ restaurant, onClose }: RestaurantSidebarProps) {
  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {restaurant && (
        <motion.aside
          key={restaurant.id}
          initial={reduce ? false : { x: "100%" }}
          animate={{ x: 0 }}
          exit={reduce ? { opacity: 0 } : { x: "100%" }}
          transition={{ duration: DURATION.ui, ease: EASE_ENTER }}
          className="absolute inset-y-0 right-0 z-20 w-[380px] max-w-[88vw] overflow-y-auto border-l border-line bg-cream pt-20 pb-6 shadow-[-8px_0_32px_rgba(59,42,34,0.18)]"
        >
          <div className="px-5">
            <div className="mb-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-lg font-semibold text-espresso">{restaurant.name}</p>
                <p className="font-serif text-sm text-espresso-soft">{restaurant.address}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close restaurant details"
                className="shrink-0 rounded-[var(--radius-pill)] p-2 text-espresso-soft transition-colors hover:bg-cream-deep"
              >
                <X size={20} weight="bold" />
              </button>
            </div>

            <div className="mb-4">
              <StatusBadge status={restaurant.dietaryStatus} />
            </div>

            {/* Mock image: solid placeholder block, per explicit request (no external photo). */}
            <div className="mb-4 flex h-32 w-full items-center justify-center rounded-[var(--radius-input)] bg-cream-deep text-espresso-soft">
              <ImageSquare size={32} weight="light" />
            </div>

            {restaurant.dietaryStatus === "verified" && (
              <div className="mb-4 font-serif text-sm text-espresso-soft">
                <p>{ZABIHAH_ATTRIBUTION}</p>
                {restaurant.zabihahUrl && (
                  <a
                    href={restaurant.zabihahUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-display font-semibold text-harbour underline"
                  >
                    Full report on Zabihah
                  </a>
                )}
              </div>
            )}
            {restaurant.dietaryStatus === "likely" && (
              <p className="mb-4 font-serif text-sm text-espresso-soft">{LIKELY_DISCLAIMER}</p>
            )}
            {restaurant.dietaryStatus !== "verified" && (
              <p className="mb-4 font-serif text-xs text-espresso-soft/80">{NON_VERIFIED_FOOTNOTE}</p>
            )}

            <div className="flex flex-col gap-5">
              {restaurant.menu.map((section) => (
                <div key={section.name}>
                  <p className="mb-2 font-display text-sm font-semibold text-espresso">{section.name}</p>
                  <div className="divide-y divide-line">
                    {section.items.map((item) => (
                      <div key={item.name} className="flex items-start justify-between gap-4 py-2">
                        <div>
                          <p className="font-display text-sm text-espresso">{item.name}</p>
                          {item.description && (
                            <p className="font-serif text-xs text-espresso-soft">{item.description}</p>
                          )}
                        </div>
                        <p className="shrink-0 font-display text-sm font-semibold text-espresso">
                          {item.price}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
