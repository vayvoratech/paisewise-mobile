// /src/core/constants/appConstants.ts

export const APP_CONSTANTS = {
  MARKET_HOURS: { 
    open: '09:15', 
    close: '15:30' 
  },
  MAX_WATCHLIST_SYMBOLS: 50,
  STARTING_BALANCE: 100000,
  XP_REQUIREMENTS: {
    level1: 1000,
    level2: 2500,
    level3: 5000,
  },
  SUPPORTED_LANGUAGES: ['en', 'hi', 'te'],
} as const;