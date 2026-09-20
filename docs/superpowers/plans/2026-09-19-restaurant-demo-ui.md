# Restaurant Demo UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 5 demo restaurants to the Toronto map: colored status pins, a scrollable clickable list (peek strip -> expanded detail), and an imported per-restaurant menu.

**Architecture:** Frontend-only mock data typed to the real `restaurants`/`dietary_tags` schema shape. `MapCanvas` renders MapLibre markers from that data and reports clicks upward; `RestaurantSheet` is a two-state bottom sheet (peek strip / expanded detail+menu) driven by `selectedId` state lifted into `map/page.tsx`.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, `motion/react`, `maplibre-gl`, `@phosphor-icons/react`. No test framework is installed in `frontend/`; verification is `tsc --noEmit`, `next lint`, and manual visual checks via `next dev` (per the ponytail skill: don't add a test framework as ceremony for a 6-file UI demo).

## Global Constraints
- Reuse `StatusBadge` (`frontend/src/components/ui/StatusBadge.tsx`) as-is; do not invent new badge styling.
- Status copy/colors must match `docs/frontend/trust-and-disclaimer-copy.md` verbatim.
- Colors/radii/fonts must use existing CSS tokens from `frontend/src/app/globals.css` (`--harbour`, `--warn`, `--cream-deep`, `--espresso-soft`, `--radius-panel`, `--radius-pill`, `font-display`), never new hex values.
- Motion must reuse `frontend/src/lib/motion.ts` tokens (`EASE_ENTER`, `EASE_EXIT`, `DURATION`) and respect `useReducedMotion()` everywhere something animates.
- Icons only from `@phosphor-icons/react` (already a dependency); no hand-rolled SVGs.
- No backend/API changes. No new npm dependencies.
- Zero em-dashes in any authored copy (menu descriptions, disclaimers, labels).

---

### Task 1: Demo restaurant data

**Files:**
- Create: `frontend/src/lib/demo-restaurants.ts`

**Interfaces:**
- Produces: `DietaryStatus`, `MenuItem`, `MenuSection`, `DemoRestaurant` types; `DEMO_RESTAURANTS: DemoRestaurant[]` (5 entries, matching the spec's table: Paramount Fine Foods/Verified, Lahore Tikka House/Verified, Banu/Likely, Adonis Shawarma/Likely, Kinton Ramen/Unchecked). Real-ish Toronto lat/lng per neighborhood (downtown core, roughly 43.64-43.67 lat / -79.38 to -79.42 lng). Each restaurant has 2-3 `MenuSection`s with ~3 `MenuItem`s each.

- [ ] **Step 1: Write the data file** with the types and 5 restaurants as specified in `docs/superpowers/specs/2026-09-19-restaurant-demo-ui-design.md`.
- [ ] **Step 2: Verify** `cd frontend; npx tsc --noEmit` passes with no errors referencing this file.
- [ ] **Step 3: Commit**
```bash
git add frontend/src/lib/demo-restaurants.ts
git commit -m "feat: add demo restaurant data"
```

---

### Task 2: Map pin DOM factory

**Files:**
- Create: `frontend/src/lib/map-pin.ts`

**Interfaces:**
- Consumes: `DietaryStatus` from `./demo-restaurants`.
- Produces: `createPinElement(status: DietaryStatus, selected: boolean): HTMLDivElement`.

- [ ] **Step 1: Write `createPinElement`.** A `div` sized ~28px (36px when `selected`), `border-radius: 999px`, background color by status (`var(--harbour)` verified, `var(--warn)` likely, `var(--espresso-soft)` unchecked/false), white/`var(--cream)` border, `box-shadow` matching the app's existing shadow style (`0 8px 24px rgba(59,42,34,0.12)`), `cursor: pointer`. Apply styles via `element.style.*` (MapLibre markers need real DOM nodes, not Tailwind class strings evaluated at runtime; inline styles read the same CSS variables so tokens stay single-sourced).
- [ ] **Step 2: Verify** `npx tsc --noEmit` passes.
- [ ] **Step 3: Commit**
```bash
git add frontend/src/lib/map-pin.ts
git commit -m "feat: add map pin DOM factory"
```

---

### Task 3: `RestaurantCard` (peek strip item)

**Files:**
- Create: `frontend/src/components/map/RestaurantCard.tsx`

**Interfaces:**
- Consumes: `DemoRestaurant` from `@/lib/demo-restaurants`, `StatusBadge` from `@/components/ui/StatusBadge`.
- Produces: `RestaurantCard({ restaurant, selected, onSelect }: { restaurant: DemoRestaurant; selected: boolean; onSelect: (id: string) => void })`.

- [ ] **Step 1: Write the component.** A `button` (for a11y/keyboard nav), fixed width (~220px) snap-aligned card: name (`font-display font-semibold`), `StatusBadge status={restaurant.dietaryStatus}`, price-level shown as `"$".repeat(priceLevel)` in `text-espresso-soft`, `neighborhood` as a small caption. `bg-cream` / `border border-line` / `rounded-[var(--radius-panel)]`; `selected` gets a `border-harbour` highlight. Calls `onSelect(restaurant.id)` on click.
- [ ] **Step 2: Verify** `npx tsc --noEmit` and `npx next lint` pass.
- [ ] **Step 3: Commit**
```bash
git add frontend/src/components/map/RestaurantCard.tsx
git commit -m "feat: add restaurant card for peek strip"
```

---

### Task 4: `RestaurantSheet` (peek strip + expanded detail/menu)

**Files:**
- Create: `frontend/src/components/map/RestaurantSheet.tsx`

**Interfaces:**
- Consumes: `DemoRestaurant[]`, `RestaurantCard`, `StatusBadge`, `motion`/`useReducedMotion` from `motion/react`, `EASE_ENTER`/`DURATION` from `@/lib/motion`.
- Produces: `RestaurantSheet({ restaurants, selectedId, onSelect, onClose }: { restaurants: DemoRestaurant[]; selectedId: string | null; onSelect: (id: string) => void; onClose: () => void })`. Renders the peek strip when `selectedId` is `null`, expanded detail when it is set.

- [ ] **Step 1: Write the peek strip.** `absolute inset-x-0 bottom-0` container, `overflow-x-auto snap-x snap-mandatory flex gap-3 px-4 py-4`, one `RestaurantCard` per restaurant (each wrapped `snap-start`).
- [ ] **Step 2: Write the expanded detail.** When `selectedId` resolves to a restaurant: a `motion.div` sliding up from the bottom (`initial={{ y: "100%" }} animate={{ y: 0 }}`, `transition={{ duration: DURATION.ui, ease: EASE_ENTER }}`, reduced-motion falls back to `initial={false}` per `useReducedMotion()`), `max-h-[70dvh] overflow-y-auto rounded-t-[var(--radius-panel)] bg-cream`. Header: name, address, `StatusBadge`, the matching disclaimer line copied verbatim from `docs/frontend/trust-and-disclaimer-copy.md` (Verified -> Zabihah attribution + `zabihahUrl` link; Likely -> the "Wayfinder does not certify..." line; Unchecked -> "Not checked yet" subtitle only), and a close button (Phosphor `X` icon) calling `onClose`.
- [ ] **Step 3: Write the menu.** Below the header, map `restaurant.menu` (`MenuSection[]`): a `font-display font-semibold` section heading, then each `MenuItem` as a row (name + description on the left, price on the right), sections separated by `divide-y divide-line` inside each section only (not one long undifferentiated list, per the design system's density guidance).
- [ ] **Step 4: Verify** `npx tsc --noEmit` and `npx next lint` pass.
- [ ] **Step 5: Commit**
```bash
git add frontend/src/components/map/RestaurantSheet.tsx
git commit -m "feat: add restaurant sheet with peek strip and menu detail"
```

---

### Task 5: Wire pins into `MapCanvas`

**Files:**
- Modify: `frontend/src/components/map/MapCanvas.tsx`

**Interfaces:**
- Consumes: `DemoRestaurant[]` from `@/lib/demo-restaurants`, `createPinElement` from `@/lib/map-pin`.
- Produces: `MapCanvas` now accepts `{ restaurants: DemoRestaurant[]; selectedId: string | null; onSelectRestaurant: (id: string) => void }` props (extending its current no-props signature).

- [ ] **Step 1: Add props to the `MapCanvas` signature** (currently `export function MapCanvas()` at line 36 per the current file); keep all existing viewport/boot logic unchanged.
- [ ] **Step 2: On `map.on("load", ...)`, after `setReady(true)`, create one `maplibregl.Marker({ element: createPinElement(r.dietaryStatus, r.id === selectedId) })` per restaurant, `.setLngLat([r.lng, r.lat]).addTo(map)`. Attach `marker.getElement().addEventListener("click", () => onSelectRestaurant(r.id))`. Store markers in a `useRef<Map<string, maplibregl.Marker>>` keyed by restaurant id for the next step; store the `map` instance itself in a ref accessible outside the `boot()` closure (it already is, via `mapRef.current`, though typed loosely as `{ remove: () => void }`, widen that ref type to include `flyTo`/`jumpTo`).
- [ ] **Step 3: Add a `useEffect` keyed on `selectedId`** that (a) re-creates each marker's element via `createPinElement` with the correct `selected` flag (swap `marker.getElement()` is not supported by maplibre-gl; instead remove and re-add the marker for the changed ids, or simplest: mutate the existing element's background/size directly via a small `updatePinElement(el, selected)` helper added to `map-pin.ts` instead of recreating), and (b) calls `mapRef.current?.flyTo({ center: [restaurant.lng, restaurant.lat], zoom: 15, essential: true })` when not reduced motion, else `jumpTo` with the same center/zoom.
- [ ] **Step 4: Verify manually.** `cd frontend; npm run dev`, open `/map`, confirm 5 pins render color-coded by status, clicking a pin calls the (temporarily console.logged, until Task 6 wires it) handler.
- [ ] **Step 5: Commit**
```bash
git add frontend/src/components/map/MapCanvas.tsx frontend/src/lib/map-pin.ts
git commit -m "feat: render restaurant pins on the map"
```

---

### Task 6: Wire state in `map/page.tsx`

**Files:**
- Modify: `frontend/src/app/map/page.tsx`

**Interfaces:**
- Consumes: `DEMO_RESTAURANTS` from `@/lib/demo-restaurants`, `RestaurantSheet` from `@/components/map/RestaurantSheet`.

- [ ] **Step 1: Make the page a client component** (`"use client"` at the top; it currently has no interactivity so it isn't one yet) and add `const [selectedId, setSelectedId] = useState<string | null>(null)`.
- [ ] **Step 2: Render** `<MapCanvas restaurants={DEMO_RESTAURANTS} selectedId={selectedId} onSelectRestaurant={setSelectedId} />` and `<RestaurantSheet restaurants={DEMO_RESTAURANTS} selectedId={selectedId} onSelect={setSelectedId} onClose={() => setSelectedId(null)} />` below the existing header.
- [ ] **Step 3: Verify manually.** `npm run dev`, open `/map`: peek strip shows 5 scrollable cards; tapping a card or a pin expands the sheet with that restaurant's menu scrollable; close returns to the peek strip; repeat with OS-level reduced-motion enabled and confirm no jank/broken animation.
- [ ] **Step 4: Run final checks**
```bash
cd frontend
npx tsc --noEmit
npx next lint
```
Expected: both pass with no errors.
- [ ] **Step 5: Commit**
```bash
git add frontend/src/app/map/page.tsx
git commit -m "feat: wire restaurant selection between map and sheet"
```

---

## Self-Review Notes
- Spec coverage: pins (Task 5), clickable (Tasks 5-6), scrollable (Task 4 peek strip + menu overflow), menu imported (Task 1 data + Task 4 render) all have tasks.
- Type consistency: `DemoRestaurant`/`DietaryStatus` defined once in Task 1, reused by name in every later task; `createPinElement` signature fixed in Task 2 and not renamed later.
- No test framework added, per Global Constraints; verification is `tsc`/`lint`/manual per the ponytail skill (avoids introducing Jest/RTL as ceremony for a 6-file demo with no existing test infra).
