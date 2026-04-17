import * as Updates from 'expo-updates';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import i18n from '../i18n';

export function useOTAUpdate() {
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // Only check in production builds, not in dev/expo go
    if (__DEV__) return;

    checkForUpdate();
  }, []);

  async function checkForUpdate() {
    try {
      setIsChecking(true);
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        setIsDownloading(true);
        await Updates.fetchUpdateAsync();

        Alert.alert(i18n.t('common.updateAvailable'), i18n.t('common.updateMessage'), [
          { text: i18n.t('common.later'), style: 'cancel' },
          { text: i18n.t('common.restart'), onPress: () => Updates.reloadAsync() },
        ]);
      }
    } catch (e) {
      // Silently fail - OTA updates are not critical
      if (__DEV__) console.warn('OTA update check failed:', e);
    } finally {
      setIsChecking(false);
      setIsDownloading(false);
    }
  }

  return { isChecking, isDownloading, checkForUpdate };
}
