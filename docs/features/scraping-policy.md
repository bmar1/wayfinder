# Scraping policy

Scraping may move halal (later other tags) **Unchecked → Likely** or **→ False**. It must **never** set **Verified**.

## Allowed sources (v1)
1. Restaurant **official website** linked from Google/Zabihah contact fields.
2. Public menu pages on that same domain.
3. Optional later: major delivery platforms’ **public** restaurant pages — only if ToS review passes; default **off** until legal OK.

Not allowed: authenticated-only pages, paywalled content, bulk crawling unrelated domains, bypassing robots where we choose to honor them.

## Job architecture (`pg-boss`, no separate cron/queue service)

```
pg-boss recurring job (every 6h, configurable)
  → SELECT restaurants JOIN dietary_tags
      WHERE status = 'unchecked'
        AND in-scope (campus radius)
        AND (last_checked_at IS NULL OR last_checked_at < now() - backoff(check_attempts))
      LIMIT batch_size
  → pgBoss.send('scrape-place', { restaurantId, tagType }) per row
        ↓
handler (pg-boss worker fn)
  → resolve domain from restaurants.website
  → if no website: record attempt, stay unchecked (see below), done
  → fetch (native fetch) + parse (cheerio); robots.txt via robots-parser, throttle ≤ 1 req/s/host
  → run evidence rules (table below)
  → write dietary_tags.status / note / confidence_score / last_checked_at
  → increment check_attempts
```

Same `pg-boss` instance also runs the Zabihah refresh and signal-outbox jobs (see [caching & quotas](./caching-and-quotas.md)); no separate worker system per concern. No headless browser: JS-rendered sites with no static dietary text just stay `unchecked` per the rule below, that's an acceptable outcome, not a gap to patch with Puppeteer/Playwright.

**Backoff:** `backoff(check_attempts)` grows the re-check interval (e.g. 6h → 24h → 7d → 30d → 90d cap) so a dead or unparseable site isn't rescraped every cron tick forever. A Likely row crossing 90 days resets the backoff to immediate for a re-check.

## Cadence
- Cron-driven (above), not purely on-demand; on-demand scrape may still fire when a place is newly discovered and Unchecked in-radius.
- Staleness: re-scrape Likely after **90 days**.

No local confirm/reject signal exists in v1 to trigger an early re-check (deferred, see [outline.md](../product/outline.md)); the 90-day cadence is the only staleness trigger for now.

## Signal → status rules

| Evidence | Status effect |
|---|---|
| Explicit “halal certified” / certifier name on official site | → `likely` (not verified) |
| Clear “not halal” / pork-forward with no halal claim | → `false` only with strong explicit language |
| Ambiguous “halal options” / single dish | → `likely` with lower confidence |
| **No website, unparseable page, or no dietary language found at all** | **stay `unchecked`** — record the attempt (`check_attempts += 1`, `last_checked_at`), do **not** set `false` |

**Why “nothing found” is not `false`:** absence of evidence is not evidence of absence. A thin/JS-rendered/missing site tells us nothing about the food; auto-labeling it `false` would present “confirmed not halal” for places we simply couldn't check, which is the exact failure mode the status model exists to prevent (see [overview NFR1/NFR10](../product/outline.md)). `false` is reserved for explicit negative language only. The visible effect to users is the same either way (hidden from the halal filter), so this costs nothing in the UI, only in labeling honesty.

Store short `note` + source URL + `last_checked_at` on every attempt, including “nothing found” ones. Confidence score 0–1 from rule strength.

## Technical hygiene
- Respect `robots.txt` for official sites when practical; throttle ≤ 1 req/s/host.
- User-Agent identifies Wayfinder; cache HTML briefly.
- No PII collection from pages.

## Related
[Overview](../product/outline.md) · [Schema](../product/schema-and-search-design.md) · [Trust copy](../frontend/trust-and-disclaimer-copy.md) · [Caching & quotas](./caching-and-quotas.md)
