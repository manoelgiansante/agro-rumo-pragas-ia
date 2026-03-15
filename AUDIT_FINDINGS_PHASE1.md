# AUDIT FINDINGS — FASE 1: Raio-X + Auditoria Técnica

**Projeto:** agro-rumo-pragas-ia (RumoPragas)
**Data:** 2026-03-15
**Auditor:** Claude Opus (automação)
**Branch:** audit/cleanup-20260313

---

## 1. Resumo Executivo

O **Rumo Pragas** é um app iOS nativo escrito em **Swift/SwiftUI** (não Expo/React Native) para identificação de pragas agrícolas usando IA. O app permite ao produtor tirar foto de uma praga, selecionar a cultura, enviar para uma Edge Function Supabase que usa Agrio (visão computacional) + Claude (enriquecimento), e receber diagnóstico com tratamentos recomendados.

**Stack confirmada:** Swift 5.x, SwiftUI, iOS 18.0+, Supabase (auth + database + edge functions + storage), Open-Meteo API (clima), CoreLocation, PhotosUI, Security framework (Keychain).

**Maturidade:** MVP funcional avançado (~80% completo). O código é bem estruturado com MVVM limpo, mas tem pontos incompletos: favoritos não funcionam, sem testes reais, sem xcconfig para secrets, sem Info.plist separado, e dependência de Edge Functions que podem não estar publicadas.

**Nível:** Entre protótipo avançado e MVP — precisa de ~20% de trabalho para chegar a release candidate.

---

## 2. Raio-X Confirmado do Projeto

### 2.1 Estrutura Principal

```
agro-rumo-pragas-ia/
├── RumoPragas/                    # Código fonte do app
│   ├── RumoPragasApp.swift        # @main entry point
│   ├── ContentView.swift          # Auth gate + splash + routing
│   ├── Config.swift               # Configurações centralizadas
│   ├── Models/         (9 arquivos)
│   ├── Views/          (18 arquivos)
│   ├── ViewModels/     (7 arquivos)
│   ├── Services/       (6 arquivos)
│   └── Utilities/      (2 arquivos)
├── RumoPragas.xcodeproj/          # Projeto Xcode
├── RumoPragasTests/               # Testes unitários (skeleton)
├── RumoPragasUITests/             # UI tests (skeleton)
├── assets/images/                 # Ícones Expo legacy (não usado)
├── bun.lock                       # Artifact Expo/Rork (não pertence)
└── .gitignore
```

**Total:** 42 arquivos Swift no código fonte principal.

### 2.2 Entry Point e Lifecycle

- **Entry point:** `RumoPragasApp.swift` — `@main` + `WindowGroup` → `ContentView()`
- **Lifecycle:** SwiftUI App lifecycle (sem UIKit AppDelegate)
- **Locale forçado:** `pt_BR` via `.environment(\.locale)`
- **ContentView.swift** atua como auth gate:
  1. SplashView por 1.5s
  2. Se `!hasSeenOnboarding` → OnboardingView
  3. Se `!isAuthenticated` → AuthView
  4. Se autenticado → MainTabView
- **Dark mode:** `@AppStorage("isDarkMode")`

### 2.3 Arquitetura

**MVVM corretamente implementado:**
- Views → consomem ViewModels via `@State`
- ViewModels → `@Observable` + `@MainActor`, chamam Services
- Services → singletons (`static let shared`), `Sendable`, `nonisolated`
- Models → structs `Codable + Sendable + Identifiable`

### 2.4 Telas (18 Views)

| View | Arquivo | Descrição |
|------|---------|-----------|
| SplashView | ContentView.swift | Splash animada com folha |
| OnboardingView | Views/OnboardingView.swift | Introdução |
| AuthView | Views/AuthView.swift | Login/cadastro |
| MainTabView | Views/MainTabView.swift | 5 tabs |
| HomeView | Views/HomeView.swift | Home com clima, scan, stats |
| DiagnosisFlowView | Views/DiagnosisFlowView.swift | Fluxo de diagnóstico |
| CameraPickerView | Views/CameraPickerView.swift | Câmera |
| CropSelectorSheet | Views/CropSelectorSheet.swift | Seleção de cultura |
| DiagnosisLoadingView | Views/DiagnosisLoadingView.swift | Loading animado |
| DiagnosisResultView | Views/DiagnosisResultView.swift | Resultado |
| DiagnosisCardView | Views/DiagnosisCardView.swift | Card de diagnóstico |
| HistoryView | Views/HistoryView.swift | Histórico |
| LibraryView | Views/LibraryView.swift | Biblioteca de pragas |
| PestDetailView | Views/PestDetailView.swift | Detalhe praga |
| AIChatView | Views/AIChatView.swift | Chat IA |
| MonitoringView | Views/MonitoringView.swift | Monitoramento |
| SettingsView | Views/SettingsView.swift | Configurações |
| EditProfileSheet | Views/EditProfileSheet.swift | Editar perfil |
| PaywallView | Views/PaywallView.swift | Paywall |

### 2.5 ViewModels (7)

| ViewModel | Responsabilidade |
|-----------|------------------|
| AuthViewModel | Auth completo (login, signup, logout, refresh, validate) |
| HomeViewModel | Clima, último diagnóstico, contagem, tips |
| DiagnosisViewModel | Diagnóstico IA (compressão, envio, parse) |
| HistoryViewModel | Lista de diagnósticos, filtros, delete |
| LibraryViewModel | Biblioteca de pragas, busca, filtro por cultura |
| AIChatViewModel | Chat com IA |
| SettingsViewModel | Perfil, preferências |

### 2.6 Services (6)

| Service | Responsabilidade |
|---------|------------------|
| SupabaseService | Auth REST, Database REST, Edge Functions, Storage |
| AIChatService | Chat IA via toolkit URL (sem auth!) |
| KeychainService | Armazenamento seguro de tokens |
| LocationService | GPS + geocoding reverso |
| WeatherService | API Open-Meteo (gratuita) |
| PestDataService | Banco local de pragas hardcoded (~51KB) |

### 2.7 Models (9)

DiagnosisResult, Pest, CropType (18 culturas), ConfidenceLevel, SeverityLevel, ChatMessage, UserProfile, SubscriptionPlan, WeatherData.

Submodels: AgrioNotesData, AgrioPrediction, AgrioEnrichment, AgrioProduct, AuthResponse, SupabaseUser, UserMetadata, APIError.

### 2.8 Fluxo de Navegação

```
App Launch → SplashView (1.5s) → validateSession()
  ├→ OnboardingView → AuthView
  ├→ AuthView (login/signup)
  └→ MainTabView
       ├─ Tab 0: HomeView → DiagnosisFlowView (foto→cultura→loading→resultado)
       ├─ Tab 1: HistoryView
       ├─ Tab 2: LibraryView → PestDetailView
       ├─ Tab 3: AIChatView
       └─ Tab 4: SettingsView → EditProfileSheet / PaywallView
```

### 2.9 Autenticação — IMPLEMENTADA

- E-mail + senha via Supabase Auth REST API
- Sign up, sign in, sign out, reset password, token refresh
- Tokens em Keychain (Security framework)
- Legacy migration UserDefaults → Keychain

**Confirmado em:** AuthViewModel.swift, SupabaseService.swift, KeychainService.swift

### 2.10 Persistência

- **Local:** Keychain (tokens), @AppStorage (onboarding, dark mode)
- **Remota:** Supabase REST (tabelas: `pragas_diagnoses`, `pragas_profiles`)
- **Cache offline:** NÃO implementado
- **Biblioteca de pragas:** Hardcoded em PestDataService.swift

### 2.11 Integrações

| Integração | Status |
|------------|--------|
| Supabase Auth | ✅ Confirmado |
| Supabase Database REST | ✅ Confirmado |
| Supabase Edge Function "diagnose" | ✅ Configurado, depende de deploy |
| Chat IA (toolkit URL) | ⚠️ Sem auth, URL pode estar vazia |
| Open-Meteo API (clima) | ✅ Funcional, sem chave |
| CoreLocation (GPS) | ✅ Confirmado |
| Câmera (UIImagePickerController) | ✅ Confirmado |
| Galeria (PhotosUI) | ✅ Confirmado |

### 2.12 Permissões Declaradas

Confirmado em `project.pbxproj` (linhas 404-406, 440-442):
- NSCameraUsageDescription ✅
- NSLocationWhenInUseUsageDescription ✅
- NSPhotoLibraryUsageDescription ✅

### 2.13 Dependências

**ZERO dependências externas.** Nenhum SPM, CocoaPods, Carthage. Tudo com frameworks nativos Apple.

### 2.14 Arquivos Suspeitos / Legacy

| Arquivo | Problema |
|---------|----------|
| `bun.lock` | Artifact Expo/Rork. Lixo. |
| `assets/images/` | Ícones Expo. Não usados. |
| `Config.swift:31-43` | Aliases EXPO_PUBLIC_*. Código morto. |
| `DiagnosisResult.swift:161` | `isFavorite` hardcoded false. Feature quebrada. |
| `RumoPragasTests/` | Template vazio. |
| `KeychainService.swift:5` | serviceName "app.rork.rumopragas". |

---

## 3. Problemas Técnicos Encontrados

### 3.1 Xcode NÃO instalado — build impossível
- **Prioridade:** P0
- **Evidência:** `xcodebuild` retorna "requires Xcode, but active developer directory is CommandLineTools"
- **Arquivo(s):** N/A (ambiente)
- **Impacto:** Impossível compilar, testar ou validar nesta máquina.
- **Correção:** Instalar Xcode.app (~30GB) ou usar CI com macOS runner.

### 3.2 Sem xcconfig — app roda com URLs vazias
- **Prioridade:** P1
- **Evidência:** Config.swift:8-13 busca de Bundle.main.infoDictionary, mas não existe .xcconfig no repo.
- **Arquivo(s):** Config.swift, project.pbxproj
- **Impacto:** Auth, diagnóstico e chat falham silenciosamente com strings vazias.
- **Correção:** Criar Debug.xcconfig/Release.xcconfig com SUPABASE_URL, SUPABASE_ANON_KEY, TOOLKIT_URL.

### 3.3 Sem disclaimer jurídico de recomendação agronômica
- **Prioridade:** P1
- **Evidência:** Zero ocorrências de "disclaimer", "não substitui", "agrônomo", "responsabilidade" no código. App recomenda defensivos com dosagem e classe toxicológica (AgrioProduct em DiagnosisResult.swift:297-313).
- **Arquivo(s):** Ausente em todo o projeto
- **Impacto:** **RISCO JURÍDICO ALTO.** Recomendação de defensivos sem receituário agronômico pode violar Lei 7.802/1989.
- **Correção:** Disclaimer em DiagnosisResultView + Termos de Uso.

### 3.4 Favoritos hardcoded false
- **Prioridade:** P1
- **Evidência:** DiagnosisResult.swift:161 — `var isFavorite: Bool { false }`
- **Arquivo(s):** Models/DiagnosisResult.swift
- **Impacto:** Feature anunciada que não funciona.
- **Correção:** Campo `is_favorite` no Supabase + toggle endpoint.

### 3.5 Chat IA sem autenticação
- **Prioridade:** P1
- **Evidência:** AIChatService.swift:12-43 — POST para `/agent/chat` sem token, apikey ou auth header.
- **Arquivo(s):** Services/AIChatService.swift
- **Impacto:** Endpoint abusável se público. Chat falha se privado.
- **Correção:** Adicionar auth header ou migrar para Edge Function.

### 3.6 Contagem de diagnósticos ineficiente
- **Prioridade:** P2
- **Evidência:** HomeViewModel.swift:76-82 — baixa até 50 registros completos só para contar.
- **Arquivo(s):** ViewModels/HomeViewModel.swift
- **Impacto:** Desperdício de bandwidth.
- **Correção:** HEAD request com `Prefer: count=exact`.

### 3.7 Bundle ID com "rork"
- **Prioridade:** P2
- **Evidência:** KeychainService.swift:5 — `serviceName = "app.rork.rumopragas"`
- **Arquivo(s):** Services/KeychainService.swift
- **Impacto:** Branding incorreto, possível problema de migração de keychain.
- **Correção:** Mudar para `com.agrorumo.rumopragas`.

### 3.8 Sem cache offline
- **Prioridade:** P2
- **Evidência:** Nenhum uso de Core Data, SQLite, SwiftData ou FileManager para cache.
- **Arquivo(s):** Todo o projeto (ausência)
- **Impacto:** App inútil sem internet.
- **Correção:** Cache mínimo com SwiftData ou UserDefaults JSON.

### 3.9 iOS 18.0 mínimo — limita audiência rural
- **Prioridade:** P2
- **Evidência:** project.pbxproj — `IPHONEOS_DEPLOYMENT_TARGET = 18.0`
- **Arquivo(s):** project.pbxproj
- **Impacto:** Produtores rurais com aparelhos mais antigos ficam excluídos.
- **Correção:** Avaliar suporte a iOS 16+.

### 3.10 LocationService com race condition potencial
- **Prioridade:** P2
- **Evidência:** LocationService.swift:15 — array `continuations` acessado de múltiplos contextos.
- **Arquivo(s):** Services/LocationService.swift
- **Impacto:** Race condition se múltiplas chamadas simultâneas.
- **Correção:** Proteger com actor ou @MainActor.

### 3.11 Sem validação de imagem
- **Prioridade:** P2
- **Evidência:** DiagnosisViewModel.swift:15-35 — comprime mas não valida conteúdo.
- **Arquivo(s):** ViewModels/DiagnosisViewModel.swift
- **Impacto:** Custo IA em imagens irrelevantes.
- **Correção:** Validação básica ou confiança < 20% = "não identificado".

### 3.12 Código morto EXPO_PUBLIC_*
- **Prioridade:** P3
- **Evidência:** Config.swift:31-43 — aliases para compatibilidade Expo que não existe mais.
- **Arquivo(s):** Config.swift, SupabaseService.swift:10-11
- **Impacto:** Confusão. SupabaseService usa alias ao invés do nome correto.
- **Correção:** Remover aliases, usar Config.supabaseURL direto.

### 3.13 Arquivos Expo/Rork residuais
- **Prioridade:** P3
- **Evidência:** bun.lock na raiz, assets/images/ com ícones Expo.
- **Arquivo(s):** bun.lock, assets/images/
- **Impacto:** Lixo no repo.
- **Correção:** Deletar.

### 3.14 Testes vazios
- **Prioridade:** P3
- **Evidência:** RumoPragasTests/ e RumoPragasUITests/ com templates Xcode vazios.
- **Arquivo(s):** RumoPragasTests/, RumoPragasUITests/
- **Impacto:** Zero cobertura de testes.
- **Correção:** Testes para AuthViewModel, DiagnosisViewModel, parsers.

---

## 4. Riscos de Produção

### Segurança
- ✅ Tokens em Keychain (correto)
- ✅ Zero chaves hardcoded no código
- ⚠️ Sem xcconfig — secrets não configurados
- ❌ Chat IA sem autenticação

### Arquitetura
- ✅ MVVM limpo e consistente
- ✅ Swift Concurrency correto
- ✅ Zero dependências externas
- ⚠️ PestDataService 51KB hardcoded
- ⚠️ Sem cache offline

### Risco Jurídico
- ❌ **CRÍTICO:** Recomenda defensivos agrícolas com nome, dosagem e classe toxicológica SEM disclaimer. Pode violar Lei 7.802/89.

### Confiabilidade
- ⚠️ Edge Function "diagnose" — depende de deploy
- ⚠️ Sem retry em chamadas API
- ⚠️ Sem rate limiting client-side

---

## 5. Conclusão

**Pronto para produção?** NÃO.
**Pronto para beta fechado?** SIM, com ressalvas (precisa de xcconfig + disclaimer).

### Bloqueadores:
1. P0: Xcode ausente nesta máquina
2. P1: xcconfig inexistente (URLs vazias)
3. P1: Disclaimer jurídico ausente
4. P1: Favoritos quebrados
5. P1: Chat IA sem auth

### Pontos positivos:
- Arquitetura MVVM limpa
- Swift Concurrency correto
- Zero dependências externas
- Auth completa com refresh e Keychain
- Biblioteca rica (18 culturas)
- Diagnóstico IA bem estruturado
- UI profissional (MeshGradient, haptics, animações)
- Permissões declaradas
- Nenhum segredo exposto
