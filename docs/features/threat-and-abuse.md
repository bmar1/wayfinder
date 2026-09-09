# Threat & abuse notes

## Provider abuse (us → them)
- No systematic extraction / bulk dump of Zabihah or Google catalogs.
- Constrained Zabihah searches only; campus-sized Google cells; stop at coverage.
- Honor 429 / Retry-After; circuit-break provider queues.
- Idempotency keys on Zabihah contributes; dedupe outbox.

## Abuse (them → us)
- Rate-limit public search/NL endpoints per IP / device.
- Local feedback: rate-limit votes; require device id; detect flip-flop spam before flipping to `false`.
- Admin link actions audited.
- NL → structured query: hard allowlist of fields; ignore prompt injection trying to force `verified`.

## Data integrity
- Only Zabihah write path may set `verified`.
- Scrapers cannot elevate to verified even if text says “certified.”
- Merge/match conflicts fail closed (`conflict`), not auto-overwrite.

## Privacy
- Zabihah signals: no PII.
- Don’t log full API keys; redact Authorization headers.

## Related
[Caching](./caching-and-quotas.md) · [Matching](./provider-matching.md) · [Scraping](./scraping-policy.md)
