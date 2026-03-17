import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PremiumCard from './PremiumCard';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

export interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  dailyPrecipitation: number;
  description: string;
  icon: string;
  location: string;
}

interface WeatherCardProps {
  weather: WeatherData | null;
  isLoading: boolean;
}

function getWeatherIcon(icon: string): React.ComponentProps<typeof Ionicons>['name'] {
  if (icon.includes('sun') || icon.includes('clear')) return 'sunny';
  if (icon.includes('cloud.rain') || icon.includes('rain')) return 'rainy';
  if (icon.includes('cloud.bolt') || icon.includes('thunder')) return 'thunderstorm';
  if (icon.includes('cloud')) return 'cloudy';
  if (icon.includes('snow')) return 'snow';
  return 'partly-sunny';
}

export default function WeatherCard({ weather, isLoading }: WeatherCardProps) {
  const isDark = useColorScheme() === 'dark';

  if (isLoading) {
    return (
      <PremiumCard>
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.accent} />
          <Text style={[styles.loadingText, isDark && { color: Colors.textDark }]}>
            Carregando clima...
          </Text>
        </View>
      </PremiumCard>
    );
  }

  if (!weather) return null;

  return (
    <PremiumCard>
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <View style={styles.iconCircle}>
            <Ionicons name={getWeatherIcon(weather.icon)} size={24} color={Colors.warmAmber} />
          </View>
          <View style={styles.tempInfo}>
            <Text style={[styles.location, isDark && { color: Colors.systemGray2 }]}>
              {weather.location}
            </Text>
            <Text style={[styles.temperature, isDark && { color: Colors.textDark }]}>
              {Math.round(weather.temperature)}{'\u00B0'}C
            </Text>
            <Text style={[styles.description, isDark && { color: Colors.systemGray2 }]}>
              {weather.description}
            </Text>
          </View>
        </View>

        <View style={styles.metricsColumn}>
          <MetricRow
            icon="water"
            value={`${Math.round(weather.humidity)}%`}
            color="#00BCD4"
            isDark={isDark}
          />
          <MetricRow
            icon="rainy"
            value={`${weather.dailyPrecipitation.toFixed(1)} mm`}
            color={Colors.techBlue}
            isDark={isDark}
          />
          <MetricRow
            icon="leaf"
            value={`${Math.round(weather.windSpeed)} km/h`}
            color="#009688"
            isDark={isDark}
          />
        </View>
      </View>
    </PremiumCard>
  );
}

function MetricRow({
  icon,
  value,
  color,
  isDark,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  color: string;
  isDark: boolean;
}) {
  return (
    <View style={styles.metricRow}>
      <Ionicons name={icon} size={12} color={color} />
      <Text style={[styles.metricValue, isDark && { color: Colors.systemGray2 }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(235, 176, 38, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tempInfo: {
    gap: 2,
  },
  location: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
  },
  temperature: {
    fontSize: FontSize.title2,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  description: {
    fontSize: FontSize.caption,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  metricsColumn: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metricValue: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: Spacing.md,
  },
  loadingText: {
    fontSize: FontSize.subheadline,
    color: Colors.textSecondary,
  },
});
