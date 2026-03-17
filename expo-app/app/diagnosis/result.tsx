import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize, Gradients } from '../../constants/theme';
import { PremiumCard } from '../../components/PremiumCard';
import { CollapsibleSection } from '../../components/CollapsibleSection';
import { ConfidenceBar } from '../../components/ConfidenceBar';

export default function ResultScreen() {
  const { data, error } = useLocalSearchParams<{ data?: string; error?: string }>();

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorCenter}>
          <View style={[styles.errorIcon, { backgroundColor: Colors.coral + '1F' }]}>
            <Ionicons name="warning" size={44} color={Colors.coral} />
          </View>
          <Text style={styles.errorTitle}>Erro no Diagnóstico</Text>
          <Text style={styles.errorMsg}>{error}</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={() => router.dismissAll()}>
            <Text style={styles.closeBtnText}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  let result: any = {};
  try { result = JSON.parse(data || '{}'); } catch {}

  const isHealthy = !result.pest_name || result.pest_name?.toLowerCase().includes('healthy');
  const confidence = result.confidence ?? 0;
  const severityColor = confidence > 0.7 ? Colors.coral : confidence > 0.4 ? Colors.warmAmber : Colors.accent;

  const parseNotes = () => {
    try {
      if (typeof result.notes === 'string') return JSON.parse(result.notes);
      return result.notes || {};
    } catch { return {}; }
  };
  const notes = parseNotes();
  const enrichment = notes.enrichment || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient colors={isHealthy ? Gradients.hero as any : [severityColor + '25', severityColor + '08']} style={styles.header}>
          <TouchableOpacity onPress={() => router.dismissAll()} style={styles.backBtn}>
            <Ionicons name="close" size={22} color={isHealthy ? '#FFF' : Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <View style={[styles.headerIcon, { backgroundColor: isHealthy ? 'rgba(255,255,255,0.2)' : severityColor + '25' }]}>
              <Ionicons name={isHealthy ? 'checkmark-circle' : 'warning'} size={32} color={isHealthy ? '#FFF' : severityColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pestName, isHealthy && { color: '#FFF' }]}>{isHealthy ? 'Planta Saudável' : result.pest_name || 'Praga Detectada'}</Text>
              {!isHealthy && <Text style={styles.scientific}>{enrichment.scientific_name || ''}</Text>}
            </View>
          </View>
        </LinearGradient>

        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: severityColor + '1F' }]}>
            <Ionicons name="speedometer" size={10} color={severityColor} />
            <Text style={[styles.badgeText, { color: severityColor }]}>
              {confidence > 0.7 ? 'Alta' : confidence > 0.4 ? 'Média' : 'Baixa'}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: Colors.techBlue + '1F' }]}>
            <Ionicons name="analytics" size={10} color={Colors.techBlue} />
            <Text style={[styles.badgeText, { color: Colors.techBlue }]}>Confiança: {Math.round(confidence * 100)}%</Text>
          </View>
          {result.crop && (
            <View style={[styles.badge, { backgroundColor: Colors.accent + '1F' }]}>
              <Ionicons name="leaf" size={10} color={Colors.accent} />
              <Text style={[styles.badgeText, { color: Colors.accent }]}>{result.crop}</Text>
            </View>
          )}
        </View>

        <View style={styles.sections}>
          {enrichment.description && (
            <CollapsibleSection title="Descrição" icon="document-text" color={Colors.accent} defaultOpen>
              <Text style={styles.sectionText}>{enrichment.description}</Text>
            </CollapsibleSection>
          )}
          {enrichment.symptoms?.length > 0 && (
            <CollapsibleSection title="Sintomas" icon="eye" color={Colors.coral} defaultOpen>
              {enrichment.symptoms.map((s: string, i: number) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: Colors.accent }]} />
                  <Text style={styles.sectionText}>{s}</Text>
                </View>
              ))}
            </CollapsibleSection>
          )}
          {enrichment.causes?.length > 0 && (
            <CollapsibleSection title="Causas" icon="alert-circle" color={Colors.warmAmber}>
              {enrichment.causes.map((s: string, i: number) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: Colors.warmAmber }]} />
                  <Text style={styles.sectionText}>{s}</Text>
                </View>
              ))}
            </CollapsibleSection>
          )}
          {enrichment.cultural_treatment?.length > 0 && (
            <CollapsibleSection title="Controle Cultural / MIP" icon="hand-left" color={Colors.accent}>
              {enrichment.cultural_treatment.map((s: string, i: number) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: Colors.accent }]} />
                  <Text style={styles.sectionText}>{s}</Text>
                </View>
              ))}
            </CollapsibleSection>
          )}
          {enrichment.chemical_treatment?.length > 0 && (
            <CollapsibleSection title="Controle Químico" icon="flask" color={Colors.techBlue}>
              <View style={styles.warning}>
                <Ionicons name="warning" size={14} color={Colors.warmAmber} />
                <Text style={styles.warningText}>Consulte um agrônomo para receituário agronômico</Text>
              </View>
              {enrichment.chemical_treatment.map((s: string, i: number) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: Colors.techBlue }]} />
                  <Text style={styles.sectionText}>{s}</Text>
                </View>
              ))}
            </CollapsibleSection>
          )}
          {enrichment.prevention?.length > 0 && (
            <CollapsibleSection title="Prevenção" icon="shield-checkmark" color="#00BCD4">
              {enrichment.prevention.map((s: string, i: number) => (
                <View key={i} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: '#00BCD4' }]} />
                  <Text style={styles.sectionText}>{s}</Text>
                </View>
              ))}
            </CollapsibleSection>
          )}
        </View>

        <PremiumCard style={{ marginHorizontal: Spacing.lg, marginBottom: 32 }}>
          <Text style={styles.detailTitle}>Detalhes da Análise</Text>
          {[
            ['Cultura selecionada', result.crop],
            ['Confiança', `${Math.round(confidence * 100)}%`],
            ['ID', result.pest_id],
            ['Localização', result.location_name],
          ].filter(([, v]) => v).map(([label, value], i) => (
            <View key={i} style={styles.detailRow}>
              <Text style={styles.detailLabel}>{label}</Text>
              <Text style={styles.detailValue}>{value}</Text>
            </View>
          ))}
        </PremiumCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  headerContent: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  headerIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
  pestName: { fontSize: FontSize.title2, fontWeight: '700' },
  scientific: { fontSize: FontSize.subheadline, color: Colors.textSecondary, fontStyle: 'italic', marginTop: 2 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: Spacing.lg },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  badgeText: { fontSize: FontSize.caption, fontWeight: '600' },
  sections: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  sectionText: { fontSize: FontSize.subheadline, lineHeight: 22, flex: 1 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: 3, marginTop: 8 },
  warning: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, backgroundColor: Colors.warmAmber + '14', borderRadius: 8, marginBottom: 10 },
  warningText: { fontSize: FontSize.caption, color: Colors.warmAmber, flex: 1 },
  detailTitle: { fontSize: FontSize.subheadline, fontWeight: '700', color: Colors.accent, marginBottom: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  detailLabel: { fontSize: FontSize.subheadline, color: Colors.textSecondary },
  detailValue: { fontSize: FontSize.subheadline, fontWeight: '600' },
  errorCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorIcon: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  errorTitle: { fontSize: FontSize.title2, fontWeight: '700', marginBottom: 8 },
  errorMsg: { fontSize: FontSize.subheadline, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32 },
  closeBtn: { backgroundColor: Colors.accent, paddingHorizontal: 48, paddingVertical: 16, borderRadius: BorderRadius.lg },
  closeBtnText: { fontSize: FontSize.headline, fontWeight: '700', color: '#FFF' },
});
