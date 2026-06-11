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
  Portfolio: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  MainTabs: NavigatorScreenParams<MainTabsParamList>;
  Lesson: { lessonId: string };
  JargonBuster: { term: string };
  Quiz: undefined;
  BuySell: { symbol: string; mode: 'buy' | 'sell' };
  TradeSuccess: {
    symbol: string;
    shares: number;
    pricePerShare: number;
    totalPaid: number;
    xpEarned: number;
  };
  Community: undefined;
};
