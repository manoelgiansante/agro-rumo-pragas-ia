# Pixel + CAPI Check — Rumo Pragas

> **DRY-RUN.** Validação que Pixel + CAPI estão funcionando antes de ativar ads.

## Configuração atual (confirmada em código)

| Item | Valor | Fonte |
|------|-------|-------|
| **Pixel ID** | `1314795250329336` | `rumo-pragas-landing/src/app/api/capi/route.ts:10` |
| **CAPI endpoint** | `https://pragas.agrorumo.com/api/capi` | Next.js App Router edge route |
| **Runtime** | Edge (Vercel) | `export const runtime = 'edge'` |
| **Graph API version** | v22.0 | `const GRAPH_API = 'https://graph.facebook.com/v22.0'` |
| **Dedup** | via `event_id` | Pixel client-side + CAPI server-side mesmo event_id |
| **Hashing** | SHA-256 | email, phone, fn, ln, external_id |

## Env vars necessárias (Vercel)

```bash
# Já configurados (confirmar em Vercel dashboard):
NEXT_PUBLIC_META_PIXEL_ID=1314795250329336  # client-side Pixel
NEXT_PUBLIC_GA4_ID=                          # pendente de Manoel

# Server-side (secret):
FB_PIXEL_ID=1314795250329336
FB_CAPI_ACCESS_TOKEN=<SECRET>               # pendente de Manoel — sem isso CAPI = disabled
FB_TEST_EVENT_CODE=<OPCIONAL — só em QA>
```

**Status atual:** `FB_CAPI_ACCESS_TOKEN` pendente (flag `status: 'disabled'` se ausente — já tratado).

## Eventos suportados (whitelist)

Em `src/app/api/capi/route.ts:15-19`:

```typescript
const ALLOWED_EVENTS = new Set([
  'PageView', 'ViewContent', 'Lead', 'CompleteRegistration', 'Contact',
  'InitiateCheckout', 'AddPaymentInfo', 'Purchase', 'Subscribe',
  'StartTrial', 'Search', 'AddToWishlist', 'CustomizeProduct',
]);
```

## Eventos críticos para esta campanha

| Evento | Quando dispara | Pixel | CAPI | Valor (opcional) |
|--------|----------------|-------|------|------------------|
| **PageView** | Landing visit | Sim (auto) | Sim | — |
| **ViewContent** | Scroll 50% + em /features | Sim (auto) | Sim | — |
| **Lead** | Submit waitlist form | Sim (manual) | Sim | — |
| **InitiateCheckout** | Click "Baixar app" | Sim (manual) | Sim | — |
| **CompleteRegistration** | App install + primeiro signup | App Event → CAPI | Sim | — |
| **StartTrial** | Trial 7d iniciado (Supabase → webhook) | App Event | Sim | R$49,90 (value) |
| **Subscribe** | Trial → paid (RevenueCat webhook → CAPI) | App Event | Sim | R$49,90 / R$149,90 |

## Checklist de validação (pré-launch)

### 1. Pixel fires (client-side)

- [ ] Abrir https://pragas.agrorumo.com com **Meta Pixel Helper** (Chrome extension)
- [ ] Verificar `PageView` fires na home
- [ ] Scroll 50% → `ViewContent` fires
- [ ] Submit waitlist → `Lead` fires
- [ ] Click "Baixar" → `InitiateCheckout` fires

### 2. CAPI echoes server-side

- [ ] Meta Events Manager → Test Events (com `FB_TEST_EVENT_CODE` setado)
- [ ] Mesmos eventos aparecem em "Server" column
- [ ] Deduplication rate > 80% (event_id match)

### 3. Deduplication

- [ ] Verificar em Events Manager: "Deduplicated events" column
- [ ] Target: **70%+ dedup rate** entre Pixel e CAPI
- [ ] Se dedup < 50%: event_id não está batendo — investigar

### 4. Advanced matching

- [ ] `em` (email hashed) presente em ≥ 50% dos eventos de Lead/StartTrial
- [ ] `ph` (phone hashed) presente onde coletado
- [ ] `external_id` (user_id) presente em eventos pós-signup

### 5. Event Quality Score

Meta Events Manager → Diagnostics:
- [ ] **Event Quality:** ≥ 7.0 (out of 10)
- [ ] Se < 7: adicionar mais parâmetros user_data (em, ph, ct, st, zp)

## Test payload CAPI (curl)

```bash
curl -X POST https://pragas.agrorumo.com/api/capi \
  -H "Content-Type: application/json" \
  -d '{
    "event_name": "Lead",
    "event_id": "test-lead-'"$(date +%s)"'",
    "user_data": {
      "em": "manoelgiansante@gmail.com",
      "ph": "+5511999999999"
    },
    "custom_data": {
      "content_name": "waitlist",
      "currency": "BRL"
    },
    "event_source_url": "https://pragas.agrorumo.com"
  }'
```

Resposta esperada:
```json
{ "status": "ok", "events_received": 1 }
```

Se `status: "disabled"` → `FB_CAPI_ACCESS_TOKEN` não está setado no Vercel.

## App events (Rumo Pragas mobile)

Para `CompleteRegistration`, `StartTrial`, `Subscribe` (mobile):

- **SDK:** Facebook SDK for React Native **NÃO** instalado ainda no Expo app
- **Alternativa:** Webhook Supabase Edge Function → POST `/api/capi` (já funciona)
- **Próximo passo:** Instalar `react-native-fbsdk-next` OU usar webhooks (decidir)

**Recomendação:** usar webhooks (mais simples, já compatível com CAPI route).

## Fluxo completo (end-to-end)

```
User clica ad Meta
    ↓
Land em pragas.agrorumo.com?fbclid=XXX
    ↓
Pixel PageView fires (client) + CAPI PageView (server) → dedup
    ↓
User submits waitlist
    ↓
Pixel Lead + CAPI Lead (com email hashed)
    ↓
User clicks "Baixar app"
    ↓
Pixel InitiateCheckout + redirect App/Play Store (com fbclid preservado)
    ↓
User instala + abre app
    ↓
Supabase trigger → Edge Function → POST /api/capi (CompleteRegistration)
    ↓
User inicia trial
    ↓
Webhook → POST /api/capi (StartTrial, value=49.90)
    ↓
Trial → paid (RevenueCat webhook)
    ↓
Webhook → POST /api/capi (Subscribe, value=49.90)
```

## Pendências pra Manoel aprovar antes de ativar

- [ ] Setar `FB_CAPI_ACCESS_TOKEN` em Vercel (se ainda não setou)
- [ ] Gerar token long-lived (expira ~2026-06-14 — ver `reference_meta_token_renewal.md`)
- [ ] Confirmar Pixel 1314795250329336 = Pixel correto para Rumo Pragas (não misturar com Rumo Máquinas)
- [ ] Criar webhook Supabase → CAPI para eventos de trial/subscribe (se ainda não existe)
- [ ] Validar Event Quality Score ≥ 7 em Events Manager
