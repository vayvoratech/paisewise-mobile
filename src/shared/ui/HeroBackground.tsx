import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../core/theme/theme';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  /** 'navy' = purple-navy splash/onboarding; 'dark' = near-black dashboard hero. */
  tone?: 'navy' | 'dark';
};

/** Full-bleed gradient backdrop used at the top of most screens. */
export function HeroBackground({ children, style, tone = 'dark' }: Props) {
  const palette: [string, string, string] =
    tone === 'navy'
      ? [colors.navyGradientTop, colors.navy, colors.navyGradientBottom]
      : [colors.bgDeep, colors.bg, '#100A1F'];
  return (
    <LinearGradient colors={palette} style={[styles.fill, style]}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
