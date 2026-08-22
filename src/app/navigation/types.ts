/**
 * Strongly-typed navigation params for the whole app.
 *
 * Flow: Splash → (Onboarding goals) → MainTabs. Modals and detail screens
 * (Lesson, Quiz, JargonBuster, BuySell, TradeSuccess) live in the root stack
 * so they can present over the tab bar.
 */
import { NavigatorScreenParams } from '@react-navigation/native';

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
  ForgotPasswordScreen: undefined;
  VerifyOtp: { email: string }; 
  ResetPassword: { email: string };
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  Lesson: { lessonId: string };
  JargonBuster: { term: string };
  Quiz: undefined;
  StockDetail: { symbol: string };
  BuySell: { symbol: string; action: 'BUY' | 'SELL'; mode?: 'buy' | 'sell' };
  TradeSuccess: {
    symbol: string;
    shares: number;
    pricePerShare: number;
    totalPaid: number;
    xpEarned: number;
    mode?: 'buy' | 'sell';
  };
  Community: undefined;
};