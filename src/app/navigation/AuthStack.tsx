/** AuthStack.tsx — Pre-login navigation flow */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Available screens in your project
import SplashScreen from '../../features/onboarding/screens/SplashScreen';
import OnboardingScreen from '../../features/onboarding/screens/OnboardingScreen';
import LoginScreen from '../../features/onboarding/screens/LoginScreen';
import SignupScreen from '../../features/onboarding/screens/SignupScreen';
import VerifyOtpScreen from '../../features/onboarding/screens/VerifyOtpScreen';
import ForgotPasswordScreen from '../../features/onboarding/screens/ForgotPasswordScreen';
import ResetPasswordScreen from '../../features/onboarding/screens/ResetPasswordScreen';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen as any} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen as any} />
      <Stack.Screen name="Login" component={LoginScreen as any} />
      <Stack.Screen name="Signup" component={SignupScreen as any} />
      <Stack.Screen name="VerifyOtp" component={VerifyOtpScreen as any} />
      <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen as any} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen as any} />
    </Stack.Navigator>
  );
}