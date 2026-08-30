import * as RNMMKV from 'react-native-mmkv';

let storage: any;
try {
  const MMKVClass = (RNMMKV as any).MMKV || (RNMMKV as any).default || RNMMKV;
  storage = new MMKVClass({ id: 'app-secure-storage' });
} catch (e) {
  storage = {
    getString: (key: string) => (typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null),
    set: (key: string, value: string) => {
      if (typeof localStorage !== 'undefined') localStorage.setItem(key, value);
    },
    delete: (key: string) => {
      if (typeof localStorage !== 'undefined') localStorage.removeItem(key);
    },
    clearAll: () => {
      if (typeof localStorage !== 'undefined') localStorage.clear();
    },
  };
}

export const tokenStorage = {
  getAccessToken: () => storage.getString('access_token'),
  setAccessToken: (token: string) => storage.set('access_token', token),
  getRefreshToken: () => storage.getString('refresh_token'),
  setRefreshToken: (token: string) => storage.set('refresh_token', token),
  getUserId: () => storage.getString('user_id'),
  setUserId: (id: string) => storage.set('user_id', id),
  
  // Provide both clearTokens and clearAll to satisfy both definitions
  clearTokens: () => {
    storage.delete('access_token');
    storage.delete('refresh_token');
    storage.delete('user_id');
  },
  clearAll: () => {
    if (typeof storage.clearAll === 'function') {
      storage.clearAll();
    } else {
      storage.delete('access_token');
      storage.delete('refresh_token');
      storage.delete('user_id');
    }
  },
};