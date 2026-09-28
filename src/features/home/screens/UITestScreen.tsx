import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppButton } from '@shared/ui/AppButton';
import { AppInput } from '@shared/ui/AppInput';
import { AppText } from '@shared/ui/AppText';
import { AppLoader } from '@shared/ui/AppLoader';
import { AppCard } from '@shared/ui/AppCard';
import { AppBottomSheet } from '@shared/ui/AppBottomSheet';
import { AppBadge } from '@shared/ui/AppBadge';
import { AppDivider } from '@shared/ui/AppDivider';
import { AppEmptyState } from '@shared/ui/AppEmptyState';
import { AppErrorBoundary } from '@shared/ui/AppErrorBoundary';

export default function UITestScreen() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState('');

  return (
    <AppErrorBoundary>
      <ScrollView contentContainerStyle={styles.container}>
        <AppText variant="h1">UI Kit Test Bench</AppText>
        
        <AppDivider />
        <AppText>Testing your Base UI Kit components interactively.</AppText>

        {/* 1. Button & Modal Test */}
        <AppButton title="Open BottomSheet" onPress={() => setIsModalVisible(true)} />

        {/* 2. Input Test */}
        <AppInput 
          placeholder="Type something..." 
          value={inputValue} 
          onChangeText={setInputValue} 
        />

        {/* 3. Card Test */}
        <AppCard>
          <AppText>Card Container Content</AppText>
          <AppText>Typed value: {inputValue || 'None'}</AppText>
        </AppCard>

        {/* 4. Badge Test */}
        <AppBadge label="Active Task" />

        {/* 5. Loader Toggle & Component Test */}
        <AppButton title={isLoading ? "Hide Loader" : "Show Loader"} onPress={() => setIsLoading(!isLoading)} />
        {isLoading && <AppLoader />}

        {/* 6. Empty State Test */}
        <AppEmptyState title="No Data Found" />

        {/* 7. BottomSheet Modal Content */}
        <AppBottomSheet visible={isModalVisible} onClose={() => setIsModalVisible(false)}>
          <AppText>BottomSheet Content</AppText>
          <AppButton title="Close" onPress={() => setIsModalVisible(false)} />
        </AppBottomSheet>
      </ScrollView>
    </AppErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    gap: 15, 
    backgroundColor: '#1E22AA',
    flexGrow: 1,
    paddingTop: 60 
  },
});