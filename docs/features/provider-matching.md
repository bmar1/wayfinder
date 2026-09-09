# Provider matching (Google ↔ Zabihah)

Goal: one Wayfinder `restaurants` row that may hold `google_place_id` and/or `zabihah_place_id`, with honest `match_status`.

No separate matching service or app-side fuzzy-match library. Matching is one SQL statement run right after an upsert, using Postgres-native `pg_trgm` (name similarity) and PostGIS (distance). This is a query, not a worker.

## When it runs
- Immediately after a Google or Zabihah upsert (whichever provider is missing on the row, in the same transaction or the next `pg-boss` tick).
- On admin "link" / "unlink."
- Optionally on schedule for `unmatched` / `conflict` rows (a `pg-boss` recurring job re-running the same query).

## Auto-match query (v1 defaults)
```sql
SELECT id, similarity(name, :candidate_name) AS name_score,
       ST_Distance(geo, :candidate_geo) AS distance_m
FROM restaurants
WHERE zabihah_place_id IS NULL  -- or google_place_id IS NULL, depending on direction
  AND ST_DWithin(geo, :candidate_geo, 75)
  AND similarity(name, :candidate_name) >= 0.88
ORDER BY name_score DESC
LIMIT 2;
```
Candidate matches if **all** hold:
1. Top row has `name_score >= 0.88` (trigram similarity handles casing/punctuation/legal-suffix noise for free).
2. `distance_m <= 75` (if either side lacks coords, require `name_score >= 0.95` and same city string instead).
3. Row 2 (if any) isn't within `0.05` similarity of row 1 (else → `conflict`, do not auto-link).

On success: set the missing provider id, `match_status = auto`, `match_confidence = name_score` (distance already gated by the `WHERE`).

## Admin link
- `match_status = admin` overrides auto.
- Admin may force-link despite low score; log actor + reason.
- Unlink clears one id (chosen side) and sets `unmatched` (or leaves the other provider).

## Conflicts & merges
- Two Wayfinder rows that later prove to be the same place: merge into the older row; re-point FKs; keep both provider ids if compatible.
- If both rows already have **different** ids for the **same** provider → `conflict`; human resolves.
- Never invent a Zabihah id.

## Verified gate after link
Only after a successful Zabihah detail (or search payload with clear halal verification fields): set `dietary_tags.status = verified` for `halal` and refresh `restaurants.zabihah_snapshot`. Linking alone does not Verified-stamp.

## Conflict priority (Zabihah always wins)
If a scrape/community signal (Likely or False) ever disagrees with a later Zabihah-verified read, Zabihah wins outright: overwrite to `verified`, keep the prior scrape `note` for audit, don't attempt to reconcile the two.

## Related
[Search providers](./search.md) · [Schema](../product/schema-and-search-design.md)
