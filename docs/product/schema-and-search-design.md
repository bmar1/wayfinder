# DB Schema & Search Design — Wayfinder (Halal-first, hybrid providers)

## Design principle
- **Discover** from Google and/or Zabihah.
- **Verify** only via Zabihah → `Verified`.
- Dietary tags stay normalized and extensible; halal ships first.
- Restriction filters return **Verified + Likely** only. `Unchecked` and `False` are first-class but excluded from those filters. `False` means confirmed not that restriction (not “unknown”).
- **Stack:** Postgres + `pg_trgm` (name matching) + PostGIS (geo). One `pg-boss` job runner (Postgres-backed queue, no Redis) drains all background work: matching, scraping, Zabihah refresh. No bespoke workers, no Elasticsearch/Algolia (indexes below are enough at campus scale).
- **v1 scope cut (2026-09-09 ponytail pass):** no local feedback loop, no Zabihah signal outbox, no NL search, no HalalRank. See [outline.md "Out of scope"](./outline.md) for triggers to revisit. This doc reflects that cut; do not re-add their tables without re-approving scope first.

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
| match_status | enum | `unmatched` / `auto` / `admin` / `conflict` |
| match_confidence | float, nullable | Auto-match score when applicable |
| last_enriched_at | timestamp, nullable | Scrapes / provider refresh |
| last_zabihah_sync_at | timestamp, nullable | Last successful Zabihah detail/rank pull |
| zabihah_snapshot | jsonb, nullable | Cached Zabihah detail payload; see below, replaces a separate table |
| zabihah_snapshot_fetched_at | timestamp, nullable | When `zabihah_snapshot` was last refreshed |
| created_at / updated_at | timestamp | |

Either provider ID may be null. Admin link sets `zabihah_place_id` (or google) and `match_status = admin`.

No `discovery_sources` column: "did this come from Google/Zabihah" is derivable (`google_place_id IS NOT NULL`, `zabihah_place_id IS NOT NULL`), storing it separately just risks drift.

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
| last_checked_at | timestamp, nullable | Last scrape/community evaluation attempt (including “nothing found”) |
| check_attempts | int, default 0 | Scrape attempts while status stays `unchecked`; drives cron backoff |
| note | text, nullable | Short audit (“menu says halal”, “no website found”, etc.) |

**Rules**
- Setting `status = verified` requires a linked `zabihah_place_id` and a successful Zabihah read that supports halal.
- Scraping / community may move `unchecked` → `likely`, or → `false` **only on explicit negative evidence**; they must **not** set `verified`.
- Scraping that finds **no evidence either way** (no website, unparseable, no dietary language) stays `unchecked`: increment `check_attempts`, stamp `last_checked_at`, do not set `false`. See [scraping policy](../features/scraping-policy.md) for the full rationale and cron cadence.
- Default for a newly discovered place with no signal: `unchecked`, `check_attempts = 0`.

### `zabihah_snapshot` (column, not a table)
Dropped the separate `zabihah_snapshots` table: it's cache/debug data we don't filter across restaurants by in v1, so it's one JSONB blob on `restaurants` instead of a joined table.

```json
{
  "meatHalalStatus": "Full",
  "verificationStatus": { "code": 6, "label": "..." },
  "handSlaughtered": true,
  "alcoholPolicy": "NotAllowed",
  "authority": "...", "supplier": "...",
  "attribution": "Data © Zabihah — https://www.zabihah.com"
}
```

No `halalRank` field: HalalRank score/tier is deferred (out of scope v1, see outline.md), the Verified badge + `zabihahUrl` link is the trust signal that ships. If a filter later needs to query a field directly (e.g. `alcoholPolicy`), promote it to a real column then. Never store third-party reviews/photos in here.

### Deferred tables (not built for v1)
- `tag_feedback` (local confirm/reject) — no traffic to feed it yet.
- `usage_signals_outbox` (Zabihah contribute/signal) — earns zero give-to-get credit per Zabihah's own docs, not worth a table + job for v1.

Both were fully speced in an earlier draft; re-add only after re-confirming the scope call in [outline.md](./outline.md).

## Indexing
- Geo index on `restaurants(geo)` (PostGIS `GIST`, `geography` column, or `ST_MakePoint(lng, lat)`).
- Trigram index on `restaurants(name)` (`CREATE EXTENSION pg_trgm; CREATE INDEX ... USING gist (name gist_trgm_ops)`) for matching, below.
- Unique indexes on `google_place_id` and `zabihah_place_id` where not null.
- `(tag_type, status)` on `dietary_tags` for “halal verified|likely near me”.
- Composite `(tag_type, restaurant_id)` unique.

## Query path (map/filter UI builds this directly)

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

**Deferred:** natural-language search (Gemini extraction into this same shape) is out of scope v1, see [outline.md](./outline.md). Ship map/filter search alone first; the query contract above is already shaped so an NL layer can bolt on later without a schema change.

## Provider + enrichment flow

```
Google search OR Zabihah search
        ↓
  upsert restaurants (provider ids)
        ↓
  matching query (single SQL statement, see provider-matching.md)
        ↓
  if zabihah linked: pg-boss job → GET /places/{id} → zabihah_snapshot → Verified when signals support
        ↓
  else / also: pg-boss job → scrape → Likely or False (never Verified)
        ↓
  query API serves DB directly
```

One `pg-boss` install covers matching follow-up, Zabihah refresh, and scraping, no separate queue tech per concern.

## Open decisions (implementation plan, not blockers for schema)
- Whether Unchecked places appear on the default map with no halal filter.
- TTL for Zabihah snapshot refresh vs on-demand (auto-match thresholds are now fixed in [provider-matching.md](../features/provider-matching.md)).

## Related
- [Overview](./outline.md)
- [Search providers](../features/search.md)
- [Provider matching](../features/provider-matching.md)
