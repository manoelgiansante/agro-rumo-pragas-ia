# Maestro E2E — Rumo Pragas IA

Testes end-to-end do app Rumo Pragas (bundle `com.agrorumo.rumopragas`).

## Pré-requisitos

- Maestro 2.x+ (`curl -Ls "https://get.maestro.mobile.dev" | bash`)
- Simulador iOS ou emulador Android rodando
- App instalado (via `expo-app/`):
  - iOS: `cd expo-app && npx expo run:ios`
  - Android: `cd expo-app && npx expo run:android`

## Flows

| Arquivo | Descrição | Tags |
|---|---|---|
| `onboarding.yaml` | Splash → tela inicial | `smoke`, `golden` |
| `auth.yaml` | Signup/login/forgot password | `auth` |
| `core-flow.yaml` | Câmera (mock) → diagnóstico IA | `golden`, `smoke` |
| `paywall.yaml` | Feature premium → paywall | `paywall`, `monetization` |
| `offline.yaml` | Sem conexão, feature de IA deve falhar gracioso | `offline`, `resilience` |

## Rodar

```bash
# Um flow
maestro test .maestro/core-flow.yaml

# Todos
maestro test .maestro/

# Por tag
maestro test .maestro/ --include-tags smoke
```

## Convenções

- Seletores regex bilíngue (PT/EN)
- Câmera/galeria: **sempre usar galeria mockada**, nunca tirar foto real em E2E
- `setAirplaneMode` em vez de shell commands para offline
