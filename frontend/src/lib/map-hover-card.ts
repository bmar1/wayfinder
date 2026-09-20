import type { DemoRestaurant, DietaryStatus } from "./demo-restaurants";

const STATUS_LABEL: Record<DietaryStatus, string> = {
  verified: "Verified halal",
  likely: "Likely halal",
  unchecked: "Not checked yet",
  false: "Not halal",
};

const STATUS_COLOR: Record<DietaryStatus, string> = {
  verified: "var(--harbour)",
  likely: "var(--warn)",
  unchecked: "var(--espresso-soft)",
  false: "var(--danger)",
};

/**
 * DOM content for the hover popup: critical info only (name, status, price
 * level, neighborhood), not the full detail (that's the click panel).
 */
export function createHoverCard(restaurant: DemoRestaurant): HTMLDivElement {
  const el = document.createElement("div");
  el.style.minWidth = "180px";
  el.style.padding = "2px 2px";
  el.style.fontFamily = "var(--font-display), sans-serif";

  const name = document.createElement("p");
  name.textContent = restaurant.name;
  name.style.margin = "0 0 4px";
  name.style.fontWeight = "600";
  name.style.fontSize = "13px";
  name.style.color = "var(--espresso)";
  el.appendChild(name);

  const status = document.createElement("p");
  status.style.margin = "0 0 4px";
  status.style.display = "flex";
  status.style.alignItems = "center";
  status.style.gap = "6px";
  status.style.fontSize = "11px";
  status.style.fontWeight = "600";
  status.style.color = STATUS_COLOR[restaurant.dietaryStatus];
  const dot = document.createElement("span");
  dot.style.width = "7px";
  dot.style.height = "7px";
  dot.style.borderRadius = "999px";
  dot.style.background = STATUS_COLOR[restaurant.dietaryStatus];
  dot.style.display = "inline-block";
  status.appendChild(dot);
  status.appendChild(document.createTextNode(STATUS_LABEL[restaurant.dietaryStatus]));
  el.appendChild(status);

  const meta = document.createElement("p");
  meta.textContent = `${"$".repeat(restaurant.priceLevel)} \u00b7 ${restaurant.neighborhood}`;
  meta.style.margin = "0";
  meta.style.fontSize = "11px";
  meta.style.color = "var(--espresso-soft)";
  el.appendChild(meta);

  return el;
}
