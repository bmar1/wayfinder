# Caching & quotas

Keep user search on **Wayfinder DB**. Use providers for ingest/enrichment within quota.

## What we cache
| Data | TTL (v1 default) | Notes |
|---|---|---|
| Zabihah place detail / HalalRank snapshot | 7 days | Refresh sooner if user opens detail and snapshot older than 24h optional |
| Google Place Details fields we store | 14 days | Re-fetch on miss/stale; respect Maps caching rules |
| Google photo bytes / CDN URL | 30 days | Store our cached URL; refresh on 404 |
| Search provider raw pages | Do not long-cache full pages | Persist upserted rows only |
| Structured in-app search results | 30–120s optional | Per geo-cell + filter hash if needed |

## Quota posture
### Zabihah
- Prefer detail weight **1** over heavy search `parts`.
- Sandbox: `pageSize` ≤ 10; stop after first 50.
- Cap worker concurrency so search stays under **30/min** and under tier burst.
- Outbox signals: batch lightly; idempotent keys on retry.

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
