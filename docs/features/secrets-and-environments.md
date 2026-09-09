# Secrets & environments

## Environments
| Env | Google | Zabihah | Notes |
|---|---|---|---|
| Local / dev | Restricted key or disabled | Sandbox key | Never commit `.env` |
| Staging | Separate GCP project preferred | Sandbox or Free | Lower QPM caps in workers |
| Production | Prod GCP project + budget alerts | Free or Pro | HalalRank scope only if granted |

## Variables
```
GOOGLE_MAPS_API_KEY=
ZABIHAH_API_KEY=
ZABIHAH_BASE_URL=https://www.zabihah.com/api/v1
ZABIHAH_HALALRANK_ENABLED=false
DATABASE_URL=
```

Optional: per-env field masks, worker concurrency, campus default lat/lng/radius.

## Handling
- Store in host secrets (Vercel/Fly/GCP Secret Manager) — not in git.
- Rotate on leak; revoke old Google key in Console and Zabihah key with provider.
- Backend-only Places/Zabihah calls; map tiles may use a separate referrer-restricted browser key with **no** Places unrestricted access.
- Scopes: enable `halalrank.read` only when needed; contribute.write only when signals ship.

## Related
[Search](./search.md) · [Abuse](./threat-and-abuse.md)
