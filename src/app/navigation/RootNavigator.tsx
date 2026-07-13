/**
 * Root navigator. Stack hosting: Splash → Onboarding → MainTabs, plus the
 * modal/detail screens (Lesson, Quiz, Jargon Buster, Buy/Sell, Trade Success,
 * Community) presented over the tabs.
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import MainTabs from './MainTabs';
import SplashScreen from '../../features/onboarding/screens/SplashScreen';
import SignupScreen from '../../features/onboarding/screens/SignupScreen';
import LoginScreen from '../../features/onboarding/screens/LoginScreen';
import GoalSetupScreen from '../../features/onboarding/screens/GoalSetupScreen';
import LessonScreen from '../../features/learn/screens/LessonScreen';
import JargonBusterScreen from '../../features/learn/screens/JargonBusterScreen';
import QuizScreen from '../../features/quiz/screens/QuizScreen';
import BuySellScreen from '../../features/practice/screens/BuySellScreen';
import TradeSuccessScreen from '../../features/practice/screens/TradeSuccessScreen';
import CommunityScreen from '../../features/community/screens/CommunityScreen';
import ForgotPasswordScreen from '../../features/onboarding/screens/ForgotPasswordScreen';
import VerifyOtpScreen from '../../features/onboarding/screens/VerifyOtpScreen';
import ResetPasswordScreen from '../../features/onboarding/screens/ResetPasswordScreen';


const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Onboarding" component={GoalSetupScreen} />
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
