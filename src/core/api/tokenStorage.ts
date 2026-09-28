/**
 * Token storage — Expo Go compatible.
 *
 * Uses a synchronous in-memory cache for fast reads (Redux init),
 * with expo-secure-store for persistence across app restarts.
 * This replaces the old react-native-mmkv dependency which requires
 * native NitroModules that Expo Go cannot run.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const KEYS = {
  accessToken: 'token.accessToken',
  refreshToken: 'token.refreshToken',
  userId: 'token.userId',
} as const;

// In-memory cache for synchronous reads (Redux initialState)
const memoryCache: Record<string, string | null> = {};

// --- Sync read helpers (from cache only) ---

function getString(key: string): string | null {
  return memoryCache[key] ?? null;
}

function set(key: string, value: string): void {
  memoryCache[key] = value;
  // Fire-and-forget persist
  if (Platform.OS !== 'web') {
    SecureStore.setItemAsync(key, value).catch(() => {});
  } else if (typeof localStorage !== 'undefined') {
    try { localStorage.setItem(key, value); } catch {}
  }
}

function remove(key: string): void {
  delete memoryCache[key];
  if (Platform.OS !== 'web') {
    SecureStore.deleteItemAsync(key).catch(() => {});
  } else if (typeof localStorage !== 'undefined') {
    try { localStorage.removeItem(key); } catch {}
  }
}

/**
 * Call once at app startup (before Redux store init) to hydrate
 * the in-memory cache from persisted secure storage.
 */
export async function hydrateTokenCache(): Promise<void> {
  if (Platform.OS === 'web') {
    if (typeof localStorage !== 'undefined') {
      memoryCache[KEYS.accessToken] = localStorage.getItem(KEYS.accessToken);
      memoryCache[KEYS.refreshToken] = localStorage.getItem(KEYS.refreshToken);
      memoryCache[KEYS.userId] = localStorage.getItem(KEYS.userId);
    }
    return;
  }
  try {
    const [at, rt, uid] = await Promise.all([
      SecureStore.getItemAsync(KEYS.accessToken),
      SecureStore.getItemAsync(KEYS.refreshToken),
      SecureStore.getItemAsync(KEYS.userId),
    ]);
    memoryCache[KEYS.accessToken] = at;
    memoryCache[KEYS.refreshToken] = rt;
    memoryCache[KEYS.userId] = uid;
  } catch {
    // SecureStore might not be available in some environments; silently skip.
  }
}

export const tokenStorage = {
  getAccessToken: () => getString(KEYS.accessToken),
  setAccessToken: (token: string) => set(KEYS.accessToken, token),
  getRefreshToken: () => getString(KEYS.refreshToken),
  setRefreshToken: (token: string) => set(KEYS.refreshToken, token),
  getUserId: () => getString(KEYS.userId),
  setUserId: (id: string) => set(KEYS.userId, id),

  clearTokens: () => {
    remove(KEYS.accessToken);
    remove(KEYS.refreshToken);
    remove(KEYS.userId);
  },
  clearAll: () => {
    remove(KEYS.accessToken);
    remove(KEYS.refreshToken);
    remove(KEYS.userId);
  },
};