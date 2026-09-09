import type { ReactNode } from "react";
import { CheckCircle, Question, Circle, XCircle } from "@phosphor-icons/react/dist/ssr";

type Status = "verified" | "likely" | "unchecked" | "false";

const STATUS_MAP: Record<
  Status,
  { label: string; icon: ReactNode; className: string }
> = {
  verified: {
    label: "Verified halal",
    icon: <CheckCircle weight="fill" size={16} />,
    className: "bg-harbour text-on-harbour",
  },
  likely: {
    label: "Likely halal",
    icon: <Question weight="fill" size={16} />,
    className: "bg-warn/15 text-warn border border-warn/40",
  },
  unchecked: {
    label: "Not checked yet",
    icon: <Circle weight="bold" size={16} />,
    className: "bg-cream-deep text-espresso-soft border border-line",
  },
  false: {
    label: "Not halal",
    icon: <XCircle weight="fill" size={16} />,
    className: "bg-danger/10 text-danger border border-danger/30",
  },
};

/** Status pill matching docs/frontend/trust-and-disclaimer-copy.md verbatim. */
export function StatusBadge({ status }: { status: Status }) {
  const s = STATUS_MAP[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 font-display text-xs font-semibold ${s.className}`}
    >
      {s.icon}
      {s.label}
    </span>
  );
}
