import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface AppBadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
  style?: ViewStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({ label, variant = 'info', style }) => {
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start' },
  success: { backgroundColor: '#E1F8EB' },
  warning: { backgroundColor: '#FFF4E5' },
  error: { backgroundColor: '#FDE8E8' },
  info: { backgroundColor: '#E8F4FD' },
  text: { fontSize: 12, fontWeight: '600' },
  successText: { color: '#10B981' },
  warningText: { color: '#F59E0B' },
  errorText: { color: '#EF4444' },
  infoText: { color: '#3B82F6' },
});