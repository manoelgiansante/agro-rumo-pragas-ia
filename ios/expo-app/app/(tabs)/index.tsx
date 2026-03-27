import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, StyleSheet, useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize, Gradients } from '../../constants/theme';
import { PremiumCard } from '../../components/PremiumCard';
import { WeatherCard } from '../../components/WeatherCard';
import { supabase } from '../../services/supabase';
import { fetchWeather, WeatherData } from '../../services/weather';
import { useAuth } from '../../hooks/useAuth';
import { useLocation } from '../../hooks/useLocation';

export default function HomeScreen() {
  const { user, session } = useAuth();
  const { location, cityName } = useLocation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [diagnosisCount, setDiagnosisCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const loadData = useCallback(async () => {
    if (location) {
      try {
        const w = await fetchWeather(location.latitude, location.longitude);
        if (cityName) w.location = cityName;
        setWeather(w);
      } catch {}
    }
    if (session?.access_token && user?.id) {
      try {
        const { count } = await supabase
          .from('pragas_diagnoses')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id);
        setDiagnosisCount(count ?? 0);
      } catch {}
    }
  }, [location, cityName, session, user]);

  useEffect(() => { loadData(); }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const riskLevel = () => {
    if (!weather) return '—';
    if (weather.humidity > 80 || weather.temperature > 35) return 'Alto';
    if (weather.humidity > 60 || weather.temperature > 30) return 'Médio';
    return 'Baixo';
  };

  const tips = [
    { icon: 'leaf', title: 'Monitore regularmente', desc: 'Faça inspeções semanais nas áreas mais vulneráveis da lavoura' },
    { icon: 'water', title: 'Atenção à irrigação', desc: 'Excesso de umidade favorece doenças fúngicas' },
    { icon: 'shield-checkmark', title: 'Rotação de culturas', desc: 'Alterne culturas para quebrar ciclos de pragas' },
  ];

  return (
    <ScrollView
      style={[styles.container, isDark && styles.containerDark]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent} />}
    >
      <LinearGradient colors={Gradients.hero as any} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroContent}>
          <Text style={styles.greeting}>{greeting()}</Text>
          <Text style={styles.userName}>{user?.user_metadata?.full_name || 'Produtor'}</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {weather && <WeatherCard weather={weather} />}

        <TouchableOpacity onPress={() => router.push('/diagnosis/camera')} activeOpacity={0.8}>
          <PremiumCard>
            <View style={styles.scanRow}>
              <LinearGradient colors={Gradients.hero as any} style={styles.scanIcon}>
                <Ionicons name="camera" size={26} color="#FFF" />
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={[styles.scanTitle, isDark && styles.textDark]}>Diagnosticar Praga</Text>
                <Text style={styles.scanSub}>Foto ou galeria • IA especializada</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.systemGray3} />
            </View>
          </PremiumCard>
        </TouchableOpacity>

        <View style={styles.statsRow}>
          {[
            { icon: 'document-text', value: diagnosisCount > 0 ? `${diagnosisCount}` : '—', label: 'Diagnósticos', color: Colors.accent },
            { icon: 'shield-checkmark', value: 'MIP', label: 'Estratégia', color: Colors.techBlue },
            { icon: 'trending-up', value: riskLevel(), label: 'Monitoramento', color: Colors.warmAmber },
          ].map((stat, i) => (
            <PremiumCard key={i} style={{ flex: 1 }}>
              <View style={styles.statCard}>
                <Ionicons name={stat.icon as any} size={22} color={stat.color} />
                <Text style={[styles.statValue, isDark && styles.textDark]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            </PremiumCard>
          ))}
        </View>

        <Text style={[styles.sectionTitle, isDark && styles.textDark]}>Boas Práticas</Text>
        {tips.map((tip, i) => (
          <PremiumCard key={i} style={{ marginBottom: Spacing.sm }}>
            <View style={styles.tipRow}>
              <View style={[styles.tipIcon, { backgroundColor: Colors.accent + '1F' }]}>
                <Ionicons name={tip.icon as any} size={18} color={Colors.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tipTitle, isDark && styles.textDark]}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </View>
            </View>
          </PremiumCard>
        ))}
        <View style={{ height: 32 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  containerDark: { backgroundColor: Colors.backgroundDark },
  hero: { height: 190, justifyContent: 'flex-end' },
  heroContent: { padding: 20, paddingBottom: 24 },
  greeting: { fontSize: FontSize.subheadline, color: 'rgba(255,255,255,0.9)' },
  userName: { fontSize: FontSize.title, fontWeight: '700', color: '#FFF' },
  content: { padding: Spacing.lg, marginTop: -16 },
  scanRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scanIcon: { width: 60, height: 60, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  scanTitle: { fontSize: FontSize.title3, fontWeight: '700' },
  scanSub: { fontSize: FontSize.subheadline, color: Colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
  statCard: { alignItems: 'center', gap: 6 },
  statValue: { fontSize: FontSize.subheadline, fontWeight: '700' },
  statLabel: { fontSize: FontSize.caption2, color: Colors.textSecondary },
  sectionTitle: { fontSize: FontSize.title3, fontWeight: '700', marginTop: Spacing.xl, marginBottom: Spacing.md },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  tipIcon: { width: 42, height: 42, borderRadius: BorderRadius.md, justifyContent: 'center', alignItems: 'center' },
  tipTitle: { fontSize: FontSize.subheadline, fontWeight: '600' },
  tipDesc: { fontSize: FontSize.caption, color: Colors.textSecondary, marginTop: 2 },
  textDark: { color: Colors.textDark },
});
