import type { WeatherData } from './weather';
import i18n from '../i18n';

export type AlertSeverity = 'high' | 'medium' | 'low';

export interface PestAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  icon: string;
  cropAffected: string;
  date: string;
  isForecast?: boolean;
}

interface AlertRule {
  id: string;
  titleKey: string;
  descKey: string;
  cropKey: string;
  severity: AlertSeverity;
  icon: string;
  condition: (weather: WeatherData) => boolean;
}

const ALERT_RULES: AlertRule[] = [
  // HIGH severity
  {
    id: 'ferrugem_alta_umidade',
    titleKey: 'alerts.ferrugem_title',
    descKey: 'alerts.ferrugem_desc',
    cropKey: 'alerts.ferrugem_crop',
    severity: 'high',
    icon: 'alert-circle',
    condition: (w) => w.humidity > 80 && w.temperature > 25,
  },
  {
    id: 'doencas_fungicas_chuva',
    titleKey: 'alerts.fungicas_title',
    descKey: 'alerts.fungicas_desc',
    cropKey: 'alerts.fungicas_crop',
    severity: 'high',
    icon: 'water',
    condition: (w) => w.rain > 5 && w.temperature > 22 && w.humidity > 75,
  },
  {
    id: 'mofo_branco',
    titleKey: 'alerts.mofo_title',
    descKey: 'alerts.mofo_desc',
    cropKey: 'alerts.mofo_crop',
    severity: 'high',
    icon: 'snow',
    condition: (w) => w.humidity > 85 && w.temperature >= 15 && w.temperature <= 25,
  },

  // MEDIUM severity
  {
    id: 'acaros_calor_seco',
    titleKey: 'alerts.acaros_title',
    descKey: 'alerts.acaros_desc',
    cropKey: 'alerts.acaros_crop',
    severity: 'medium',
    icon: 'bug',
    condition: (w) => w.temperature > 30 && w.humidity < 50,
  },
  {
    id: 'cigarrinha_milho',
    titleKey: 'alerts.cigarrinha_title',
    descKey: 'alerts.cigarrinha_desc',
    cropKey: 'alerts.cigarrinha_crop',
    severity: 'medium',
    icon: 'bug',
    condition: (w) => w.temperature >= 25 && w.temperature <= 32 && w.humidity < 65 && w.rain < 2,
  },
  {
    id: 'lagarta_umidade_moderada',
    titleKey: 'alerts.lagarta_title',
    descKey: 'alerts.lagarta_desc',
    cropKey: 'alerts.lagarta_crop',
    severity: 'medium',
    icon: 'leaf',
    condition: (w) =>
      w.humidity >= 60 && w.humidity <= 80 && w.temperature >= 22 && w.temperature <= 32,
  },
  {
    id: 'percevejos_graos',
    titleKey: 'alerts.percevejos_title',
    descKey: 'alerts.percevejos_desc',
    cropKey: 'alerts.percevejos_crop',
    severity: 'medium',
    icon: 'shield',
    condition: (w) => w.temperature > 28 && w.dailyPrecipitationSum < 3,
  },

  // LOW severity
  {
    id: 'vento_dispersao',
    titleKey: 'alerts.vento_title',
    descKey: 'alerts.vento_desc',
    cropKey: 'alerts.vento_crop',
    severity: 'low',
    icon: 'leaf',
    condition: (w) => w.windSpeed > 25,
  },
  {
    id: 'geada_estresse',
    titleKey: 'alerts.geada_title',
    descKey: 'alerts.geada_desc',
    cropKey: 'alerts.geada_crop',
    severity: 'low',
    icon: 'thermometer',
    condition: (w) => w.temperature < 10,
  },
  {
    id: 'condicoes_favoraveis_geral',
    titleKey: 'alerts.estavel_title',
    descKey: 'alerts.estavel_desc',
    cropKey: 'alerts.estavel_crop',
    severity: 'low',
    icon: 'checkmark-circle',
    condition: (w) =>
      w.temperature >= 18 &&
      w.temperature <= 28 &&
      w.humidity >= 40 &&
      w.humidity <= 70 &&
      w.rain < 1,
  },
];

/**
 * Generates forecast-based pest alerts by analyzing the 7-day daily forecast.
 * Looks for multi-day weather patterns that indicate pest/disease risks.
 */
export function generateForecastAlerts(weather: WeatherData): PestAlert[] {
  const forecast = weather.forecast;
  if (!forecast || forecast.length === 0) return [];

  const now = new Date().toISOString();
  const alerts: PestAlert[] = [];

  // Rule A: 3+ consecutive days with precipitation > 5mm AND temp > 22C
  // → Prolonged fungal disease risk
  let consecutiveWetWarm = 0;
  for (const day of forecast) {
    if (day.precipitationSum > 5 && day.temperatureMax > 22) {
      consecutiveWetWarm++;
      if (consecutiveWetWarm >= 3) {
        alerts.push({
          id: 'forecast_doencas_fungicas_prolongado',
          title: i18n.t('alerts.forecast_fungicas_title'),
          description: i18n.t('alerts.forecast_fungicas_desc'),
          severity: 'high',
          icon: 'water',
          cropAffected: i18n.t('alerts.forecast_fungicas_crop'),
          date: now,
          isForecast: true,
        });
        break;
      }
    } else {
      consecutiveWetWarm = 0;
    }
  }

  // Rule B: Any day with min temp < 5C → Frost alert
  const frostDay = forecast.find((day) => day.temperatureMin < 5);
  if (frostDay) {
    alerts.push({
      id: 'forecast_geada',
      title: i18n.t('alerts.forecast_geada_title'),
      description: i18n.t('alerts.forecast_geada_desc', { date: frostDay.date }),
      severity: 'high',
      icon: 'snow',
      cropAffected: i18n.t('alerts.forecast_geada_crop'),
      date: now,
      isForecast: true,
    });
  }

  // Rule C: 3+ days with zero precipitation AND temp > 30C
  // → Prolonged dry period - mite/thrips risk
  let consecutiveDryHot = 0;
  for (const day of forecast) {
    if (day.precipitationSum === 0 && day.temperatureMax > 30) {
      consecutiveDryHot++;
      if (consecutiveDryHot >= 3) {
        alerts.push({
          id: 'forecast_seco_acaros',
          title: i18n.t('alerts.forecast_seco_title'),
          description: i18n.t('alerts.forecast_seco_desc'),
          severity: 'medium',
          icon: 'bug',
          cropAffected: i18n.t('alerts.forecast_seco_crop'),
          date: now,
          isForecast: true,
        });
        break;
      }
    } else {
      consecutiveDryHot = 0;
    }
  }

  return alerts;
}

/**
 * Generates pest alerts based on current weather conditions AND the 7-day forecast.
 * Evaluates all rules against the weather data and returns matching alerts
 * sorted by severity (high first).
 * Deduplicates by alert id, keeping the higher severity one.
 */
export function generateAlerts(weather: WeatherData): PestAlert[] {
  const now = new Date().toISOString();
  const severityOrder: Record<AlertSeverity, number> = { high: 0, medium: 1, low: 2 };

  // Current-conditions alerts
  const currentAlerts: PestAlert[] = ALERT_RULES.filter((rule) => rule.condition(weather)).map(
    (rule) => ({
      id: rule.id,
      title: i18n.t(rule.titleKey),
      description: i18n.t(rule.descKey),
      severity: rule.severity,
      icon: rule.icon,
      cropAffected: i18n.t(rule.cropKey),
      date: now,
    }),
  );

  // Forecast-based alerts
  const forecastAlerts = generateForecastAlerts(weather);

  // Merge and deduplicate by id (keep highest severity)
  const alertMap = new Map<string, PestAlert>();

  for (const alert of [...currentAlerts, ...forecastAlerts]) {
    const existing = alertMap.get(alert.id);
    if (!existing || severityOrder[alert.severity] < severityOrder[existing.severity]) {
      alertMap.set(alert.id, alert);
    }
  }

  const merged = Array.from(alertMap.values());

  // Sort: high > medium > low
  merged.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return merged;
}
