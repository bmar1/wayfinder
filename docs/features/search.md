# Search providers — Setup & use (Google Places + Zabihah)

Wayfinder **discovers** places via **Google Places** and/or **Zabihah**. Only **Zabihah** can set dietary status **Verified**. User-facing search hits **our DB** first; live provider calls are for ingest/enrichment (and optional live mode later).

```
[Map/filter UI] → structured query → Wayfinder DB
                      ↑
         ingest / enrich jobs (pg-boss)
         ├─ Google Places (Nearby / Text / Details / Photos)
         ├─ Zabihah search / detail
         └─ scrape (Likely / False only)
```

**v1 scope cut (2026-09-09):** no HalalRank calls, no `contribute/signal` outbox, no NL search UI. See [outline.md "Out of scope"](../product/outline.md).

| Concern | Owner |
|---|---|
| Find candidates | Google **or** Zabihah |
| Canonical row | `restaurants` |
| Link providers | Auto name+geo + admin ([matching](./provider-matching.md)) |
| Verified | Zabihah only |
| Likely / False | Scrape + local feedback |
| Photos / map shell | Prefer Google (cached) |
| Attribution | Zabihah required when their data is shown; Google per Maps ToS |

Related: [Schema](../product/schema-and-search-design.md) · [Overview](../product/outline.md) · [Caching & quotas](./caching-and-quotas.md)

---

# Part A — Google Places API (New)

## Role in Wayfinder
- **Primary discovery** for restaurants in a campus radius (coverage often wider than Zabihah alone).
- Supplies `google_place_id`, name, lat/lng, address, phone, website, `price_level`, photo refs.
- **Never** sets `dietary_tags.status = verified`.
- May contribute weak text for scrape/keyword pipelines only after we store/copy allowed fields — not a Verified path.
- New Google-only rows start as **Unchecked** until Zabihah match or scrape/community promotes to Likely/False.

## Setup
1. Create/select a **Google Cloud** project with billing enabled.
2. Enable **Places API (New)** (and Maps JS / Static if the map UI needs them).
3. Create an **API key**; restrict it:
   - API restrictions: Places API (New) (+ Maps APIs you actually use)
   - Application restrictions: server IP for backend ingest; HTTP referrers / app IDs for any client map keys (prefer **server-side** Places calls so the key never ships in the app).
4. Set a **budget alert** and optional **daily quota cap** in Cloud Console (spend control — Google billing is SKU-based).
5. Env:
   - `GOOGLE_MAPS_API_KEY` (or `GOOGLE_PLACES_API_KEY`)
   - Optional: `GOOGLE_PLACES_FIELD_MASK_NEARBY`, `GOOGLE_PLACES_FIELD_MASK_DETAILS` (keep masks tight)

Docs: [Places API usage & billing](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing)

## Rate limits & quotas
- **No fixed universal daily request ceiling** from Google for Places in the same sense as Zabihah sandbox; limits are mainly **QPM (queries per minute)** and **billing**.
- FAQ class of limits: **Places ~6,000 QPM** at the product level (confirm live values in **Cloud Console → Google Maps Platform → Quotas**).
- Places API (New): rate limit is **per API method per project** (Nearby Search, Text Search, Place Details, Photos, Autocomplete each have their own quota).
- Over limit → typically **HTTP 429** / `RESOURCE_EXHAUSTED` / legacy-style `OVER_QUERY_LIMIT`. Back off; do not retry storms.
- **Result window:** Nearby/Text Search return up to **20 results per page**, about **3 pages** (~**60** max per query). Subdivide geocells for campus coverage rather than one huge radius dump.
- **Radius:** Nearby Search radius is in **meters** (max commonly **50,000**); Wayfinder campus use should stay small (e.g. 1–2 km).
- **Field masks drive cost:** you are billed at the **highest SKU** among requested fields (Essentials / Pro / Enterprise tiers). Request only fields we persist.

## Endpoints we use (v1 intent)
| Method | Use |
|---|---|
| **Nearby Search (New)** | Ingest restaurants around campus lat/lng + radius; type/food filters as available |
| **Text Search (New)** | Keyword discovery (“kabab near …”) when NL/map keyword present |
| **Place Details (New)** | Fill phone, website, hours, price, address components for a `google_place_id` |
| **Place Photos (New)** | Fetch/cache `photo_url` (respect attribution / max dimensions) |

Prefer batching ingest in workers with concurrency caps below QPM. Cache Details/Photos aggressively ([caching](./caching-and-quotas.md)).

## Client rules
- Always send a minimal **FieldMask**.
- Paginate only as needed for campus cells; stop when coverage is enough.
- Map UI should not call Places on every pan — query Wayfinder DB.
- Comply with [Google Maps Platform Terms](https://cloud.google.com/maps-platform/terms) (caching rules for some content are strict — prefer storing IDs + refreshing details on TTL rather than forever-caching restricted payloads).
- Google data does **not** replace Zabihah attribution when both appear on a card.

## Mapping into schema
- Upsert `restaurants.google_place_id`, name, geo, contact, `discovery_sources` includes `google`.
- Default `dietary_tags` row for `halal`: `unchecked` if none exists.
- Enqueue **provider matching** toward Zabihah.
- Optional: enqueue scrape using `website` if present.

---

# Part B — Zabihah Places API

Official base: `https://www.zabihah.com/api/v1`  
**Attribution required** on every plan wherever Zabihah data is shown.

## Role in Wayfinder
- Discovery (search) **and** sole **Verified** authority (place detail).
- No writes to Zabihah in v1 (no `contribute/signal`, no HalalRank read); see scope cut above.

## Setup
1. Apply for a key (sandbox first: verify email/phone; one application under review at a time).
2. Auth: `Authorization: Bearer …` **or** `x-api-key`.
3. Env: `ZABIHAH_API_KEY`, `ZABIHAH_BASE_URL`.

```bash
curl "https://www.zabihah.com/api/v1/places/search?keyword=kabab&lat=38.9&lng=-77.4&radius=25&parts=hours&parts=cuisines" \
  -H "Authorization: Bearer zbh_live_..."
```

## Rate limits & tiers
| Tier | Daily (weight) | Burst | Notes |
|---|---|---|---|
| Sandbox | 250/day | 10/min | Eval only; search `pageSize` ≤ 10; first 50 results |
| Free | 2,500/day base | 60/min | Give-to-get can raise/lower |
| Pro | 20,000/day guaranteed | 200/min | Paid allowance not reduced by give-to-get |

- Charged by **request weight**, not flat 1-per-call (`X-RateLimit-Remaining` can drop by >1).
- Every response: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`; **429** includes `Retry-After`.
- Extra search ceiling: **30 searches/minute/app** (independent of weight).
- Program-wide safety caps may throttle Free/sandbox under extreme load (not Pro’s guaranteed allowance).

### Weight
| Call | Weight |
|---|---|
| `GET /places/{id}` | 1 |
| Search | 3 + 1 per `parts` value |

Keep search `parts` lean; pull extras on detail. (`GET /halalrank/{id}` exists but is unused in v1.)

## Endpoints Wayfinder uses
### `GET /places/search`
Params: `keyword`, `lat`+`lng`, `radius` (miles ≤ 100), `cuisine`, `meatHalalStatus`, `type`, `page`, `pageSize` (≤ 25; sandbox ≤ 10), `parts`.

Must be constrained (else 400): meaningful filter; keyword ≥ 2 chars, not wildcard; radius needs coords; result window capped. No bulk export.

**Use:** parallel discovery; upsert `zabihah_place_id`; may set Verified + snapshot if payload is enough, else enqueue detail/halalrank.

### `GET /places/{id}`
Detail + halal signals. Sets/refreshes `restaurants.zabihah_snapshot` and **Verified** when signals warrant. Never invent Verified from Google/scrape.

### Deferred (not called in v1)
`GET /halalrank/{id}` (needs `halalrank.read`, adds a score/tier we're not shipping yet), `POST /contribute/signal` (earns zero give-to-get credit per Zabihah's docs), `correction`, `halal-evidence`, `missing-place`, `review`. See [outline.md "Out of scope"](../product/outline.md) for triggers to revisit.

## Zabihah errors
| Code | Action |
|---|---|
| 400 | Fix search constraints |
| 404 | Rematch / clear bad link |
| 409 | Duplicate contribute → treat OK |
| 413 | Shrink body |
| 429 | Honor Retry-After |
| Sunset header | Plan version migration (≥ 6 months after deprecation announce) |

## Data-field policy
First-party halal only — no third-party reviews/photos/discussions. Use `zabihahUrl` for rich content on Zabihah.

---

# Shared checklist
- [ ] Google key restricted; Places (New) enabled; budget alert on
- [ ] Zabihah sandbox smoke: constrained `places/search`
- [ ] Shared HTTP clients parse Google 429 and Zabihah rate-limit headers
- [ ] Field masks / `parts` minimized
- [ ] Upserts align with [schema](../product/schema-and-search-design.md)
- [ ] Attribution UI for Zabihah-backed rows
- [ ] Matching thresholds live before auto-link ([provider-matching](./provider-matching.md))
