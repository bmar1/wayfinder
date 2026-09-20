import type { DietaryStatus } from "./demo-restaurants";

/**
 * MapLibre markers need a raw DOM node, not a React component, so pin
 * styling reads the same CSS variables as the rest of the app (see
 * frontend/src/app/globals.css) via inline styles instead of Tailwind
 * classes evaluated at build time.
 */
const STATUS_COLOR: Record<DietaryStatus, string> = {
  verified: "var(--harbour)",
  likely: "var(--warn)",
  unchecked: "var(--espresso-soft)",
  false: "var(--danger)",
};

function applyDotStyle(dot: HTMLDivElement, status: DietaryStatus, selected: boolean) {
  const size = selected ? 36 : 28;
  dot.style.width = `${size}px`;
  dot.style.height = `${size}px`;
  dot.style.borderRadius = "999px";
  dot.style.background = STATUS_COLOR[status];
  dot.style.border = "2px solid var(--cream)";
  dot.style.boxShadow = selected
    ? "0 0 0 3px var(--harbour-bright), 0 8px 24px rgba(59,42,34,0.24)"
    : "0 8px 24px rgba(59,42,34,0.12)";
  dot.style.transition =
    "width 160ms ease, height 160ms ease, box-shadow 160ms ease, opacity 200ms ease, transform 200ms ease";
}

/**
 * Creates the DOM node passed to `new maplibregl.Marker({ element })`.
 * MapLibre owns `transform` on this outer element to position the marker on
 * the map, so all visual styling (including animated scale/opacity for the
 * entrance and selection states) lives on an inner `dot` child instead, to
 * avoid clobbering that positioning transform.
 */
export function createPinElement(status: DietaryStatus, selected: boolean): HTMLDivElement {
  const el = document.createElement("div");
  el.style.cursor = "pointer";
  const dot = document.createElement("div");
  applyDotStyle(dot, status, selected);
  el.appendChild(dot);
  return el;
}

/** The animatable inner node, for entrance/selection animations driven from MapCanvas. */
export function getPinDot(el: HTMLDivElement): HTMLDivElement {
  return el.firstElementChild as HTMLDivElement;
}

/** Mutates an existing pin's inner dot in place (avoids removing/re-adding the marker). */
export function updatePinElement(el: HTMLDivElement, status: DietaryStatus, selected: boolean) {
  applyDotStyle(getPinDot(el), status, selected);
}
