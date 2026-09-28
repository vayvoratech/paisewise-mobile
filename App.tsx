import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/app/store';
import RootNavigator from './src/app/navigation/RootNavigator';
import mixpanel, { initMixpanel } from '@core/mixpanel';

// export default function App() {
//   useEffect(() => {
//     // Initialize Mixpanel on app startup
//     initMixpanel();
//   }, []);

export default function App() {
  useEffect(() => {
    const setupAnalytics = async () => {
      await initMixpanel();
      
      // Track app_opened event as per spec
      mixpanel.track('app_opened', {
        app_version: '1.0.0',
        device_type: 'android', // or use Platform.OS
        is_first_open: true, // You can check AsyncStorage/MMKV here if needed later
      });
    };

    setupAnalytics();
  }, []);

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar style="light" />
          <RootNavigator />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </Provider>
  );
}