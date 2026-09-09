// Shared motion tokens for Wayfinder.
// Mirrors docs/frontend/design-system.md Section 5 (durations, easings) and the
// design-taste-frontend skill's "motion must be motivated" rule: every variant
// below exists to communicate hierarchy, storytelling, feedback, or a state
// transition, never decoration for its own sake.

export const EASE_ENTER = [0.22, 1, 0.36, 1] as const;
export const EASE_EXIT = [0.4, 0, 1, 1] as const;

export const DURATION = {
  micro: 0.16, // 120-180ms band
  ui: 0.28, // 240-320ms band
  page: 0.46, // 400-520ms band
} as const;

/** Reveal-on-scroll for a single element. Storytelling: content arrives as you scroll. */
export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.56, ease: EASE_ENTER },
  },
};

/** Stagger container for grouped children (steps, comparison rows, FAQ items). */
export function staggerContainer(staggerDelay = 0.08) {
  return {
    hidden: {},
    shown: {
      transition: { staggerChildren: staggerDelay },
    },
  };
}

export const staggerItem = {
  hidden: { opacity: 0, y: 28 },
  shown: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.page, ease: EASE_ENTER },
  },
};

/** Tactile feedback for buttons: a physical push, per skill Section 4.5. */
export const tapScale = { scale: 0.98 };
