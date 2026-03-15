# BUILD REPORT — FASE 1

**Projeto:** agro-rumo-pragas-ia (RumoPragas)
**Data:** 2026-03-15

---

## Ambiente de Build

- **Máquina:** Mac Mini M4, macOS 15.3.1 (Sequoia)
- **Developer Tools:** Command Line Tools instalado
- **Xcode.app:** NÃO instalado
- **xcodebuild:** Indisponível (requer Xcode.app completo)

## Tentativa de Build

### Comando executado:
```bash
xcodebuild -project RumoPragas.xcodeproj -list
```

### Resultado:
```
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory
'/Library/Developer/CommandLineTools' is a command line tools instance
```

### Causa raiz:
O Mac Mini tem apenas Command Line Tools instalado. O `xcodebuild` requer Xcode.app completo (~30GB) que não está presente em `/Applications/`.

## Análise Estática (sem build)

### Target identificado via project.pbxproj:
- **Product:** RumoPragas.app
- **Targets:** RumoPragas, RumoPragasTests, RumoPragasUITests
- **Deployment Target:** iOS 18.0
- **Swift version:** Inferido 5.x (usa @Observable, MeshGradient — features Swift 5.9+/iOS 18)

### Dependências de build:
- **SPM packages:** ZERO (nenhum XCRemoteSwiftPackageReference no pbxproj)
- **CocoaPods:** Não usado
- **Frameworks:** Foundation, SwiftUI, PhotosUI, CoreLocation, Security (todos nativos Apple)

### Configurações ausentes para build funcional:
1. **xcconfig files:** Não existem. Necessário criar:
   - `Debug.xcconfig` com: SUPABASE_URL, SUPABASE_ANON_KEY, TOOLKIT_URL
   - `Release.xcconfig` com os mesmos valores de produção
2. **Signing:** Requer Apple Developer account + provisioning profile
3. **Info.plist:** Gerado automaticamente pelo Xcode via build settings (INFOPLIST_KEY_* no pbxproj)

### Warnings prováveis (baseado em análise estática):
1. `Config.swift:31-43` — Propriedades EXPO_PUBLIC_* nunca usadas diretamente (code smell)
2. `DiagnosisResult.swift:161` — `isFavorite` computed property sempre false
3. `LocationService.swift:15` — Array de continuations sem isolation explícita
4. `bun.lock` e `assets/images/` — Arquivos não pertencentes ao projeto Xcode

### Erros prováveis em runtime (não compilação):
1. Config.supabaseURL retornará "" (sem xcconfig → sem valor em Info.plist)
2. Config.supabaseAnonKey retornará "" (mesmo motivo)
3. Config.toolkitURL retornará "" (mesmo motivo)
4. Toda chamada a SupabaseService falhará com URL inválida
5. AIChatService falhará com URL vazia

## Conclusão

| Aspecto | Status |
|---------|--------|
| Compila? | ❓ Não verificável (sem Xcode) |
| Erros de compilação? | Improvável — código usa APIs corretas e tipos consistentes |
| Roda localmente? | **NÃO** — faltam xcconfig + Xcode + signing |
| Bloqueador principal | Xcode ausente nesta máquina |

### Para rodar o projeto:
1. Instalar Xcode.app (App Store ou download Apple Developer)
2. Criar `Debug.xcconfig` com chaves Supabase
3. Abrir `RumoPragas.xcodeproj` no Xcode
4. Selecionar simulator ou device com signing
5. Build & Run

### Alternativa para CI:
GitHub Actions com `macos-14` runner + Xcode 16. Não requer Xcode local.
