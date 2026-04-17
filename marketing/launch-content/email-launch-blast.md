# Email Launch Blast — Rumo Pragas (React Email ready)

**Lista alvo:** Waitlist AgroRumo + subscribers atuais Rumo Máquinas + landing page signups
**Envio:** Terça-feira 07h00 BRT (produtor abre email antes de ir pro campo)
**Sender:** Manoel Nascimento <manoel@agrorumo.com>
**Reply-to:** manoel@agrorumo.com (humano, não no-reply)

---

## SUBJECT LINE A/B TEST (3 opções)

### Opção A — Dor/Número
```
Rafael perdeu 30% da soja em 48h. Você não precisa.
```
**Rationale:** Nome real + número concreto + call out direto. Emoção + urgência.

### Opção B — Curiosity gap
```
A praga da sua lavoura tem 5 segundos de vida.
```
**Rationale:** Força a abertura. Promessa específica. Zero clickbait.

### Opção C — Announcement direto
```
🌾 Tá no ar: Rumo Pragas (grátis pra você testar)
```
**Rationale:** Transparente, menciona grátis. Para quem já conhece a marca.

**Recomendação:** Testar A vs B em 10% da lista cada (split), vencedor vai pra 80% restante.

---

## PREHEADER

```
IA que identifica praga por foto — 82,5% de acurácia, validada em campo. Download iOS + Android.
```

**Char count:** 107 (ideal Gmail preview: <110)

---

## BODY (React Email markdown)

```markdown
# Oi, {{firstName}} 👋

Há seis meses, meu amigo Rafael me ligou às 22h: "Manoel, perdi 30% da soja."

Ferrugem asiática. **Demorou 48 horas pra identificar.** Tempo suficiente pra praga tomar conta de 40 hectares.

Ele não é iniciante. Planta soja em Goiás há 12 anos. O problema não foi ele.

O problema é este:

- Identificar praga no olho exige anos de experiência
- Agrônomo ocupado não responde WhatsApp em 5 minutos
- Livro de pragas na estante não te acode às 18h na lavoura
- E cada hora que passa, a praga avança

Foi aí que começamos a construir o **Rumo Pragas**.

## O que ele faz

Um app pra celular que:

- 📷 **Identifica praga por foto** em 5 segundos
- 🤖 **IA treinada em +100 pragas brasileiras** (soja, milho, café, algodão)
- 💬 **Chat com agrônoma IA** pra tirar dúvida na hora
- 📊 **Histórico da sua lavoura** com relatório PDF exportável

**Acurácia validada em campo: 82,5%** — testado com produtores reais em Goiás, Mato Grosso e Paraná.

Não é IA gringa reembalada. É Claude Vision treinado com banco de imagens real da lavoura brasileira.

## Baixe agora, grátis pra começar

[📱 Baixar no iOS](https://apps.apple.com/br/app/id6762232682)

[🤖 Baixar no Android](https://play.google.com/store/apps/details?id=com.agrorumo.rumopragas)

Ou acesse direto: [pragas.agrorumo.com](https://pragas.agrorumo.com)

## Preciso da sua ajuda

Esse é o lançamento 1.0. A acurácia de 82,5% vai virar 90%+ conforme mais produtores usarem e reportarem resultado.

Se você testar, **me responde esse email** contando:

- Qual praga você identificou
- Acertou ou errou
- O que faltou no app

Feedback do produtor é o que vai fazer essa ferramenta virar o padrão do setor.

Abraço,

**Manoel Nascimento**  
Fundador, AgroRumo  
[manoel@agrorumo.com](mailto:manoel@agrorumo.com)

---

*P.S. Se conhece algum produtor que já perdeu lavoura por identificar praga tarde, encaminha esse email. Acabou de ficar uma ferramenta gratuita nas mãos de quem precisa.*

---

*Você está recebendo este email porque se cadastrou na AgroRumo ou Rumo Pragas. Se preferir não receber mais, [cancele aqui]({{unsubscribe_url}}).*
```

**Word count:** ~340 palavras (dentro de 300-500 target)

---

## MÉTRICAS ESPERADAS

| Métrica | Benchmark agro B2B | Meta Rumo Pragas |
|---------|-------------------|------------------|
| Open rate | 22-28% | 30%+ |
| Click rate | 3-5% | 5%+ |
| Unsubscribe | <0,5% | <0,3% |
| Reply rate | 0,1-0,5% | 1%+ (CTA explícito de reply) |

---

## NOTAS DE PRODUÇÃO

- **DKIM/SPF/DMARC:** Validar antes do send (risco spam). Checar via mail-tester.com se score < 9/10 → não enviar.
- **Imagem no corpo:** Máximo 2 (herói + app screenshot). Razão texto:imagem ideal 70:30.
- **Links trackados:** UTM params em TODOS os links: `utm_source=email&utm_campaign=launch&utm_content=cta_ios` (e cta_android, cta_web).
- **Dark mode:** Testar render em Gmail/Apple Mail dark. Logo precisa versão branca ou fundo transparente.
- **A/B subject test:** Enviar em 2 batches de 1h de diferença. Resend MCP suporta via broadcast split.
- **Segmento:** NUNCA enviar pra usuários Rumo Máquinas ativos pagantes sem opt-in cross-product. Usar tag `subscribed_pragas_launch` ou similar.
- **Warm-up check:** Se domínio agrorumo.com tem < 30 dias de histórico de envio, fazer staged send (200 → 1000 → 5000 → full list) pra evitar spam trap.
- **CAN-SPAM + LGPD:** Unsubscribe obrigatório, sender address físico no footer (usar endereço comercial, não residencial).
