import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../../core/theme/theme';

type Variant = 'primary' | 'gradientAmber' | 'gradientPurple' | 'success' | 'dark' | 'outline';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const GRADIENTS: Record<string, [string, string]> = {
  gradientAmber: [colors.amberBright, colors.orange],
  gradientPurple: [colors.green, colors.purple],
};

export function Button({ label, onPress, variant = 'primary', loading, disabled, style }: Props) {
  const isGradient = variant === 'gradientAmber' || variant === 'gradientPurple';
  const content = loading ? (
    <ActivityIndicator color={variant === 'outline' ? colors.text : colors.white} />
  ) : (
    <Text style={[styles.label, labelColor(variant)]}>{label}</Text>
  );

  const inner = (
    <View style={[styles.base, !isGradient && bgFor(variant), variant === 'outline' && styles.outline, style]}>
      {content}
    </View>
  );

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} disabled={disabled || loading}>
      {isGradient ? (
        <LinearGradient colors={GRADIENTS[variant]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[styles.base, style]}>
          {content}
        </LinearGradient>
      ) : (
        inner
      )}
    </TouchableOpacity>
  );
}

function bgFor(variant: Variant): ViewStyle {
  switch (variant) {
    case 'success':
      return { backgroundColor: colors.greenBright };
    case 'dark':
      return { backgroundColor: colors.black };
    case 'outline':
      return { backgroundColor: 'transparent' };
    default:
      return { backgroundColor: colors.purple };
  }
}

function labelColor(variant: Variant) {
  if (variant === 'success' || variant === 'dark') return { color: variant === 'dark' ? colors.amber : colors.black };
  if (variant === 'outline') return { color: colors.textOnDark };
  return { color: colors.white };
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  outline: { borderWidth: 1, borderColor: colors.borderDark, backgroundColor: 'rgba(255,255,255,0.04)' },
  label: { ...typography.bodyBold, fontSize: 17 },
});
