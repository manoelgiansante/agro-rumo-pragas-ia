# Meta Ads Copy — Rumo Pragas Launch (5 variações cada)

**Objetivo da campanha:** App Install (iOS + Android)
**Orçamento inicial sugerido:** R$100/dia por 7 dias (R$700 test budget)
**Targeting:** Brasil, 25-55 anos, interesses: agricultura, soja, pecuária, agronegócio, fazenda, máquinas agrícolas; comportamentos: pequenos produtores rurais, owners de pequenos negócios agro
**Placements:** Feed Instagram + Facebook + Reels (iniciar, depois expandir com winner)
**CBO:** Advantage+ Campaign Budget, deixar algoritmo distribuir entre criativos

---

## PRIMARY TEXT (125 chars) — 5 VARIAÇÕES

### V1 — Dor/número
```
Ferrugem asiática leva 48h pra identificar. 30% da safra pode ir embora. Agora são 5 segundos. Baixa grátis.
```
**Char count:** 119

### V2 — Pergunta direta
```
Já perdeu lavoura porque demorou pra identificar a praga? Esse app resolve em 5 segundos com foto. 82,5% de acurácia.
```
**Char count:** 125

### V3 — Prova social hard
```
82,5% de acurácia validada em campo. Tira foto da folha, IA identifica a praga na hora. Soja, milho, café, algodão.
```
**Char count:** 123

### V4 — Story do fundador
```
"Meu amigo perdeu 30% da soja em 48h pra ferrugem." Por isso construí o Rumo Pragas. IA identifica praga em 5s.
```
**Char count:** 122

### V5 — Benefício concreto
```
Identifique praga agrícola em 5 segundos com a câmera do celular. Grátis pra começar. iOS + Android. 🌾
```
**Char count:** 113

---

## HEADLINES (27 chars) — 5 VARIAÇÕES

### V1 — Dor
```
Praga identificada em 5s
```
**Char count:** 24

### V2 — Dado
```
82,5% acurácia em campo
```
**Char count:** 23

### V3 — Ação
```
Foto → Diagnóstico → Ação
```
**Char count:** 25

### V4 — Simples
```
Rumo Pragas. Grátis. 🌾
```
**Char count:** 22

### V5 — Resultado
```
Salve sua safra. Baixe já.
```
**Char count:** 26

---

## CTA BUTTONS — 5 VARIAÇÕES (testar qual converte melhor)

1. **Baixar** — Direto, mais universal
2. **Instalar Agora** — Urgência suave
3. **Saiba Mais** — Soft-sell, gera mais tráfego pra landing pra qualificar
4. **Experimente Grátis** — Reforça "free to start"
5. **Baixar App** — Explicit app install

**Recomendação:** Começar com "Baixar" em 3 ad sets + "Experimente Grátis" em 2 ad sets. Depois de 72h, escalar o winner.

---

## MATRIZ DE TESTE (5x5 = 25 combinações no Advantage+)

Advantage+ Creative permite combinar 5 primary text + 5 headlines + 5 CTAs automaticamente. O algoritmo Meta testa todas as combinações e destaca winners.

| Dimensão | Total |
|----------|-------|
| Primary text | 5 |
| Headlines | 5 |
| CTAs | 5 |
| **Total combinações** | **125** (Meta escolhe automaticamente) |

---

## ASSETS DE IMAGEM/VÍDEO (recomendação)

### Criativo 1 — Vídeo demo 15s (reuso TikTok)
Screen record do app + voz off + texto on-screen

### Criativo 2 — Carrossel 5 cards
- Card 1: Problema (folha com ferrugem)
- Card 2: Frustração (celular no campo)
- Card 3: Solução (app abrindo)
- Card 4: Resultado (diagnóstico)
- Card 5: CTA (download)

### Criativo 3 — Image estática 1:1
Split-screen: folha com praga (esquerda) + tela do app com diagnóstico (direita) + overlay "82,5% ACURÁCIA"

### Criativo 4 — Vídeo testimonial 20s
Produtor real (Rafael ou similar) falando pra câmera + b-roll lavoura

### Criativo 5 — Static com números gigantes
Fundo verde + "82,5%" gigante + subtexto "acurácia validada em campo"

---

## SAFETY RULES APLICADAS (anti-ban)

Conforme `critical_meta_ads_anti_ban.md`:

✅ Sem income claims ("ganhe R$X", "economize garantido")
✅ Sem before/after sem disclaimer
✅ Sem health claims ("cura", "garantido")
✅ Sem escassez falsa ("últimos dias", "só hoje")
✅ Criar ads manualmente, não via loop automatizado
✅ Não criar >5 ads de uma vez (mass create)
✅ Respeitar WRITE_INTERVAL_MS >= 1500 se criar via API
✅ Audit log em `ads_actions_log` antes/depois de cada write
✅ NÃO subir campanha entre 23h-6h BRT

**Compliance agro adicional:**
- Evitar recomendações específicas de produto químico nos ads (nome de fungicida/inseticida) — Lei 7.802/89 impõe restrições
- Sempre mencionar "IA" ou "app" como ferramenta de apoio, nunca substituto de agrônomo
- Não prometer "100% de identificação" — sempre usar "82,5% de acurácia validada"

---

## MÉTRICAS DE SUCESSO (benchmark launch week)

| Métrica | Benchmark agro BR | Meta Rumo Pragas |
|---------|-------------------|------------------|
| CTR | 1,2-1,8% | 1,5%+ |
| CPM | R$15-25 | < R$30 |
| CPI (cost per install) | R$8-15 | < R$12 |
| Install → Open rate | 70%+ | 80%+ |
| Cost per signup | R$15-25 | < R$20 |

---

## KILL CRITERIA (quando pausar)

- CTR < 0,5% em 48h com >R$100 gastos → pausar ad set
- CPI > R$25 em 48h com >R$150 gastos → pausar ad set
- Frequência > 5.0 → adicionar novos criativos ou ampliar audience
- Zero conversões em 72h com R$200 gastos → reavaliar targeting completo

**Regra de escala (Safety Rules):** Aguardar 72h entre scale-ups. Máximo +20% por scale. Nunca escalar em fim de semana.
