# Wayfinder — Product Overview

## What it is
Wayfinder helps people find food that matches dietary restrictions near them — starting with **halal**, then expanding to kosher, vegetarian, vegan, and other constraints — without treating every weak signal as certified fact.

Campus / walkable radius is the first geography; the product is place-discovery + trust labeling, not a full social network or review site.

## Problem it solves
Observant and restriction-aware eaters need **discoverable places** and **honest status**:
- Where can I eat nearby?
- Is this actually halal (or another restriction), or only rumored?
- What is verified vs inferred vs unknown vs ruled out?

Wrong “verified” labels are worse than missing places. Trust tiers are a first-class product requirement.

## How it works (high level)
1. **Discover** places via **Google Places** and/or **Zabihah** search (either source can introduce a listing).
2. **Verify** dietary status only through **Zabihah** first-party data (place detail). That is the only path to **Verified**.
3. **Enrich** with scraping (site text) for **Likely** (or **False** on explicit negative evidence).
4. **Search / filter** in-app (map filters). Halal-filtered results show **Verified + Likely** only.

**Deferred (post-v1, not built now):** local community confirm/reject feedback loop, natural-language search, Zabihah HalalRank score/tier, Zabihah usage-signal outbox. See "Out of scope" below for why each was cut.

Attribution to Zabihah is required wherever their data is shown. Richer reviews/photos live on Zabihah via deep link — Wayfinder does not re-host third-party UGC from Zabihah.

## Dietary status model (halal v1; same shape later)
| Status | Meaning | Can appear in halal filter? |
|---|---|---|
| **Verified** | Confirmed via Zabihah | Yes |
| **Likely** | Scrape / keyword support; not Zabihah-verified | Yes |
| **Unchecked** | Known place; status not established yet | No |
| **False** | Confirmed **not** that restriction (for halal: not halal) | No |

`False` ≠ `Unchecked`. Unchecked means “can still be checked.” False means ruled out.

## Functional requirements (FR)

### Discovery & places
- FR1: Search/browse places by location (lat/lng + radius) and optional keyword.
- FR2: Ingest candidates from Google Places and/or Zabihah Places API.
- FR3: Deduplicate / link providers: auto-match on name + proximity; admin can manually link when ambiguous.
- FR4: Store provider IDs (`google_place_id`, `zabihah_place_id`) independently (either may be null).

### Dietary / trust
- FR5: Only Zabihah data may set status **Verified** (and related halal fields).
- FR6: Scraping may set **Likely** or **False** (on explicit negative evidence only), never **Verified**.
- FR7: Halal (and later restriction) filters return **Verified ∪ Likely** only.
- FR8: UI must display status tier clearly (Verified vs Likely vs Unchecked vs False).

### Search UX
- FR10: Map/filter UI compiles to one structured query contract (see [schema](./schema-and-search-design.md)).

### Integrations
- FR12: Call Google Places (New) and Zabihah with restricted keys; respect Google QPM/429 and Zabihah rate-limit headers / search weight.
- FR14: Show Zabihah attribution on every place that uses their data; expose `zabihahUrl` when present.

### Extensibility
- FR15: Schema supports multiple dietary tag types from day one; only halal is populated in v1.

## Non-functional requirements (NFR)

- **NFR1 Trust:** Never present inferred/scrape/community labels as certified/Verified.
- **NFR2 Accuracy over coverage:** Prefer hiding Unchecked from restriction filters rather than over-claiming.
- **NFR3 Rate limits:** Stay within Zabihah tier limits and Google Places QPM/SKU cost; weight Zabihah search `parts` and Google field masks carefully; cache detail.
- **NFR4 Privacy:** No PII collected from scraped pages or stored beyond what's needed to run the app.
- **NFR5 Attribution & terms:** Comply with Zabihah API terms (attribution, no bulk export / systematic extraction abuse).
- **NFR6 Freshness:** Track enrichment timestamps; re-check Likely/stale rows preferentially over blanket crawl.
- **NFR7 Latency:** User-facing search should hit our DB/index first; live provider calls are for ingest/enrichment, not every map pan (unless explicitly live mode).
- **NFR8 Observability:** Log provider errors, 429/Retry-After, match confidence, and admin link actions.
- **NFR9 Extensibility:** Adding kosher/vegetarian later is new tag pipeline + sources, not a restaurants-table rewrite.
- **NFR10 Liability framing:** Disclaimers for non-Verified claims; link out for full halal reports on Zabihah.

## Out of scope (v1)

Cut after a ponytail pass (2026-09-09), each with the trigger to revisit:

- **Local confirm/reject feedback loop** (`tag_feedback`) — no value until there's real foot traffic to generate votes. Add when there's user volume to sustain it.
- **Zabihah usage-signal outbox** (`POST /contribute/signal`) — the API docs state it earns zero give-to-get credit; not worth the `pg-boss` job + table for v1. Add if reciprocity/analytics value becomes clear.
- **Natural-language search** (Gemini extraction) — a second search surface to validate before map/filter search is proven. Add once filter UX is validated with real users.
- **Zabihah HalalRank** (score/tier, `halalrank.read` scope) — the trust signal that matters is the Verified badge + link to Zabihah, not a numeric score. Add if users ask "how halal" beyond yes/no.
- Zabihah contribute corrections / halal-evidence / missing-place / reviews (not required to ship).
- Replacing Zabihah with HMA as Verified authority (HMA not Verified source).
- Hosting Zabihah reviews, photos, or community discussions.
- Bulk export of Zabihah catalog.

## Related docs
- [Schema & search design](./schema-and-search-design.md)
- [Search providers (Google + Zabihah)](../features/search.md)
- [Provider matching](../features/provider-matching.md)
- [Caching & quotas](../features/caching-and-quotas.md)
- [Scraping policy](../features/scraping-policy.md)
- [Trust & disclaimer copy](../frontend/trust-and-disclaimer-copy.md)
- [Secrets & environments](../features/secrets-and-environments.md)
- [Threat & abuse](../features/threat-and-abuse.md)
- [Design system](../frontend/design-system.md)

## Still useful before / during UI build
- **[Design system](../frontend/design-system.md)** — palette, type, motion, landing (locked 2026-09-09).
- **API surface** — Wayfinder public HTTP routes for search/detail/feedback (once stack is chosen).
- **Campus geo config** — default center, radius, cell grid size.
