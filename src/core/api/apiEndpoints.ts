// /src/core/api/apiEndpoints.ts

export const BASE_URL = 'http://localhost:8080';

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
    ORDERS: `${BASE_URL}/trading/orders`,
    HOLDINGS: `${BASE_URL}/trading/holdings`,
  },
  PORTFOLIO: {
    SUMMARY: `${BASE_URL}/portfolio/summary`,
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