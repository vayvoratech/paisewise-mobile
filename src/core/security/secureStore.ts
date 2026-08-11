/**
 * Secure, encrypted key/value storage backed by the device keychain
 * (iOS Keychain / Android Keystore) via expo-secure-store.
 *
 * SECURITY: Auth tokens and any sensitive material MUST go through here —
 * never AsyncStorage or plain files, which are unencrypted and readable on
 * rooted/jailbroken devices and in backups.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
} as const;

const OPTIONS: SecureStore.SecureStoreOptions = {
  // Require the device to be unlocked; do not sync to iCloud/backups.
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

// Check if native SecureStore is supported/available
async function isSecureStoreAvailable(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return SecureStore.isAvailableAsync();
}

async function setItem(key: string, value: string): Promise<void> {
  const secureAvailable = await isSecureStoreAvailable();
  if (secureAvailable) {
    await SecureStore.setItemAsync(key, value, OPTIONS);
  } else {
    // Web fallback
    sessionStorage.setItem(key, value);
  }
}

async function getItem(key: string): Promise<string | null> {
  const secureAvailable = await isSecureStoreAvailable();
  if (secureAvailable) {
    return SecureStore.getItemAsync(key, OPTIONS);
  } else {
    // Web fallback
    return sessionStorage.getItem(key);
  }
}

async function removeItem(key: string): Promise<void> {
  const secureAvailable = await isSecureStoreAvailable();
  if (secureAvailable) {
    await SecureStore.deleteItemAsync(key, OPTIONS);
  } else {
    // Web fallback
    sessionStorage.removeItem(key);
  }
}

export const tokenStore = {
  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      setItem(KEYS.accessToken, accessToken),
      setItem(KEYS.refreshToken, refreshToken),
    ]);
  },
  getAccessToken: () => getItem(KEYS.accessToken),
  getRefreshToken: () => getItem(KEYS.refreshToken),
  async clear(): Promise<void> {
    await Promise.all([
      removeItem(KEYS.accessToken),
      removeItem(KEYS.refreshToken),
    ]);
  },
};
