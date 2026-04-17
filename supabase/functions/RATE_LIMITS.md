# Rate Limits & Security — Rumo Pragas Edge Functions

**Last updated:** 2026-04-17
**Owner:** Manoel Nascimento
**Supabase project:** `jxcnfyeemdltdfqtgbcl`

## Overview

Two independent throttling layers protect the backend against abuse and cap
Anthropic API spend:

1. **Monthly plan caps** — stored in DB, enforced per-request by counting rows.
   These are the "product limits" that a user sees (e.g. "3 diagnoses/month on
   free plan"). Upgrading the plan raises the cap.

2. **Per-user burst rate limiting** — in-memory per Edge Function cold start.
   Protects against scripted abuse of a valid JWT (e.g. a compromised token
   hammering `/diagnose` would exhaust the monthly budget in seconds without
   this). Burst limits are generous enough that legitimate users never hit them.

Both layers must be passed for a request to succeed.

## Plan-based Limits

### ai-chat

Anthropic Haiku text calls. Rate is measured in **messages per minute**.

| Plan       | Monthly cap (messages) | Burst cap (msg/min) |
|------------|------------------------|---------------------|
| free       | 10                     | 20                  |
| pro        | unlimited              | 100                 |
| enterprise | unlimited              | 500                 |

**429 response:** `Retry-After: 60` header. `X-RateLimit-*` headers present.

### diagnose

Anthropic Haiku **Vision** calls (~5-10x cost of text). Rate measured **per hour**
because Vision requests are expensive and users rarely burst in a minute.

| Plan       | Monthly cap (diagnoses) | Burst cap (diag/hour) |
|------------|-------------------------|-----------------------|
| free       | 3                       | 10                    |
| pro        | 30                      | 100                   |
| enterprise | unlimited               | 10,000                |

**429 response:** `Retry-After: 3600` header.

### analytics

Event ingestion. No Anthropic cost, but prevents DB write floods.

| Plan       | Burst cap (requests/min) | Max events per batch |
|------------|--------------------------|----------------------|
| all users  | 30                       | 100                  |

### Webhooks (stripe-webhook, revenuecat-webhook)

Server-to-server webhooks. Rate limited by caller key (auth header prefix).

| Webhook      | Burst cap (req/min) |
|--------------|---------------------|
| stripe       | 100                 |
| revenuecat   | 100                 |

## Implementation Details

Rate limiting uses an **in-memory `Map<userId, { count, resetAt }>`** per
Edge Function cold start:

- LRU-style eviction when the map exceeds 10,000 entries (expired entries
  are dropped first, keeping ≤ 90% of the cap).
- TTL is `RATE_LIMIT_WINDOW_MS` (60s for ai-chat, 3600s for diagnose).
- On cold start, the map is empty — users get a fresh quota. This is a
  **known trade-off**: cold starts give users a fresh window, but Supabase
  typically keeps functions warm for minutes, so the practical window
  approximates the nominal window.
- The LRU cap bounds memory to ~500KB per function instance.

### Why in-memory and not Redis/Upstash?

- Edge Functions already have Anthropic cost as the hard ceiling.
- Per-plan **monthly caps** (DB-backed) are the true product limit.
- Burst rate limiting is a **defense-in-depth** against scripted abuse, not
  a primary billing control.
- Adding Redis would introduce a cross-region dependency + cost for a
  feature that Supabase-hosted in-memory already handles well.
- If a sophisticated attacker warms cold starts in parallel across regions,
  monthly cap (DB) would still cap total spend.

## Response Headers

All rate-limited endpoints return these headers on both 200 and 429:

```
X-RateLimit-Limit: <plan burst cap>
X-RateLimit-Remaining: <count remaining in window>
X-RateLimit-Reset: <unix epoch seconds when window resets>
Retry-After: <seconds>  (only on 429)
```

## Webhook Authentication

### Stripe (stripe-webhook)

HMAC-SHA256 signature verification via `Stripe-Signature` header.
Timestamp tolerance: 300s (5 min). `STRIPE_WEBHOOK_SECRET` required.
In production (`ENVIRONMENT=production`), rejects test events
(`event.livemode === false`).

### RevenueCat (revenuecat-webhook)

Bearer token via `Authorization` header. RevenueCat does **not** natively
support HMAC signing as of 2026 — they only offer a static shared
Authorization header. We apply compensating controls:

1. **HTTPS-only** (TLS protects transport integrity)
2. **Constant-time token compare** (timingSafeEqual)
3. **Rate limit per caller** (100 req/min)
4. **Idempotency dedup** (in-memory by `app_user_id + event.type + purchased_at_ms`)
5. **UUID validation** on `app_user_id` (prevents injection)
6. **Event-type allowlist** (SUBSCRIPTION_EVENTS set)

**Operational policy:** ROTATE `REVENUECAT_WEBHOOK_SECRET` **monthly**. Procedure:

1. Generate new random secret (e.g. `openssl rand -base64 48`)
2. Set both old and new as valid in RevenueCat dashboard (supports rolling)
3. `supabase secrets set REVENUECAT_WEBHOOK_SECRET=<new> --project-ref jxcnfyeemdltdfqtgbcl`
4. Verify new secret is live (inspect next webhook in logs)
5. Remove old secret from RevenueCat dashboard
6. Anotar rotation na Obsidian Daily Note

When/if RevenueCat adds native HMAC signing, migrate by verifying
`X-RevenueCat-Signature` header against body HMAC-SHA256.

## CORS

All functions now use a **hardcoded whitelist fallback** for `ALLOWED_ORIGINS`:

```ts
const DEFAULT_ALLOWED = [
  "https://pragas.agrorumo.com",
  "https://rumopragas.com.br",
  "https://rumo-pragas.vercel.app",
  "exp://localhost:19000",
  "exp://localhost:8081",
  "http://localhost:19006",
  "http://localhost:8081",
];
const ALLOWED_ORIGINS = (() => {
  const env = Deno.env.get("ALLOWED_ORIGINS");
  if (!env || env.trim() === "") return DEFAULT_ALLOWED;
  return env.split(",").map((o) => o.trim()).filter(Boolean);
})();
```

**Rationale:** previously the fallback was empty (deny-all on origin). While
secure, that broke preview deploys when the env var was accidentally unset.
Hardcoded whitelist is safer than `*` and fail-open to known-safe origins.

**To override per-deploy:**

```bash
supabase secrets set \
  ALLOWED_ORIGINS="https://pragas.agrorumo.com,https://preview.example.com" \
  --project-ref jxcnfyeemdltdfqtgbcl
```

## Deploy

```bash
# Deploy all functions
supabase functions deploy ai-chat          --project-ref jxcnfyeemdltdfqtgbcl
supabase functions deploy diagnose         --project-ref jxcnfyeemdltdfqtgbcl
supabase functions deploy analytics        --project-ref jxcnfyeemdltdfqtgbcl
supabase functions deploy revenuecat-webhook --project-ref jxcnfyeemdltdfqtgbcl
supabase functions deploy stripe-webhook   --project-ref jxcnfyeemdltdfqtgbcl
supabase functions deploy delete-user-account --project-ref jxcnfyeemdltdfqtgbcl
supabase functions deploy process-deletions --project-ref jxcnfyeemdltdfqtgbcl

# Or deploy them all in one go:
supabase functions deploy --project-ref jxcnfyeemdltdfqtgbcl
```

## Monitoring

- **Sentry:** 429 responses are logged with `WARN` level and include
  `userId`, `plan`, and `limit`. If a user persistently hits 429, investigate
  for a compromised JWT or buggy client.
- **Anthropic dashboard:** track daily spend. Anomalous spikes should match
  logged 429 volume.
- **Supabase logs:** `mcp__supabase__get_logs` to filter Edge Function logs.
