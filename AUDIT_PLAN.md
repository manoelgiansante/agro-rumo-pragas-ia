# PLANO MESTRE DE AUDITORIA — Rumo Pragas IA

**Projeto**: agro-rumo-pragas-ia (Swift/iOS nativo - Xcode)
**Stack**: Swift, SwiftUI, Supabase, AI (Claude + Agrio), CoreLocation
**Supabase**: jxcnfyeemdltdfqtgbcl (ÚNICO permitido)
**Criado**: 2026-03-15

---

## Estrutura do Projeto (Raio-X)

```
RumoPragas/
├── RumoPragasApp.swift          # Entry point
├── ContentView.swift            # Root view / auth gate
├── Config.swift                 # Variáveis de config (Supabase, API keys)
├── Models/
│   ├── ChatMessage.swift        # Mensagens do chat IA
│   ├── ConfidenceLevel.swift    # Níveis de confiança do diagnóstico
│   ├── CropType.swift           # Tipos de cultura (soja, milho, etc)
│   ├── DiagnosisResult.swift    # Resultado do diagnóstico
│   ├── Pest.swift               # Modelo de praga
│   ├── SeverityLevel.swift      # Níveis de severidade
│   ├── SubscriptionPlan.swift   # Planos de assinatura
│   ├── UserProfile.swift        # Perfil do usuário
│   └── WeatherData.swift        # Dados meteorológicos
├── Services/
│   ├── AIChatService.swift      # Serviço de chat com IA
│   ├── KeychainService.swift    # Armazenamento seguro de tokens
│   ├── LocationService.swift    # Localização GPS
│   ├── PestDataService.swift    # Dados de pragas (biblioteca)
│   ├── SupabaseService.swift    # Cliente Supabase
│   └── WeatherService.swift     # Serviço de clima
├── ViewModels/
│   ├── AIChatViewModel.swift    # ViewModel do chat IA
│   ├── AuthViewModel.swift      # ViewModel de autenticação
│   ├── DiagnosisViewModel.swift # ViewModel de diagnóstico
│   ├── HistoryViewModel.swift   # ViewModel do histórico
│   ├── HomeViewModel.swift      # ViewModel da home
│   ├── LibraryViewModel.swift   # ViewModel da biblioteca
│   └── SettingsViewModel.swift  # ViewModel de configurações
├── Views/
│   ├── AIChatView.swift         # Tela de chat com IA
│   ├── AuthView.swift           # Tela de login/cadastro
│   ├── CameraPickerView.swift   # Seletor de câmera/galeria
│   ├── CropSelectorSheet.swift  # Sheet de seleção de cultura
│   ├── DiagnosisCardView.swift  # Card de diagnóstico
│   ├── DiagnosisFlowView.swift  # Fluxo completo de diagnóstico
│   ├── DiagnosisLoadingView.swift # Animação de loading
│   ├── DiagnosisResultView.swift  # Tela de resultado
│   ├── EditProfileSheet.swift   # Editar perfil
│   ├── HistoryView.swift        # Histórico de diagnósticos
│   ├── HomeView.swift           # Tela principal
│   ├── LibraryView.swift        # Biblioteca de pragas
│   ├── MainTabView.swift        # Tab bar principal
│   ├── MonitoringView.swift     # Monitoramento
│   ├── OnboardingView.swift     # Onboarding
│   ├── PaywallView.swift        # Paywall/assinaturas
│   ├── PestDetailView.swift     # Detalhe de praga
│   └── SettingsView.swift       # Configurações
└── Utilities/
    ├── AppTheme.swift           # Tema visual
    └── DateFormatUtility.swift  # Formatação de datas
```

---

## FASE 1 — Raio-X Completo (Análise Estática)

### 1.1 Arquitetura e Estrutura
- [ ] Verificar se MVVM está implementado corretamente (Views → ViewModels → Services)
- [ ] Verificar se Models são Codable e compatíveis com Supabase
- [ ] Mapear dependências entre módulos
- [ ] Verificar se há código morto ou duplicado
- [ ] Verificar se Config.swift usa xcconfig (sem hardcoded keys)

### 1.2 Supabase Integration
- [ ] Verificar SupabaseService.swift: client init, auth, storage, database
- [ ] Confirmar project ID = jxcnfyeemdltdfqtgbcl
- [ ] Verificar se Auth flow está completo (signup, signin, signout, token refresh)
- [ ] Verificar RLS (Row Level Security) nas tabelas referenciadas
- [ ] Verificar se Storage está configurado para upload de imagens

### 1.3 Dependências e Build
- [ ] Verificar Package.swift ou SPM packages no .xcodeproj
- [ ] Listar todas as dependências externas
- [ ] Verificar versões mínimas de iOS suportadas
- [ ] Verificar Info.plist: permissões (câmera, fotos, localização)
- [ ] Verificar se tem signing configurado

### 1.4 Variáveis de Ambiente e Segurança
- [ ] Verificar se chaves API estão em xcconfig (NÃO hardcoded)
- [ ] Verificar .gitignore inclui xcconfig com secrets
- [ ] Verificar KeychainService.swift para armazenamento seguro
- [ ] Buscar strings sensíveis no código (grep por "eyJ", "sk-", "key", passwords)

---

## FASE 2 — Build e Estabilidade

### 2.1 Compilação
- [ ] Tentar build via xcodebuild (verificar se compila)
- [ ] Listar todos os warnings
- [ ] Resolver erros de compilação
- [ ] Verificar Swift version compatibility

### 2.2 Fluxo de Telas
- [ ] Verificar entry point (RumoPragasApp.swift → ContentView)
- [ ] Verificar navegação: Auth → Onboarding → MainTabView
- [ ] Verificar todas as 4 tabs: Home, History, Library, Settings
- [ ] Verificar sheets: CropSelector, EditProfile, Paywall
- [ ] Verificar fluxo de diagnóstico: Camera → CropSelect → Loading → Result

### 2.3 Estados Vazios e Erros
- [ ] Verificar empty states em: History, Library, Home
- [ ] Verificar loading states em: Diagnosis, Chat, Library
- [ ] Verificar error handling em: Auth, Diagnosis, API calls
- [ ] Verificar offline behavior

---

## FASE 3 — Auditoria Funcional

### 3.1 Autenticação
- [ ] Sign up funcional
- [ ] Sign in funcional
- [ ] Sign out funcional
- [ ] Recuperação de senha
- [ ] Persistência de sessão
- [ ] Token refresh automático

### 3.2 Diagnóstico (Fluxo Principal)
- [ ] Captura de foto via câmera
- [ ] Seleção de foto da galeria
- [ ] Seleção de cultura
- [ ] Envio para IA
- [ ] Recebimento e parsing do resultado
- [ ] Exibição de: praga, confiança, severidade, tratamentos
- [ ] Salvamento no histórico
- [ ] Favoritar diagnóstico

### 3.3 Histórico
- [ ] Lista de diagnósticos passados
- [ ] Filtros (cultura, severidade, data)
- [ ] Busca por nome de praga
- [ ] Swipe to delete
- [ ] Swipe to favorite

### 3.4 Biblioteca de Pragas
- [ ] Categorias por cultura
- [ ] Lista de pragas por categoria
- [ ] Busca de pragas
- [ ] Detalhe da praga (sintomas, tratamento, prevenção)

### 3.5 Configurações
- [ ] Editar perfil
- [ ] Toggle dark mode
- [ ] Seleção de idioma
- [ ] Gerenciamento de assinatura
- [ ] Notificações push

---

## FASE 4 — Lógica de Negócio (Agro)

### 4.1 Adequação ao Agro Brasileiro
- [ ] Nomenclatura correta de pragas em PT-BR
- [ ] Culturas relevantes para o Brasil
- [ ] Terminologia de manejo (MIP, defensivos, controle biológico)
- [ ] Unidades corretas (ha, sacas, arrobas quando aplicável)
- [ ] Regiões e sazonalidade

### 4.2 Valor para o Usuário
- [ ] Fluxo principal leva < 60s do início ao resultado?
- [ ] Resultado é acionável (produtor sabe o que fazer)?
- [ ] Existe valor sem internet (cache, biblioteca offline)?
- [ ] O app parece produto comercial ou protótipo?

### 4.3 Riscos de Negócio
- [ ] Disclaimer sobre recomendação agronômica (não substitui agrônomo)
- [ ] Aviso sobre uso de defensivos (regulamentação)
- [ ] Termos de uso e política de privacidade

---

## FASE 5 — Motor de IA

### 5.1 Integração com IA
- [ ] Onde a IA é chamada (AIChatService? Edge Function?)
- [ ] Qual modelo/API é usado (Claude? GPT? Vision?)
- [ ] Prompt de sistema: qualidade e especificidade agro
- [ ] Entrada: como a imagem é enviada (base64? URL? Storage?)
- [ ] Saída: formato do resultado (JSON? texto livre?)

### 5.2 Qualidade do Diagnóstico
- [ ] Confidence level é calculado como?
- [ ] Tratamento de baixa confiança (< 60%)
- [ ] Fallback quando IA falha ou timeout
- [ ] Tratamento de imagens ruins (escuras, desfocadas)
- [ ] Limite de uso por plano (Free vs Pro)

### 5.3 Segurança e Custo
- [ ] Rate limiting no endpoint de IA
- [ ] Custo estimado por diagnóstico
- [ ] Logs de inferência (rastreabilidade)
- [ ] Risco de recomendação insegura

---

## FASE 6 — Dados, Backend e Segurança

### 6.1 Schema de Dados
- [ ] Tabelas no Supabase: users, diagnoses, pests, subscriptions?
- [ ] Relacionamentos e foreign keys
- [ ] Validações server-side
- [ ] Migrations versionadas?

### 6.2 Segurança
- [ ] RLS habilitado em todas as tabelas
- [ ] Sem chaves hardcoded no código
- [ ] Upload de imagens validado (tipo, tamanho)
- [ ] Sem logs sensíveis (tokens, senhas)
- [ ] HTTPS em todas as chamadas

### 6.3 Storage
- [ ] Bucket configurado para fotos de diagnóstico
- [ ] Política de acesso (só o dono vê suas fotos)
- [ ] Compressão/resize antes do upload
- [ ] Limpeza de imagens antigas

---

## FASE 7 — UX/UI e Qualidade Visual

### 7.1 Design System
- [ ] Tema consistente (cores #1A966B e #3882F2)
- [ ] Tipografia SF Pro com hierarquia clara
- [ ] Cards com sombras sutis
- [ ] Ícones consistentes (SF Symbols?)

### 7.2 Responsividade
- [ ] iPhone SE (tela pequena)
- [ ] iPhone Pro Max (tela grande)
- [ ] iPad (se suportado)
- [ ] Dynamic Type (acessibilidade)

### 7.3 Polish
- [ ] Animações suaves (transições, loading)
- [ ] Haptic feedback nos pontos certos
- [ ] Splash screen profissional
- [ ] App icon de qualidade
- [ ] Screenshots para App Store

---

## FASE 8 — Preparação para Lançamento

### 8.1 App Store
- [ ] Bundle ID configurado
- [ ] Signing & provisioning
- [ ] App Store Connect: metadata, screenshots, descrição
- [ ] Privacy policy URL
- [ ] Classificação etária

### 8.2 Performance
- [ ] Tempo de launch < 2s
- [ ] Scroll fluido (60fps)
- [ ] Memória controlada (sem leaks)
- [ ] Uso de bateria razoável

### 8.3 Testes
- [ ] Unit tests para ViewModels
- [ ] Unit tests para Services
- [ ] UI tests para fluxos principais
- [ ] Testes de integração com Supabase

---

## Prioridade de Execução

| # | Fase | Impacto | Esforço | Prioridade |
|---|------|---------|---------|------------|
| 1 | Build e compilação | CRÍTICO | Baixo | P0 |
| 2 | Auth + Supabase | CRÍTICO | Médio | P0 |
| 3 | Fluxo de diagnóstico | ALTO | Alto | P1 |
| 4 | Motor de IA | ALTO | Alto | P1 |
| 5 | Segurança | ALTO | Médio | P1 |
| 6 | Biblioteca + Histórico | MÉDIO | Médio | P2 |
| 7 | UX/UI polish | MÉDIO | Médio | P2 |
| 8 | Lógica de negócio agro | MÉDIO | Baixo | P2 |
| 9 | Testes | MÉDIO | Alto | P3 |
| 10 | App Store prep | BAIXO | Médio | P3 |

---

## Como Executar

1. Mande o /opus executar **uma fase por vez**
2. Ele retorna relatório + correções feitas
3. Revise e mande a próxima fase
4. Repita até todas as fases verdes
5. Final: backlog priorizado do que resta

**Comando para iniciar**: Envie ao /opus:
```
Leia o arquivo /Users/manoelnascimento/agrorumo-projetos/agro-rumo-pragas-ia/AUDIT_PLAN.md
Execute a FASE 1 completa. Leia todos os arquivos Swift, analise a fundo, e retorne o relatório com status de cada item.
```
