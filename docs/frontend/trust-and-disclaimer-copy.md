# Trust & disclaimer copy

UI must make status impossible to confuse with certification theater.

## Status labels (halal)
| Status | Badge | Short subtitle |
|---|---|---|
| Verified | Verified halal | Confirmed with Zabihah data |
| Likely | Likely halal | Based on public info or community, not Zabihah-verified |
| Unchecked | Not checked yet | We have not confirmed this place for halal |
| False | Not halal | Marked as not halal |

## Filter empty state
When halal filter is on and nothing matches:

> No verified or likely halal places in this area yet. Zoom out or clear filters to browse all places.

## Card / detail disclaimers
- **Verified:** show Zabihah attribution + link `zabihahUrl` (“Full report on Zabihah”).
- **Likely:**  

  > Wayfinder does not certify restaurants. “Likely” is inferred from public sources or community tips and can be wrong. Prefer Verified when observance requires certainty.
- **Any non-Verified on a dietary screen:** one persistent footnote:  

  > Dietary labels can change. Always confirm with the restaurant if it matters for your practice.

## Confirm / reject prompts
Deferred (post-v1): no user-facing confirm/reject UI in v1, status changes come only from Zabihah verification and the scrape job. Revisit once there's real user traffic to sustain the loop. See [outline.md "Out of scope"](../product/outline.md).

## Attribution
Zabihah-backed fields: `Data © Zabihah — https://www.zabihah.com` (or API `_attribution` string).
This exact string is Zabihah's required attribution format per their API terms; it is exempt from the em-dash-free copy rule below since we render it verbatim, not as authored UI copy.

## Copy rules (design-taste-frontend, Section 9.G)
All UI-authored strings (badges, buttons, toasts, empty states, prompts) use zero em-dashes (—) or en-dashes (–) as punctuation. Use a period, comma, or plain hyphen instead. Verbatim third-party strings (like the Zabihah attribution above) are the only exception.

## Related
[Overview](../product/outline.md) · [Search](../features/search.md) · [Design system](./design-system.md)
