# Product Hunt Launch — Rumo Pragas

**Categoria:** Artificial Intelligence + Mobile Apps + Agriculture/Food
**Launch day target:** Tuesday (Tue/Wed best for top 5 rank)
**Hunter:** Manoel Nascimento (self-hunt OK pra first launch)
**Makers:** Manoel Nascimento + AgroRumo team

---

## TAGLINE (60 chars max)

### Principal
```
Identify crop pests in 5 seconds with AI. Brazilian farm-tested.
```
**Char count:** 60

### Alternativas
- `AI pest identification for farmers — 82.5% accuracy.` (53 chars)
- `Snap a leaf. Get instant pest diagnosis. 82.5% accurate.` (56 chars)
- `Claude Vision for crop pest ID. Built for Brazilian farms.` (58 chars)

**Recomendação:** Versão principal — balances AI + specificity + regional proof.

---

## DESCRIPTION (260 chars max)

```
Rumo Pragas uses AI to identify crop pests from a single leaf photo in 5 seconds — with 82.5% accuracy validated in real Brazilian fields. Covers 100+ pests in soy, corn, coffee, cotton. Includes AI agronomist chat, history, and PDF reports. Free to start.
```
**Char count:** 260

---

## FIRST COMMENT (founder voice)

```
Hey Product Hunt 👋

I'm Manoel, founder of AgroRumo, and today I'm launching Rumo Pragas.

**The story:**

Six months ago, a farmer friend of mine lost 30% of his soy crop in 48 hours to Asian rust. He's been farming for 12 years. The problem wasn't experience — it was that identifying crop pests by eye requires expertise that isn't always available at 6pm when you're alone in the field.

Brazil has 5 million farmers. Asian rust alone costs the country ~$2 billion per year. And yet, the primary tools are: (1) your own eyes, (2) calling an agronomist (often unavailable), or (3) a pest guide published in 2015.

**What we built:**

Rumo Pragas is a mobile app that:

- Identifies pests from a leaf photo in 5 seconds
- Trained on 100+ pests across soy, corn, coffee, cotton
- 82.5% accuracy validated in real fields (not lab) in Goiás, Mato Grosso, Paraná
- Chat with an AI agronomist (built on Claude)
- Full history + PDF export for buyers/insurance

**Technical:**

We use Claude Vision (Anthropic) as the base model, fine-tuned with real imagery from Brazilian farms during the 2025/2026 season. Unlike generic pest ID solutions trained on US/European data, ours is calibrated for regional variants that matter here.

**Pricing:**

Free to start. Premium ($4.99/mo) unlocks unlimited history, extended AI chat, and PDF exports — launching Q2 2026.

**What I'd love from PH:**

1. Any feedback on the onboarding flow (pragas.agrorumo.com)
2. If you know farmers, send them our way — their feedback improves the model
3. Developers: tell me what you'd add if you were building this

Happy to answer any questions. I'll be here all day.

Cheers from Brazil 🌾
Manoel
```

---

## LAUNCH DAY CHECKLIST

### T-7 days (1 week before)

- [ ] Lock in launch date (Tuesday preferred)
- [ ] Add "Coming Soon" page on Product Hunt
- [ ] Set up notification signup → email list of supporters
- [ ] Reach out to 50+ contacts who will comment/upvote on launch day (DO NOT ask for upvotes explicitly — against PH rules)
- [ ] Prepare gallery images (6x, each 1270x760):
  - [ ] Hero shot: app screen + "5 seconds to identify any pest"
  - [ ] Step 1: Take photo
  - [ ] Step 2: AI analyzes
  - [ ] Step 3: Diagnosis + recommendation
  - [ ] Chat with AI agronomist screen
  - [ ] History + PDF export
- [ ] Prepare GIF/video demo (30s max, shows app in action)
- [ ] Write 10+ pre-written comments/responses for expected questions (save as draft)

### T-3 days

- [ ] Confirm Product Hunt page is error-free
- [ ] Test all links (iOS, Android, web landing)
- [ ] Prepare Twitter thread for launch day
- [ ] Draft LinkedIn post announcing PH launch
- [ ] Ensure app is stable — no bugs in onboarding on day 0

### T-1 day

- [ ] Email supporters: "Tomorrow we launch on PH — here's the link: [link]"
- [ ] Post in relevant Slack/Discord communities (Maker communities: Indie Hackers, WIP, etc.)
- [ ] Schedule LinkedIn + Twitter posts for 00:01 PST (PH launch time)

### Launch day (Tuesday, 00:01 PST / 05:01 BRT)

- [ ] **00:01 PST** — Product goes live on PH
- [ ] **00:05 PST** — Post first comment (Manoel voice, above)
- [ ] **01:00 PST** — Post on Twitter, LinkedIn, personal networks
- [ ] **03:00 PST** — Start responding to every comment within 15min
- [ ] **06:00 PST** — Post update with early milestones
- [ ] **09:00 PST** — LinkedIn announcement post
- [ ] **12:00 PST** — Email blast to waitlist
- [ ] **15:00 PST** — Twitter thread with product demo video
- [ ] **18:00 PST** — Reddit posts (r/SideProject, r/agriculture, r/brasil)
- [ ] **21:00 PST** — Check rank, thank community, share final push message
- [ ] **23:59 PST** — Final ranking locked in

### T+1 (post launch)

- [ ] Write "What we learned" post (LinkedIn + Twitter)
- [ ] Thank everyone who commented/upvoted individually
- [ ] Analyze traffic: PH → landing → install conversion rate
- [ ] Apply learnings to next launch (ProductHunt offers 2 launches per product per year)

---

## RANK STRATEGY (top 5 target)

Based on 2026 PH benchmarks:

| Rank | Approx. upvotes needed |
|------|------------------------|
| #1 | 500+ |
| Top 5 | 200-400 |
| Top 10 | 100-200 |

**Realistic target for first-time launcher in agri-tech niche:** Top 10-15 (AI apps category is saturated; agriculture gives us differentiation).

**Key tactics:**
1. **Quality comments over upvote count** — PH algorithm weighs engagement
2. **Reply to every single comment** — ideally within 10min
3. **Cross-promote** — Twitter (main), LinkedIn (Brazil market), Reddit (niche)
4. **Avoid:** Asking people to upvote explicitly (ban risk), vote manipulation, fake accounts

---

## RISKS + MITIGATION

| Risk | Mitigation |
|------|------------|
| PH community mostly US/English — agriculture niche lowers engagement | Focus messaging on "AI for farmers" angle (universal), add Brazilian context as proof |
| App only works in Brazilian Portuguese | Mention English UI is "coming Q3 2026" in first comment |
| Competitor hunts same day | Check PH upcoming every 24h before launch — pivot day if needed |
| Server overload on launch | Test Supabase + Vercel limits beforehand, enable caching |
| Negative feedback on accuracy (82.5% vs. claims of "100%" competitors) | Lean in: "We validated in real fields, not lab. We'd rather be honest at 82.5% than dishonest at 100%" |

---

## ASSETS REQUIRED (prepare before launch)

- [ ] Product logo (240x240 PNG, transparent bg)
- [ ] Gallery images (6x at 1270x760)
- [ ] Demo video/GIF (MP4 or GIF, <30s, <10MB)
- [ ] Website link: https://pragas.agrorumo.com
- [ ] iOS link: https://apps.apple.com/br/app/id6762232682
- [ ] Android link: https://play.google.com/store/apps/details?id=com.agrorumo.rumopragas
- [ ] Press kit link: https://agrorumo.com/press/rumo-pragas
- [ ] Tags: ai, mobile-apps, agriculture, productivity, saas, brazilian

---

## NOTAS DE PRODUÇÃO

- **Timezone crítico:** PH resets às 00:00 PST (05:00 BRT). Launch precisa ser nesse horário exato.
- **Self-hunt é OK em 2026** (regra mudou em 2023). Mas ter alguém respeitado PH pra promover aumenta reach.
- **Makers tag:** Adicionar co-founders, devs principais, designers. Ajuda no social proof inicial.
- **Launch 2x por ano:** PH permite re-launch major versions. Planejar PH #2 em 6 meses com "v2.0 — new cultures + English UI".
- **Post-launch SEO:** Página do PH rankeia muito bem no Google por meses. Usar como permanent landing source.
