export interface AgrioPrediction {
  id: string;
  confidence: number;
  common_name?: string;
  scientific_name?: string;
  category?: string;
  type?: string;
}

export interface AgrioProduct {
  name: string;
  active_ingredient?: string;
  dosage?: string;
  interval?: string;
  safety_period?: string;
  toxic_class?: string;
}

export interface AgrioEnrichment {
  name_pt?: string;
  name_es?: string;
  description?: string;
  description_es?: string;
  causes?: string[];
  causes_es?: string[];
  symptoms?: string[];
  symptoms_es?: string[];
  chemical_treatment?: string[];
  chemical_treatment_es?: string[];
  biological_treatment?: string[];
  biological_treatment_es?: string[];
  cultural_treatment?: string[];
  cultural_treatment_es?: string[];
  prevention?: string[];
  prevention_es?: string[];
  severity?: SeverityLevel;
  lifecycle?: string;
  economic_impact?: string;
  monitoring?: string[];
  favorable_conditions?: string[];
  resistance_info?: string;
  recommended_products?: AgrioProduct[];
  related_pests?: string[];
  action_threshold?: string;
  mip_strategy?: string;
}

export interface AgrioNotesData {
  message?: string;
  crop?: string;
  crop_confidence?: number;
  id_array?: AgrioPrediction[];
  predictions?: AgrioPrediction[];
  enrichment?: AgrioEnrichment;
}

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'none';

export type ConfidenceLevelName = 'high' | 'medium' | 'low' | 'very_low';

export interface DiagnosisResult {
  id: string;
  user_id: string;
  crop: string;
  pest_id?: string;
  pest_name?: string;
  confidence?: number;
  image_url?: string;
  notes?: string;
  location_lat?: number;
  location_lng?: number;
  location_name?: string;
  created_at: string;
  parsedNotes?: AgrioNotesData;
}

// --- Helpers ---

export const SEVERITY_CONFIG: Record<
  SeverityLevel,
  { displayName: string; color: string; icon: string }
> = {
  critical: { displayName: 'Critico', color: '#FF3B30', icon: 'alert-triangle' },
  high: { displayName: 'Alto', color: '#FF9500', icon: 'alert-circle' },
  medium: { displayName: 'Medio', color: '#FFCC00', icon: 'info' },
  low: { displayName: 'Baixo', color: '#2E8C3E', icon: 'check-circle' },
  none: { displayName: 'Nenhum', color: '#8E8E93', icon: 'minus-circle' },
};

export const CONFIDENCE_LEVELS: Record<
  ConfidenceLevelName,
  { displayName: string; color: string; percentage: string }
> = {
  high: { displayName: 'Alta', color: '#2E8C3E', percentage: '85%+' },
  medium: { displayName: 'Media', color: '#FFCC00', percentage: '60-84%' },
  low: { displayName: 'Baixa', color: '#FF9500', percentage: '40-59%' },
  very_low: { displayName: 'Muito Baixa', color: '#FF3B30', percentage: '<40%' },
};

export function getConfidenceLevel(confidence?: number): ConfidenceLevelName {
  if (!confidence) return 'low';
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.60) return 'medium';
  if (confidence >= 0.40) return 'low';
  return 'very_low';
}

export function getSeverityLevel(result: DiagnosisResult): SeverityLevel {
  const severity = result.parsedNotes?.enrichment?.severity;
  if (severity && SEVERITY_CONFIG[severity]) return severity;
  return 'medium';
}

export function getDisplayName(result: DiagnosisResult): string {
  return (
    result.parsedNotes?.enrichment?.name_pt ??
    result.pest_name ??
    result.pest_id ??
    'Diagnostico'
  );
}

export function getScientificName(result: DiagnosisResult): string | undefined {
  const preds = result.parsedNotes?.predictions ?? result.parsedNotes?.id_array ?? [];
  const top = preds.find((p) => p.id !== 'Healthy') ?? preds[0];
  return top?.scientific_name;
}

export function getAllPredictions(result: DiagnosisResult): AgrioPrediction[] {
  return result.parsedNotes?.predictions ?? result.parsedNotes?.id_array ?? [];
}

export function isHealthy(result: DiagnosisResult): boolean {
  return result.pest_id === 'Healthy' || result.pest_name === 'Healthy';
}

export function parseNotes(notes?: string): AgrioNotesData | undefined {
  if (!notes) return undefined;
  try {
    return JSON.parse(notes) as AgrioNotesData;
  } catch {
    return undefined;
  }
}
