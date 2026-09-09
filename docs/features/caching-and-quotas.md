# Caching & quotas

Keep user search on **Wayfinder DB**. Use providers for ingest/enrichment within quota.

All background work (matching follow-up, scraping, Zabihah refresh) runs through one **`pg-boss`** job runner (Postgres-backed queue). It already handles concurrency limits, scheduling, and retry, so quota control below is about the request patterns going *through* those jobs, not about the job runner itself.

## What we cache
| Data | TTL (v1 default) | Notes |
|---|---|---|
| Zabihah place detail snapshot | 7 days | Refresh sooner if user opens detail and snapshot older than 24h optional |
| Google Place Details fields we store | 14 days | Re-fetch on miss/stale; respect Maps caching rules |
| Google photo bytes / CDN URL | 30 days | Store our cached URL; refresh on 404 |
| Search provider raw pages | Do not long-cache full pages | Persist upserted rows only |
| Structured in-app search results | 30–120s optional | Per geo-cell + filter hash if needed |

## Quota posture
### Zabihah
- Prefer detail weight **1** over heavy search `parts`.
- Sandbox: `pageSize` ≤ 10; stop after first 50.
- Cap the `pg-boss` job's concurrency (its built-in `teamSize`/`teamConcurrency`, no separate rate-limit library) so search stays under **30/min** and under tier burst.

### Google
- Tight **FieldMask**; Nearby/Text only for new cells / keywords.
- Subdivide campus into cells; remember “done” cells until TTL.
- Stay under project **QPM** (confirm in Cloud Console; Places often ~6k QPM class, **per method** for New API).
- Budget alerts + optional daily spend cap.

## Failure behavior
- 429 → exponential backoff + jitter; pause that provider queue.
- Serve stale snapshot if refresh fails (mark `last_*_sync` failure in logs).
- Never burn quota on map pan.

## Related
[Search](./search.md) · [Abuse](./threat-and-abuse.md)
