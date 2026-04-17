# Budget + Pacing Plan — Rumo Pragas

> **DRY-RUN.** Plano de orçamento e escala. Respeita regra ZERO-B (72h entre scales, +20% máx).

## Resumo executivo

| Semana | Budget/dia | Total semana | Foco | Trigger scaling |
|--------|------------|--------------|------|-----------------|
| S1 | R$50 | R$350 | Learning Phase | CPL < R$10 |
| S2 | R$60 (ou R$100 se S1 OK) | R$420-700 | Validação | ROAS > 1.5 |
| S3 | R$120-150 | R$840-1050 | Scaling + retarget | ROAS > 2.0 |
| S4+ | R$200+ | R$1400+ | Otimização | CAC < LTV/3 |

**Premissa base:** R$50/dia = R$1500/mês inicial. Se funcionar, escalar pra R$6000-10000/mês.

## Benchmarks (targets)

| Métrica | Target S1 | Target S2 | Target S3+ |
|---------|-----------|-----------|------------|
| **CPL (Custo por Lead)** | ≤ R$10 | ≤ R$8 | ≤ R$5 |
| **CTR (link)** | ≥ 1.0% | ≥ 1.5% | ≥ 2.0% |
| **CPM** | ≤ R$25 | ≤ R$20 | monitorar |
| **CPI (Custo por Install)** | ≤ R$4 | ≤ R$3 | ≤ R$2.50 |
| **CPT (Custo por Trial)** | ≤ R$15 | ≤ R$12 | ≤ R$8 |
| **Trial → Paid %** | (acompanhar) | ≥ 15% | ≥ 20% |
| **ROAS (Purchase)** | — | ≥ 1.5 | ≥ 2.0 |
| **Frequency** | ≤ 2.5 | ≤ 3.0 | ≤ 3.5 |

**Learning Phase (Meta):** 50+ conversions/ad set/semana. Com R$20/dia × 3 ad sets = R$140/semana. Se CPL R$10 → 14 leads/semana por ad set. **Abaixo do ideal**, mas aceitável para validação inicial.

## Semana 1 (Dias 1-7) — LEARNING PHASE

### Setup
- **Budget total:** R$50/dia
  - Campaign 1 (Leads): R$20/dia CBO
  - Campaign 2 (App Install): R$30/dia CBO
  - Campaign 3 (Retarget): **NÃO ATIVAR** (ainda sem audience)
- **Bid strategy:** Lowest cost (sem cap)
- **Placements:** Advantage+ (todos)

### Regras
- **NÃO mexer** em nada nos primeiros 3 dias (learning phase)
- **NÃO pausar ads** por ruído (< 500 impressions)
- Se `CPL > R$15` **em 48h** em algum ad set → pausar só esse ad set (ver kill-switches.md)

### Check-in (Dia 4 manhã)
- Revisar ad set level: qual está performando?
- Se 1 ad set com 50% menor CPL → começar a consolidar budget
- **NÃO scale ainda** (72h regra)

### Check-in (Dia 7)
- Consolidar resultados. Decidir S2.

## Semana 2 (Dias 8-14) — VALIDAÇÃO + PRIMEIRO SCALE

### Condições para scale +20% (obrigatório cumprir TODAS)
1. Ad set rodou ≥ 72h sem mudanças
2. CPL dentro do target (≤ R$10 Lead, ≤ R$4 Install)
3. Frequency < 3.0
4. ROAS ≥ 1.2 (se já tem dados de Purchase)
5. Nenhum erro 429 nas últimas 24h
6. Sem erro de Learning Phase ("Learning Limited")

### Se TODAS OK:
- Scale **+20%** no budget da campaign (ex: R$20 → R$24 no Lead, R$30 → R$36 no Install)
- Aguardar **mais 72h** antes de novo scale
- Max 2 scales por semana (+20% × 2 = +44% total)

### Se alguma condição falha:
- **NÃO escalar** essa semana
- Investigar: criativo cansado? Audience saturada? CPM subiu?
- Criativo refresh: rodar 2 novos ads com copy variation diferente (ângulo não testado)

### Ativar Retargeting (Dia 14)
- Campaign 3 com R$10/dia ABO
- Audience: Visitors 30d + Email openers
- Ads: 2 variantes focadas em "Você já conhece o Rumo Pragas…"

## Semana 3+ — SCALING + OTIMIZAÇÃO

### Condições para scale agressivo (+50% em uma campaign)
1. ROAS ≥ 2.0 por 7 dias seguidos
2. LTV/CAC ≥ 3
3. 2+ criativos evergreen identificados
4. Frequency < 3.5

### NUNCA:
- **Dobrar budget** de um dia pro outro (+100%)
- Escalar **mais de +20%** em ad set nível (use campaign CBO)
- Escalar **durante weekend** (pouca conversão, frequency sobe)
- Scale em **2 ad sets ao mesmo tempo** da mesma campaign

### Horizontal scaling (preferível a vertical)
- Clonar ad set vencedor com audience levemente diferente
- Criar novo ad set com novo ângulo criativo
- Expandir geo (adicionar 2-3 novos estados)

## Kill triggers (resumo — detalhe em kill-switches.md)

| Métrica | Threshold | Ação |
|---------|-----------|------|
| CPL | > R$15 em 48h | Pausar ad set |
| Frequency | > 3.5 | Rotacionar creative |
| CTR | < 0.8% em 24h | Pausar ad individual |
| Relevance Score | < 4/10 | Revisar creative |
| Spend spike | > 2× esperado em 4h | Investigar fraude + pausar |

## Cronograma de writes à Marketing API

Respeitando ZERO-B (`WRITE_INTERVAL_MS >= 1500`, `MAX_WRITES_PER_5MIN = 15`):

| Ação | Writes estimados | Quando |
|------|------------------|--------|
| Setup inicial (campaigns + adsets + audiences + creatives + ads) | ~35 writes | Dia 0, batch em 15min |
| Check-in diário | 0-2 writes | Diário (só se rebalanceamento) |
| Scale (+20%) | 1 write | Semanal máx |
| Pause ad set | 1 write | Só se trigger |
| Unpause ad set | 1 write | Só após 24h cooldown |

**Setup inicial deve ser fracionado:**
- Bloco 1 (15 writes): campaigns + 5 ad sets (5-10min, 1.5s entre cada)
- Aguardar **10 min**
- Bloco 2 (15 writes): creatives + ads
- Aguardar **10 min**
- Bloco 3 (5 writes): exclusion audiences + final setup

## Limite máximo de gasto (hard cap)

Configurar em Business Manager:
- **Account spending limit:** R$1500 no mês inicial
- **Daily spend cap:** R$80 (50% acima do budget pra margem de flutuação)
- Alerta WhatsApp se gasto diário > R$70

## Saída Learning Phase

Meta requer **50 conversions/semana** por ad set.

Se após **14 dias** algum ad set ainda em "Learning Limited":
1. Consolidar: mover budget pro ad set com melhor performance
2. Evento de otimização mais alto no funil (ex: Lead em vez de StartTrial)
3. Broader audience (Advantage+ Audience)
4. Não "lowest cost" → tentar "cost cap" (Meta dá mais volume às vezes)

## Pendências pra Manoel aprovar antes de ativar

- [ ] Confirmar budget total mensal inicial: R$1500 ou outro valor?
- [ ] Aprovar split 40/60 (R$20 Lead / R$30 Install)?
- [ ] Setar account spending limit no Business Manager
- [ ] Configurar alerta WhatsApp para gasto > R$70/dia
- [ ] Decidir: pausar campaign 1 (Leads) ou 2 (Install) se S1 mostrar 1 muito superior?
