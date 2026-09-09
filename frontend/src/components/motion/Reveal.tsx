"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp } from "@/lib/motion";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
};

/**
 * Scroll reveal for a single block. Reason: hierarchy + storytelling, per
 * design-taste-frontend Section 5.C. Degrades to a static crossfade (no
 * y-shift) under prefers-reduced-motion.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const reduce = useReducedMotion();
  const Component = as === "li" ? motion.li : motion.div;

  return (
    <Component
      className={className}
      initial={reduce ? { opacity: 0 } : fadeUp.hidden}
      whileInView={reduce ? { opacity: 1 } : fadeUp.shown}
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -8% 0px" }}
      transition={
        reduce
          ? { duration: 0.2, delay }
          : { ...fadeUp.shown.transition, delay }
      }
    >
      {children}
    </Component>
  );
}
