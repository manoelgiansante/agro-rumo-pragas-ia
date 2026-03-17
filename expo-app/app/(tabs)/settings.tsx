import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, StyleSheet, useColorScheme, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors, Spacing, BorderRadius, FontSize, Gradients } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

export default function SettingsScreen() {
  const isDark = useColorScheme() === 'dark';
  const { user, signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(isDark);
  const [pushEnabled, setPushEnabled] = useState(true);
  const userName = user?.user_metadata?.full_name || 'Produtor';
  const userEmail = user?.email || '';

  const handleSignOut = () => {
    Alert.alert('Sair da Conta', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, isDark && styles.textMuted]}>{title}</Text>
      <View style={[styles.sectionContent, isDark && styles.sectionContentDark]}>{children}</View>
    </View>
  );

  const Row = ({ icon, label, value, onPress, trailing }: any) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress && !trailing} activeOpacity={0.7}>
      <Ionicons name={icon} size={20} color={Colors.accent} style={{ width: 28 }} />
      <Text style={[styles.rowLabel, isDark && styles.textDark]}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      {trailing}
      {onPress && <Ionicons name="chevron-forward" size={16} color={Colors.systemGray3} />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <Section title="Perfil">
        <View style={styles.profileRow}>
          <LinearGradient colors={Gradients.hero as any} style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <Text style={[styles.profileName, isDark && styles.textDark]}>{userName}</Text>
            <Text style={styles.profileEmail}>{userEmail}</Text>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={10} color={Colors.accent} />
              <Text style={styles.roleText}>Produtor Rural</Text>
            </View>
          </View>
        </View>
      </Section>

      <Section title="Assinatura">
        <Row icon="diamond" label="Plano Atual" value="Gratuito" />
        <Row icon="arrow-up-circle" label="Upgrade de Plano" onPress={() => router.push('/paywall')} />
      </Section>

      <Section title="Aparência e Preferências">
        <Row icon="moon" label="Modo Escuro" trailing={<Switch value={darkMode} onValueChange={setDarkMode} trackColor={{ true: Colors.accent }} />} />
        <Row icon="globe" label="Idioma" value="Português" />
        <Row icon="notifications" label="Notificações" trailing={<Switch value={pushEnabled} onValueChange={setPushEnabled} trackColor={{ true: Colors.accent }} />} />
      </Section>

      <Section title="Sobre">
        <Row icon="hand-left" label="Política de Privacidade" onPress={() => Linking.openURL('https://rumopragas.com.br/privacidade')} />
        <Row icon="document-text" label="Termos de Uso" onPress={() => Linking.openURL('https://rumopragas.com.br/termos')} />
        <Row icon="information-circle" label="Versão" value="1.0.0" />
      </Section>

      <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={18} color={Colors.coral} />
        <Text style={styles.signOutText}>Sair da Conta</Text>
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  containerDark: { backgroundColor: Colors.backgroundDark },
  section: { marginTop: Spacing.xl },
  sectionTitle: { fontSize: FontSize.caption, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', paddingHorizontal: Spacing.xl, marginBottom: 6 },
  sectionContent: { backgroundColor: Colors.card, marginHorizontal: Spacing.lg, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  sectionContentDark: { backgroundColor: '#1C1C1E' },
  profileRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: FontSize.title2, fontWeight: '700', color: '#FFF' },
  profileName: { fontSize: FontSize.headline, fontWeight: '600' },
  profileEmail: { fontSize: FontSize.caption, color: Colors.textSecondary, marginTop: 2 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  roleText: { fontSize: FontSize.caption2, fontWeight: '600', color: Colors.accent },
  row: { flexDirection: 'row', alignItems: 'center', padding: Spacing.lg, gap: 10, borderBottomWidth: 0.5, borderBottomColor: Colors.separator },
  rowLabel: { flex: 1, fontSize: FontSize.body },
  rowValue: { fontSize: FontSize.subheadline, color: Colors.textSecondary },
  signOutBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: Spacing.xxl, marginHorizontal: Spacing.lg, padding: Spacing.lg, backgroundColor: Colors.card, borderRadius: BorderRadius.lg },
  signOutText: { fontSize: FontSize.subheadline, fontWeight: '600', color: Colors.coral },
  textDark: { color: Colors.textDark },
  textMuted: { color: Colors.systemGray },
});
