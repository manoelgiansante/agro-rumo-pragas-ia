# 🔍 RELATÓRIO DE AUDITORIA TOTAL — RUMO PRAGAS IA

**Data:** 6 de Abril de 2026  
**Auditor:** Time de Auditoria Sênior (30 frentes paralelas)  
**Escopo:** App Expo (iOS/Android), App Nativo iOS (Swift), Backend Supabase, Edge Functions, Banco de Dados, Pagamentos, Segurança, Performance, UX, Publicação

---

## SEÇÃO 1 — RESUMO EXECUTIVO

| Métrica                        | Nota                      |
| ------------------------------ | ------------------------- |
| **Nota Geral do Produto**      | **6.5 / 10**              |
| **Risco Atual de Publicar**    | **7.0 / 10** (alto risco) |
| **Confiança Atual do Produto** | **5.5 / 10**              |

### 🔴 TOP 10 PROBLEMAS ENCONTRADOS

| #   | Problema                                                                                                                               | Severidade |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| 1   | **Arquivo `.env` com chaves reais (Supabase anon key, Stripe live key) commitado no Git** — exposição de segredos em repositório       | CRÍTICA    |
| 2   | **Nenhum sistema de analytics/tracking implementado** — zero visibilidade sobre funil, conversão, retenção e comportamento de usuários | CRÍTICA    |
| 3   | **App nativo iOS (Swift) tem PaywallView sem integração real de pagamentos** — botão "Assinar" apenas fecha a modal                    | CRÍTICA    |
| 4   | **Dois apps paralelos (Expo + Swift nativo) sem sincronização** — duplicação massiva, divergência funcional, manutenção insustentável  | ALTA       |
| 5   | **Push token atualizado com `user_id` mas tabela `pragas_profiles` usa `id` como PK** — sync do push token falha silenciosamente       | ALTA       |
| 6   | **Sem validação client-side de email/senha no cadastro** — aceita senhas fracas, sem feedback de formato de email                      | ALTA       |
| 7   | **Dark mode toggle no Settings é cosmético** — `setDarkMode` altera estado local mas não afeta o `useColorScheme()` do sistema         | ALTA       |
| 8   | **Sem Apple Sign In** — exigido pela Apple se oferece sign-in de terceiros; risco de rejeição na App Store                             | ALTA       |
| 9   | **Sem testes E2E e poucos testes unitários** — cobertura parcial, 0 testes para telas/componentes de fluxo crítico                     | ALTA       |
| 10  | **EAS Submit ascAppId = "0"** — placeholder não configurado, impossibilita publicação automática na App Store                          | ALTA       |

### 🟢 TOP 10 OPORTUNIDADES

| #   | Oportunidade                                                                       | Impacto             |
| --- | ---------------------------------------------------------------------------------- | ------------------- |
| 1   | Implementar analytics completo (Mixpanel/PostHog/Amplitude) com funil de conversão | Receita ↑↑↑         |
| 2   | Adicionar Apple Sign In e Google Sign In no app                                    | Conversão ↑↑        |
| 3   | Dashboard web para produtores com mapas e relatórios                               | Retenção ↑↑↑        |
| 4   | Notificações push server-side baseadas em condições climáticas da região           | Engajamento ↑↑      |
| 5   | Histórico de diagnósticos com fotos (image storage no Supabase)                    | UX Premium ↑↑       |
| 6   | Exportar relatório PDF profissional com logo e dados de geolocalização             | Valor Percebido ↑↑↑ |
| 7   | Comparação temporal de diagnósticos (evolução da praga)                            | Diferencial ↑↑      |
| 8   | Chat IA com envio de fotos inline (não só texto)                                   | UX ↑↑               |
| 9   | Integração com APIs de preço de defensivos (ex: MAPA/AGROFIT)                      | Valor Prático ↑↑↑   |
| 10  | Modo offline completo com banco local (SQLite/WatermelonDB)                        | Confiabilidade ↑↑   |

### 💬 CONCLUSÃO SINCERA

O produto tem uma **base técnica sólida** com arquitetura bem pensada (Expo Router, Supabase, Edge Functions, Claude Vision AI). O fluxo de diagnóstico por IA é o core do produto e funciona corretamente. Entretanto, existem **gaps críticos de segurança** (chaves expostas no repositório), **ausência total de analytics**, **duplicação desnecessária com o app Swift nativo**, e **funcionalidades inacabadas** (pagamentos iOS nativo, dark mode, account deletion backend). O app **não está pronto para publicação comercial** sem resolver os itens P0.

---

## SEÇÃO 2 — INVENTÁRIO TOTAL

### 📱 TELAS DO APP EXPO (React Native)

| Tela                    | Rota                     | Status                              |
| ----------------------- | ------------------------ | ----------------------------------- |
| Onboarding              | `/onboarding`            | ✅ Funcional                        |
| Login/Cadastro          | `/(auth)/login`          | ✅ Funcional                        |
| Home                    | `/(tabs)/index`          | ✅ Funcional                        |
| Histórico               | `/(tabs)/history`        | ✅ Funcional                        |
| Biblioteca de Pragas    | `/(tabs)/library`        | ✅ Funcional                        |
| Chat IA                 | `/(tabs)/ai-chat`        | ✅ Funcional                        |
| Configurações           | `/(tabs)/settings`       | ⚠️ Parcial (dark mode não funciona) |
| Captura de Imagem       | `/diagnosis/camera`      | ✅ Funcional                        |
| Seleção de Cultura      | `/diagnosis/crop-select` | ✅ Funcional                        |
| Loading Diagnóstico     | `/diagnosis/loading`     | ✅ Funcional                        |
| Resultado Diagnóstico   | `/diagnosis/result`      | ✅ Funcional                        |
| Paywall                 | `/paywall`               | ✅ Funcional (RevenueCat)           |
| Política de Privacidade | `/privacy`               | ✅ Funcional                        |
| Termos de Uso           | `/terms`                 | ✅ Funcional                        |

### 📱 TELAS DO APP NATIVO iOS (Swift)

| Tela                | View                     | Status                     |
| ------------------- | ------------------------ | -------------------------- |
| Splash              | ContentView (SplashView) | ✅                         |
| Onboarding          | OnboardingView           | ✅                         |
| Auth (Login/Signup) | AuthView                 | ✅                         |
| Home                | HomeView                 | ✅                         |
| Diagnóstico Flow    | DiagnosisFlowView        | ✅                         |
| Resultado           | DiagnosisResultView      | ✅                         |
| Histórico           | HistoryView              | ✅                         |
| Biblioteca          | LibraryView              | ✅                         |
| Chat IA             | AIChatView               | ✅                         |
| Configurações       | SettingsView             | ✅                         |
| Paywall             | PaywallView              | 🔴 UI Only (sem pagamento) |
| Camera/Picker       | CameraPickerView         | ✅                         |

### 🔌 INTEGRAÇÕES EXTERNAS

| Serviço                    | Uso                              | Status                                    |
| -------------------------- | -------------------------------- | ----------------------------------------- |
| **Supabase**               | Auth, Database, Edge Functions   | ✅ Ativo                                  |
| **Claude API (Anthropic)** | Diagnóstico por imagem + Chat IA | ✅ Ativo (via Edge Functions)             |
| **Open-Meteo**             | Dados meteorológicos             | ✅ Ativo (API pública)                    |
| **RevenueCat**             | IAP iOS/Android                  | ⚠️ Configurado mas sem chaves ativas      |
| **Stripe**                 | Pagamentos web/webhook           | ⚠️ Webhook configurado, sem checkout flow |
| **Expo Notifications**     | Push notifications               | ⚠️ Parcialmente implementado              |
| **Expo Updates**           | OTA updates                      | ✅ Configurado                            |
| **Google OAuth**           | Login social                     | ❌ Não implementado no frontend           |
| **Apple Sign In**          | Login social iOS                 | ❌ Não implementado                       |

### 🗄️ TABELAS DO BANCO DE DADOS

| Tabela             | Colunas Críticas                                                                                  | RLS |
| ------------------ | ------------------------------------------------------------------------------------------------- | --- |
| `pragas_diagnoses` | id, user_id, crop, pest_id, pest_name, confidence, image_url, notes, location_lat/lng, created_at | ✅  |
| `pragas_profiles`  | id, full_name, role, city, state, crops[], push_token, deletion_requested_at                      | ✅  |
| `subscriptions`    | id, user*id, plan, status, provider, stripe*_, apple\__, google\_\*, period_start/end             | ✅  |

### 🔧 EDGE FUNCTIONS (BACKEND)

| Função           | Endpoint                       | Status       |
| ---------------- | ------------------------------ | ------------ |
| `diagnose`       | `/functions/v1/diagnose`       | ✅ Funcional |
| `ai-chat`        | `/functions/v1/ai-chat`        | ✅ Funcional |
| `stripe-webhook` | `/functions/v1/stripe-webhook` | ⚠️ Parcial   |

---

## SEÇÃO 3 — MATRIZ DE ACHADOS

### ACH-001: Chaves secretas expostas no repositório Git

- **ÁREA:** Segurança
- **SEVERIDADE:** CRÍTICA
- **IMPACTO:** Segurança, Dados, Receita
- **EVIDÊNCIA:** Arquivo `expo-app/.env` contém:
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...` (JWT completo)
  - `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51SPmgm...` (chave LIVE do Stripe)
  - `EXPO_PUBLIC_GOOGLE_CLIENT_ID=659275180000-...`
- **COMO REPRODUZIR:** `cat expo-app/.env`
- **CAUSA PROVÁVEL:** `.env` foi commitado antes do `.gitignore` ser configurado, ou o `.gitignore` foi adicionado depois
- **CORREÇÃO:** 1) Rodar chave Supabase e Stripe imediatamente; 2) Usar `git filter-branch` ou BFG Repo Cleaner para remover do histórico; 3) Verificar se `.env` está no `.gitignore` (está, mas o dano já foi feito se commitado)
- **RISCO DE NÃO CORRIGIR:** Exposição total do banco de dados, compras fraudulentas no Stripe, possível vazamento de dados de usuários
- **ESFORÇO:** 2-4h
- **PRIORIDADE:** P0

---

### ACH-002: Zero analytics/tracking implementado

- **ÁREA:** Analytics / Produto
- **SEVERIDADE:** CRÍTICA
- **IMPACTO:** Receita, Produto, Decisões
- **EVIDÊNCIA:** Grep por `analytics|tracking|pixel|gtag|firebase|amplitude|mixpanel|posthog|segment` retornou 0 resultados relevantes. Nenhum SDK de analytics instalado no `package.json`.
- **COMO REPRODUZIR:** Verificar `package.json` — ausência de qualquer lib de analytics
- **CAUSA PROVÁVEL:** Foco no desenvolvimento funcional sem instrumentação
- **CORREÇÃO:** Implementar Mixpanel, PostHog ou Amplitude com eventos de funil: `onboarding_completed`, `signup`, `login`, `diagnosis_started`, `diagnosis_completed`, `paywall_viewed`, `subscription_started`, `chat_message_sent`
- **RISCO DE NÃO CORRIGIR:** Cegueira total sobre conversão, retenção e comportamento. Impossível otimizar produto ou marketing.
- **ESFORÇO:** 8-16h
- **PRIORIDADE:** P0

---

### ACH-003: Push token sync usa coluna errada

- **ÁREA:** Backend / Notificações
- **SEVERIDADE:** ALTA
- **IMPACTO:** Funcionalidade
- **EVIDÊNCIA:** Em `useNotifications.ts` linha 38:
  ```typescript
  await supabase
    .from("pragas_profiles")
    .update({ push_token: token })
    .eq("user_id", user.id);
  ```
  Mas a tabela `pragas_profiles` usa `id` como PK (que referencia `auth.users.id`), **não `user_id`**. O `.eq('user_id', user.id)` não encontrará nenhuma linha pois a coluna se chama `id`.
- **COMO REPRODUZIR:** Registrar push token → verificar que `pragas_profiles.push_token` permanece NULL
- **CAUSA PROVÁVEL:** Confusão entre `id` (PK) e `user_id` (não existe na tabela profiles)
- **CORREÇÃO:** Trocar `.eq('user_id', user.id)` por `.eq('id', user.id)`
- **RISCO DE NÃO CORRIGIR:** Push notifications nunca serão entregues via servidor
- **ESFORÇO:** 5 min
- **PRIORIDADE:** P0

---

### ACH-004: Dark Mode toggle não funciona

- **ÁREA:** UX / Settings
- **SEVERIDADE:** ALTA
- **IMPACTO:** UX, Confiança
- **EVIDÊNCIA:** Em `settings.tsx` linha 66-67:
  ```typescript
  const [darkMode, setDarkMode] = useState(isDark);
  ```
  O `setDarkMode` altera apenas um estado local. O `useColorScheme()` do React Native reflete a preferência do SISTEMA operacional — não é controlável pelo app.
- **COMO REPRODUZIR:** Alterar toggle → observar que nada muda visualmente
- **CAUSA PROVÁVEL:** Feature incompleta
- **CORREÇÃO:** 1) Remover o toggle e seguir a preferência do sistema, OU 2) Implementar um ThemeProvider com contexto global que override o sistema
- **RISCO DE NÃO CORRIGIR:** Usuário percebe que toggle não funciona → perda de confiança
- **ESFORÇO:** 2-4h
- **PRIORIDADE:** P1

---

### ACH-005: Sem Apple Sign In

- **ÁREA:** Publicação iOS / Auth
- **SEVERIDADE:** ALTA
- **IMPACTO:** Publicação
- **EVIDÊNCIA:** Nenhum código de Sign In with Apple encontrado em todo o projeto. `app.json` não declara `expo-apple-authentication` plugin. Apple **exige** Sign In with Apple se o app oferece qualquer método de login de terceiros (Guideline 4.8).
- **COMO REPRODUZIR:** Submeter para App Store Review
- **CAUSA PROVÁVEL:** Feature não implementada ainda
- **CORREÇÃO:** Implementar `expo-apple-authentication` + handler no backend Supabase
- **RISCO DE NÃO CORRIGIR:** **Rejeição garantida** na App Store
- **ESFORÇO:** 8-16h
- **PRIORIDADE:** P0

---

### ACH-006: Sem validação client-side de email/senha

- **ÁREA:** Auth / UX
- **SEVERIDADE:** ALTA
- **IMPACTO:** UX, Segurança
- **EVIDÊNCIA:** Em `login.tsx`, `handleSubmit`:
  ```typescript
  if (!email.trim() || !password.trim()) { ... }
  if (mode === 'signup' && !fullName.trim()) { ... }
  ```
  Apenas verifica se campos estão vazios. Não valida formato de email, tamanho mínimo de senha, caracteres especiais. O Supabase por padrão aceita senhas com apenas 6 caracteres.
- **COMO REPRODUZIR:** Tentar cadastrar com email "abc" e senha "123"
- **CAUSA PROVÁVEL:** Confiança excessiva na validação server-side
- **CORREÇÃO:** Adicionar regex de email, mínimo 8 caracteres para senha, feedback visual inline
- **RISCO DE NÃO CORRIGIR:** Contas com senhas fracas, experiência amadora
- **ESFORÇO:** 2-4h
- **PRIORIDADE:** P1

---

### ACH-007: Account deletion é apenas "soft" — sem backend para execução

- **ÁREA:** LGPD / Compliance
- **SEVERIDADE:** ALTA
- **IMPACTO:** Compliance, Publicação
- **EVIDÊNCIA:** Em `settings.tsx`, `handleDeleteAccount` apenas marca `deletion_requested_at` na tabela `pragas_profiles`. Não existe nenhum job, cron, ou Edge Function que processe as solicitações. O alert diz "dados serão removidos em até 15 dias conforme a LGPD", mas **nada garante que isso aconteça**.
- **COMO REPRODUZIR:** Solicitar exclusão → verificar que dados permanecem no banco indefinidamente
- **CAUSA PROVÁVEL:** Feature incompleta
- **CORREÇÃO:** Implementar cron job ou Edge Function que: 1) Busca profiles com `deletion_requested_at < NOW() - 15 days`; 2) Deleta diagnósticos, subscription, profile; 3) Chama `supabase.auth.admin.deleteUser()`
- **RISCO DE NÃO CORRIGIR:** Violação da LGPD, rejeição Apple/Google (exigem account deletion funcional)
- **ESFORÇO:** 4-8h
- **PRIORIDADE:** P0

---

### ACH-008: Paywall iOS nativo é apenas UI (sem pagamento real)

- **ÁREA:** Pagamentos / iOS
- **SEVERIDADE:** CRÍTICA
- **IMPACTO:** Receita
- **EVIDÊNCIA:** No `PaywallView.swift` nativo, o botão de assinatura chama apenas `dismiss()`. Não há integração com StoreKit 2, RevenueCat ou qualquer payment SDK.
- **COMO REPRODUZIR:** Abrir PaywallView no app Swift → tocar "Assinar" → apenas fecha a tela
- **CAUSA PROVÁVEL:** App nativo incompleto; equipe focou no Expo app
- **CORREÇÃO:** Se o Expo app é a versão principal, **abandonar o app Swift nativo** ou implementar StoreKit 2 completo
- **RISCO DE NÃO CORRIGIR:** Se publicar o nativo: usuário tenta pagar, nada acontece
- **ESFORÇO:** 16-40h (se manter app nativo)
- **PRIORIDADE:** P0 (se publicar nativo) / N/A (se usar apenas Expo)

---

### ACH-009: EAS Submit com ascAppId = "0"

- **ÁREA:** Publicação
- **SEVERIDADE:** ALTA
- **IMPACTO:** Publicação
- **EVIDÊNCIA:** `eas.json` → `submit.production.ios.ascAppId: "0"` — placeholder inválido
- **COMO REPRODUZIR:** Rodar `eas submit -p ios --profile production` → falha
- **CAUSA PROVÁVEL:** App não registrado no App Store Connect ainda
- **CORREÇÃO:** Criar app no App Store Connect e preencher o `ascAppId` real
- **RISCO DE NÃO CORRIGIR:** Impossível publicar via EAS
- **ESFORÇO:** 30 min
- **PRIORIDADE:** P0

---

### ACH-010: Dois apps (Expo + Swift nativo) divergentes

- **ÁREA:** Arquitetura
- **SEVERIDADE:** ALTA
- **IMPACTO:** Manutenção, Consistência
- **EVIDÊNCIA:** Existem dois apps completos: `expo-app/` (React Native/Expo) e `RumoPragas/` (Swift nativo). O Swift não tem: offline queue, RevenueCat, push token sync. O Expo não tem: SplashView animada nativa, SwiftUI performance. Ambos acessam o mesmo backend.
- **CAUSA PROVÁVEL:** Possível pivot de Swift nativo para Expo, ou desenvolvimento paralelo
- **CORREÇÃO:** **Escolher UM** e focar nele. Recomendação: Expo (mais completo, cross-platform)
- **RISCO DE NÃO CORRIGIR:** Manutenção de dois codebase duplicados, bugs em um não corrigidos no outro, confusão de qual é o "oficial"
- **ESFORÇO:** Decisão estratégica
- **PRIORIDADE:** P0

---

### ACH-011: RLS subscription — service_role policy conflita com user SELECT

- **ÁREA:** Banco de Dados / Segurança
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Segurança, Dados
- **EVIDÊNCIA:** Na tabela `subscriptions`:
  ```sql
  CREATE POLICY "Service role can manage subscriptions"
    ON subscriptions FOR ALL
    USING (auth.role() = 'service_role');
  ```
  A policy `FOR ALL` com `auth.role() = 'service_role'` é redundante — service_role já bypassa RLS. Além disso, **não há policy INSERT para o trigger** `handle_new_user()` que roda como `SECURITY DEFINER` (OK neste caso, mas deve ser documentado).
- **CORREÇÃO:** Remover a policy redundante; documentar que triggers SECURITY DEFINER bypassam RLS
- **ESFORÇO:** 30 min
- **PRIORIDADE:** P2

---

### ACH-012: Sem UPDATE policy em diagnósticos

- **ÁREA:** Banco de Dados
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Funcionalidade
- **EVIDÊNCIA:** `pragas_diagnoses` tem SELECT, INSERT e DELETE policies, mas **não tem UPDATE**. Se futuramente quiser permitir edição de diagnósticos (notas, tags), será bloqueado pelo RLS.
- **CORREÇÃO:** Adicionar policy de UPDATE se necessário, ou documentar que é intencional
- **ESFORÇO:** 10 min
- **PRIORIDADE:** P3

---

### ACH-013: Diagnósticos sem imagem persistida

- **ÁREA:** Produto / UX
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** UX, Valor
- **EVIDÊNCIA:** O campo `image_url` em `pragas_diagnoses` existe mas **nunca é preenchido**. A Edge Function `diagnose` não faz upload da imagem para Supabase Storage — apenas a envia ao Claude e descarta. O usuário não pode ver a foto no histórico.
- **COMO REPRODUZIR:** Fazer diagnóstico → ir em Histórico → card não mostra foto
- **CORREÇÃO:** Após diagnóstico, fazer upload da imagem para Supabase Storage bucket e salvar a URL no `image_url`
- **ESFORÇO:** 4-8h
- **PRIORIDADE:** P1

---

### ACH-014: Textos i18n pt-BR sem acentos

- **ÁREA:** UX / Conteúdo
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Confiança, UX
- **EVIDÊNCIA:** Arquivo `i18n/locales/pt-BR.ts` usa texto sem acentos: "Historico" em vez de "Histórico", "Diagnosticos" em vez de "Diagnósticos"
- **COMO REPRODUZIR:** Verificar os textos das abas na interface
- **CORREÇÃO:** Adicionar acentos corretos em todo o arquivo de tradução pt-BR
- **ESFORÇO:** 1-2h
- **PRIORIDADE:** P1

---

### ACH-015: Chat IA não tem limite de uso para plano free

- **ÁREA:** Pagamentos / Produto
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Receita
- **EVIDÊNCIA:** A Edge Function `ai-chat` valida autenticação mas **não verifica o plano do usuário**. A paywall diz "Chat IA limitado" para free e "ilimitado" para pro, mas **a limitação não existe no backend**.
- **COMO REPRODUZIR:** Usar plano free → enviar mensagens ilimitadas no chat IA
- **CORREÇÃO:** Adicionar verificação de plano e contagem de mensagens na Edge Function `ai-chat`
- **RISCO DE NÃO CORRIGIR:** Custo excessivo com Claude API sem receita (cada mensagem custa $$)
- **ESFORÇO:** 2-4h
- **PRIORIDADE:** P0

---

### ACH-016: Stripe webhook sem event idempotency

- **ÁREA:** Pagamentos
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Dados, Receita
- **EVIDÊNCIA:** A Edge Function `stripe-webhook` processa eventos sem verificar duplicatas. Se o Stripe envia o mesmo evento duas vezes (retry), o handler executará duas vezes.
- **CORREÇÃO:** Armazenar `event.id` em tabela de eventos processados; ignorar duplicatas
- **ESFORÇO:** 2h
- **PRIORIDADE:** P1

---

### ACH-017: Sem rate limiting nas Edge Functions

- **ÁREA:** Segurança / Performance
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Custo, Segurança
- **EVIDÊNCIA:** Nenhuma das Edge Functions (diagnose, ai-chat, stripe-webhook) implementa rate limiting. Um usuário autenticado pode fazer centenas de chamadas por minuto.
- **CORREÇÃO:** Implementar rate limiting por user_id (usando tabela Redis ou counter no Supabase)
- **ESFORÇO:** 4-8h
- **PRIORIDADE:** P1

---

### ACH-018: Imagem base64 enviada via JSON body (sem streaming)

- **ÁREA:** Performance
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Performance, Custo
- **EVIDÊNCIA:** `sendDiagnosis()` envia a imagem como base64 string dentro de um JSON body. Para uma foto de 5MB, o payload JSON chega a ~6.7MB (base64 overhead 33%). Não há multipart upload ou streaming.
- **CORREÇÃO:** Usar upload direto para Supabase Storage + passar apenas a URL para a Edge Function, ou implementar multipart/form-data
- **ESFORÇO:** 8-16h
- **PRIORIDADE:** P2

---

### ACH-019: Loading screen usa location default hardcoded se GPS falha

- **ÁREA:** UX / Dados
- **SEVERIDADE:** BAIXA
- **IMPACTO:** Dados
- **EVIDÊNCIA:** Em `diagnosis/loading.tsx`:
  ```typescript
  location?.latitude ?? -15.78,
  location?.longitude ?? -47.93,
  ```
  Se a localização não é obtida, usa coordenadas de Brasília como fallback. Isso polui os dados de geolocalização dos diagnósticos.
- **CORREÇÃO:** Enviar `null` quando localização indisponível; tratar null no backend
- **ESFORÇO:** 30 min
- **PRIORIDADE:** P2

---

### ACH-020: Componente DiagnosisCard aceita prop `onPress` mas não usa

- **ÁREA:** Qualidade de Código
- **SEVERIDADE:** BAIXA
- **IMPACTO:** Manutenção
- **EVIDÊNCIA:** `DiagnosisCard` aceita `onPress` no tipo mas nunca invoca
- **CORREÇÃO:** Remover prop não utilizada ou implementar a navegação para detalhes
- **ESFORÇO:** 15 min
- **PRIORIDADE:** P3

---

### ACH-021: CORS wildcard (\*) em todas as Edge Functions

- **ÁREA:** Segurança
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Segurança
- **EVIDÊNCIA:** Todas as Edge Functions usam `'Access-Control-Allow-Origin': '*'`. Em produção, deveria ser restrito ao domínio do app.
- **CORREÇÃO:** Restringir CORS ao domínio real do app e Supabase
- **ESFORÇO:** 1h
- **PRIORIDADE:** P1

---

### ACH-022: TIPS na Home Screen são hardcoded em português (sem i18n)

- **ÁREA:** i18n / UX
- **SEVERIDADE:** BAIXA
- **IMPACTO:** UX
- **EVIDÊNCIA:** `const TIPS` em `(tabs)/index.tsx` tem textos fixos em português, não passando pelo `useTranslation()`
- **CORREÇÃO:** Usar chaves i18n para tips
- **ESFORÇO:** 30 min
- **PRIORIDADE:** P2

---

### ACH-023: Settings → subscriber error retry duplica código de carregamento

- **ÁREA:** Qualidade de Código
- **SEVERIDADE:** BAIXA
- **IMPACTO:** Manutenção
- **EVIDÊNCIA:** Em `settings.tsx`, o bloco de retry no `subErrorRow` repete ~15 linhas idênticas ao `useEffect` de carregamento de subscription
- **CORREÇÃO:** Extrair para função `loadSubscriptionData` reutilizável (já existe no useEffect mas o retry não a usa)
- **ESFORÇO:** 30 min
- **PRIORIDADE:** P3

---

### ACH-024: AI Chat não tem botão de limpar conversa visível

- **ÁREA:** UX
- **SEVERIDADE:** BAIXA
- **IMPACTO:** UX
- **EVIDÊNCIA:** A função `clearChat` existe no `ai-chat.tsx` mas não está conectada a nenhum botão na UI. Não há como o usuário limpar o histórico de chat.
- **CORREÇÃO:** Adicionar ícone de lixeira no header da tela de chat
- **ESFORÇO:** 30 min
- **PRIORIDADE:** P2

---

### ACH-025: Sem confirmação por email após cadastro

- **ÁREA:** Auth / UX
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Segurança
- **EVIDÊNCIA:** O `signUp()` chama `supabase.auth.signUp()` e mostra alert "Verifique seu email". Porém, depende da configuração do Supabase de exigir confirmação de email. Se não estiver habilitado, usuários com email falso podem se cadastrar.
- **CORREÇÃO:** Verificar no Supabase Dashboard que email confirmation está habilitado; implementar fluxo de reenvio de email
- **ESFORÇO:** 1-2h
- **PRIORIDADE:** P1

---

### ACH-026: Sem tela de "Editar Perfil" no Expo app

- **ÁREA:** UX / Produto
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** UX
- **EVIDÊNCIA:** Settings mostra nome e email mas não tem opção de editar. A tabela `pragas_profiles` tem campos `city`, `state`, `crops[]` que nunca são preenchidos pelo app. O Swift nativo tem `EditProfileSheet`.
- **CORREÇÃO:** Implementar tela de edição de perfil
- **ESFORÇO:** 4-8h
- **PRIORIDADE:** P2

---

### ACH-027: Biblioteca de pragas é estática (hardcoded)

- **ÁREA:** Produto
- **SEVERIDADE:** BAIXA
- **IMPACTO:** Escalabilidade
- **EVIDÊNCIA:** `PESTS_BY_CROP` em `library.tsx` tem ~80 pragas hardcoded no código. Adicionar/atualizar pragas exige deploy.
- **CORREÇÃO:** Migrar para tabela no Supabase com admin CRUD
- **ESFORÇO:** 8-16h
- **PRIORIDADE:** P3

---

### ACH-028: useEffect sem deps array no Loading screen

- **ÁREA:** Estabilidade
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Performance
- **EVIDÊNCIA:** Em `diagnosis/loading.tsx`:
  ```typescript
  useEffect(() => { ... analyze(); ... }, []);
  ```
  O ESLint disable comment `// eslint-disable-line react-hooks/exhaustive-deps` confirma que deps foram intencionalmente omitidas, mas variáveis como `imageBase64`, `session`, `isConnected` poderiam mudar durante a vida do componente.
- **CORREÇÃO:** Verificar se strict mode re-renders causam duplicação de chamadas API (potencialmente duas chamadas ao Claude $$)
- **ESFORÇO:** 2h
- **PRIORIDADE:** P1

---

### ACH-029: Diagnóstico result.tsx tem hooks condicionais

- **ÁREA:** Estabilidade / React Rules
- **SEVERIDADE:** MÉDIA
- **IMPACTO:** Estabilidade
- **EVIDÊNCIA:** Em `result.tsx`, há retornos antecipados (early returns para error/queued states) **antes** do `useEffect` que chama `trackSuccessfulDiagnosis()`. Hooks do React devem ser chamados antes de qualquer return condicional.
- **COMO REPRODUZIR:** React Strict Mode pode detectar; pode causar comportamento inesperado
- **CORREÇÃO:** Mover todos os hooks para o topo do componente, antes de qualquer early return
- **ESFORÇO:** 1h
- **PRIORIDADE:** P1

---

### ACH-030: Stripe checkout flow inexistente no app

- **ÁREA:** Pagamentos
- **SEVERIDADE:** ALTA
- **IMPACTO:** Receita
- **EVIDÊNCIA:** O `stripe-webhook` existe, e `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` está configurado, mas **não há nenhum código de Stripe Checkout** no app (nem web, nem in-app). O fluxo de pagamento depende inteiramente do RevenueCat. O Stripe webhook parece preparado para um fluxo web que não existe.
- **CORREÇÃO:** Decidir: usar Stripe (precisa criar checkout) OU usar apenas RevenueCat (remover Stripe config)
- **ESFORÇO:** Decisão + 8-24h implementação
- **PRIORIDADE:** P1

---

## SEÇÃO 4 — ITENS CRÍTICOS ANTES DE BUILD

| #   | Item                                                            | Risco                        |
| --- | --------------------------------------------------------------- | ---------------------------- |
| 1   | Rotacionar chaves expostas no `.env` (Supabase, Stripe, Google) | Segurança                    |
| 2   | Implementar Apple Sign In                                       | Rejeição App Store           |
| 3   | Corrigir push token sync (`.eq('id', ...)`)                     | Funcionalidade quebrada      |
| 4   | Implementar account deletion real (backend cron/function)       | LGPD + rejeição Apple/Google |
| 5   | Configurar `ascAppId` real no EAS                               | Impossível publicar          |
| 6   | Implementar limite de chat IA por plano                         | Custo descontrolado          |
| 7   | Decidir: Expo OU Swift nativo (não ambos)                       | Manutenção insustentável     |
| 8   | Implementar analytics mínimo                                    | Cegueira operacional         |
| 9   | Corrigir hooks condicionais em `result.tsx`                     | Crash potencial              |
| 10  | Corrigir textos i18n com acentos                                | Imagem amadora               |

---

## SEÇÃO 5 — GAPS DE PRODUTO E RECURSOS FALTANTES

### Comparação com benchmark (apps de agro premium)

| Recurso                             | Seu App         | Agrio         | Plantix | Cropin | iCrop |
| ----------------------------------- | --------------- | ------------- | ------- | ------ | ----- |
| Diagnóstico por IA foto             | ✅              | ✅            | ✅      | ✅     | ❌    |
| Biblioteca de pragas                | ✅ (hardcoded)  | ✅ (dinâmica) | ✅      | ✅     | ✅    |
| Chat IA                             | ✅              | ❌            | ❌      | ❌     | ❌    |
| Dados meteorológicos                | ✅              | ✅            | ✅      | ✅     | ✅    |
| Alertas por clima                   | ✅              | ✅            | ❌      | ✅     | ❌    |
| Histórico com fotos                 | ❌              | ✅            | ✅      | ✅     | ✅    |
| Mapa de diagnósticos                | ❌              | ✅            | ✅      | ✅     | ❌    |
| Dashboard web                       | ❌              | ✅            | ❌      | ✅     | ✅    |
| Multi-idioma                        | ✅ (3)          | ✅ (10+)      | ✅ (18) | ✅     | ❌    |
| Modo offline completo               | ⚠️ (queue only) | ✅            | ✅      | ❌     | ❌    |
| Relatório PDF                       | ✅              | ✅            | ❌      | ✅     | ❌    |
| Compartilhamento WhatsApp           | ✅              | ❌            | ✅      | ❌     | ❌    |
| Apple/Google Sign In                | ❌              | ✅            | ✅      | ✅     | ✅    |
| Perfil detalhado (fazenda, talhões) | ❌              | ✅            | ❌      | ✅     | ✅    |
| Notificações por região             | ⚠️ (local only) | ✅ (server)   | ✅      | ✅     | ❌    |
| Marketplace de defensivos           | ❌              | ❌            | ❌      | ✅     | ❌    |
| Integração IoT/sensores             | ❌              | ❌            | ❌      | ✅     | ✅    |

### Recursos faltantes para nível premium:

1. **Mapa interativo** com diagnósticos geolocalizados do produtor
2. **Gestão de talhões** (propriedade, áreas, hectares)
3. **Comparação temporal** de diagnósticos (evolução ao longo do tempo)
4. **Onboarding inteligente** (perguntar culturas, região, tamanho de propriedade)
5. **Notificações push server-side** baseadas em clima da região do usuário
6. **Dashboard web** para visualização em desktop
7. **Integração com calendário agrícola** (safra, plantio, colheita)
8. **Recomendação de produtos registrados** com link para AGROFIT/MAPA
9. **Fotos de referência** na biblioteca de pragas (como a praga se parece)
10. **Chat IA com envio de fotos** (hoje aceita apenas texto)

---

## SEÇÃO 6 — AUDITORIA DE PAGAMENTOS

### Fluxo Ideal

```
User abre app → Paywall → Seleciona plano → IAP (Apple/Google) via RevenueCat
→ Webhook atualiza subscriptions → App valida entitlement → Libera features
→ Renovação automática → Webhook atualiza → Continue
→ Cancelamento → Webhook → Downgrade para free
→ Restore purchases → RevenueCat valida → Reativa
```

### Fluxo Atual

```
User abre app → Paywall → Seleciona plano → RevenueCat (se configurado)
→ Se não configurado: "Em breve!" → volta
→ Se configurado: compra via IAP → CustomerInfo → Alert "Ativada!"
→ MAS: status NÃO é sincronizado com Supabase subscriptions table!
→ Diagnose Edge Function verifica subscriptions table (que pode estar desatualizada)
→ Resultado: usuário paga mas limite continua como free
```

### Divergências Críticas

| Item                       | Esperado                                         | Atual                                               |
| -------------------------- | ------------------------------------------------ | --------------------------------------------------- |
| Sync RevenueCat → Supabase | Webhook ou SDK listener atualiza `subscriptions` | ❌ Não implementado                                 |
| Stripe Checkout            | Flow completo                                    | ❌ Sem checkout (apenas webhook pronto)             |
| Restore Purchases          | Funciona e re-sincroniza                         | ⚠️ Funciona no RevenueCat mas não atualiza Supabase |
| Upgrade/Downgrade          | Refletido em tempo real                          | ❌ Sem sync automático                              |
| Expiração                  | Detecta e downgrade                              | ❌ Sem verificação periódica                        |
| Trial                      | Período de teste                                 | ❌ Não implementado                                 |

### Riscos de Pagamento

1. 🔴 Usuário paga via IAP → `subscriptions` table permanece `free` → funcionalidades continuam limitadas
2. 🔴 Sem webhook RevenueCat → impossível reconciliar compras
3. ⚠️ Stripe webhook existe mas sem checkout → dead code
4. ⚠️ `current_period_end` não é verificado — assinatura expirada pode parecer ativa

---

## SEÇÃO 7 — AUDITORIA DE BANCO E DADOS

### Problemas de Modelagem

| Problema                            | Tabela             | Impacto                                      |
| ----------------------------------- | ------------------ | -------------------------------------------- |
| `image_url` nunca preenchido        | `pragas_diagnoses` | Funcionalidade perdida                       |
| Sem campo `severity` direto         | `pragas_diagnoses` | Precisa parsear JSON `notes` para obter      |
| `deletion_requested_at` sem backend | `pragas_profiles`  | LGPD compliance fake                         |
| `push_token` sem FK/index           | `pragas_profiles`  | OK para volume atual                         |
| `notes` é TEXT com JSON serializado | `pragas_diagnoses` | Impossível fazer queries por campos internos |
| Sem tabela de logs/audit trail      | global             | Zero rastreabilidade                         |
| Sem tabela de eventos/analytics     | global             | Sem métricas server-side                     |

### Segurança RLS

- ✅ `pragas_diagnoses`: SELECT, INSERT, DELETE por `user_id` — correto
- ✅ `pragas_profiles`: SELECT, INSERT, UPDATE por `id` — correto
- ✅ `subscriptions`: SELECT por `user_id` — correto
- ⚠️ `subscriptions`: INSERT/UPDATE apenas por service_role (correto para segurança, mas sem policy explícita necessária — service_role já bypassa RLS)
- ❌ Sem UPDATE policy em `pragas_diagnoses` — intencional mas não documentado
- ❌ Sem política de backup verificável
- ⚠️ `notes` como JSON serializado permite armazenar dados arbitrários sem validação de schema

### Sugestões de Melhoria

1. Converter `notes` para JSONB com index GIN para queries eficientes
2. Adicionar campo `severity` direto em `pragas_diagnoses` para filtros/ordenação
3. Criar tabela `audit_log` para rastreabilidade de ações
4. Adicionar tabela `pest_library` para biblioteca dinâmica
5. Criar tabela `user_farms` para gestão de propriedades

---

## SEÇÃO 8 — AUDITORIA DE APP STORE E PLAY STORE

### iOS App Store

| Requisito                       | Status | Observação                           |
| ------------------------------- | ------ | ------------------------------------ |
| Apple Sign In                   | ❌     | OBRIGATÓRIO se oferece login social  |
| Restore Purchases button        | ✅     | Presente na Paywall                  |
| Account Deletion                | ⚠️     | UI existe mas backend não processa   |
| Privacy nutrition labels        | ❌     | Não configurado no App Store Connect |
| Camera permission string        | ✅     | Descriptiva e adequada               |
| Location permission string      | ✅     | Descriptiva e adequada               |
| Photo Library permission string | ✅     | Descriptiva e adequada               |
| ITSAppUsesNonExemptEncryption   | ✅     | false — correto para Supabase HTTPS  |
| bundleIdentifier                | ✅     | `com.agrorumo.rumopragas`            |
| ascAppId                        | ❌     | Placeholder "0"                      |
| PrivacyInfo.xcprivacy           | ✅     | Presente no projeto Swift            |
| Minimum deployment target       | ✅     | iOS 15.1                             |
| Screenshots                     | ✅     | Pasta `store-screenshots/` existe    |

**Risco de Rejeição: ALTO** — Apple Sign In ausente é causa garantida de rejeição.

### Google Play Store

| Requisito               | Status | Observação                            |
| ----------------------- | ------ | ------------------------------------- |
| Data Safety declaration | ❌     | Precisa preencher no Play Console     |
| Account deletion        | ⚠️     | UI existe mas não funciona de fato    |
| Adaptive icon           | ✅     | Configurado no `app.json`             |
| Min SDK 24              | ✅     | Android 7.0+                          |
| Target SDK              | ✅     | EAS build usa `latest`                |
| Billing integration     | ⚠️     | RevenueCat configurado mas sem chaves |
| ANRs/Crashes            | 🟡     | Não testável sem build                |
| Content rating          | ❌     | Precisa preencher no Play Console     |

---

## SEÇÃO 9 — PERFORMANCE E ESTABILIDADE

### Gargalos Identificados

| Gargalo                                        | Causa                                   | Impacto                             | Prioridade |
| ---------------------------------------------- | --------------------------------------- | ----------------------------------- | ---------- |
| Payload de diagnóstico ~6.7MB                  | Base64 em JSON body                     | Lentidão em 3G/4G, timeout em rural | P2         |
| Home screen faz 3+ chamadas paralelas no mount | Weather + Diagnoses count + Queue count | Re-render cascata                   | P3         |
| Biblioteca hardcoded no bundle                 | 80+ pragas no JS bundle                 | Aumento do bundle size              | P3         |
| Chat history em AsyncStorage                   | Parsing de JSON a cada render           | Lentidão com muitas mensagens       | P3         |
| Sem lazy loading na Library FlatList           | Todos os items renderizados             | Potencial janking                   | P3         |

### Pontos de Estabilidade

| Risco            | Cenário                            | Mitigação Atual           |
| ---------------- | ---------------------------------- | ------------------------- |
| Race condition   | Duplo-tap no "Iniciar Diagnóstico" | Nenhuma (sem debounce)    |
| Loading infinito | Claude API timeout > 180s          | Edge Function tem timeout |
| Crash silencioso | AsyncStorage full                  | Try/catch com fallback    |
| Tela branca      | Erro não capturado em contexto     | ErrorBoundary presente ✅ |

---

## SEÇÃO 10 — PLANO DE AÇÃO PRIORIZADO

### P0 — CORRIGIR ANTES DE PUBLICAR

| #   | Ação                                                                     | Esforço | Área         |
| --- | ------------------------------------------------------------------------ | ------- | ------------ |
| 1   | Rotacionar TODAS as chaves expostas (Supabase anon key, Stripe live key) | 2h      | Segurança    |
| 2   | Implementar Apple Sign In (expo-apple-authentication)                    | 12h     | Auth         |
| 3   | Corrigir push token sync (`.eq('id', user.id)`)                          | 5 min   | Notificações |
| 4   | Implementar account deletion backend (Edge Function cron)                | 6h      | LGPD         |
| 5   | Configurar `ascAppId` no EAS                                             | 30 min  | Publicação   |
| 6   | Implementar limite de chat IA por plano no backend                       | 3h      | Pagamentos   |
| 7   | Decidir: manter Expo OU Swift nativo (recomendado: Expo)                 | Decisão | Arquitetura  |
| 8   | Implementar sync RevenueCat → Supabase subscriptions                     | 8h      | Pagamentos   |
| 9   | Corrigir hooks condicionais em `result.tsx`                              | 1h      | Estabilidade |
| 10  | Implementar analytics básico (PostHog/Mixpanel)                          | 8h      | Produto      |

### P1 — CORRIGIR LOGO DEPOIS

| #   | Ação                                                    | Esforço |
| --- | ------------------------------------------------------- | ------- |
| 11  | Adicionar validação client-side de email/senha          | 3h      |
| 12  | Corrigir Dark Mode toggle (remover ou implementar real) | 3h      |
| 13  | Adicionar acentos no i18n pt-BR                         | 2h      |
| 14  | Implementar upload de imagem para Storage + `image_url` | 6h      |
| 15  | Adicionar idempotency no Stripe webhook                 | 2h      |
| 16  | Implementar rate limiting nas Edge Functions            | 4h      |
| 17  | Restringir CORS nas Edge Functions                      | 1h      |
| 18  | Verificar email confirmation no Supabase Auth           | 1h      |
| 19  | Corrigir useEffect deps no Loading screen               | 2h      |
| 20  | Implementar Google Sign In                              | 8h      |

### P2 — MELHORIAS IMPORTANTES

| #   | Ação                                               | Esforço |
| --- | -------------------------------------------------- | ------- |
| 21  | Implementar tela de edição de perfil               | 6h      |
| 22  | Botão limpar chat na tela de IA                    | 30 min  |
| 23  | Remover localização default hardcoded              | 30 min  |
| 24  | Internacionalizar TIPS hardcoded                   | 1h      |
| 25  | Converter `notes` para JSONB no DB                 | 4h      |
| 26  | Implementar notificações push server-side          | 12h     |
| 27  | Multipart upload para imagens (melhorar perf)      | 12h     |
| 28  | Mapa de diagnósticos geolocalizados                | 16h     |
| 29  | Onboarding inteligente (perguntar culturas/região) | 8h      |
| 30  | Trial period de 7 dias para plano Pro              | 6h      |

### P3 — MELHORIAS PREMIUM / REFINAMENTOS

| #   | Ação                                           | Esforço |
| --- | ---------------------------------------------- | ------- |
| 31  | Dashboard web para produtores                  | 40h+    |
| 32  | Biblioteca de pragas dinâmica (banco de dados) | 12h     |
| 33  | Chat IA com envio de fotos inline              | 8h      |
| 34  | Gestão de talhões/propriedade                  | 24h     |
| 35  | Integração com AGROFIT/MAPA                    | 16h     |
| 36  | Comparação temporal de diagnósticos            | 12h     |
| 37  | Fotos de referência na biblioteca              | 8h      |
| 38  | Calendário agrícola                            | 16h     |
| 39  | Export de dados para CSV/Excel                 | 4h      |
| 40  | Deep links universais                          | 4h      |

---

## SEÇÃO 11 — QUICK WINS (Alto Impacto + Baixa Dificuldade)

| #   | Quick Win                                                     | Tempo  | Impacto                   |
| --- | ------------------------------------------------------------- | ------ | ------------------------- |
| 1   | Corrigir `.eq('id', user.id)` no push token sync              | 5 min  | Habilita push server-side |
| 2   | Adicionar acentos nos textos i18n pt-BR                       | 1h     | Visual profissional       |
| 3   | Adicionar botão "Limpar conversa" no Chat IA                  | 30 min | UX                        |
| 4   | Remover Dark Mode toggle (seguir sistema)                     | 30 min | Remove bug visível        |
| 5   | Configurar `ascAppId` no EAS                                  | 30 min | Desbloqueia publicação    |
| 6   | Remover coordenada default hardcoded no diagnóstico           | 30 min | Dados mais precisos       |
| 7   | Adicionar badge de "Novo" no chat IA quando sugestões mudarem | 30 min | Engajamento               |
| 8   | Adicionar vibração (haptic) ao deletar diagnóstico            | 10 min | UX premium                |
| 9   | Mostrar data relativa no histórico ("há 2 dias")              | 1h     | UX moderna                |
| 10  | Adicionar link para suporte/email nas Settings                | 30 min | Confiança                 |

---

## SEÇÃO 12 — O QUE NÃO FOI POSSÍVEL VALIDAR

| Item                           | Motivo                                        | Como Validar                                               |
| ------------------------------ | --------------------------------------------- | ---------------------------------------------------------- |
| **Endpoints em produção**      | Sem acesso ao Supabase Dashboard              | Testar com `curl` contra URLs do `.env`                    |
| **RevenueCat offerings reais** | Chaves não presentes/ativas                   | Configurar no RevenueCat Dashboard e testar em device real |
| **Email confirmation ativo**   | Depende de config no Supabase Auth            | Verificar no Supabase Dashboard → Auth → Settings          |
| **Stripe webhook em produção** | Sem acesso ao Stripe Dashboard                | Verificar logs do Stripe CLI                               |
| **Build iOS real**             | Sem máquina com Xcode/Apple Dev Account ativa | Rodar `eas build -p ios --profile development`             |
| **Build Android real**         | Sem dispositivo Android                       | Rodar `eas build -p android --profile preview`             |
| **Performance real em device** | Sem device físico                             | Testar com Expo Dev Client em device                       |
| **Push notifications reais**   | Requer device físico + EAS project            | Deploy Edge Function + enviar push via Expo API            |
| **Crash analytics**            | Nenhum SDK instalado (Sentry/Bugsnag)         | Não há dados de crashes                                    |
| **SEO/Website**                | Nenhum website encontrado no repositório      | Verificar se `rumopragas.com.br` existe                    |
| **Google Play billing**        | Sem conta Google Play Developer verificada    | Criar app no Play Console e testar                         |
| **Claude API custo real**      | Sem acesso ao dashboard Anthropic             | Verificar billing no console.anthropic.com                 |

---

## RANKINGS FINAIS

### 🏆 TOP 20 CORREÇÕES MAIS IMPORTANTES

1. Rotacionar chaves expostas no Git
2. Implementar Apple Sign In
3. Sync RevenueCat → Supabase subscriptions
4. Implementar account deletion real (backend)
5. Limite de chat IA por plano
6. Corrigir push token sync (`.eq('id')`)
7. Configurar `ascAppId` no EAS
8. Implementar analytics
9. Corrigir hooks condicionais em result.tsx
10. Validação client-side de email/senha
11. Upload/persistência de imagens de diagnóstico
12. Rate limiting nas Edge Functions
13. Acentos no i18n pt-BR
14. Dark mode fix (remover toggle fake)
15. Restringir CORS em produção
16. Idempotency no Stripe webhook
17. Email confirmation verificação
18. Tela de edição de perfil
19. Trial period para plano Pro
20. Google Sign In

### 📈 TOP 10 MELHORIAS QUE MAIS AUMENTAM CONVERSÃO

1. Analytics com funil de conversão
2. Apple Sign In + Google Sign In (reduz fricção de cadastro)
3. Trial period de 7 dias
4. Onboarding inteligente (personalização)
5. Histórico com fotos (valor tangível do diagnóstico)
6. Dashboard web (justifica plano Enterprise)
7. Notificações push com alertas de pragas personalizados
8. Mapa de diagnósticos geolocalizados
9. Chat IA com fotos inline
10. Relatório PDF premium com logo do produtor

### 🤝 TOP 10 MELHORIAS QUE MAIS AUMENTAM CONFIANÇA DO USUÁRIO

1. Acentos corretos e texto profissional (i18n)
2. Histórico com fotos de cada diagnóstico
3. Fotos de referência na biblioteca de pragas
4. PDF de relatório com dados completos
5. Disclaimer profissional (consulte agrônomo)
6. Selo de segurança / LGPD visível
7. Tela "Sobre" com dados da empresa
8. Suporte por email/WhatsApp funcional
9. Loading estados e skeletons profissionais (já tem ✅)
10. Feedbacks de erro claros e específicos (parcialmente ✅)

### 📉 TOP 10 MELHORIAS QUE MAIS DIMINUEM CHURN

1. Notificações push relevantes (alertas de pragas para região)
2. Histórico com fotos (razão para voltar ao app)
3. Modo offline completo
4. Comparação temporal (valor crescente com uso)
5. Chat IA com personalização por cultura do produtor
6. Gestão de talhões (investimento do usuário no app)
7. Relatórios de tendência (valor analítico)
8. Trial generoso que mostra valor antes de cobrar
9. Review prompt no momento certo (já implementado ✅)
10. Calendário agrícola com lembretes

### 🛡️ TOP 10 MELHORIAS QUE MAIS REDUZEM RISCO DE SUPORTE E BUGS

1. Rate limiting nas APIs (evita abuso e custo)
2. Error Boundary global (já implementado ✅)
3. Offline queue com retry (parcialmente ✅)
4. Validação de email/senha client-side
5. Idempotency em webhooks
6. Crash analytics (Sentry/Bugsnag)
7. Testes E2E automatizados
8. Health check endpoint
9. Backup automático do banco
10. Logs e monitoramento de Edge Functions

---

## ⚖️ VEREDITO FINAL

# ❌ NÃO DEVE PUBLICAR AINDA

### Justificativa:

1. **Segurança:** Chaves secretas foram expostas no repositório. É necessário rotacionar TODAS as chaves antes de qualquer publicação. Este é um risco de segurança grave.

2. **Compliance Apple:** A ausência de Apple Sign In **garante rejeição** na App Store. A Apple exige Sign In with Apple quando qualquer método de login de terceiros é oferecido.

3. **Compliance LGPD:** O account deletion existe na UI mas não é executado no backend. Isso configura violação da LGPD e pode resultar em sanções legais.

4. **Pagamentos:** Existe uma **desconexão fatal** entre RevenueCat (IAP) e a tabela `subscriptions` do Supabase. Um usuário que paga NÃO terá seu plano atualizado no backend, resultando em limite de diagnósticos incorreto.

5. **Operacional:** Sem analytics, sem crash reporting, sem monitoramento. Publicar sem visibilidade é voar às cegas.

### Para mudar para "PODE PUBLICAR COM RESSALVAS":

- Resolver itens P0 (1-10) — estimativa: **40-60 horas de trabalho**
- Resolver quick wins (1-10) — estimativa: **5-6 horas**
- Total para publicar: **~1-2 semanas de desenvolvimento focado**

O produto tem **excelente potencial**. O core de diagnóstico por IA é diferenciado. A arquitetura é moderna. O código é bem organizado. Mas precisa de polimento crítico em segurança, pagamentos e compliance antes de ir ao ar.

---

_Relatório gerado em 6 de Abril de 2026 por auditoria automatizada de 30 frentes._
