/**
 * Strongly-typed navigation params for the whole app.
 *
 * Flow: Splash → (Onboarding goals) → MainTabs. Modals and detail screens
 * (Lesson, Quiz, JargonBuster, BuySell, TradeSuccess) live in the root stack
 * so they can present over the tab bar.
 */
import { NavigatorScreenParams } from '@react-navigation/native';
import { OrderReceipt } from '../../features/portfolio/order.types';

export type MainTabsParamList = {
  Home: undefined;
  Learn: undefined;
  Practice: undefined;
  Watchlist: undefined;
  Portfolio: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Signup: undefined;
  Login: undefined;
  MpinLogin: { phone?: string; isUnlock?: boolean } | undefined;
  SetMpin: undefined;
  ResetMpin: { email: string; mode?: 'change' | 'forgot' };
  ForgotPasswordScreen: { mode?: 'password' | 'mpin' } | undefined;
  VerifyOtp: { email: string; mode?: 'password' | 'mpin' };
  ResetPassword: { email: string };
  Onboarding: undefined;
  Auth: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  Lesson: { lessonId: string };
  JargonBuster: { term: string };
  Quiz: { lessonId?: string } | undefined;
  StockDetail: { symbol: string; companyName?: string };
  BuySell: {
    symbol: string;
    action?: 'BUY' | 'SELL';
    mode?: 'buy' | 'sell';
    tradingMode?: 'PRACTICE' | 'REAL';
  };
  TradeSuccess: {
    symbol: string;
    shares: number;
    pricePerShare: number;
    totalPaid: number;
    xpEarned: number;
    mode?: 'buy' | 'sell';
    isReal?: boolean;
  };
  Orders: { initialTab?: 'OPEN' | 'COMPLETED' | 'CANCELLED' } | undefined;
  OrderDetail: { orderId: string; order?: OrderReceipt };
  TradeHistory: undefined;
  Community: undefined;
  Badges: undefined;
  Watchlist: undefined;
  SymbolSearch: undefined;
  MutualFunds: { category?: 'all' | 'large' | 'mid' | 'debt' } | undefined;
  FundDetail: { fundId?: string; fundName?: string } | undefined;
  SIPCalculator: { initialAmount?: number; initialYears?: number; initialRate?: number } | undefined;
  SIPSetup: { fundId?: string; defaultAmount?: number; goalId?: string; entrySource?: string } | undefined;
  Goals: undefined;
  MFPortfolio: undefined;
  TaxReport: { financialYear?: string } | undefined;
};