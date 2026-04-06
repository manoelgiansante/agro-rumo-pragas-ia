# Guia de Seguranca - Rumo Pragas IA

## Rotacao de Chaves (URGENTE)

As chaves abaixo precisam ser rotacionadas imediatamente se foram expostas:

### 1. Supabase
- Acesse: https://supabase.com/dashboard/project/settings/api
- Regenere a "anon key" e "service_role key"
- Atualize no .env e nas Supabase Edge Functions

### 2. Stripe
- Acesse: https://dashboard.stripe.com/apikeys
- Clique em "Roll key" na secret key
- Atualize a publishable key no .env
- Atualize a secret key nas Supabase Edge Functions
- Atualize o webhook secret: https://dashboard.stripe.com/webhooks

### 3. Google OAuth
- Acesse: https://console.cloud.google.com/apis/credentials
- Crie novas credenciais OAuth
- Atualize no .env

### 4. Claude API (Anthropic)
- Acesse: https://console.anthropic.com/settings/keys
- Crie uma nova API key
- Atualize nas Supabase Edge Functions (CLAUDE_API_KEY)

### 5. RevenueCat
- Acesse: https://app.revenuecat.com > Project Settings > API Keys
- Regenere as chaves iOS e Android
- Atualize no .env

### 6. Google Gemini (se ainda em uso)
- Acesse: https://aistudio.google.com/app/apikey
- Crie uma nova API key
- Atualize nas Supabase Edge Functions (GOOGLE_GEMINI_API_KEY)

## Onde Colocar Cada Chave

| Chave | Local | Tipo |
|-------|-------|------|
| SUPABASE_URL | .env (app) | Publica |
| SUPABASE_ANON_KEY | .env (app) | Publica |
| STRIPE_PUBLISHABLE_KEY | .env (app) | Publica |
| GOOGLE_CLIENT_ID | .env (app) | Publica |
| REVENUECAT_IOS_KEY | .env (app) | Publica |
| REVENUECAT_ANDROID_KEY | .env (app) | Publica |
| STRIPE_SECRET_KEY | Supabase Secrets | SECRETA |
| SUPABASE_SERVICE_ROLE_KEY | Supabase Secrets | SECRETA |
| CLAUDE_API_KEY | Supabase Secrets | SECRETA |
| GOOGLE_GEMINI_API_KEY | Supabase Secrets | SECRETA |
| STRIPE_WEBHOOK_SECRET | Supabase Secrets | SECRETA |
| RESEND_API_KEY | Supabase Secrets | SECRETA |

## ALERTA: Chaves Secretas no .env

O arquivo `.env` atual contem chaves que NAO deveriam estar no app mobile:
- `STRIPE_SECRET_KEY` - DEVE ser removida do .env e usada apenas via Supabase Secrets
- `SUPABASE_SERVICE_ROLE_KEY` - DEVE ser removida do .env e usada apenas via Supabase Secrets
- `GOOGLE_GEMINI_API_KEY` - DEVE ser removida do .env e usada apenas via Supabase Secrets

Essas chaves dao acesso total ao banco de dados e servicos de pagamento.
Qualquer pessoa que descompilar o app pode extrair essas chaves.

## Como Configurar Secrets nas Supabase Edge Functions

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=eyJxxx
supabase secrets set CLAUDE_API_KEY=sk-ant-xxx
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
supabase secrets set GOOGLE_GEMINI_API_KEY=AIzaxxx
supabase secrets set RESEND_API_KEY=re_xxx
```

## EAS Secrets (para builds)

Para que as variaveis de ambiente estejam disponiveis nos builds EAS:

```bash
eas secret:create --name EXPO_PUBLIC_SUPABASE_URL --value "https://xxx.supabase.co"
eas secret:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "eyJxxx"
eas secret:create --name EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY --value "pk_live_xxx"
eas secret:create --name EXPO_PUBLIC_GOOGLE_CLIENT_ID --value "xxx.apps.googleusercontent.com"
eas secret:create --name EXPO_PUBLIC_REVENUECAT_IOS_KEY --value "appl_xxx"
eas secret:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value "goog_xxx"
```

## Checklist de Seguranca

- [ ] Chaves secretas rotacionadas (Stripe secret, Service Role, Claude API, Gemini API)
- [ ] Chaves secretas REMOVIDAS do .env (manter apenas chaves publicas)
- [ ] .env NAO esta no git (verificar com: `git ls-files expo-app/.env`)
- [ ] Secrets server-side configurados nas Supabase Edge Functions
- [ ] Webhook Stripe com verificacao de assinatura ativa
- [ ] RLS habilitado em todas as tabelas do Supabase
- [ ] EAS Secrets configurados para builds de producao
- [ ] Google OAuth redirect URIs restritos aos dominios corretos
