# Restaurant demo UI — design spec

Date: 2026-09-19
Status: Approved

## Goal
Extend the existing empty Toronto map shell (`frontend/src/components/map/MapCanvas.tsx`) with 5 demo restaurants: map pins, a clickable/scrollable list, and an imported menu per restaurant. No backend changes; this is frontend-only mock data shaped like the real `restaurants` / `dietary_tags` schema so it can be swapped for a live API later without a UI rewrite.

## Why frontend-only mock data
The Spring Boot/PostGIS backend (`d405e67`) has no restaurants endpoint yet, only `/api/map` for viewport. Building a real ingest pipeline is out of scope for "build the UI." Mock data typed to match `docs/product/schema-and-search-design.md`'s `restaurants` shape keeps the swap to a real API a data-source change only, not a component rewrite.

## Data model
`frontend/src/lib/demo-restaurants.ts`:

```ts
export type DietaryStatus = "verified" | "likely" | "unchecked" | "false";

export type MenuItem = { name: string; price: string; description?: string };
export type MenuSection = { name: string; items: MenuItem[] };

export type DemoRestaurant = {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  lat: number;
  lng: number;
  priceLevel: 1 | 2 | 3 | 4;
  dietaryStatus: DietaryStatus;
  zabihahUrl?: string;
  menu: MenuSection[];
};
```

5 real-inspired Toronto restaurants with a deliberate trust-tier spread, so the demo exercises the product's core idea (not 5 identical pins):

| Restaurant | Area | Status |
|---|---|---|
| Paramount Fine Foods | Middle Eastern | Verified |
| Lahore Tikka House | Gerrard St | Verified |
| Banu | Ossington | Likely |
| Adonis Shawarma | Middle Eastern quick-serve | Likely |
| Kinton Ramen | Japanese ramen | Unchecked |

Each restaurant has a lean menu: 2-3 sections (e.g. Starters/Mains/Drinks), about 3 items each, name + price + optional short description. This follows `docs/frontend/design-system.md` / the `design-taste-frontend` skill's "grouped chunks" guidance rather than one long flat list.

Status copy and colors must match `docs/frontend/trust-and-disclaimer-copy.md` exactly and reuse the existing `StatusBadge` component (`frontend/src/components/ui/StatusBadge.tsx`) rather than inventing new badge styling.

## Map pins
`MapCanvas` accepts new props: `restaurants: DemoRestaurant[]`, `selectedId: string | null`, `onSelectRestaurant: (id: string) => void`.

- `frontend/src/lib/map-pin.ts`: `createPinElement(status, selected)` returns a plain `HTMLDivElement` (MapLibre `Marker` requires a raw DOM node, not a React component) colored by status: `--harbour` (Verified), `--warn` (Likely), `--espresso-soft`/`--cream-deep` (Unchecked). Selected pin gets a one-time scale-up, not a looping pulse (matches the design system's `verifiedPulse`: "once, not looping").
- After map `load`, `MapCanvas` creates one `maplibregl.Marker` per restaurant, attaches a click handler calling `onSelectRestaurant(id)`.
- When `selectedId` changes, `MapCanvas` flies to that restaurant's coordinates (`map.flyTo`, `essential: true`) and re-renders the marker's selected style. Under `prefers-reduced-motion`, use `map.jumpTo` instead of `flyTo`.
- Pins stagger in on load (`pinEnter`, 40ms stagger, capped at 12 concurrent per the design system; only 5 exist so all animate).

## Scrollable list + clickable detail: `RestaurantSheet`
New `frontend/src/components/map/RestaurantSheet.tsx`, a bottom sheet with two states:

- **Peek** (default): a horizontal, scroll-snap strip of compact restaurant cards (`frontend/src/components/map/RestaurantCard.tsx`): name, `StatusBadge`, price-level dots, neighborhood. Tapping a card selects that restaurant (same effect as tapping its pin).
- **Expanded**: header (name, address, `StatusBadge`, the matching disclaimer line from `trust-and-disclaimer-copy.md`, Zabihah link when Verified), then the **scrollable, category-grouped menu**. A close control collapses back to peek.

Selecting a restaurant (via pin or card) expands the sheet to that restaurant's detail. Closing the expanded sheet returns to the peek strip; the map camera stays as-is.

Transitions reuse `frontend/src/lib/motion.ts` tokens (`EASE_ENTER`, `DURATION.ui`) for a `sheetUp`-style slide/height change, with a reduced-motion crossfade fallback per the design system's mandatory reduced-motion rule (Section 6.B of the design-taste-frontend skill, cited in `design-system.md` Section 5.2).

## Wiring
`frontend/src/app/map/page.tsx` lifts `selectedId` state (`useState<string | null>`) and an `expanded` boolean, passing handlers to both `MapCanvas` and `RestaurantSheet` so pin clicks and card clicks stay in sync.

## Out of scope
- Real backend ingest / `/api/restaurants` endpoint (frontend mock only, per the approved data-source decision).
- Filtering/search UI (not requested).
- Any write path (admin link, scrape, Zabihah sync) — this is a read-only UI demo.

## Files touched
- Create: `frontend/src/lib/demo-restaurants.ts`
- Create: `frontend/src/lib/map-pin.ts`
- Create: `frontend/src/components/map/RestaurantCard.tsx`
- Create: `frontend/src/components/map/RestaurantSheet.tsx`
- Modify: `frontend/src/components/map/MapCanvas.tsx`
- Modify: `frontend/src/app/map/page.tsx`

## Related
- [Design system](../../frontend/design-system.md)
- [Trust & disclaimer copy](../../frontend/trust-and-disclaimer-copy.md)
- [Schema & search design](../../product/schema-and-search-design.md)
