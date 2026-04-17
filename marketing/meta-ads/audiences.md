# Audiences — Rumo Pragas

> **DRY-RUN.** Definições para criar via `mcp__facebook-ads__create_custom_audience` e `create_lookalike_audience` após aprovação.

## §1. Core — Produtores Soja (interesses)

```yaml
name: CORE_Soja_BR_25-65_20260418
geo:
  countries: [BR]
  regions: [MT, MS, GO, BA, PR, SP, MG, RS, TO, MA, PA, PI]  # top 12 estados agro
age_min: 25
age_max: 65
gender: all
languages: [pt_BR]
interests:
  - id: "6003237530498"  # Agriculture
  - id: "6003125568581"  # Soybean
  - id: "6003522921821"  # Agribusiness
  - id: "6003106413921"  # Farming
  - id: "6003457912171"  # John Deere
  - id: "6003269122441"  # Embrapa
behaviors:
  - "Small business owners"  # proxy pra produtor
device:
  platforms: [mobile]  # prioridade mobile (app install)
  os: [iOS, Android]
exclusions:
  - custom_audience: Existing_Customers_All
  - custom_audience: App_Installed_Last_30d
  - custom_audience: Trial_Started_Last_30d
expected_reach_estimate: 2.5M - 4.5M  # validar com estimate_audience_size
```

## §2. Core — Produtores Café + Milho (interesses)

```yaml
name: CORE_CafeMilho_BR_25-65_20260418
geo:
  countries: [BR]
  regions: [MG, SP, ES, BA, GO, MT, MS, PR, RS]  # café em MG/ES, milho CS
age_min: 25
age_max: 65
languages: [pt_BR]
interests:
  - id: "6003125568581"  # Coffee production
  - id: "6003524030466"  # Corn
  - id: "6003522921821"  # Agribusiness
  - id: "6003237530498"  # Agriculture
  - id: "6003269122441"  # Embrapa
  - "AgroShow"
  - "Expodireto"
  - "Farm Show"
exclusions:
  - custom_audience: Existing_Customers_All
  - custom_audience: App_Installed_Last_30d
expected_reach_estimate: 1.8M - 3.2M
```

## §3. Lookalike 1% — Waitlist

```yaml
name: LAL1_Waitlist_BR_20260418
source: Custom_Audience_Waitlist_Emails  # gerar a partir do Supabase
  # SQL:
  #   SELECT email, phone, created_at
  #   FROM waitlist
  #   WHERE app = 'rumo-pragas'
  #     AND unsubscribed_at IS NULL
  #   ORDER BY created_at DESC
lookalike_spec:
  country: BR
  ratio: 0.01  # top 1%
  type: similarity  # focus quality over reach
activate_when: source_audience_size >= 100
  # Meta exige min 100 seed; recomenda 1000+ para qualidade
expected_reach_estimate: 2.1M  # ~1% de 210M Brasil
```

**Se waitlist < 100 emails:** usar §2 (Core CafeMilho) como proxy enquanto acumula.

## §4. Core — Agro BR Broad (fallback)

```yaml
name: CORE_AgroBR_Broad_20260418
geo:
  countries: [BR]
age_min: 25
age_max: 60
languages: [pt_BR]
interests: []  # DELIBERADAMENTE VAZIO — Advantage+ Audience
advantage_audience: true  # deixar algoritmo encontrar
exclusions:
  - custom_audience: App_Installed_Last_30d
  - custom_audience: Trial_Started_Last_30d
expected_reach_estimate: 15M+  # broad pra Meta otimizar
```

## §5. Retargeting — Visitors Landing + Email

```yaml
name: RETARGET_Engaged_30d_20260501  # ativar só depois de 14d de tráfego
sources:
  - pixel_event: PageView
    retention_days: 30
    url_contains: ["pragas.agrorumo.com"]
  - pixel_event: ViewContent
    retention_days: 30
  - custom_audience: Email_Openers_Last_14d  # do Resend MCP
  - instagram_engagers_365d: true
  - facebook_engagers_365d: true
exclusions:
  - custom_audience: Trial_Started_Last_30d
  - custom_audience: App_Installed_Last_30d
  - custom_audience: Existing_Customers_All
expected_reach_estimate: depende do volume (validar após 2 semanas)
```

## §6. Exclusões globais (aplicar em toda campanha)

```yaml
global_exclusions:
  - custom_audience: Existing_Customers_All
    source: Supabase subscriptions WHERE status IN ('active', 'trialing')
  - custom_audience: App_Installed_Last_30d
    source: App event install via CAPI
  - custom_audience: Trial_Started_Last_30d
    source: Pixel event StartTrial + App event trial_started
  - custom_audience: Competitors_Employees  # opcional — profissionais de concorrentes
    source: manual (Plantix, AgriCheck, PlantNet)
```

## Custom Audiences a criar (ordem)

1. `CA_Existing_Customers_All` — via Supabase export (LTV segmentado pra futuro LAL)
2. `CA_App_Installed_Last_30d` — App Event
3. `CA_Trial_Started_Last_30d` — Pixel + App Event
4. `CA_Waitlist_Emails_All` — Supabase export (seed para LAL §3)
5. `CA_Website_Visitors_30d` — Pixel
6. `CA_Website_Visitors_180d` — Pixel (pra retargeting longo)

## Tamanho mínimo (regra Meta)

- Custom Audience: **100 usuários** mínimo pra targetar
- Lookalike: **100 seed** mínimo (recomendado 1000+)
- Se < 100 em qualquer fonte: usar audiência de interesse como proxy

## Validação antes de ativar

Rodar (após aprovação de Manoel):
```
mcp__facebook-ads__estimate_audience_size  # para cada ad set
mcp__facebook-ads__get_audience_insights    # demographic breakdown
```

Se reach estimado for < 500k para uma audience core: revisitar geo/interesses.
