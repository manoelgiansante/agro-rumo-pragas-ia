# AUDIT PRIORITY BACKLOG — Fase 1

**Projeto:** agro-rumo-pragas-ia (RumoPragas)
**Data:** 2026-03-15

---

## Tabela Executiva

| # | Item | Prioridade | Esforço | Impacto | Ação Recomendada | Arquivos |
|---|------|-----------|---------|---------|-----------------|----------|
| 1 | Xcode ausente — build impossível | P0 | Alto (30GB download) | CRÍTICO | Instalar Xcode.app ou configurar CI | Ambiente |
| 2 | Sem xcconfig — URLs vazias em runtime | P1 | Baixo (1h) | CRÍTICO | Criar Debug.xcconfig + Release.xcconfig com SUPABASE_URL, ANON_KEY, TOOLKIT_URL | Config.swift, project.pbxproj |
| 3 | Sem disclaimer jurídico | P1 | Baixo (2h) | CRÍTICO | Adicionar aviso legal em DiagnosisResultView: "Consulte um agrônomo" + atualizar Termos de Uso | Views/DiagnosisResultView.swift, novo: TermsView |
| 4 | Favoritos hardcoded false | P1 | Médio (4h) | ALTO | Campo is_favorite no Supabase + toggle API + stored property | Models/DiagnosisResult.swift, Services/SupabaseService.swift |
| 5 | Chat IA sem autenticação | P1 | Baixo (2h) | ALTO | Adicionar Bearer token ou migrar para Edge Function | Services/AIChatService.swift |
| 6 | Contagem de diagnósticos ineficiente | P2 | Baixo (1h) | MÉDIO | HEAD request com Prefer: count=exact | ViewModels/HomeViewModel.swift |
| 7 | Bundle ID "rork" no keychain | P2 | Baixo (30min) | MÉDIO | Mudar para com.agrorumo.rumopragas | Services/KeychainService.swift, project.pbxproj |
| 8 | Sem cache offline | P2 | Alto (8h) | MÉDIO | SwiftData ou UserDefaults JSON para histórico | Novo: CacheService.swift |
| 9 | iOS 18.0 mínimo | P2 | Alto (16h) | MÉDIO | Avaliar downgrade para iOS 16+ (substitui MeshGradient, Tab API) | project.pbxproj, AppTheme.swift, MainTabView.swift |
| 10 | LocationService race condition | P2 | Baixo (1h) | MÉDIO | Proteger array de continuations com @MainActor | Services/LocationService.swift |
| 11 | Sem validação de imagem | P2 | Médio (4h) | BAIXO | Validação client-side ou tratamento backend de confiança < 20% | ViewModels/DiagnosisViewModel.swift |
| 12 | Código morto EXPO_PUBLIC_* | P3 | Baixo (30min) | BAIXO | Remover aliases, usar Config.supabaseURL direto | Config.swift, Services/SupabaseService.swift |
| 13 | Arquivos Expo/Rork residuais | P3 | Baixo (5min) | BAIXO | Deletar bun.lock e assets/images/ | bun.lock, assets/ |
| 14 | Testes vazios | P3 | Alto (16h) | MÉDIO | Testes para AuthViewModel, DiagnosisViewModel, parsers | RumoPragasTests/ |

---

## Resumo por Prioridade

| Prioridade | Quantidade | Esforço Total Estimado |
|-----------|------------|----------------------|
| P0 | 1 | Xcode install (~1h + 30GB) |
| P1 | 4 | ~9h de desenvolvimento |
| P2 | 5 | ~30h de desenvolvimento |
| P3 | 4 | ~17h de desenvolvimento |

---

## Ordem de Execução Recomendada

### Sprint 1 — Desbloqueio (P0 + P1 críticos)
1. ~~Instalar Xcode~~ ou configurar CI
2. Criar xcconfig com chaves Supabase
3. Adicionar disclaimer jurídico
4. Corrigir chat IA (adicionar auth)

### Sprint 2 — Qualidade (P1 + P2 rápidos)
5. Implementar favoritos
6. Corrigir contagem eficiente
7. Corrigir bundle ID
8. Fix LocationService race condition

### Sprint 3 — Robustez (P2 + P3)
9. Implementar cache offline
10. Limpar código morto EXPO_PUBLIC_*
11. Deletar arquivos Expo residuais
12. Avaliar iOS 16+ (se necessário para público-alvo)

### Sprint 4 — Qualidade de Longo Prazo
13. Implementar testes unitários
14. Implementar validação de imagem
