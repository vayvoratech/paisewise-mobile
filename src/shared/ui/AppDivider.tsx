import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface AppDividerProps {
  style?: ViewStyle;
  orientation?: 'horizontal' | 'vertical';
}

export const AppDivider: React.FC<AppDividerProps> = ({ style, orientation = 'horizontal' }) => {
  return <View style={[orientation === 'horizontal' ? styles.horizontal : styles.vertical, style]} />;
};

const styles = StyleSheet.create({
  horizontal: { height: 1, width: '100%', backgroundColor: '#E5E5EA', marginVertical: 8 },
  vertical: { width: 1, height: '100%', backgroundColor: '#E5E5EA', marginHorizontal: 8 },
});