# Compliance Check — Rumo Pragas Meta Ads

> **DRY-RUN.** Checklist legal + Meta content policy. Validar ANTES de cada criativo ir ao ar.

## 1. Lei Federal 7.802/89 (Defensivos Agrícolas)

**Aplicabilidade:** Rumo Pragas não vende defensivo, mas sugere que pragas/doenças exigem manejo. Se criativo menciona "controle", "combate", "aplicação", "produto químico" → DISCLAIMER obrigatório.

### Disclaimer obrigatório (versão curta, rodapé):
> "Ferramenta auxiliar. Não substitui o receituário agronômico (Lei 7.802/89)."

### Disclaimer versão longa (onde cabe, landing):
> "O Rumo Pragas é uma ferramenta auxiliar de identificação de pragas e doenças por imagem. Os resultados são indicativos e não substituem o diagnóstico presencial, o receituário agronômico obrigatório (Lei 7.802/89, Decreto 4.074/2002) e a supervisão de agrônomo habilitado. Resultados individuais podem variar."

### Onde aplicar (checklist):
- [ ] Video creative (Creative A): texto sobreposto nos últimos 3 segundos (fonte pequena OK)
- [ ] Carrossel (Creative B): card 3 ou 5, rodapé
- [ ] Single image (Creative C): canto inferior direito (fonte 10-12px se 1080×1080)
- [ ] Todos os primary texts que mencionam "recomendação", "manejo", "controle"
- [ ] Landing page: footer + página dedicada `/termos-legais`

## 2. Meta Content Policy (prohibited content)

### 2.1 Health claims — NÃO usar
- [ ] NÃO: "cura sua lavoura"
- [ ] NÃO: "90% mais saúde nas plantas" (sem estudo)
- [ ] NÃO: before/after dramáticos sem disclaimer "resultados podem variar"
- [x] OK: "ajuda a identificar" (funcional, não-garantia)
- [x] OK: "IA treinada com lavouras brasileiras" (factual)

### 2.2 Income claims — NÃO usar
- [ ] NÃO: "economize R$X por safra"
- [ ] NÃO: "aumente seu lucro em 30%"
- [ ] NÃO: "recupere o investimento em 1 semana"
- [x] OK: "decida o manejo antes que a praga se alastre" (sem valor monetário absoluto)
- [x] OK: "acelere a triagem" (genérico)

### 2.3 Escassez falsa — NÃO usar
- [ ] NÃO: "só hoje"
- [ ] NÃO: "últimas vagas"
- [ ] NÃO: "promoção relâmpago 24h"
- [x] OK: "7 dias grátis" (oferta real, não tempo-limitado)

### 2.4 Before/after — PERMITIDO com disclaimer
- [x] OK: screenshot antes (folha com praga) + depois (diagnóstico na tela)
- **Disclaimer obrigatório:** "Resultados individuais podem variar. Ferramenta auxiliar."
- [ ] NÃO: fotos de lavoura morta → lavoura saudável (implica cura, health claim)

### 2.5 Sensacionalismo / medo excessivo — NÃO usar
- [ ] NÃO: "sua fazenda vai falir se você não agir"
- [ ] NÃO: "essa praga vai destruir tudo"
- [x] OK: "identificar cedo faz diferença" (fato)

### 2.6 Discriminação / targeting protegido — NÃO aplicável
- Agro BR não é categoria especial (housing/employment/credit). OK prosseguir.

### 2.7 Testimonials — se usar, requer consentimento
- [ ] Se creative incluir depoimento de produtor: ter consentimento escrito (LGPD)
- [ ] Se foto de produtor: ter release de imagem
- [ ] Nome e estado podem aparecer ("João, MT"); CPF NUNCA

### 2.8 Idade — restringir 18+
- [x] Age restriction: 18+ (agronegócio, decisão comercial)
- Configurar em ad set level

## 3. Meta Special Ad Categories

Rumo Pragas **NÃO é** Special Ad Category (não é housing, employment, credit, social issue). OK usar todas as targeting options incluindo geo + idade.

**Validar em Business Manager** que a conta não está marcada acidentalmente como Special Category.

## 4. LGPD (Brasil)

### Landing page (já deve ter):
- [ ] Cookie banner com opt-in consent
- [ ] Privacy Policy link visível no footer
- [ ] Data processing agreement com Meta (via Pixel settings)
- [ ] Botão "gerenciar consentimento"

### CAPI + hashing:
- [x] Email/phone hashed SHA-256 antes de enviar (já implementado em `/api/capi`)
- [x] Consent check ANTES de fire event (validar no Pixel client-side)
- [ ] Se user opt-out: não enviar via CAPI tbm (server-side respeita consent)

### Waitlist form:
- [ ] Checkbox opt-in "Aceito receber contato sobre Rumo Pragas"
- [ ] Link pra privacy policy
- [ ] Sem pré-marcação (checkbox unchecked by default)

## 5. Apple / Google (quando dirigir pra app store)

### ATT (iOS 14.5+)
- [x] Rumo Pragas app já deve pedir ATT prompt (verificar `expo-tracking-transparency`)
- [ ] Se user nega ATT: CAPI server-side ainda funciona (external_id + IP)

### Privacy Nutrition Label (App Store Connect)
- [ ] Declarar "Data Used to Track You" se Meta Ads usa event_id do app
- [ ] Data Linked to You: email, user_id

### Data Safety (Play Store)
- [ ] Declarar Meta Analytics + Meta Ads SDK (se instalar)

## 6. Conteúdo criativo — validação específica

### Copy existente (`meta-ads-copy.md`)
Auditoria rápida dos 9 primary texts:

| Texto | Issue potencial | Mitigação |
|-------|-----------------|-----------|
| Ângulo 1.1 | "7 dias grátis sem cartão" | OK — não é escassez |
| Ângulo 1.2 | "se você não identificar cedo, o estrago só cresce" | Borderline fear — adicionar "pode variar" |
| Ângulo 1.3 | "compara +500 pragas" | Factual, deve ter no landing |
| Ângulo 2.1 | "indica a praga mais provável" | OK — não garante |
| Ângulo 2.2 | "Cansou de mandar foto pro grupo de WhatsApp" | OK |
| Ângulo 2.3 | "mais de 30 culturas suportadas" | Factual — validar |
| Ângulo 3.1 | "acelera a triagem" | OK |
| Ângulo 3.2 | "antes de chamar o agrônomo" | Borderline — NÃO substituir agrônomo |
| Ângulo 3.3 | "quanto vale descobrir uma praga 3 dias antes" | OK — pergunta retórica |

**Ajustes recomendados:**
- Ângulo 3.2: trocar "antes de chamar o agrônomo" → "antes de acionar o agrônomo" (semântica mais suave)
- Todos os headlines: garantir que disclaimer "Lei 7.802/89" esteja no primary text ou na imagem/video

## 7. Claims factuais — backup de prova

Se criativo diz **"90% de precisão"**, **"+500 pragas catalogadas"**, **"30+ culturas"**:
- [ ] Ter documento interno de validação (training set, test accuracy)
- [ ] Meta pode pedir em review — ter pronto
- [ ] Se claim não é comprovável: trocar por "precisão variável" / "catálogo em expansão"

## 8. Checklist pré-submit (por creative)

Antes de subir cada creative:
- [ ] Text overlay < 20% (usar Meta Text Overlay Tool)
- [ ] Disclaimer Lei 7.802/89 presente
- [ ] Sem health claim absoluto
- [ ] Sem income claim absoluto
- [ ] Sem escassez falsa
- [ ] Sem before/after sem disclaimer
- [ ] Age 18+ no ad set
- [ ] Landing page + privacy policy OK
- [ ] LGPD cookie banner OK

## 9. Processo se ad for rejeitado

1. Meta envia notification + motivo
2. **NÃO resubmit idêntico** — vai ser rejeitado de novo + strike conta
3. Ler motivo, ajustar criativo, resubmit
4. Se rejeição persiste: appeal em Ads Manager → "Request Review"
5. Se 3 rejeições seguidas mesmo ad set: parar, revisar política, só então resubmit

## 10. Pendências pra Manoel aprovar antes de ativar

- [ ] Confirmar disclaimers Lei 7.802/89 estão no landing + em todos os criativos
- [ ] Validar que cookie banner LGPD funciona (teste com Chrome incognito)
- [ ] Ter documento de validação da claim "precisão IA" (se usar número)
- [ ] Confirmar que waitlist form tem opt-in não pré-marcado
- [ ] Testar ATT prompt no app (iOS)
- [ ] Ajustar Ângulo 3.2 ("antes de chamar" → "antes de acionar")
- [ ] Revisar landing footer: privacy policy + termos legais + ANVISA/MAPA se aplicável
