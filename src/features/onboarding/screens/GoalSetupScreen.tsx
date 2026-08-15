/** Screen 02 — Goal Setup (onboarding, step 1 of 4). */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { GOALS } from '../goals.data';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const TOTAL_STEPS = 4;

export default function GoalSetupScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string | null>('house');

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        {/* Step progress */}
        <View style={styles.steps}>
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <View key={i} style={[styles.stepBar, i === 0 ? styles.stepActive : styles.stepIdle]} />
          ))}
        </View>

        <Text style={styles.stepLabel}>STEP 1 OF {TOTAL_STEPS}</Text>
        <Text style={styles.qHi}>आप पैसे क्यों{'\n'}बचाना चाहते हैं?</Text>
        <Text style={styles.qEn}>Why do you want to invest?</Text>
        <Text style={styles.qHint}>No wrong answer. We'll customise your learning path.</Text>

        <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
          {GOALS.map((g) => {
            const active = selected === g.id;
            return (
              <TouchableOpacity
                key={g.id}
                activeOpacity={0.85}
                onPress={() => setSelected(g.id)}
                style={[styles.option, active && styles.optionActive]}
              >
                <Text style={styles.optionEmoji}>{g.emoji}</Text>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{g.title}</Text>
                  <Text style={styles.optionSub}>{g.subtitle}</Text>
                </View>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active && <Text style={styles.radioCheck}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}

          <Button
            label="Continue  →"
            variant="dark"
            style={styles.continue}
            disabled={!selected}
            onPress={() => navigation.replace('MainTabs', { screen: 'Home' })}
          />
        </ScrollView>
      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  steps: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.xl, marginTop: spacing.md },
  stepBar: { flex: 1, height: 4, borderRadius: 2 },
  stepActive: { backgroundColor: colors.amber },
  stepIdle: { backgroundColor: 'rgba(255,255,255,0.12)' },
  stepLabel: { ...typography.overline, color: colors.textMutedDark, paddingHorizontal: spacing.xl, marginTop: spacing.xl },
  qHi: { ...typography.h1, color: colors.textOnDark, paddingHorizontal: spacing.xl, marginTop: spacing.sm },
  qEn: { ...typography.h3, color: colors.textMutedDark, paddingHorizontal: spacing.xl, marginTop: spacing.md },
  qHint: { ...typography.body, color: colors.textFaint, paddingHorizontal: spacing.xl, marginTop: spacing.sm, marginBottom: spacing.lg },
  sheet: { flex: 1, backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheetContent: { padding: spacing.xl, gap: spacing.md },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionActive: { backgroundColor: colors.yellowCard, borderColor: colors.amber },
  optionEmoji: { fontSize: 30, marginRight: spacing.lg },
  optionText: { flex: 1 },
  optionTitle: { ...typography.bodyBold, color: colors.text },
  optionSub: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  radio: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { backgroundColor: colors.amber, borderColor: colors.amber },
  radioCheck: { color: colors.white, fontWeight: '800', fontSize: 14 },
  continue: { marginTop: spacing.md },
});
