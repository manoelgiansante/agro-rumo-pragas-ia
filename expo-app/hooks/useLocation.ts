import { useState, useCallback } from 'react';
import * as Location from 'expo-location';

interface LocationState {
  location: { latitude: number; longitude: number } | null;
  cityName: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({
    location: null,
    cityName: null,
    isLoading: false,
    error: null,
  });

  const requestPermission = useCallback(async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setState((prev) => ({
        ...prev,
        error: 'Permissao de localizacao negada',
      }));
      return false;
    }
    return true;
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const granted = await requestPermission();
      if (!granted) {
        setState((prev) => ({ ...prev, isLoading: false }));
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      // Reverse geocode to get city name
      let cityName: string | null = null;
      try {
        const [place] = await Location.reverseGeocodeAsync(coords);
        if (place) {
          cityName = place.city ?? place.subregion ?? place.region ?? null;
        }
      } catch {
        // Reverse geocode can fail silently - location coords are still valid
      }

      setState({
        location: coords,
        cityName,
        isLoading: false,
        error: null,
      });

      return coords;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao obter localizacao';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      return null;
    }
  }, [requestPermission]);

  return {
    ...state,
    requestPermission,
    getCurrentLocation,
  };
}
