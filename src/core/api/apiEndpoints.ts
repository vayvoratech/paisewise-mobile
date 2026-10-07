import Constants from 'expo-constants';
import { Platform } from 'react-native';

const getDevIp = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return window.location.hostname || 'localhost';
  }
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    return hostUri.split(':')[0];
  }
  return '10.154.230.218';
};

const DEV_IP = getDevIp();

const resolveBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) {
    if (Platform.OS !== 'web' && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
      return envUrl.replace(/localhost|127\.0\.0\.1/, DEV_IP);
    }
    return envUrl;
  }
  return Platform.OS === 'web' ? 'http://localhost:8080' : `http://${DEV_IP}:8080`;
};

export const BASE_URL_LIST = [
  'https://paisewise-backend.onrender.com',
  `http://${DEV_IP}:8080`,
  'http://localhost:8080',
];

export const BASE_URL = resolveBaseUrl();

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${BASE_URL}/auth/register`,
    LOGIN: `${BASE_URL}/auth/login`,
    REFRESH_TOKEN: `${BASE_URL}/auth/refresh-token`,
    FORGOT_PASSWORD: `${BASE_URL}/auth/forgot-password`,
    VERIFY_OTP: `${BASE_URL}/auth/verify-otp`,
    RESET_PASSWORD: `${BASE_URL}/auth/reset-password`,
    LOGOUT: `${BASE_URL}/auth/logout`,
  },
  LEARNING: {
    LESSONS: `${BASE_URL}/learning/lessons`,
    PROGRESS: `${BASE_URL}/learning/progress`,
  },
  TRADING: {
    ORDERS: `${BASE_URL}/practice/orders`,
    ACCOUNT: `${BASE_URL}/practice/account`,
    STOCKS: `${BASE_URL}/practice/stocks`,
    HOLDINGS: `${BASE_URL}/trading/holdings`,
  },
  PORTFOLIO: {
    SUMMARY: `${BASE_URL}/portfolio/me`,
    BUY: `${BASE_URL}/portfolio/buy`,
    HOLDINGS: `${BASE_URL}/portfolio/me/holdings`,
    AI_INSIGHT: `${BASE_URL}/portfolio/ai-insight`,
    PNL_REPORT: `${BASE_URL}/portfolio/pnl-report`,
    INSIGHTS: `${BASE_URL}/portfolio/insights`,
  },
  MARKET: {
    QUOTE: `${BASE_URL}/market/quote`,
    WATCHLIST: `${BASE_URL}/market/watchlist`,
  },
  COMMUNITY: {
    POSTS: `${BASE_URL}/community/posts`,
  }
} as const;