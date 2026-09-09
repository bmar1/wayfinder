# DB Schema & Search Design — Wayfinder (Halal-first, hybrid providers)

## Design principle
- **Discover** from Google and/or Zabihah.
- **Verify** only via Zabihah → `Verified`.
- Dietary tags stay normalized and extensible; halal ships first.
- Restriction filters return **Verified + Likely** only. `Unchecked` and `False` are first-class but excluded from those filters. `False` means confirmed not that restriction (not “unknown”).

## Core tables

### `restaurants`
| column | type | notes |
|---|---|---|
| id | uuid (PK) | Canonical Wayfinder place |
| google_place_id | string, nullable, unique | From Google Places; may be null if Zabihah-only |
| zabihah_place_id | string, nullable, unique | From Zabihah; may be null until matched/linked |
| name | string | |
| address | string, nullable | |
| city / state / country | string, nullable | Useful for matching & display |
| lat / lng | float | Geo queries |
| price_level | int (1–4), nullable | Google or derived |
| photo_url | string, nullable | Prefer Google/cached assets; not Zabihah UGC scrape |
| phone / website | string, nullable | |
| zabihah_url | string, nullable | Deep link when known |
| discovery_sources | string[] or flags | e.g. `google`, `zabihah` — how we first saw it |
| match_status | enum | `unmatched` / `auto` / `admin` / `conflict` |
| match_confidence | float, nullable | Auto-match score when applicable |
| last_enriched_at | timestamp, nullable | Scrapes / provider refresh |
| last_zabihah_sync_at | timestamp, nullable | Last successful Zabihah detail/rank pull |
| created_at / updated_at | timestamp | |

Either provider ID may be null. Admin link sets `zabihah_place_id` (or google) and `match_status = admin`.

### `dietary_tags`
One row per `(restaurant_id, tag_type)`.

| column | type | notes |
|---|---|---|
| id | uuid (PK) | |
| restaurant_id | uuid (FK → restaurants) | |
| tag_type | enum | `halal`, `kosher`, `vegetarian`, `vegan`, `low_calorie` — only `halal` in v1 |
| status | enum | `verified` / `likely` / `unchecked` / `false` |
| confidence_score | float, nullable | 0–1 for Likely pipelines |
| verified_source | enum, nullable | Only when `verified`: `zabihah` (sole v1 verifier) |
| likely_sources | string[] or join table | e.g. `scrape`, `keyword`, `community` |
| last_verified_at | timestamp, nullable | Zabihah sync time when verified |
| last_checked_at | timestamp, nullable | Last scrape/community evaluation |
| note | text, nullable | Short audit (“menu says halal”, etc.) |

**Rules**
- Setting `status = verified` requires a linked `zabihah_place_id` and a successful Zabihah read that supports halal.
- Scraping / community may move `unchecked` → `likely` or → `false`, or demote `likely` → `false`. They must **not** set `verified`.
- Default for a newly discovered place with no signal: `unchecked`.

### `zabihah_snapshots` (optional but recommended)
Cache of Zabihah fields we display or use for Verified — avoids re-hitting detail on every request.

| column | type | notes |
|---|---|---|
| restaurant_id | uuid (PK/FK) | |
| meat_halal_status | string, nullable | e.g. Full / Partial |
| verification_status_code / label | int/string, nullable | Zabihah verificationStatus |
| hand_slaughtered | bool, nullable | |
| alcohol_policy | string, nullable | |
| authority / supplier | string, nullable | |
|halal_rank_score | int, nullable | |
|halal_rank_tier | string, nullable | |
|halal_rank_computed_on | timestamp, nullable | |
| raw_json | jsonb, nullable | Trimmed payload for debug; no third-party reviews |
| fetched_at | timestamp | |
| attribution | string | e.g. Data © Zabihah — https://www.zabihah.com |

### `tag_feedback` (local confirm / flag)
| column | type | notes |
|---|---|---|
| id | uuid (PK) | |
| dietary_tag_id | uuid (FK) | |
| user_id or device_id | string | Lightweight identity OK in v1 |
| vote | enum | `confirm` (still matches) / `reject` (changed → false for that tag) |
| created_at | timestamp | |

Aggregates adjust `confidence_score` or flip `likely` ↔ `false` per product rules. **Not** forwarded to Zabihah contribute endpoints in v1.

### `usage_signals_outbox` (Zabihah contribute/signal)
| column | type | notes |
|---|---|---|
| id | uuid (PK) | |
| type | enum | `search` / `view` / `tap` / `favorite` / `direction` |
| place_id | string, nullable | Zabihah place id when required |
| query | string, nullable | For search signals (≥ 2 chars) |
| count | int, default 1 | |
| idempotency_key | string, nullable | |
| status | enum | `pending` / `sent` / `failed` |
| created_at / sent_at | timestamp | |

No PII. Usage signals earn no Zabihah give-to-get credit; still send for program hygiene / limits.

## Indexing
- Geo index on `restaurants(lat, lng)` (PostGIS `GIST` or geohash).
- Unique indexes on `google_place_id` and `zabihah_place_id` where not null.
- `(tag_type, status)` on `dietary_tags` for “halal verified|likely near me”.
- Composite `(tag_type, restaurant_id)` unique.

## Query path (map + NL converge here)

```json
{
  "tag_type": "halal",
  "statuses": ["verified", "likely"],
  "max_price_level": 2,
  "lat": 43.6577,
  "lng": -79.3788,
  "radius_km": 1.5,
  "keywords": ["kabab"],
  "sort_by": "distance"
}
```

- Default `statuses` for a restriction filter: `["verified", "likely"]`.
- Unfiltered browse may omit `tag_type` / include `unchecked` if product wants discovery of unchecked places — **not** inside halal filter.
- Never return `false` for that `tag_type` in a positive restriction filter.

### Gemini filter-extraction (translator only)

```
Extract search filters from the user's food query. Output ONLY valid JSON:
{
  "tag_type": "halal" | "kosher" | "vegetarian" | "vegan" | "low_calorie" | null,
  "statuses": ["verified", "likely"] | null,
  "max_price_level": 1-4 | null,
  "radius_km": number | null,
  "keywords": string[] | null,
  "sort_by": "distance" | "price" | null
}
Default radius_km to 1.5 if unspecified.
If a restriction is implied, default statuses to ["verified","likely"].
If unsupported tag_type for this deployment, still extract it — backend returns friendly "not supported yet".
Return JSON only.
```

## Provider + enrichment flow

```
Google search OR Zabihah search
        ↓
  upsert restaurants (provider ids)
        ↓
  auto-match name+geo → zabihah_place_id (or admin link)
        ↓
  if zabihah linked: GET place /halalrank → snapshot → status Verified when signals support
        ↓
  else / also: scrape & local feedback → Likely or False (never Verified)
        ↓
  query API serves DB; outbox drains usage signals
```

## Open decisions (implementation plan, not blockers for schema)
- Exact auto-match distance/name thresholds.
- Whether Unchecked places appear on the default map with no halal filter.
- TTL for Zabihah snapshot refresh vs on-demand.

## Related
- [Overview](./outline.md)
- [Search providers](../features/search.md)
- [Provider matching](../features/provider-matching.md)
