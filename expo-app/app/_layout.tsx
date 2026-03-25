import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuthContext } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';
import { Colors } from '../constants/theme';

// Prevent the splash screen from auto-hiding before data is loaded
SplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = '@rumo_pragas_onboarding_seen';

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const segments = useSegments();
  const router = useRouter();
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  // Register for push notifications only after the user is authenticated
  useNotifications(isAuthenticated);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setHasSeenOnboarding(value === 'true');
    });
  }, []);

  // Hide splash screen once auth state and onboarding check are resolved
  useEffect(() => {
    if (!isLoading && hasSeenOnboarding !== null) {
      SplashScreen.hideAsync();
    }
  }, [isLoading, hasSeenOnboarding]);

  useEffect(() => {
    if (isLoading || hasSeenOnboarding === null) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!hasSeenOnboarding && !inOnboarding) {
      router.replace('/onboarding');
    } else if (!isAuthenticated && !inAuthGroup && hasSeenOnboarding) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && (inAuthGroup || inOnboarding)) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments, hasSeenOnboarding, router]);

  if (isLoading || hasSeenOnboarding === null) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="privacy" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
