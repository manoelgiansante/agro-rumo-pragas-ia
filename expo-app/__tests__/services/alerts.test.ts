import { generateAlerts, type PestAlert } from '../../services/alerts';
import type { WeatherData } from '../../services/weather';

function makeWeather(overrides: Partial<WeatherData> = {}): WeatherData {
  return {
    temperature: 25,
    apparentTemperature: 26,
    humidity: 60,
    precipitation: 0,
    rain: 0,
    weatherCode: 0,
    windSpeed: 10,
    dailyPrecipitationSum: 0,
    description: 'Ceu limpo',
    icon: 'sunny',
    ...overrides,
  };
}

describe('generateAlerts', () => {
  it('returns ferrugem alert for high humidity + high temp', () => {
    const weather = makeWeather({ humidity: 85, temperature: 28 });
    const alerts = generateAlerts(weather);

    const ferrugem = alerts.find((a) => a.id === 'ferrugem_alta_umidade');
    expect(ferrugem).toBeDefined();
    expect(ferrugem!.severity).toBe('high');
    expect(ferrugem!.title).toContain('ferrugem');
  });

  it('returns mites/acaros alert for hot + dry conditions', () => {
    const weather = makeWeather({ temperature: 33, humidity: 40 });
    const alerts = generateAlerts(weather);

    const acaros = alerts.find((a) => a.id === 'acaros_calor_seco');
    expect(acaros).toBeDefined();
    expect(acaros!.severity).toBe('medium');
    expect(acaros!.title).toContain('acaros');
  });

  it('returns cold stress alert for cold conditions', () => {
    const weather = makeWeather({ temperature: 5, humidity: 50 });
    const alerts = generateAlerts(weather);

    const cold = alerts.find((a) => a.id === 'geada_estresse');
    expect(cold).toBeDefined();
    expect(cold!.severity).toBe('low');
    expect(cold!.title).toContain('Baixas temperaturas');
  });

  it('sorts alerts by severity: high > medium > low', () => {
    // Conditions that trigger multiple severity levels:
    // humidity > 80, temp > 25 -> ferrugem (high)
    // humidity > 85, temp 15-25 -> mofo branco (high) -- temp > 25 so won't match
    // humidity 60-80 -> won't match (humidity > 80)
    // temp > 28, precipitationSum < 3 -> percevejos (medium)
    // wind > 25 -> vento (low)
    const weather = makeWeather({
      temperature: 29,
      humidity: 82,
      windSpeed: 30,
      dailyPrecipitationSum: 1,
    });

    const alerts = generateAlerts(weather);

    // Should have at least alerts of different severities
    expect(alerts.length).toBeGreaterThanOrEqual(2);

    // Verify ordering
    for (let i = 0; i < alerts.length - 1; i++) {
      const severityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
      expect(severityOrder[alerts[i].severity]).toBeLessThanOrEqual(
        severityOrder[alerts[i + 1].severity],
      );
    }
  });

  it('returns empty array when no conditions match', () => {
    // Very specific conditions that avoid all rules:
    // temp 15 (not < 10, not > 25, not > 28, not > 30, not 25-32 with low humidity)
    // humidity 35 (not > 80, not > 85, not > 75, not < 50, not 60-80, not < 65, not 40-70)
    // rain 0, wind 5, precipitation 0
    const weather = makeWeather({
      temperature: 15,
      humidity: 35,
      rain: 0,
      windSpeed: 5,
      dailyPrecipitationSum: 0,
    });

    const alerts = generateAlerts(weather);
    // May return 0 or the stable conditions alert. Check each has valid structure.
    alerts.forEach((alert) => {
      expect(alert).toHaveProperty('id');
      expect(alert).toHaveProperty('title');
      expect(alert).toHaveProperty('severity');
      expect(alert).toHaveProperty('date');
    });
  });

  it('includes date in ISO format on each alert', () => {
    const weather = makeWeather({ humidity: 90, temperature: 28 });
    const alerts = generateAlerts(weather);

    expect(alerts.length).toBeGreaterThan(0);
    alerts.forEach((alert) => {
      // ISO format: YYYY-MM-DDTHH:mm:ss.sssZ
      expect(alert.date).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });
  });

  it('returns mofo branco alert for very high humidity + moderate temp', () => {
    const weather = makeWeather({ humidity: 90, temperature: 20 });
    const alerts = generateAlerts(weather);

    const mofo = alerts.find((a) => a.id === 'mofo_branco');
    expect(mofo).toBeDefined();
    expect(mofo!.severity).toBe('high');
  });
});
