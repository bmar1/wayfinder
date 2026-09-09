"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { tapScale } from "@/lib/motion";

type ButtonProps = {
  href: string;
  children: ReactNode;
  /** `ghost` is the outline treatment for dark surfaces (the hero photo). */
  variant?: "primary" | "outline" | "ghost";
  className?: string;
  onClick?: () => void;
};

/**
 * The single CTA control for the product ("Open map"). Full-pill radius per
 * the design system's Shape Consistency Lock; tactile feedback via a small
 * scale-down on tap/hover, never a color swap that breaks the one-accent lock.
 */
export function Button({ href, children, variant = "primary", className = "", onClick }: ButtonProps) {
  const reduce = useReducedMotion();

  const base =
    "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] px-7 py-3.5 font-display text-base font-semibold whitespace-nowrap transition-colors duration-200";
  const styles = {
    primary: "bg-harbour text-on-harbour hover:bg-harbour-bright",
    outline:
      "bg-transparent text-harbour border-2 border-harbour hover:bg-harbour hover:text-on-harbour",
    ghost:
      "bg-cream/10 text-on-ink border-2 border-on-ink/45 backdrop-blur-sm hover:bg-cream hover:text-espresso hover:border-cream",
  }[variant];

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -1 }}
      whileTap={reduce ? undefined : tapScale}
      className="inline-block"
    >
      <Link href={href} onClick={onClick} className={`${base} ${styles} ${className}`}>
        {children}
      </Link>
    </motion.div>
  );
}
