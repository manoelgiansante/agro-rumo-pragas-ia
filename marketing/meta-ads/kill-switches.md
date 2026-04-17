# Kill Switches — Rumo Pragas Meta Ads

> **DRY-RUN.** Thresholds de pausa/alerta automática. Aplicar como cron/monitor após aprovação.

## Princípio

Proteger a conta `act_25112854085004456` de performance ruim + detectar fraude antes que drene budget.

## Thresholds (CRITICAL)

### 1. CPL (Custo por Lead) muito alto
- **Trigger:** `CPL > R$10 em 48h + ≥ 100 impressions`
- **Ação:** Pausar AD SET (não campaign inteira)
- **Write:** `mcp__facebook-ads__pause_campaign` no ad set level
- **Cooldown:** 24h antes de unpause (regra ZERO-B)
- **Alerta WhatsApp:** "Ad set X pausado por CPL R$Y > target R$10"

### 2. Frequency alta (fatigue)
- **Trigger:** `Frequency > 3.5 em 7 dias rolling`
- **Ação:** NÃO pausar ad set. Rotacionar creatives:
  1. Pausar ad com maior frequency
  2. Subir ad novo (copy variation ainda não testada)
- **Max 2 rotações por semana** (evita caos criativo)

### 3. CTR baixo (creative ruim)
- **Trigger:** `CTR (link) < 0.8% em 24h + ≥ 500 impressions`
- **Ação:** Pausar AD individual
- **Cooldown:** aguardar 72h antes de tentar criativo similar

### 4. Relevance Score / Quality Ranking
- **Trigger:** `Quality Ranking = "Below Average"` ou `"Below Average (10%)"`
- **Ação:** Revisar creative manualmente. Se persiste, pausar.
- **Nota:** Meta hoje usa `quality_ranking`, `engagement_rate_ranking`, `conversion_rate_ranking` (todos 3)

### 5. Spend spike (possível fraude ou bug)
- **Trigger:** `Spend nas últimas 4h > 2× média das últimas 24h`
- **Ação:** PAUSAR CAMPAIGN inteira + alerta WhatsApp urgente
- **Exemplo:** Se campaign gasta R$3/hora médio e de repente R$15/hora → pause

### 6. Zero conversions prolongado
- **Trigger:** `Spend > R$100 em ad set SEM 1 conversion`
- **Ação:** Pausar ad set + investigar tracking

### 7. Negative feedback
- **Trigger:** `Negative feedback rating = "High"`
- **Ação:** Pausar ad IMEDIATAMENTE. Criativo pode queimar a pixel/conta.
- **Review:** checar se há claim problemático (health, income, before/after)

## Alertas (INFO, não pausam)

### A. Frequency subindo
- **Trigger:** Frequency > 2.5 em 5 dias
- **Ação:** notificar pra planejar creative refresh

### B. ROAS caindo
- **Trigger:** ROAS queda > 30% semana-a-semana
- **Ação:** notificar, investigar funnel

### C. CPM subindo
- **Trigger:** CPM > R$35 (muito alto pra agro BR)
- **Ação:** notificar. Audience pode estar saturada ou dando lance alto.

### D. Delivery erratic
- **Trigger:** Impressions variam > 50% dia-a-dia
- **Ação:** notificar. Pode ser learning phase OU budget não alocado.

### E. Error 429 rate limit
- **Trigger:** **3 erros 429 em 1 min** (ZERO-B regra)
- **Ação:** Circuit breaker — **PARAR TODAS as writes por 1h** + alerta WhatsApp
- **Sem exceção.** Meta detecta retry agressivo e pode banir token.

## Account-level protection

### F. Account disabled
- **Trigger:** `/me` retorna 403 ou `"account_disabled"` / `"deactivated"`
- **Ação:** **PARAR TUDO IMEDIATAMENTE**. Alerta WhatsApp + email.
- **NUNCA** tentar reativar via código. Manoel faz appeal manual (180 dias ou ban permanente).

### G. Token expirado
- **Trigger:** `/me` retorna erro 190 (OAuthException)
- **Ação:** Renovar token (ver `reference_meta_token_renewal.md`). Parar writes até token novo.
- **Janela:** token long-lived expira ~2026-06-14

### H. Spend limit atingido
- **Trigger:** `account_status = LIMITED_SPENDING` ou aproximando do cap
- **Ação:** notificar. Validar com Manoel se aumenta o cap.

## Monitoring implementation

### Opção 1: Cron simples (recomendado pra MVP)
```
# crontab: roda a cada 2h durante horário comercial
0 8,10,12,14,16,18,20 * * 1-6 /Users/manoelnascimento/AgroRumo\ Projetos/Marketing/social-bot/scripts/check-ads.sh
```

Script chama `mcp__facebook-ads__get_campaign_performance` + avalia thresholds.

### Opção 2: social-bot integration (já existe)
Adicionar thresholds acima em `src/ads/monitor.ts` (atualmente tem bug de scaling diário — **FIX antes de ativar**, ver Obsidian).

### Opção 3: Ads Cockpit dashboard
Exibir thresholds no cockpit https://ads-cockpit-beige.vercel.app/ com sinalização visual.

## Horários proibidos (ZERO-B)

**NÃO fazer writes entre 23h-6h BRT** sem razão clara.
- Motivo: Meta detecta padrões bot em horários não-comerciais
- Exceção: emergência (spend spike, account disabled)
- Leituras (GET) OK qualquer horário

## Writes paralelos

- **Max 3 writes paralelos** (ZERO-B). Exceder = padrão bot.
- Implementação: semáforo/queue no código

## Audit log obrigatório

Antes e depois de CADA write:
```typescript
await logToSupabase('ads_actions_log', {
  timestamp: new Date(),
  action: 'pause_ad_set',
  campaign_id: '...',
  ad_set_id: '...',
  reason: 'CPL > R$10 in 48h',
  metrics_before: { cpl: 12.50, impressions: 3420, ... },
});
// await write
await logToSupabase('ads_actions_log', {
  // ...
  result: 'success',
  metrics_after: { status: 'PAUSED' },
});
```

## Resumo das ações (tabela decisão rápida)

| Sinal | Severidade | Ação | Cooldown |
|-------|-----------|------|----------|
| CPL > R$10 em 48h | MED | Pause ad set | 24h |
| Frequency > 3.5 | MED | Rotate creative | 72h |
| CTR < 0.8% em 24h | LOW | Pause ad | 72h |
| Quality ranking Below Avg | MED | Review, maybe pause | — |
| Spend spike 2× em 4h | HIGH | Pause campaign + alert | manual review |
| Zero conv com spend > R$100 | MED | Pause ad set + investigate tracking | manual review |
| Negative feedback High | HIGH | Pause ad immediate | 7d |
| 3 erros 429 em 1min | CRITICAL | Stop ALL writes 1h + alert | 1h |
| Account disabled | CRITICAL | STOP everything + alert | appeal humano |

## Pendências pra Manoel aprovar antes de ativar

- [ ] Aprovar thresholds (ajustar se CPL target for diferente)
- [ ] Definir canal de alerta: WhatsApp? Slack? Both?
- [ ] Aprovar spend spike trigger (2× média em 4h)
- [ ] Decidir onde rodar monitor: cron? social-bot? cockpit?
- [ ] Corrigir bug scaling diário em `src/ads/monitor.ts` ANTES de ativar
