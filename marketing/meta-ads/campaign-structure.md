# Campaign Structure — Rumo Pragas Launch

> **DRY-RUN.** Estrutura proposta. Nenhuma campanha criada ainda.

## Princípios aplicados (meta-ads skill)

- **Um objetivo por campanha** — não misturar Traffic com Conversions (algoritmo fragmenta)
- **CBO (Campaign Budget Optimization)** para Prospecting — Meta redistribui entre ad sets
- **ABO (Ad Set Budget)** para Retargeting — controle manual
- **Advantage+ Placements** — deixar Meta otimizar Feed / Reels / Stories
- **3-5 ads por ad set** — variedade suficiente pra rotação sem fragmentar

## Naming Convention

`META_[Objective]_[Audience]_[Offer]_[YYYYMMDD]`

Exemplos:
- `META_Lead_Waitlist-Soja_Trial7d_20260418`
- `META_AppInstall_LookalikeWaitlist_FreeTrial_20260418`
- `META_Retarget_Visitors30d_Trial7d_20260418`

## Hierarquia

```
Account: act_25112854085004456 (AgroRumo)
│
├── Campaign 1: META_Lead_Prospecting_Trial7d_20260418
│   ├── Objective: Leads (Conversions → StartTrial)
│   ├── Budget: CBO R$20/dia
│   ├── Optimization: Conversions (event: StartTrial)
│   ├── Attribution: 7-day click, 1-day view
│   ├── Bid Strategy: Lowest cost (sem cap inicial)
│   ├── Status inicial: PAUSED (nunca ACTIVE direto)
│   │
│   ├── Ad Set 1.1: Produtores Soja (interesses)
│   │   ├── Placement: Advantage+ (auto)
│   │   ├── Audience: ver audiences.md §1
│   │   └── Ads: 3 variantes (Ângulo 1 DOR)
│   │
│   ├── Ad Set 1.2: Produtores Café+Milho (interesses)
│   │   ├── Placement: Advantage+
│   │   ├── Audience: ver audiences.md §2
│   │   └── Ads: 3 variantes (Ângulo 2 SOLUÇÃO)
│   │
│   └── Ad Set 1.3: Broad Advantage+ (algoritmo livre)
│       ├── Placement: Advantage+
│       ├── Audience: Advantage+ Audience (sem interesses — só geo + idade)
│       └── Ads: 3 variantes (Ângulo 3 ROI)
│
├── Campaign 2: META_AppInstall_Prospecting_FreeTrial_20260418
│   ├── Objective: App Installs (Conversions → CompleteRegistration via app event)
│   ├── Budget: CBO R$30/dia
│   ├── Optimization: App Install → then App Event (trial_started)
│   ├── Attribution: 7-day click
│   ├── Status inicial: PAUSED
│   │
│   ├── Ad Set 2.1: Lookalike 1% Waitlist (quando tiver 100+ emails)
│   │   ├── Placement: Advantage+ (Feed + Reels + Stories)
│   │   ├── Audience: ver audiences.md §3
│   │   └── Ads: 3 variantes (foco no trial 7 dias)
│   │
│   └── Ad Set 2.2: Interesses Agro BR (fallback se lookalike < 1M)
│       ├── Placement: Advantage+
│       ├── Audience: ver audiences.md §4
│       └── Ads: 3 variantes
│
└── Campaign 3: META_Retarget_Visitors_Trial7d_20260418
    ├── Objective: Conversions (StartTrial)
    ├── Budget: ABO R$10/dia (fora dos R$50, separado)
    │   NOTA: Retargeting só ativar após 2 semanas de tráfego (audiência precisa acumular)
    ├── Status inicial: PAUSED até ter audiência
    │
    └── Ad Set 3.1: Website Visitors 30d + Email Abertos
        ├── Placement: Feed + Stories
        ├── Audience: ver audiences.md §5
        ├── Exclusions: trial_started nos últimos 30d + app_installed
        └── Ads: 2 variantes (depoimento + urgência legítima)
```

## Resumo budget

| Campanha | Budget/dia | Ad Sets | Ads | Total/semana |
|----------|------------|---------|-----|--------------|
| Lead Prospecting | R$20 (CBO) | 3 | 9 | R$140 |
| App Install Prospecting | R$30 (CBO) | 2 | 6 | R$210 |
| Retargeting (Semana 3+) | R$10 (ABO) | 1 | 2 | R$70 |
| **TOTAL inicial (S1-S2)** | **R$50** | **5** | **15** | **R$350** |
| **TOTAL com retarget (S3+)** | **R$60** | **6** | **17** | **R$420** |

## Regras de operação

- **NUNCA** criar diretamente em `ACTIVE` — sempre `PAUSED` primeiro
- **NUNCA** criar >5 ads de uma vez (mass create = bot-like)
- Cooldown **24h** entre PAUSE e UNPAUSE do mesmo ad set
- Scaling **apenas após 72h** de métrica estável (regra ZERO-B)
- Max scale **+20%** por vez (nunca dobrar)
- Audit log obrigatório em `ads_actions_log` antes e depois de cada write

## Attribution window padrão

- **7-day click, 1-day view** (padrão Meta 2026 pós-iOS 14.5)
- Comparar com GA4 (4-day click) e CAPI (deduplicado por event_id)

## Próximos passos

1. Manoel aprova esta estrutura (checklist no README.md)
2. Validar orçamento diário em Business Manager (limite de gasto da conta)
3. Confirmar Page ID + Instagram Account vinculados à conta de anúncios
4. Ativar em sequência: Campaign 1 → (3 dias) → Campaign 2 → (14 dias) → Campaign 3
