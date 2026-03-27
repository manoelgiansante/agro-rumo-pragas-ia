import { Config } from '../constants/config';

export interface DiagnosisResult {
  id: string;
  user_id: string;
  crop_type: string;
  image_url: string | null;
  diagnosis_text: string;
  confidence: number;
  pest_name: string | null;
  severity: string | null;
  recommendations: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

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
    throw new Error(`Diagnosis failed (${response.status}): ${errorBody}`);
  }

  return response.json();
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
    throw new Error(`Failed to fetch diagnoses: ${response.status}`);
  }

  return response.json();
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
    throw new Error(`Failed to delete diagnosis: ${response.status}`);
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
    throw new Error(`Failed to fetch count: ${response.status}`);
  }

  const count = response.headers.get('content-range');
  if (count) {
    const match = count.match(/\/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  }
  return 0;
}
