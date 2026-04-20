import { useEffect, useRef, useState, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import {
  configureNotificationHandler,
  registerForPushNotificationsAsync,
} from '../services/notifications';
import { supabase } from '../services/supabase';

// iOS 26 TurboModule crash fix: do NOT call configureNotificationHandler() at
// module-load time. It is now lazy+idempotent (see services/notifications.ts)
// and is invoked the first time the hook mounts or registerForPushNotificationsAsync
// is called.

interface UseNotificationsReturn {
  expoPushToken: string | null;
  notification: Notifications.Notification | null;
  registerForNotifications: () => Promise<string | null>;
}

/**
 * Hook that manages push notification registration and incoming notification handling.
 * - Registers for push notifications on mount (if shouldRegister is true)
 * - Listens for incoming notifications while app is foregrounded
 * - Handles notification tap responses (deep linking)
 */
export function useNotifications(shouldRegister: boolean = false): UseNotificationsReturn {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const syncTokenToSupabase = useCallback(async (token: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('pragas_profiles').update({ push_token: token }).eq('id', user.id);
      }
    } catch (error) {
      if (__DEV__) console.warn('Failed to sync push token to Supabase:', error);
    }
  }, []);

  const registerForNotifications = useCallback(async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setExpoPushToken(token);
      await syncTokenToSupabase(token);
    }
    return token;
  }, [syncTokenToSupabase]);

  useEffect(() => {
    // Web has no native push — skip listener installation to avoid TurboModule
    // calls on a platform that does not implement them.
    if (Platform.OS === 'web') {
      return;
    }

    // Lazy, idempotent handler init. Wrapped in try/catch by the service.
    configureNotificationHandler();

    if (shouldRegister) {
      registerForNotifications();
    }

    // Listen for notifications received while app is in foreground.
    // Wrapped in try/catch because on iOS 26 the TurboModule init may throw;
    // in that case we degrade to no-op listeners instead of crashing the app.
    try {
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (receivedNotification) => {
          setNotification(receivedNotification);
        },
      );
    } catch (error) {
      if (__DEV__) console.warn('[notifications] addNotificationReceivedListener failed:', error);
    }

    try {
      responseListener.current = Notifications.addNotificationResponseReceivedListener(
        (response) => {
          const data = response.notification.request.content.data;
          if (data?.screen === 'diagnosis' && data?.diagnosisId) {
            router.push(`/diagnosis/${data.diagnosisId}`);
          } else if (data?.screen === 'home') {
            router.replace('/(tabs)');
          }
        },
      );
    } catch (error) {
      if (__DEV__)
        console.warn('[notifications] addNotificationResponseReceivedListener failed:', error);
    }

    return () => {
      try {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      } catch {
        // ignore removal errors — app is unmounting anyway
      }
    };
  }, [shouldRegister, registerForNotifications]);

  return {
    expoPushToken,
    notification,
    registerForNotifications,
  };
}
