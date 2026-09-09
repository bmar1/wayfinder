# Scraping policy

Scraping may move halal (later other tags) **Unchecked → Likely** or **→ False**. It must **never** set **Verified**.

## Allowed sources (v1)
1. Restaurant **official website** linked from Google/Zabihah contact fields.
2. Public menu pages on that same domain.
3. Optional later: major delivery platforms’ **public** restaurant pages — only if ToS review passes; default **off** until legal OK.

Not allowed: authenticated-only pages, paywalled content, bulk crawling unrelated domains, bypassing robots where we choose to honor them.

## Cadence
- Prefer on-demand when a place is Unchecked and in-radius, or when feedback flags drift.
- Staleness: re-scrape Likely after **90 days** or on `reject` votes — not a full weekly crawl.

## Signal → status rules
| Evidence | Status effect |
|---|---|
| Explicit “halal certified” / certifier name on official site | → `likely` (not verified) |
| Clear “not halal” / pork-forward with no halal claim | → `false` only with strong explicit language; else leave unchecked |
| Ambiguous “halal options” / single dish | → `likely` with lower confidence, or stay unchecked if weak |
| No dietary language | stay `unchecked` |

Store short `note` + source URL + `last_checked_at`. Confidence score 0–1 from rule strength.

## Technical hygiene
- Respect `robots.txt` for official sites when practical; throttle ≤ 1 req/s/host.
- User-Agent identifies Wayfinder; cache HTML briefly.
- No PII collection from pages.

## Related
[Overview](../product/outline.md) · [Schema](../product/schema-and-search-design.md) · [Trust copy](../frontend/trust-and-disclaimer-copy.md)
