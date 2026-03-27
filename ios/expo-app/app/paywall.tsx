import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSize, Gradients } from '../constants/theme';

const PLANS = [
  { id: 'free', name: 'Gratuito', price: 'R$ 0', limit: 3, features: ['3 diagnósticos/mês', 'Biblioteca de pragas', 'Chat IA limitado'] },
  { id: 'pro', name: 'Pro', price: 'R$ 29/mês', limit: 30, popular: true, features: ['30 diagnósticos/mês', 'Biblioteca completa', 'Chat IA ilimitado', 'Histórico completo', 'Suporte prioritário'] },
  { id: 'enterprise', name: 'Enterprise', price: 'R$ 69/mês', limit: -1, features: ['Diagnósticos ilimitados', 'Tudo do Pro', 'API de integração', 'Dashboard avançado', 'Suporte dedicado'] },
];

export default function PaywallScreen() {
  const [selected, setSelected] = useState('pro');
  const plan = PLANS.find(p => p.id === selected)!;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient colors={Gradients.hero as any} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Ionicons name="close" size={22} color="#FFF" />
          </TouchableOpacity>
          <Ionicons name="diamond" size={40} color="#FFF" style={{ marginBottom: 12 }} />
          <Text style={styles.title}>Rumo Pragas Pro</Text>
          <Text style={styles.subtitle}>Desbloqueie todo o potencial da IA para proteção da sua lavoura</Text>
        </LinearGradient>

        <View style={styles.plans}>
          {PLANS.map(p => (
            <TouchableOpacity
              key={p.id}
              style={[styles.planCard, selected === p.id && styles.planCardSelected]}
              onPress={() => { Haptics.selectionAsync(); setSelected(p.id); }}
              activeOpacity={0.8}
            >
              {p.popular && (
                <View style={styles.popularBadge}>
                  <Ionicons name="star" size={8} color="#FFF" />
                  <Text style={styles.popularText}>Popular</Text>
                </View>
              )}
              <Text style={[styles.planName, selected === p.id && styles.planNameSelected]}>{p.name}</Text>
              <Text style={[styles.planPrice, selected === p.id && styles.planPriceSelected]}>{p.price}</Text>
              <Text style={styles.planLimit}>{p.limit === -1 ? 'ilimitado' : `${p.limit} diag/mês`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.features}>
          <Text style={styles.featuresTitle}>Recursos incluídos</Text>
          {plan.features.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.accent} />
              <Text style={styles.featureText}>{f}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.back(); }} activeOpacity={0.8}>
          <LinearGradient colors={selected === 'free' ? [Colors.systemGray4, Colors.systemGray3] : Gradients.hero as any} style={styles.subscribeBtn}>
            <Text style={styles.subscribeBtnText}>{selected === 'free' ? 'Continuar Gratuito' : `Assinar ${plan.price}`}</Text>
          </LinearGradient>
        </TouchableOpacity>
        <Text style={styles.cancelNote}>Cancele a qualquer momento. Sem compromisso.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingBottom: 30, paddingHorizontal: 24, alignItems: 'center' },
  closeBtn: { position: 'absolute', top: 50, left: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.title, fontWeight: '700', color: '#FFF' },
  subtitle: { fontSize: FontSize.subheadline, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 8 },
  plans: { flexDirection: 'row', gap: 10, padding: Spacing.lg },
  planCard: { flex: 1, alignItems: 'center', padding: Spacing.lg, backgroundColor: Colors.card, borderRadius: BorderRadius.lg, borderWidth: 2, borderColor: 'transparent' },
  planCardSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent + '0D' },
  popularBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, position: 'absolute', top: -10, backgroundColor: Colors.accent, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  popularText: { fontSize: 9, fontWeight: '700', color: '#FFF' },
  planName: { fontSize: FontSize.subheadline, fontWeight: '700', color: Colors.textSecondary },
  planNameSelected: { color: Colors.accent },
  planPrice: { fontSize: FontSize.title3, fontWeight: '700', marginTop: 4 },
  planPriceSelected: { color: Colors.accent },
  planLimit: { fontSize: FontSize.caption2, color: Colors.textSecondary, marginTop: 4 },
  features: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  featuresTitle: { fontSize: FontSize.subheadline, fontWeight: '700', marginBottom: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  featureText: { fontSize: FontSize.subheadline },
  footer: { padding: Spacing.lg, paddingBottom: 32 },
  subscribeBtn: { height: 56, borderRadius: BorderRadius.lg, justifyContent: 'center', alignItems: 'center' },
  subscribeBtnText: { fontSize: FontSize.headline, fontWeight: '700', color: '#FFF' },
  cancelNote: { fontSize: FontSize.caption, color: Colors.textSecondary, textAlign: 'center', marginTop: 10 },
});
