import React, { useState, useMemo } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { CROPS } from '../../constants/crops';
import { PremiumCard } from '../../components/PremiumCard';

const PESTS_BY_CROP: Record<string, { name: string; scientific: string; severity: string }[]> = {
  soja: [
    { name: 'Ferrugem Asiática', scientific: 'Phakopsora pachyrhizi', severity: 'critical' },
    { name: 'Lagarta da Soja', scientific: 'Anticarsia gemmatalis', severity: 'high' },
    { name: 'Percevejo Marrom', scientific: 'Euschistus heros', severity: 'high' },
    { name: 'Mosca Branca', scientific: 'Bemisia tabaci', severity: 'medium' },
  ],
  milho: [
    { name: 'Lagarta do Cartucho', scientific: 'Spodoptera frugiperda', severity: 'critical' },
    { name: 'Cigarrinha do Milho', scientific: 'Dalbulus maidis', severity: 'high' },
    { name: 'Cercosporiose', scientific: 'Cercospora zeae-maydis', severity: 'medium' },
  ],
  cafe: [
    { name: 'Broca do Café', scientific: 'Hypothenemus hampei', severity: 'critical' },
    { name: 'Ferrugem do Café', scientific: 'Hemileia vastatrix', severity: 'high' },
    { name: 'Bicho Mineiro', scientific: 'Leucoptera coffeella', severity: 'medium' },
  ],
};

const severityColor: Record<string, string> = {
  critical: Colors.coral, high: Colors.warmAmber, medium: Colors.techBlue, low: Colors.accent,
};

export default function LibraryScreen() {
  const isDark = useColorScheme() === 'dark';
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const allPests = useMemo(() => {
    const pests: { name: string; scientific: string; severity: string; crop: string }[] = [];
    for (const [crop, list] of Object.entries(PESTS_BY_CROP)) {
      for (const pest of list) pests.push({ ...pest, crop });
    }
    return pests;
  }, []);

  const filtered = allPests.filter(p =>
    (!selectedCrop || p.crop === selectedCrop) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput style={[styles.searchInput, isDark && styles.textDark]} placeholder="Buscar praga..." placeholderTextColor={Colors.textSecondary} value={search} onChangeText={setSearch} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: Spacing.lg, gap: 8, paddingBottom: 8 }}>
        <TouchableOpacity style={[styles.chip, !selectedCrop && styles.chipActive]} onPress={() => setSelectedCrop(null)}>
          <Text style={[styles.chipText, !selectedCrop && styles.chipTextActive]}>Todos</Text>
        </TouchableOpacity>
        {CROPS.filter(c => PESTS_BY_CROP[c.id]).map(crop => (
          <TouchableOpacity key={crop.id} style={[styles.chip, selectedCrop === crop.id && styles.chipActive]} onPress={() => setSelectedCrop(crop.id === selectedCrop ? null : crop.id)}>
            <Text style={styles.chipEmoji}>{crop.icon}</Text>
            <Text style={[styles.chipText, selectedCrop === crop.id && styles.chipTextActive]}>{crop.displayName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item, i) => `${item.crop}-${item.name}-${i}`}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="leaf-outline" size={48} color={Colors.systemGray3} />
            <Text style={[styles.emptyTitle, isDark && styles.textDark]}>Nenhuma praga encontrada</Text>
          </View>
        }
        renderItem={({ item }) => (
          <PremiumCard style={{ marginBottom: Spacing.sm }}>
            <View style={styles.pestRow}>
              <View style={[styles.severityDot, { backgroundColor: severityColor[item.severity] }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.pestName, isDark && styles.textDark]}>{item.name}</Text>
                <Text style={styles.pestScientific}>{item.scientific}</Text>
              </View>
              <Text style={styles.cropBadge}>{CROPS.find(c => c.id === item.crop)?.icon}</Text>
            </View>
          </PremiumCard>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  containerDark: { backgroundColor: Colors.backgroundDark },
  center: { alignItems: 'center', paddingTop: 60 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.systemGray6, borderRadius: BorderRadius.md, margin: Spacing.lg, marginBottom: Spacing.sm, paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, height: 44, fontSize: FontSize.body },
  chip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.full, backgroundColor: Colors.systemGray6, gap: 4 },
  chipActive: { backgroundColor: Colors.accent },
  chipText: { fontSize: FontSize.caption, fontWeight: '600', color: Colors.textSecondary },
  chipTextActive: { color: '#FFF' },
  chipEmoji: { fontSize: 14 },
  pestRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  severityDot: { width: 8, height: 8, borderRadius: 4 },
  pestName: { fontSize: FontSize.subheadline, fontWeight: '600' },
  pestScientific: { fontSize: FontSize.caption, color: Colors.textSecondary, fontStyle: 'italic' },
  cropBadge: { fontSize: 20 },
  emptyTitle: { fontSize: FontSize.title3, fontWeight: '700', marginTop: 16 },
  textDark: { color: Colors.textDark },
});
