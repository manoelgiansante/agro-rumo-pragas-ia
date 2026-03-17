import { Config } from '../constants/config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `Você é o Agro IA, assistente especializado em pragas agrícolas e manejo integrado de pragas (MIP) do app Rumo Pragas. Você ajuda produtores rurais, agrônomos e técnicos agrícolas brasileiros. Responda sempre em português brasileiro, de forma clara e prática. Suas especialidades: identificação de pragas, doenças de plantas, recomendações de manejo (cultural, convencional e orgânico), prevenção, monitoramento, condições climáticas favoráveis a pragas, e boas práticas agrícolas. Seja direto, use linguagem acessível e, quando relevante, sugira o diagnóstico por foto do app. Culturas principais: soja, milho, café, algodão, cana-de-açúcar e trigo.`;

export async function sendChatMessage(
  messages: { role: string; content: string }[],
  _token?: string | null
): Promise<string> {
  const apiKey = Config.CLAUDE_API_KEY;

  if (!apiKey) {
    throw new Error('Claude API key não configurada');
  }

  const claudeMessages = messages.map(m => ({
    role: m.role === 'user' ? 'user' as const : 'assistant' as const,
    content: m.content,
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: claudeMessages,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro na IA (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  if (data.content && data.content.length > 0) {
    return data.content[0].text;
  }

  throw new Error('Resposta vazia da IA');
}
