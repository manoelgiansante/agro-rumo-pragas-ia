import { Config } from '../constants/config';
import { supabase } from './supabase';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function sendChatMessage(
  messages: { role: string; content: string }[]
): Promise<string> {
  // Get current session token
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    throw new Error('Voce precisa estar logado para usar o chat IA');
  }

  const url = `${Config.SUPABASE_URL}/functions/v1/ai-chat`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      messages: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorMessage = `Erro na IA (${response.status})`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed.error) errorMessage = parsed.error;
    } catch {
      // Use default error message
    }
    throw new Error(errorMessage);
  }

  const data = await response.json();

  if (data.response) {
    return data.response;
  }

  throw new Error('Resposta vazia da IA');
}
