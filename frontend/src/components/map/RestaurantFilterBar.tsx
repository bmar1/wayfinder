import type { DietaryStatus } from "@/lib/demo-restaurants";

export type FilterValue = "all" | DietaryStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All" },
  { value: "verified", label: "Verified" },
  { value: "likely", label: "Likely" },
  { value: "unchecked", label: "Unchecked" },
];

type RestaurantFilterBarProps = {
  value: FilterValue;
  onChange: (value: FilterValue) => void;
};

/** Mock status filter: narrows the demo restaurants shown on the map, client-side only. */
export function RestaurantFilterBar({ value, onChange }: RestaurantFilterBarProps) {
  return (
    <div
      role="group"
      aria-label="Filter restaurants by status"
      className="absolute left-1/2 top-20 z-30 flex -translate-x-1/2 gap-1 rounded-[var(--radius-pill)] bg-cream/90 p-1.5 shadow-[0_8px_24px_rgba(59,42,34,0.12)] backdrop-blur-md"
    >
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          aria-pressed={value === filter.value}
          onClick={() => onChange(filter.value)}
          className={`rounded-[var(--radius-pill)] px-3 py-1.5 font-display text-xs font-semibold whitespace-nowrap transition-colors ${
            value === filter.value
              ? "bg-harbour text-on-harbour"
              : "text-espresso-soft hover:bg-cream-deep"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
