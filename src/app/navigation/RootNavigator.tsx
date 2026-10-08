/** RootNavigator.tsx — Main router handling Auth vs Main session */
import React, { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { NavigationContainer, useNavigationContainerRef, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootStackParamList } from './types';

// Import local security / storage
import { tokenStorage } from '../../core/api/tokenStorage';
import { credentialsStore } from '../../core/security/secureStore';
import { RootState } from '../store';

// Import the main stacks
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

// Import push/modal screens
import LessonScreen from '../../features/learn/screens/LessonScreen';
import JargonBusterScreen from '../../features/learn/screens/JargonBusterScreen';
import QuizScreen from '../../features/quiz/screens/QuizScreen';
import BuySellScreen from '../../features/practice/screens/BuySellScreen';
import TradeSuccessScreen from '../../features/practice/screens/TradeSuccessScreen';
import CommunityScreen from '../../features/community/screens/CommunityScreen';
import BadgesScreen from '../../features/profile/screens/BadgesScreen';
import SettingsScreen from '../../features/profile/screens/SettingsScreen';
import HelpScreen from '../../features/profile/screens/HelpScreen';

// Import MPIN feature screens
import MpinLoginScreen from '../../features/onboarding/screens/MpinLoginScreen';
import SetMpinScreen from '../../features/onboarding/screens/SetMpinScreen';
import ResetMpinScreen from '../../features/onboarding/screens/ResetMpinScreen';

// Import Watchlist feature screens
import WatchlistScreen from '../../features/watchlist/screens/WatchlistScreen';
import SymbolSearchScreen from '../../features/search/screens/SymbolSearchScreen';
import StockDetailScreen from '../../features/market/screens/StockDetailScreen';

// Import Mutual Funds feature screens
import MutualFundsScreen from '../../features/mutualfunds/screens/MutualFundsScreen';
import FundDetailScreen from '../../features/mutualfunds/screens/FundDetailScreen';

// Import SIP & Goals screens
import SIPCalculatorScreen from '../../features/sip/screens/SIPCalculatorScreen';
import SIPSetupScreen from '../../features/sip/screens/SIPSetupScreen';
import GoalsScreen from '../../features/sip/screens/GoalsScreen';

// Import Mutual Funds & Tax screens
import MFPortfolioScreen from '../../features/portfolio/screens/MFPortfolioScreen';
import TaxReportScreen from '../../features/portfolio/screens/TaxReportScreen';

// Import Portfolio & Order screens
import OrdersScreen from '../../features/portfolio/screens/OrdersScreen';
import OrderDetailScreen from '../../features/portfolio/screens/OrderDetailScreen';
import TradeHistoryScreen from '../../features/portfolio/screens/TradeHistoryScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppLockManager({ navigationRef }: { navigationRef: NavigationContainerRef<RootStackParamList> }) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  useEffect(() => {
    if (!accessToken) return;

    const lockApp = async () => {
      const currentRoute = navigationRef.getCurrentRoute();
      if (!currentRoute) return;

      const routeName = currentRoute.name;
      // Do not lock if already on lock screen, or during initial signup/onboarding phases
      if (
        routeName === 'MpinLogin' ||
        routeName === 'Splash' ||
        routeName === 'Signup' ||
        routeName === 'Login' ||
        routeName === 'Onboarding' ||
        routeName === 'SetMpin'
      ) {
        return;
      }

      const hasMpin = await credentialsStore.getHasMpin();
      const savedPhone = await credentialsStore.getPhone();
      if (hasMpin && savedPhone) {
        navigationRef.navigate('MpinLogin', { phone: savedPhone, isUnlock: true });
      }
    };

    if (Platform.OS === 'web') {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          lockApp();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    } else {
      const handleAppStateChange = (nextAppState: string) => {
        if (nextAppState === 'active') {
          lockApp();
        }
      };
      const subscription = AppState.addEventListener('change', handleAppStateChange);
      return () => {
        subscription.remove();
      };
    }
  }, [accessToken, navigationRef]);

  return null;
}

import { AlertToastBanner } from '../../shared/ui/AlertToastBanner';

export default function RootNavigator() {
  const navigationRef = useNavigationContainerRef<RootStackParamList>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  return (
    <NavigationContainer ref={navigationRef}>
      <AlertToastBanner />
      <AppLockManager navigationRef={navigationRef} />
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? "MainTabs" : "Auth"} 
        screenOptions={{ headerShown: false }}
      >
        {/* Auth flow (Splash, Onboarding, Login, OTP, Mpin) */}
        <Stack.Screen name="Auth" component={AuthStack} />

        {/* Main app flow */}
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Detail / pushed screens */}
        <Stack.Screen name="Lesson" component={LessonScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="Badges" component={BadgesScreen as any} />
        <Stack.Screen name="Settings" component={SettingsScreen as any} />
        <Stack.Screen name="Help" component={HelpScreen as any} />
        {/* MPIN / Biometric screens at root level to support global overlay locking */}
        <Stack.Screen name="MpinLogin" component={MpinLoginScreen} />
        <Stack.Screen name="SetMpin" component={SetMpinScreen} />
        <Stack.Screen name="ResetMpin" component={ResetMpinScreen} />

        {/* Watchlist feature screens */}
        <Stack.Screen name="Watchlist" component={WatchlistScreen} />
        <Stack.Screen name="SymbolSearch" component={SymbolSearchScreen} />
        <Stack.Screen name="StockDetail" component={StockDetailScreen} />

        {/* Mutual Funds feature screens */}
        <Stack.Screen name="MutualFunds" component={MutualFundsScreen} />
        <Stack.Screen name="FundDetail" component={FundDetailScreen} />

        {/* Orders & Trade History feature screens */}
        <Stack.Screen name="Orders" component={OrdersScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
        <Stack.Screen name="TradeHistory" component={TradeHistoryScreen} />

        {/* SIP & Goal Tracking screens */}
        <Stack.Screen name="SIPCalculator" component={SIPCalculatorScreen as any} />
        <Stack.Screen name="SIPSetup" component={SIPSetupScreen as any} />
        <Stack.Screen name="Goals" component={GoalsScreen as any} />

        {/* Mutual Funds Portfolio & Tax Report screens */}
        <Stack.Screen name="MFPortfolio" component={MFPortfolioScreen as any} />
        <Stack.Screen name="TaxReport" component={TaxReportScreen as any} />

        {/* Transparent modal sheets */}
        <Stack.Group screenOptions={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}>
          <Stack.Screen name="JargonBuster" component={JargonBusterScreen} />
          <Stack.Screen name="BuySell" component={BuySellScreen} />
        </Stack.Group>

        {/* Full-screen success */}
        <Stack.Screen name="TradeSuccess" component={TradeSuccessScreen} options={{ animation: 'fade' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}