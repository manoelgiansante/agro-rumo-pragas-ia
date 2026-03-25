import { Config } from '../constants/config';
import type { DiagnosisResult } from '../types/diagnosis';
import { parseNotes } from '../types/diagnosis';

export type { DiagnosisResult };

export async function sendDiagnosis(
  imageBase64: string,
  cropType: string,
  latitude: number | null,
  longitude: number | null,
  token: string
): Promise<DiagnosisResult> {
  const url = `${Config.SUPABASE_URL}/functions/v1/diagnose`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      image_base64: imageBase64,
      crop_type: cropType,
      latitude,
      longitude,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Diagnostico falhou (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  // Parse notes if they come as string
  if (data.notes && !data.parsedNotes) {
    data.parsedNotes = parseNotes(data.notes);
  }

  return data as DiagnosisResult;
}

export async function fetchDiagnoses(
  token: string,
  userId: string,
  limit: number = 50
): Promise<DiagnosisResult[]> {
  const url =
    `${Config.SUPABASE_URL}/rest/v1/pragas_diagnoses` +
    `?user_id=eq.${userId}&order=created_at.desc&limit=${limit}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: Config.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar diagnosticos: ${response.status}`);
  }

  const rows = await response.json();
  return rows.map((row: DiagnosisResult) => ({
    ...row,
    parsedNotes: parseNotes(row.notes),
  }));
}

export async function deleteDiagnosis(token: string, id: string): Promise<void> {
  const url = `${Config.SUPABASE_URL}/rest/v1/pragas_diagnoses?id=eq.${id}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: Config.SUPABASE_ANON_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao excluir diagnostico: ${response.status}`);
  }
}

export async function fetchDiagnosisCount(token: string, userId: string): Promise<number> {
  const url =
    `${Config.SUPABASE_URL}/rest/v1/pragas_diagnoses` +
    `?user_id=eq.${userId}&select=id`;

  const response = await fetch(url, {
    method: 'HEAD',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: Config.SUPABASE_ANON_KEY,
      Prefer: 'count=exact',
    },
  });

  if (!response.ok) {
    throw new Error(`Falha ao buscar contagem: ${response.status}`);
  }

  const count = response.headers.get('content-range');
  if (count) {
    const match = count.match(/\/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
  return 0;
}
