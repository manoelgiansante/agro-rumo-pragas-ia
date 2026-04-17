# Meta Ads — Rumo Pragas Launch (DRY-RUN)

> **STATUS:** DRY-RUN — nenhuma write na Marketing API foi feita.
> Manoel precisa revisar e aprovar ANTES de ativar qualquer campanha.

## Contexto

- **Produto:** Rumo Pragas (app mobile — IA diagnose pragas agrícolas)
- **Landing:** https://pragas.agrorumo.com (Next.js 15, Pixel + CAPI live)
- **Account:** `act_25112854085004456` (produção — zero tolerância a bot-like)
- **Pixel ID:** `1314795250329336`
- **CAPI:** `/api/capi` edge route (eventos: PageView, Lead, StartTrial, InitiateCheckout, Purchase)
- **Orçamento inicial:** R$50/dia (split: R$20 lead gen, R$30 app install)
- **Objetivo Sprint 1:** Leads (email waitlist + demo request)
- **Objetivo Sprint 2:** App Installs
- **Objetivo Sprint 3:** Subscriptions (trial → paid)

## Arquivos neste bundle

| # | Arquivo | Conteúdo |
|---|---------|----------|
| 1 | `campaign-structure.md` | Hierarquia Campaign → Ad Set → Ad |
| 2 | `audiences.md` | Core, lookalike, retargeting + exclusions |
| 3 | `creatives.md` | 3 creatives iniciais (video, carrossel, single image) + copy |
| 4 | `pixel-capi-check.md` | Validação Pixel + CAPI + eventos |
| 5 | `budget-pacing-plan.md` | Semana 1-4 scaling + regra 72h |
| 6 | `kill-switches.md` | Thresholds de pausa automática |
| 7 | `compliance-check.md` | Lei 7.802/89 + Meta content policy |

## Checklist de aprovação (Manoel)

- [ ] Revisar `campaign-structure.md` — hierarquia e nomes
- [ ] Revisar `audiences.md` — validar interesses, idade, geo
- [ ] Revisar `creatives.md` — aprovar copy e storyboards
- [ ] Confirmar Pixel/CAPI via `pixel-capi-check.md` (teste Events Manager)
- [ ] Aprovar orçamento R$50/dia em `budget-pacing-plan.md`
- [ ] Validar thresholds em `kill-switches.md`
- [ ] Checar `compliance-check.md` antes de subir criativos

## Next step (só após aprovação humana)

1. Manoel escreve "aprovado — pode ativar" OU ajusta os docs
2. Claude roda `mcp__facebook-ads__validate_token` e `mcp__facebook-ads__health_check`
3. Se token OK: cria Campaign em status **PAUSED** primeiro (nunca ACTIVE direto)
4. Preview de cada ad via `mcp__facebook-ads__preview_ad`
5. Manoel confirma preview → só então `mcp__facebook-ads__resume_campaign`
6. Audit log em `ads_actions_log` antes e depois de cada write (regra ZERO-B)

---

**Criado:** 2026-04-17
**Autor:** Claude + meta-ads skill
**Referência:** `~/Obsidian Vault/Marketing/Meta Ads - Regras de Seguranca Anti-Ban.md`
