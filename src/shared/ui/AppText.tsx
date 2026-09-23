import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

interface AppTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'body' | 'caption';
  color?: string;
}

export const AppText: React.FC<AppTextProps> = ({ variant = 'body', color = '#111', style, children, ...props }) => {
  return (
    <Text style={[styles[variant], { color }, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: { fontSize: 28, fontWeight: 'bold', lineHeight: 34 },
  h2: { fontSize: 22, fontWeight: 'bold', lineHeight: 28 },
  body: { fontSize: 16, fontWeight: 'normal', lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: 'normal', lineHeight: 16 },
});