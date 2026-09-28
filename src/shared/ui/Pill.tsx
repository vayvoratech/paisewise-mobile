import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../../core/theme/theme';

type Props = {
  label: string;
  color?: string;
  bg?: string;
  borderColor?: string;
  style?: ViewStyle;
  mono?: boolean;
};

/** Rounded chip used for badges like "50 XP at stake", "SEBI Regulated", tags. */
export function Pill({ label, color = colors.text, bg = colors.surfaceMuted, borderColor, style, mono }: Props) {
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: bg },
        borderColor ? { borderWidth: 1, borderColor } : null,
        style,
      ]}
    >
      <Text style={[styles.text, { color }, mono && styles.mono]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  text: { fontSize: 13, fontWeight: '600' },
  mono: { letterSpacing: 1, fontWeight: '700' },
});
