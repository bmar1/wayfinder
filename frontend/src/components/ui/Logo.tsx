import { LogoMark } from "./LogoMark";

type LogoProps = {
  size?: "sm" | "lg" | "xl";
  tone?: "espresso" | "cream";
  className?: string;
};

/** Mark + wordmark lockup. Single source of truth for brand identity everywhere it appears. */
export function Logo({ size = "sm", tone = "espresso", className = "" }: LogoProps) {
  const markSize =
    size === "xl"
      ? "h-16 w-16 sm:h-20 sm:w-20"
      : size === "lg"
        ? "h-11 w-11 sm:h-14 sm:w-14"
        : "h-8 w-8";
  const textSize =
    size === "xl" ? "text-4xl sm:text-5xl" : size === "lg" ? "text-2xl sm:text-3xl" : "text-xl";
  const textColor = tone === "cream" ? "text-cream" : "text-espresso";

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={`${markSize} ${textColor}`} />
      <span
        className={`font-display ${textSize} font-extrabold tracking-tight ${textColor}`}
      >
        Wayfinder
      </span>
    </span>
  );
}
