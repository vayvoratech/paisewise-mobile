import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { colors, radius, shadow, spacing } from '../../core/theme/theme';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  /** Dark translucent card used on the hero backdrop (e.g. dashboard stat box). */
  dark?: boolean;
  padded?: boolean;
};

export function Card({ children, style, onPress, dark, padded = true }: Props) {
  const cardStyle = [
    styles.card,
    padded && styles.padded,
    dark ? styles.dark : styles.light,
    style,
  ];
  if (onPress) {
    return (
      <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={cardStyle}>
        {children}
      </TouchableOpacity>
    );
  }
  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg },
  padded: { padding: spacing.lg },
  light: { backgroundColor: colors.surface, ...shadow.card },
  dark: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: colors.borderDark,
  },
});
