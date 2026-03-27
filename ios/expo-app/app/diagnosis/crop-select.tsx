import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList, TextInput, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSize, Gradients } from '../../constants/theme';
import { CROPS, CropType } from '../../constants/crops';

export default function CropSelectScreen() {
  const { imageUri, imageBase64 } = useLocalSearchParams<{ imageUri: string; imageBase64: string }>();
  const [selected, setSelected] = useState<CropType>(CROPS[0]);
  const [search, setSearch] = useState('');

  const filtered = CROPS.filter(c => !search || c.displayName.toLowerCase().includes(search.toLowerCase()));

  const handleSelect = (crop: CropType) => {
    Haptics.selectionAsync();
    setSelected(crop);
  };

  const startDiagnosis = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/diagnosis/loading', params: { imageUri, imageBase64, cropId: selected.id, cropApiName: selected.apiName } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerText}>Selecionar Cultura</Text>
        <View style={{ width: 36 }} />
      </View>

      {imageUri && (
        <View style={styles.preview}>
          <Image source={{ uri: imageUri }} style={styles.previewImage} />
          <View style={{ flex: 1 }}>
            <Text style={styles.previewTitle}>Imagem selecionada</Text>
            <Text style={styles.previewSub}>Escolha a cultura para melhor precisão</Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color={Colors.accent} />
        </View>
      )}

      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={Colors.textSecondary} />
        <TextInput style={styles.searchInput} placeholder="Buscar cultura..." placeholderTextColor={Colors.textSecondary} value={search} onChangeText={setSearch} />
      </View>

      <Text style={styles.question}>Qual cultura está afetada?</Text>

      <FlatList
        data={filtered}
        numColumns={4}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
        columnWrapperStyle={{ gap: 8, marginBottom: 8 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.cropItem, selected.id === item.id && styles.cropItemSelected]}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
          >
            <Text style={styles.cropEmoji}>{item.icon}</Text>
            <Text style={[styles.cropName, selected.id === item.id && styles.cropNameSelected]} numberOfLines={1}>{item.displayName}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={startDiagnosis} activeOpacity={0.8}>
          <LinearGradient colors={Gradients.hero as any} style={styles.startBtn}>
            <Text style={styles.startBtnText}>Iniciar Diagnóstico</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.systemGray6, justifyContent: 'center', alignItems: 'center' },
  headerText: { fontSize: FontSize.headline, fontWeight: '700' },
  preview: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.systemGray6, borderRadius: BorderRadius.lg, marginBottom: Spacing.md },
  previewImage: { width: 56, height: 56, borderRadius: 12 },
  previewTitle: { fontSize: FontSize.subheadline, fontWeight: '600' },
  previewSub: { fontSize: FontSize.caption, color: Colors.textSecondary, marginTop: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.systemGray6, borderRadius: BorderRadius.md, marginHorizontal: Spacing.lg, paddingHorizontal: 12, gap: 8, marginBottom: Spacing.md },
  searchInput: { flex: 1, height: 40, fontSize: FontSize.subheadline },
  question: { fontSize: FontSize.title3, fontWeight: '700', paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  cropItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: BorderRadius.md, backgroundColor: Colors.systemGray6, borderWidth: 2, borderColor: 'transparent' },
  cropItemSelected: { borderColor: Colors.accent, backgroundColor: Colors.accent + '15' },
  cropEmoji: { fontSize: 28 },
  cropName: { fontSize: FontSize.caption2, fontWeight: '600', marginTop: 4, color: Colors.textSecondary },
  cropNameSelected: { color: Colors.accent },
  footer: { padding: Spacing.lg, paddingBottom: 32 },
  startBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, height: 56, borderRadius: BorderRadius.lg },
  startBtnText: { fontSize: FontSize.headline, fontWeight: '700', color: '#FFF' },
});
