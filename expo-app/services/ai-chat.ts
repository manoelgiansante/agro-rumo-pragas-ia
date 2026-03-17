import { Config } from '../constants/config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Voce e o Agro IA, um assistente especializado em pragas agricolas, doencas de plantas e manejo integrado de pragas (MIP). Voce foi criado pela AgroRumo para ajudar agricultores brasileiros.

Suas capacidades:
- Identificar pragas e doencas com base em descricoes de sintomas
- Recomendar metodos de controle (biologico, quimico e cultural)
- Orientar sobre monitoramento e prevencao
- Fornecer informacoes sobre ciclo de vida de pragas
- Sugerir produtos fitossanitarios registrados no MAPA
- Orientar sobre boas praticas agricolas

Regras:
- Sempre responda em portugues brasileiro
- Seja objetivo e pratico nas recomendacoes
- Quando recomendar produtos, sempre mencione a importancia de consultar um agronomo
- Priorize metodos de controle biologico e MIP quando possivel
- Se nao tiver certeza, diga claramente e recomende consultar um profissional`;

export async function sendChatMessage(
  messages: ChatMessage[],
  token: string
): Promise<string> {
  const toolkitUrl = Config.TOOLKIT_URL;
  if (!toolkitUrl) {
    throw new Error('TOOLKIT_URL nao configurado');
  }

  const url = `${toolkitUrl}/agent/chat`;

  const fullMessages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages,
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages: fullMessages }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Chat failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.response ?? data.message ?? data.content ?? '';
}
