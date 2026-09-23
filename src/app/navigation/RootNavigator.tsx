/** RootNavigator.tsx — Main router handling Auth vs Main session */
import React, { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

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

const Stack = createNativeStackNavigator<any>();

function AppLockManager({ navigationRef }: { navigationRef: any }) {
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
  const navigationRef = useNavigationContainerRef();
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
        <Stack.Screen name="Lesson" component={LessonScreen as any} />
        <Stack.Screen name="Quiz" component={QuizScreen as any} />
        <Stack.Screen name="Community" component={CommunityScreen} />
        <Stack.Screen name="Badges" component={BadgesScreen as any} />
        
        {/* MPIN / Biometric screens at root level to support global overlay locking */}
        <Stack.Screen name="MpinLogin" component={MpinLoginScreen as any} />
        <Stack.Screen name="SetMpin" component={SetMpinScreen as any} />
        <Stack.Screen name="ResetMpin" component={ResetMpinScreen as any} />

        {/* Watchlist feature screens */}
        <Stack.Screen name="Watchlist" component={WatchlistScreen as any} />
        <Stack.Screen name="SymbolSearch" component={SymbolSearchScreen as any} />
        <Stack.Screen name="StockDetail" component={StockDetailScreen as any} /> 

        {/* Mutual Funds feature screens */}
        <Stack.Screen name="MutualFunds" component={MutualFundsScreen as any} />
        <Stack.Screen name="FundDetail" component={FundDetailScreen as any} /> 

        {/* Transparent modal sheets */}
        <Stack.Group screenOptions={{ presentation: 'transparentModal', animation: 'slide_from_bottom' }}>
          <Stack.Screen name="JargonBuster" component={JargonBusterScreen as any} />
          <Stack.Screen name="BuySell" component={BuySellScreen as any} />
        </Stack.Group>

        {/* Full-screen success */}
        <Stack.Screen name="TradeSuccess" component={TradeSuccessScreen as any} options={{ animation: 'fade' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}