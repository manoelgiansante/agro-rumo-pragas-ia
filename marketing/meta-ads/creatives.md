# Creatives — Rumo Pragas Launch

> **DRY-RUN.** Briefing dos 3 creatives iniciais. Copy em `marketing/meta-ads-copy.md` (já existe — 9 headlines × 9 primary × 9 descriptions = 81 combinações possíveis).

## Princípios (meta-ads skill)

- Hook nos primeiros 3 segundos (retenção cai 50% após 3s)
- Text overlay < 20% da área da imagem (Meta penaliza se >20%)
- Vertical 9:16 para Stories/Reels, 1:1 para Feed, 16:9 para Feed desktop
- 3-5 variantes por ad set (evita fatigue cedo)
- Refresh quando frequency > 3.5 (ver kill-switches.md)

## Creative A — Video 15s (PRINCIPAL)

**Formato:** 9:16 vertical, 15 segundos, legendas queimadas
**Ângulo:** SOLUÇÃO — foto → diagnóstico (Ângulo 2 do meta-ads-copy.md)
**Uso:** Ad Set 1.2, 2.1, 2.2

### Storyboard

| Segundo | Visual | Texto overlay | Áudio |
|---------|--------|---------------|-------|
| 0-2 | Close em folha de soja com mancha (foco) | "Praga atacando a lavoura?" | Som ambiente (vento) |
| 2-5 | Mão com celular apontando pra folha — câmera do app aberta | "Tire uma foto." | Click simulado |
| 5-9 | Screen recording do app: loading → resultado "Ferrugem Asiática — 92% confiança" | "IA identifica em segundos." | Tick sonoro |
| 9-12 | PDF laudo na tela, compartilhamento WhatsApp | "Laudo pro agrônomo em PDF." | Whoosh |
| 12-15 | Logo Rumo Pragas + CTA "Baixe grátis 7 dias" | "Rumo Pragas — 7 dias grátis" | VO: "Rumo Pragas" |

### Spec técnica
- Resolução: 1080×1920 (9:16)
- Framerate: 30fps
- Duração: 15s (máximo 15s para Reels)
- Audio: mandatório (85% users assistem com som)
- Legendas: queimadas (85% users assistem muted no início)
- Logo: 3 últimos segundos
- Disclaimer texto pequeno (canto): "Ferramenta auxiliar. Não substitui receituário agronômico."

### Produção
- **Opção 1 (fast):** Gerar via `ai-video-generation` skill + `ai-marketing-videos` skill
  - Modelo sugerido: **Seedance 2.0 image-to-video** ou **Veo 3.1**
  - Seed: screenshot real da câmera do app + still da folha
- **Opção 2 (quality):** Gravação real no campo (MT/MS) — escalar com produtor parceiro
- **Opção 3 (hybrid):** Screen recording real do app + b-roll AI gerado

### Copy bundle (primário)
- **Primary text:** meta-ads-copy.md §Ângulo 2, variação 1
  > "Aponta a câmera para a folha, tira a foto e pronto: o Rumo Pragas mostra a praga mais provável, o nível de severidade e o que os técnicos costumam recomendam. Funciona até sem sinal no campo — processa quando a internet voltar. 7 dias grátis para testar."
- **Headline:** "Tire uma foto. A IA identifica."
- **Description:** "Foto → IA → resultado."
- **CTA:** "Baixar"
- **Destination:** App Store / Play Store (dynamic — Meta detecta device)

---

## Creative B — Carrossel 5 cards (1:1)

**Formato:** 5 cards, 1080×1080 (1:1), imagens estáticas
**Ângulo:** DOR → SOLUÇÃO → ROI
**Uso:** Ad Set 1.1, 1.3

### Cards

| Card | Imagem | Headline | Body |
|------|--------|----------|------|
| 1 | Folha com lagarta visível + ícone de lupa | "Identificou essa praga?" | "Se você demorar, ela se espalha. Veja como agir na hora." |
| 2 | Smartphone apontando pra lavoura | "Tire uma foto." | "A câmera do seu celular vira um diagnóstico." |
| 3 | Screen do app com resultado "Percevejo Marrom — 89%" | "IA treinada com lavouras BR." | "+500 pragas catalogadas. 30+ culturas." |
| 4 | PDF laudo sendo compartilhado WhatsApp | "Mande pro agrônomo." | "Laudo profissional em PDF. Decisão mais rápida." |
| 5 | Logo + CTA "7 dias grátis, sem cartão" | "Baixe o Rumo Pragas." | "Sem cartão. Cancele quando quiser." |

### Spec técnica
- Resolução: 1080×1080 cada card
- Text < 20% da imagem (verificar com Meta Text Overlay Tool)
- Ordem dos cards: fixa (não random)
- Link por card: mesmo destino (landing ou app store)
- Disclaimer (card 3 ou 5, texto pequeno): "Ferramenta auxiliar. Lei 7.802/89."

### Produção
- **Imagens:** Gerar via `ai-image-generation` (FLUX Dev LoRA ou Gemini 3 Pro Image)
- **Screenshots app:** reais (já existem em `rumo-pragas/assets/`)
- **Design final:** Canva MCP (`mcp__canva__canva_create_designs`) usando brand colors

### Copy bundle
- **Primary text:** meta-ads-copy.md §Ângulo 1, variação 2
- **CTA:** "Saiba Mais" (leva pra landing, não pro app direto — leads)
- **Destination:** https://pragas.agrorumo.com/?utm_source=meta&utm_campaign=launch_carousel

---

## Creative C — Single Image (1:1)

**Formato:** 1080×1080, imagem estática
**Ângulo:** ROI — "Descobrir cedo = perder menos"
**Uso:** Ad Set 1.3, 2.2

### Conceito

Hero shot: produtor sorrindo, segurando smartphone com app aberto, lavoura de soja ao fundo, golden hour. Textura real (não AI slop).

**Text overlay (< 20%):**
- Topo: "Descubra a praga antes que ela se alastre"
- Rodapé: "7 dias grátis · Rumo Pragas" + logo

### Spec técnica
- Resolução: 1080×1080
- 4K se possível (Meta faz downscale bem)
- Produção: foto real > AI. Se AI: FLUX com seed consistent
- Text overlay manual (não deixar AI escrever texto — vira gibberish)

### Produção
- **Opção 1:** Foto real com produtor parceiro (MT) — melhor ROAS histórico
- **Opção 2:** FLUX Dev + retoque no Canva
- **Opção 3:** Imagem do Unsplash com overlay (rápido)

### Copy bundle
- **Primary text:** meta-ads-copy.md §Ângulo 3, variação 3
  > "Quanto vale descobrir uma praga 3 dias antes? No Rumo Pragas o diagnóstico sai em segundos, a partir de uma foto do celular — e fica salvo no histórico pra comparar ao longo da safra. 7 dias grátis, sem cartão."
- **Headline:** "Decida o manejo antes da praga se alastrar."
- **Description:** "Trial 7 dias. Sem cartão."
- **CTA:** "Baixar"

---

## Variantes adicionais (A/B test na mesma ad set)

Cada ad set roda **3 ads**, combinando:

| Ad Set | Creative | Angle | Copy variation |
|--------|----------|-------|----------------|
| 1.1 Soja | B (carrossel) | DOR | §1.1 |
| 1.1 Soja | A (video 15s) | SOLUÇÃO | §2.1 |
| 1.1 Soja | C (single img) | DOR | §1.3 |
| 1.2 CafeMilho | A (video 15s) | SOLUÇÃO | §2.2 |
| 1.2 CafeMilho | B (carrossel) | SOLUÇÃO | §2.1 |
| 1.2 CafeMilho | C (single img) | ROI | §3.1 |
| 1.3 Broad | A (video 15s) | SOLUÇÃO | §2.3 |
| 1.3 Broad | C (single img) | ROI | §3.2 |
| 1.3 Broad | B (carrossel) | ROI | §3.3 |
| 2.1 Lookalike | A (video 15s) | SOLUÇÃO | §2.1 |
| 2.1 Lookalike | C (single img) | ROI | §3.1 |
| 2.1 Lookalike | B (carrossel) | DOR | §1.2 |
| 2.2 Interesses | A (video 15s) | DOR | §1.1 |
| 2.2 Interesses | B (carrossel) | SOLUÇÃO | §2.2 |
| 2.2 Interesses | C (single img) | ROI | §3.3 |

**Total:** 15 ads, 9 copy variations (já escritas), 3 creatives bases.

## Produção checklist

- [ ] Creative A (video 15s) — gerar ou gravar
- [ ] Creative B (carrossel 5 cards) — design no Canva
- [ ] Creative C (single image) — foto ou AI
- [ ] Screenshots reais do app (3+ states) — já temos em assets/
- [ ] Validar text < 20% em todos (Meta Overlay Tool)
- [ ] Legendas queimadas nos vídeos
- [ ] Disclaimers legais em todos (Lei 7.802/89)
- [ ] Logo Rumo Pragas consistente (brand pack `~/AgroRumo Projetos/Brand Assets/`)
- [ ] Thumbnails de video definidos (primeiro frame ou override)

## Handoff

Depois da produção:
1. Upload via `mcp__facebook-ads__upload_creative_asset` (video + imagens)
2. Criar creatives via `mcp__facebook-ads__create_ad_creative`
3. Preview via `mcp__facebook-ads__preview_ad` — Manoel valida cada um
4. Só então atacha ao ad set e sobe ad (status PAUSED)
