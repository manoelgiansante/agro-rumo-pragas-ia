import { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, ClipboardList, BookOpen, ShieldCheck } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const ONBOARDING_KEY = '@rumo_pragas_onboarding_seen';

interface OnboardingPage {
  id: string;
  title: string;
  subtitle: string;
  gradientColors: [string, string];
  Icon: typeof Camera;
}

const PAGES: OnboardingPage[] = [
  {
    id: '1',
    title: 'Diagnostico com IA',
    subtitle:
      'Tire uma foto da planta afetada e nossa inteligencia artificial identifica a praga ou doenca em segundos.',
    gradientColors: ['#0F6B4D', '#1A966B'],
    Icon: Camera,
  },
  {
    id: '2',
    title: 'Historico Completo',
    subtitle:
      'Acompanhe todos os diagnosticos realizados, visualize tendencias e tome decisoes baseadas em dados.',
    gradientColors: ['#2563EB', '#3B82F6'],
    Icon: ClipboardList,
  },
  {
    id: '3',
    title: 'Biblioteca de Pragas',
    subtitle:
      'Acesse informacoes detalhadas sobre as principais pragas e doencas das lavouras brasileiras.',
    gradientColors: ['#D97706', '#F59E0B'],
    Icon: BookOpen,
  },
  {
    id: '4',
    title: 'Proteja sua Lavoura',
    subtitle:
      'Receba recomendacoes de manejo integrado de pragas e proteja sua producao com tecnologia de ponta.',
    gradientColors: ['#0F6B4D', '#29B887'],
    Icon: ShieldCheck,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const finishOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(auth)/login');
  };

  const goToNext = () => {
    if (currentIndex < PAGES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      finishOnboarding();
    }
  };

  const renderPage = ({ item }: { item: OnboardingPage }) => {
    const { Icon } = item;
    return (
      <LinearGradient
        colors={item.gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.page}
      >
        <View style={styles.pageContent}>
          <View style={styles.iconContainer}>
            <Icon size={64} color={Colors.white} strokeWidth={1.5} />
          </View>
          <Text style={styles.pageTitle}>{item.title}</Text>
          <Text style={styles.pageSubtitle}>{item.subtitle}</Text>
        </View>
      </LinearGradient>
    );
  };

  const isLastPage = currentIndex === PAGES.length - 1;

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={PAGES}
        renderItem={renderPage}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setCurrentIndex(index);
        }}
      />

      {/* Bottom controls overlay */}
      <View style={styles.bottomOverlay}>
        {/* Dot indicators */}
        <View style={styles.dotsContainer}>
          {PAGES.map((page, index) => (
            <View
              key={page.id}
              style={[
                styles.dot,
                index === currentIndex ? styles.dotActive : styles.dotInactive,
              ]}
            />
          ))}
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          {!isLastPage ? (
            <>
              <TouchableOpacity onPress={finishOnboarding} style={styles.skipButton}>
                <Text style={styles.skipText}>Pular</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={goToNext} style={styles.nextButton}>
                <Text style={styles.nextText}>Proximo</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              onPress={finishOnboarding}
              style={styles.startButton}
              activeOpacity={0.8}
            >
              <Text style={styles.startText}>Comecar Agora</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  page: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl * 1.5,
    marginTop: -80,
  },
  iconContainer: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxxl,
  },
  pageTitle: {
    fontSize: FontSize.title,
    fontWeight: FontWeight.bold,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  pageSubtitle: {
    fontSize: FontSize.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: Spacing.xxl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.white,
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  skipText: {
    fontSize: FontSize.body,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: FontWeight.medium,
  },
  nextButton: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: BorderRadius.full,
  },
  nextText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: Colors.accent,
  },
  startButton: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
  },
  startText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: Colors.accent,
  },
});
