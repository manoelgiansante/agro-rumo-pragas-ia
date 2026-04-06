import { fetchWeather, WeatherError } from '../../services/weather';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- Mocks ---
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// --- Helpers ---
const WEATHER_CACHE_KEY = '@rumo_pragas_weather_cache';

function makeOpenMeteoResponse() {
  return {
    current: {
      temperature_2m: 28.5,
      apparent_temperature: 30.1,
      relative_humidity_2m: 72,
      precipitation: 0,
      rain: 0,
      weather_code: 1,
      wind_speed_10m: 12.3,
    },
    daily: {
      time: ['2026-03-26', '2026-03-27', '2026-03-28'],
      temperature_2m_max: [30, 31, 29],
      temperature_2m_min: [20, 21, 19],
      precipitation_sum: [2, 0, 5],
      weather_code: [1, 0, 61],
    },
  };
}

function makeExpectedWeatherData() {
  return {
    temperature: 28.5,
    apparentTemperature: 30.1,
    humidity: 72,
    precipitation: 0,
    rain: 0,
    weatherCode: 1,
    windSpeed: 12.3,
    dailyPrecipitationSum: 2,
    description: 'Predominantemente limpo',
    icon: 'partly-sunny',
    forecast: expect.arrayContaining([
      expect.objectContaining({
        date: '2026-03-26',
        dayAbbrev: 'Hoje',
        temperatureMax: 30,
        temperatureMin: 20,
      }),
    ]),
  };
}

// --- Tests ---
describe('fetchWeather', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
  });

  it('returns correct data structure from API', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeOpenMeteoResponse(),
    });

    const result = await fetchWeather(-23.55, -46.63);

    expect(result).not.toBeNull();
    expect(result).toMatchObject(makeExpectedWeatherData());
    expect(result!.forecast).toHaveLength(3);
    expect(result!.forecast![0].dayAbbrev).toBe('Hoje');
    expect(result!.forecast![1].dayAbbrev).not.toBe('Hoje');
  });

  it('returns cached data when cache is fresh', async () => {
    const cachedData = {
      temperature: 25,
      apparentTemperature: 26,
      humidity: 60,
      precipitation: 0,
      rain: 0,
      weatherCode: 0,
      windSpeed: 5,
      dailyPrecipitationSum: 0,
      description: 'Ceu limpo',
      icon: 'sunny',
    };

    mockAsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({
        data: cachedData,
        timestamp: Date.now(), // Fresh cache
      }),
    );

    const result = await fetchWeather(-23.55, -46.63);

    expect(result).toEqual(cachedData);
    // fetch should NOT have been called because cache was fresh
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('fetches from API when cache is expired', async () => {
    const staleTimestamp = Date.now() - 15 * 60 * 1000; // 15 min ago (TTL is 10 min)

    mockAsyncStorage.getItem.mockResolvedValueOnce(
      JSON.stringify({
        data: { temperature: 20 },
        timestamp: staleTimestamp,
      }),
    );

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeOpenMeteoResponse(),
    });

    const result = await fetchWeather(-23.55, -46.63);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(result!.temperature).toBe(28.5);
  });

  it('caches successful API responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeOpenMeteoResponse(),
    });

    await fetchWeather(-23.55, -46.63);

    expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
      WEATHER_CACHE_KEY,
      expect.stringContaining('"temperature":28.5'),
    );
  });

  it('falls back to stale cache when API fails', async () => {
    const staleData = {
      temperature: 22,
      apparentTemperature: 23,
      humidity: 55,
      precipitation: 0,
      rain: 0,
      weatherCode: 0,
      windSpeed: 3,
      dailyPrecipitationSum: 0,
      description: 'Ceu limpo',
      icon: 'sunny',
    };

    // First call: getCachedWeather returns null (expired)
    // Second call (getStaleCache): returns stale data
    mockAsyncStorage.getItem
      .mockResolvedValueOnce(null) // No fresh cache
      .mockResolvedValueOnce(
        JSON.stringify({
          data: staleData,
          timestamp: Date.now() - 60 * 60 * 1000, // 1 hour old
        }),
      );

    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const result = await fetchWeather(-23.55, -46.63);

    expect(result).toEqual(staleData);
  });

  it('throws WeatherError when API fails and no cache exists', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(fetchWeather(-23.55, -46.63)).rejects.toThrow(WeatherError);
    await expect(fetchWeather(-23.55, -46.63)).rejects.toThrow(
      'Nao foi possivel obter dados meteorologicos',
    );
  });

  it('throws WeatherError when API returns non-OK status and no cache', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchWeather(-23.55, -46.63)).rejects.toThrow(WeatherError);
  });
});
