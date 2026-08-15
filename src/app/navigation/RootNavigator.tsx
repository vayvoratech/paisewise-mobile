/** RootNavigator.tsx — Main router handling Auth vs Main session */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { tokenStorage } from '../../core/api/tokenStorage';

// Import the two main stacks
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

// Import push/modal screens here (these remain in RootNavigator)
import LessonScreen from '../../features/learn/screens/LessonScreen';
import JargonBusterScreen from '../../features/learn/screens/JargonBusterScreen';
import QuizScreen from '../../features/quiz/screens/QuizScreen';
import BuySellScreen from '../../features/practice/screens/BuySellScreen';
import TradeSuccessScreen from '../../features/practice/screens/TradeSuccessScreen';
import CommunityScreen from '../../features/community/screens/CommunityScreen';

const Stack = createNativeStackNavigator<any>();

export default function RootNavigator() {
  // Check if a valid access token exists
  //const isAuthenticated = !!tokenStorage.getAccessToken();
  // const isAuthenticated = false;
  const isAuthenticated = true;

  return (
    <NavigationContainer>
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