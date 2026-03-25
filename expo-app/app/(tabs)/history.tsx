import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert, StyleSheet, useColorScheme, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize } from '../../constants/theme';
import { PremiumCard } from '../../components/PremiumCard';
import { DiagnosisCard } from '../../components/DiagnosisCard';
import { supabase } from '../../services/supabase';
import { useAuthContext } from '../../context/AuthContext';

export default function HistoryScreen() {
  const { user, session } = useAuthContext();
  const isDark = useColorScheme() === 'dark';
  const [diagnoses, setDiagnoses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadDiagnoses = async () => {
    if (!session?.access_token || !user?.id) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('pragas_diagnoses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);
      setDiagnoses(data ?? []);
    } catch {}
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadDiagnoses();
    }, [user, session])
  );

  const deleteDiagnosis = async (id: string) => {
    Alert.alert('Excluir', 'Tem certeza que deseja excluir este diagnóstico?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
        await supabase.from('pragas_diagnoses').delete().eq('id', id);
        setDiagnoses(d => d.filter(x => x.id !== id));
      }},
    ]);
  };

  const filtered = diagnoses.filter(d =>
    !search || (d.pest_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.crop || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={[styles.center, isDark && styles.containerDark]}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Carregando histórico...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <View style={styles.searchRow}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, isDark && styles.textDark]}
          placeholder="Buscar por praga..."
          placeholderTextColor={Colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.center}>
            <Ionicons name="document-text-outline" size={48} color={Colors.systemGray3} />
            <Text style={[styles.emptyTitle, isDark && styles.textDark]}>Nenhum diagnóstico</Text>
            <Text style={styles.emptyDesc}>Seus diagnósticos aparecerão aqui</Text>
          </View>
        }
        ListHeaderComponent={
          <Text style={[styles.count, isDark && styles.textDark]}>{filtered.length} diagnósticos</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onLongPress={() => deleteDiagnosis(item.id)} activeOpacity={0.8}>
            <DiagnosisCard diagnosis={item} />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  containerDark: { backgroundColor: Colors.backgroundDark },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.systemGray6, borderRadius: BorderRadius.md, margin: Spacing.lg, paddingHorizontal: 14, gap: 8 },
  searchInput: { flex: 1, height: 44, fontSize: FontSize.body },
  count: { fontSize: FontSize.subheadline, fontWeight: '600', marginBottom: Spacing.md },
  loadingText: { fontSize: FontSize.subheadline, color: Colors.textSecondary, marginTop: 12 },
  emptyTitle: { fontSize: FontSize.title3, fontWeight: '700', marginTop: 16 },
  emptyDesc: { fontSize: FontSize.subheadline, color: Colors.textSecondary, marginTop: 4 },
  textDark: { color: Colors.textDark },
});
