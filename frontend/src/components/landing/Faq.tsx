"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { Plus } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/motion/Reveal";

const QUESTIONS = [
  {
    q: "Is Wayfinder the same as Zabihah?",
    a: "No. Zabihah is the only source that can verify halal status. Wayfinder brings that data together with Google Places and local checks, then shows it all on one map with honest labels.",
  },
  {
    q: "What does Likely halal actually mean?",
    a: "It means the status came from a restaurant’s own site, a menu, or a local confirmation, not from Zabihah. It can be wrong, so we call it Likely, not Verified.",
  },
  {
    q: "Which city does Wayfinder cover first?",
    a: "Toronto, starting from the downtown core. More cities and campuses follow the same trust model as coverage grows.",
  },
  {
    q: "Is Wayfinder free to use?",
    a: "Yes. Finding and filtering places is free. Search stays free even as we add features later.",
  },
  {
    q: "What if a place’s status looks wrong?",
    a: "Tell us from the place page. Local feedback can move a place to Likely or False, but only Zabihah can ever set a place to Verified.",
  },
];

/**
 * Header on the left, answers on the right: the right column is a real
 * interactive control, not an explainer paragraph, which is the one case the
 * two-column section header is worth using. Expand and collapse is a state
 * transition, and the accordion keeps five answers from dumping as one wall
 * of text.
 */
export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <section id="faq" className="scroll-mt-16 border-t border-line/70 bg-cream">
      <div className="mx-auto grid max-w-[1400px] grid-cols-1 gap-12 px-6 py-20 sm:px-10 sm:py-24 lg:grid-cols-[minmax(0,26%)_1fr] lg:gap-20">
        <Reveal>
          <h2 className="font-display text-3xl font-extrabold leading-tight tracking-tight text-espresso sm:text-4xl">
            Questions people ask.
          </h2>
        </Reveal>

        <Reveal delay={0.06}>
          <div className="flex flex-col divide-y divide-line/70 border-t border-line/70">
            {QUESTIONS.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={item.q}>
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span className="font-display text-lg font-semibold text-espresso sm:text-xl">
                      {item.q}
                    </span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{
                        duration: reduce ? 0 : 0.24,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="shrink-0 text-harbour"
                    >
                      <Plus size={20} weight="bold" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: reduce ? 0 : 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[62ch] pb-7 font-serif text-base leading-relaxed text-espresso-soft">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
