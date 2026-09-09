"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { staggerContainer, staggerItem } from "@/lib/motion";

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  /** Keeps list markup valid: the group is the ul/ol, its items are the li. */
  as?: "div" | "ul" | "ol";
};

/** Parent for grouped reveals (steps, comparison rows, FAQ items). */
export function StaggerGroup({
  children,
  className,
  staggerDelay,
  as = "div",
}: StaggerGroupProps) {
  const reduce = useReducedMotion();
  const Component = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={{ once: true, amount: 0.18 }}
      variants={reduce ? undefined : staggerContainer(staggerDelay)}
    >
      {children}
    </Component>
  );
}

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
};

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const reduce = useReducedMotion();
  const Component = as === "li" ? motion.li : motion.div;

  return (
    <Component
      className={className}
      variants={reduce ? undefined : staggerItem}
      initial={reduce ? { opacity: 0 } : undefined}
      whileInView={reduce ? { opacity: 1 } : undefined}
      viewport={reduce ? { once: true, amount: 0.2 } : undefined}
      transition={reduce ? { duration: 0.2 } : undefined}
    >
      {children}
    </Component>
  );
}
