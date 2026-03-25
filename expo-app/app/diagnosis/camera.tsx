import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSize, Gradients } from '../../constants/theme';
import { PremiumCard } from '../../components/PremiumCard';

export default function CameraScreen() {
  const pickImage = async (useCamera: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissao necessaria',
          'Precisamos de acesso a camera para fotografar pragas e doencas na lavoura. Habilite nas configuracoes do dispositivo.',
        );
        return;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissao necessaria',
          'Precisamos de acesso a galeria para selecionar fotos de pragas e doencas. Habilite nas configuracoes do dispositivo.',
        );
        return;
      }
    }

    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ['images'],
      quality: 0.7,
      base64: true,
      allowsEditing: true,
    };

    const result = useCamera
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      router.push({ pathname: '/diagnosis/crop-select', params: { imageUri: asset.uri, imageBase64: asset.base64 || '' } });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <Ionicons name="close" size={22} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Ionicons name="camera" size={16} color={Colors.accent} />
          <Text style={styles.headerText}>Diagnosticar Praga</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={[styles.iconRing, { width: 150, height: 150 }]}>
            <View style={[styles.iconRing, { width: 120, height: 120, borderColor: Colors.accent + '33' }]}>
              <Ionicons name="camera" size={48} color={Colors.accent} />
            </View>
          </View>
        </View>

        <Text style={styles.title}>Identificação por IA</Text>
        <Text style={styles.subtitle}>Tire uma foto ou escolha da galeria para identificar pragas e doenças na sua lavoura</Text>

        <View style={styles.buttons}>
          <TouchableOpacity onPress={() => pickImage(true)} activeOpacity={0.8}>
            <PremiumCard>
              <View style={styles.btnRow}>
                <LinearGradient colors={Gradients.hero as any} style={styles.btnIcon}>
                  <Ionicons name="camera" size={24} color="#FFF" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.btnTitle}>Tirar Foto</Text>
                  <Text style={styles.btnSub}>Use a câmera para capturar a praga</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.systemGray3} />
              </View>
            </PremiumCard>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => pickImage(false)} activeOpacity={0.8}>
            <PremiumCard>
              <View style={styles.btnRow}>
                <LinearGradient colors={[Colors.techBlue, Colors.techBlue + 'CC']} style={styles.btnIcon}>
                  <Ionicons name="images" size={24} color="#FFF" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.btnTitle}>Escolher da Galeria</Text>
                  <Text style={styles.btnSub}>Selecione uma foto existente</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Colors.systemGray3} />
              </View>
            </PremiumCard>
          </TouchableOpacity>
        </View>

        <View style={styles.tips}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={16} color={Colors.warmAmber} />
            <Text style={styles.tipsTitle}>Dicas para melhor resultado</Text>
          </View>
          <PremiumCard>
            {[
              { icon: 'sunny', color: '#FFD600', text: 'Boa iluminação natural' },
              { icon: 'expand', color: '#00BCD4', text: 'Foco na área afetada, bem de perto' },
              { icon: 'leaf', color: Colors.accent, text: 'Inclua folhas, caule ou fruto visíveis' },
              { icon: 'image', color: Colors.techIndigo, text: 'Imagem nítida sem tremor' },
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <Ionicons name={tip.icon as any} size={16} color={tip.color} />
                <Text style={styles.tipText}>{tip.text}</Text>
              </View>
            ))}
          </PremiumCard>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.systemGray6, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerText: { fontSize: FontSize.headline, fontWeight: '700' },
  content: { flex: 1, paddingHorizontal: Spacing.lg, alignItems: 'center' },
  iconContainer: { marginTop: 20, marginBottom: 20 },
  iconRing: { borderWidth: 2, borderColor: Colors.accent + '1A', borderRadius: 999, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: FontSize.title, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: FontSize.subheadline, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: 20, marginBottom: 24 },
  buttons: { width: '100%', gap: 12 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  btnIcon: { width: 54, height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  btnTitle: { fontSize: FontSize.headline, fontWeight: '600' },
  btnSub: { fontSize: FontSize.caption, color: Colors.textSecondary, marginTop: 2 },
  tips: { width: '100%', marginTop: 24 },
  tipsHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  tipsTitle: { fontSize: FontSize.subheadline, fontWeight: '600', color: Colors.warmAmber },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  tipText: { fontSize: FontSize.subheadline, color: Colors.textSecondary },
});
