/**
 * Root navigator. Stack hosting: Splash → Onboarding → MainTabs, plus the
 * modal/detail screens (Lesson, Quiz, Jargon Buster, Buy/Sell, Trade Success,
 * Community) presented over the tabs.
 */
import React, { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { RootStackParamList } from './types';
import MainTabs from './MainTabs';
import SplashScreen from '../../features/onboarding/screens/SplashScreen';
import SignupScreen from '../../features/onboarding/screens/SignupScreen';
import LoginScreen from '../../features/onboarding/screens/LoginScreen';
import OnboardingScreen from '../../features/onboarding/screens/OnboardingScreen';
import LessonScreen from '../../features/learn/screens/LessonScreen';
import JargonBusterScreen from '../../features/learn/screens/JargonBusterScreen';
import QuizScreen from '../../features/quiz/screens/QuizScreen';
import BuySellScreen from '../../features/practice/screens/BuySellScreen';
import TradeSuccessScreen from '../../features/practice/screens/TradeSuccessScreen';
import CommunityScreen from '../../features/community/screens/CommunityScreen';
import ForgotPasswordScreen from '../../features/onboarding/screens/ForgotPasswordScreen';
import VerifyOtpScreen from '../../features/onboarding/screens/VerifyOtpScreen';
import ResetPasswordScreen from '../../features/onboarding/screens/ResetPasswordScreen';
import MpinLoginScreen from '../../features/onboarding/screens/MpinLoginScreen';
import SetMpinScreen from '../../features/onboarding/screens/SetMpinScreen';
import ResetMpinScreen from '../../features/onboarding/screens/ResetMpinScreen';

import { RootState } from '../store';
import { credentialsStore } from '../../core/security/secureStore';

const Stack = createNativeStackNavigator<RootStackParamList>();

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

      const savedMpin = await credentialsStore.getMpin();
      const savedPhone = await credentialsStore.getPhone();
      if (savedMpin && savedPhone) {
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

export default function RootNavigator() {
  const navigationRef = useNavigationContainerRef();

  return (
    <NavigationContainer ref={navigationRef}>
      <AppLockManager navigationRef={navigationRef} />
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MpinLogin" component={MpinLoginScreen} />
        <Stack.Screen name="SetMpin" component={SetMpinScreen} />
        <Stack.Screen name="ResetMpin" component={ResetMpinScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />

        {/* Detail / pushed screens */}
        <Stack.Screen name="Lesson" component={LessonScreen} />
        <Stack.Screen name="Quiz" component={QuizScreen} />
        <Stack.Screen name="Community" component={CommunityScreen} />

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