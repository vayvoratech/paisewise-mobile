import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { PracticeAccountProvider } from './src/features/portfolio/PracticeAccountContext';
import RootNavigator from './src/app/navigation/RootNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PracticeAccountProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </PracticeAccountProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
