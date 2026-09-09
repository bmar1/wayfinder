# Provider matching (Google ↔ Zabihah)

Goal: one Wayfinder `restaurants` row that may hold `google_place_id` and/or `zabihah_place_id`, with honest `match_status`.

## When matching runs
- After Google ingest (no Zabihah id yet)
- After Zabihah ingest (no Google id yet)
- On admin “link” / “unlink”
- Optionally on schedule for `unmatched` / `conflict` rows

## Auto-match (v1 defaults)
Candidate pair if **all** hold:
1. Same normalized name similarity ≥ **0.88** (casefold, strip punctuation/legal suffixes Inc/Ltd/Restaurant).
2. Distance ≤ **75 m** (if both have coords); if one lacks coords, require similarity ≥ **0.95** and same city string when present.
3. No other candidate within 75 m with similarity within **0.05** of the best (else → `conflict`, do not auto-link).

On success: set missing provider id, `match_status = auto`, store `match_confidence` (similarity × distance factor).

## Admin link
- `match_status = admin` overrides auto.
- Admin may force-link despite low score; log actor + reason.
- Unlink clears one id (chosen side) and sets `unmatched` (or leaves the other provider).

## Conflicts & merges
- Two Wayfinder rows that later prove to be the same place: merge into the older row; re-point FKs; keep both provider ids if compatible.
- If both rows already have **different** ids for the **same** provider → `conflict`; human resolves.
- Never invent a Zabihah id.

## Verified gate after link
Only after a successful Zabihah detail (or search payload with clear halal verification fields): set `dietary_tags.status = verified` for `halal` and refresh `zabihah_snapshots`. Linking alone does not Verified-stamp.

## Related
[Search providers](./search.md) · [Schema](../product/schema-and-search-design.md)
