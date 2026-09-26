import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';

interface SIPSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unitPrefix?: string;
  unitSuffix?: string;
  presetChips?: { label: string; value: number }[];
  onChange: (value: number) => void;
  accentColor?: string;
}

export const SIPSlider: React.FC<SIPSliderProps> = ({
  label,
  value,
  min,
  max,
  step,
  unitPrefix = '',
  unitSuffix = '',
  presetChips = [],
  onChange,
  accentColor = colors.purple,
}) => {
  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const handleDecrement = () => {
    const next = Math.max(min, value - step);
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.min(max, value + step);
    onChange(next);
  };

  const handleTrackTap = (e: any) => {
    const { locationX } = e.nativeEvent;
    // Assume width roughly 280-340px or dynamically calculate
    // We can also let preset chips and steppers drive precise numbers
  };

  const formattedDisplay = () => {
    if (unitPrefix === '₹') {
      if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
      if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
      return `₹${value.toLocaleString('en-IN')}`;
    }
    return `${unitPrefix}${value}${unitSuffix}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.valueText, { color: accentColor }]}>{formattedDisplay()}</Text>
      </View>

      {/* Stepper + Track */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleDecrement}
          disabled={value <= min}
          style={[styles.stepBtn, value <= min && styles.stepBtnDisabled]}
        >
          <Text style={styles.stepBtnText}>−</Text>
        </TouchableOpacity>

        <View style={styles.trackContainer}>
          <View style={styles.trackBackground}>
            <View
              style={[
                styles.trackFill,
                { width: `${percent}%`, backgroundColor: accentColor },
              ]}
            />
          </View>
          <View
            style={[
              styles.thumb,
              { left: `${Math.min(96, Math.max(2, percent))}%`, borderColor: accentColor },
            ]}
          />
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleIncrement}
          disabled={value >= max}
          style={[styles.stepBtn, value >= max && styles.stepBtnDisabled]}
        >
          <Text style={styles.stepBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Preset Chips */}
      {presetChips.length > 0 && (
        <View style={styles.chipsContainer}>
          {presetChips.map((chip) => {
            const isSelected = value === chip.value;
            return (
              <TouchableOpacity
                key={chip.label}
                activeOpacity={0.8}
                onPress={() => onChange(chip.value)}
                style={[
                  styles.chip,
                  isSelected && { backgroundColor: accentColor, borderColor: accentColor },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && { color: colors.white, fontWeight: '700' },
                  ]}
                >
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodyBold,
    color: colors.text,
  },
  valueText: {
    ...typography.h3,
    fontWeight: '800',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.xs,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
  stepBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  trackContainer: {
    flex: 1,
    height: 24,
    justifyContent: 'center',
    position: 'relative',
  },
  trackBackground: {
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: 4,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: 4,
  },
  thumb: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
    borderWidth: 3,
    marginLeft: -9,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
