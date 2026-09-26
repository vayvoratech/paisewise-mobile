import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { SIPSlider } from '../components/SIPSlider';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function SIPCalculatorScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [mode, setMode] = useState<'sip' | 'lumpsum'>('sip');
  const [amount, setAmount] = useState<number>(route.params?.initialAmount || 5000);
  const [returnRate, setReturnRate] = useState<number>(route.params?.initialRate || 13);
  const [years, setYears] = useState<number>(route.params?.initialYears || 10);
  const [adjustInflation, setAdjustInflation] = useState<boolean>(false);

  // Math calculation
  const inflationRate = 6.0; // 6% average Indian inflation
  let investedAmount = 0;
  let maturityValue = 0;

  if (mode === 'sip') {
    const monthlyRate = returnRate / 12 / 100;
    const months = years * 12;
    investedAmount = amount * months;
    if (monthlyRate === 0) {
      maturityValue = investedAmount;
    } else {
      maturityValue = Math.round(
        amount * (((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate))
      );
    }
  } else {
    investedAmount = amount;
    maturityValue = Math.round(amount * Math.pow(1 + returnRate / 100, years));
  }

  const wealthGain = Math.max(0, maturityValue - investedAmount);
  const effectiveMaturity = adjustInflation
    ? Math.round(maturityValue / Math.pow(1 + inflationRate / 100, years))
    : maturityValue;
  const effectiveGain = Math.max(0, effectiveMaturity - investedAmount);

  const investedPct = maturityValue > 0 ? (investedAmount / maturityValue) * 100 : 50;
  const gainPct = 100 - investedPct;

  // Milestone trajectory
  const milestones = [1, 3, 5, 10, 15, 20].filter((y) => y <= Math.max(years, 10));

  const handleStartSIP = () => {
    navigation.navigate('SIPSetup', {
      defaultAmount: amount,
    });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SIP & CAGR Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Selector */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            onPress={() => {
              setMode('sip');
              if (amount > 100000) setAmount(5000);
            }}
            style={[styles.toggleBtn, mode === 'sip' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, mode === 'sip' && styles.toggleTextActive]}>
              Monthly SIP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setMode('lumpsum');
              if (amount < 10000) setAmount(50000);
            }}
            style={[styles.toggleBtn, mode === 'lumpsum' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, mode === 'lumpsum' && styles.toggleTextActive]}>
              One-Time Lumpsum
            </Text>
          </TouchableOpacity>
        </View>

        {/* Projection Hero Card */}
        <Card style={styles.heroCard}>
          <Text style={styles.heroCorpusLabel}>
            {adjustInflation ? 'Real Value (Inflation Adjusted)' : 'Total Projected Wealth'}
          </Text>
          <Text style={styles.heroCorpusValue}>{formatINR(effectiveMaturity)}</Text>

          {/* Visual split progress bar */}
          <View style={styles.splitBar}>
            <View style={[styles.splitInvested, { width: `${investedPct}%` }]} />
            <View style={[styles.splitGain, { width: `${gainPct}%` }]} />
          </View>

          <View style={styles.heroBreakdownRow}>
            <View style={styles.heroBreakdownCol}>
              <View style={styles.legendDotRow}>
                <View style={[styles.dot, { backgroundColor: colors.purple }]} />
                <Text style={styles.legendText}>Total Invested</Text>
              </View>
              <Text style={styles.breakdownNum}>{formatINR(investedAmount)}</Text>
            </View>

            <View style={styles.heroBreakdownCol}>
              <View style={styles.legendDotRow}>
                <View style={[styles.dot, { backgroundColor: colors.green }]} />
                <Text style={styles.legendText}>Estimated Gain</Text>
              </View>
              <Text style={[styles.breakdownNum, { color: colors.green }]}>
                +{formatINR(effectiveGain)}
              </Text>
            </View>
          </View>

          {/* Inflation Toggle */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setAdjustInflation(!adjustInflation)}
            style={styles.inflationToggle}
          >
            <View style={[styles.checkbox, adjustInflation && styles.checkboxActive]}>
              {adjustInflation && <Text style={styles.checkMark}>✓</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inflationTitle}>Adjust for 6% annual inflation</Text>
              <Text style={styles.inflationSub}>
                Shows future wealth in today's actual purchasing power
              </Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* Input Sliders */}
        <SIPSlider
          label={mode === 'sip' ? 'Monthly Investment' : 'Lumpsum Investment'}
          value={amount}
          min={mode === 'sip' ? 500 : 5000}
          max={mode === 'sip' ? 100000 : 2500000}
          step={mode === 'sip' ? 500 : 5000}
          unitPrefix="₹"
          accentColor={colors.purple}
          presetChips={
            mode === 'sip'
              ? [
                  { label: '₹1K', value: 1000 },
                  { label: '₹2.5K', value: 2500 },
                  { label: '₹5K', value: 5000 },
                  { label: '₹10K', value: 10000 },
                  { label: '₹25K', value: 25000 },
                ]
              : [
                  { label: '₹25K', value: 25000 },
                  { label: '₹50K', value: 50000 },
                  { label: '₹1L', value: 100000 },
                  { label: '₹2.5L', value: 250000 },
                  { label: '₹5L', value: 500000 },
                ]
          }
          onChange={setAmount}
        />

        <SIPSlider
          label="Expected Return Rate (CAGR p.a.)"
          value={returnRate}
          min={1}
          max={30}
          step={0.5}
          unitSuffix="%"
          accentColor={colors.green}
          presetChips={[
            { label: '8% Debt', value: 8 },
            { label: '12% Balanced', value: 12 },
            { label: '15% Equity', value: 15 },
            { label: '18% Mid/Small', value: 18 },
          ]}
          onChange={setReturnRate}
        />

        <SIPSlider
          label="Investment Horizon"
          value={years}
          min={1}
          max={30}
          step={1}
          unitSuffix=" Years"
          accentColor={colors.amber}
          presetChips={[
            { label: '3Y', value: 3 },
            { label: '5Y', value: 5 },
            { label: '10Y', value: 10 },
            { label: '15Y', value: 15 },
            { label: '20Y', value: 20 },
          ]}
          onChange={setYears}
        />

        {/* Wealth Accumulation Trajectory */}
        <Card style={styles.trajectoryCard}>
          <Text style={styles.trajectoryTitle}>Wealth Growth Milestones</Text>
          <Text style={styles.trajectorySub}>
            Watch the power of compounding accelerate over time
          </Text>

          <View style={styles.milestoneList}>
            {milestones.map((m) => {
              const mMonths = m * 12;
              const mRate = returnRate / 12 / 100;
              const mInvested = mode === 'sip' ? amount * mMonths : amount;
              const mFuture =
                mode === 'sip'
                  ? Math.round(
                      amount *
                        (((Math.pow(1 + mRate, mMonths) - 1) / mRate) *
                          (1 + mRate))
                    )
                  : Math.round(amount * Math.pow(1 + returnRate / 100, m));

              return (
                <View key={m} style={styles.milestoneRow}>
                  <View style={styles.milestoneYearBadge}>
                    <Text style={styles.milestoneYearText}>{m}Y</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.milestoneInvested}>
                      Invested: {formatINR(mInvested)}
                    </Text>
                  </View>
                  <Text style={styles.milestoneCorpus}>{formatINR(mFuture)}</Text>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Start SIP Action Button */}
        <View style={styles.actionContainer}>
          <Button
            label={`Start SIP with ${formatINR(amount)}/mo`}
            onPress={handleStartSIP}
            variant="gradientAmber"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: { fontSize: 20, color: colors.text, fontWeight: '700' },
  headerTitle: { ...typography.h3, color: colors.text },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    padding: 3,
    marginBottom: spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  toggleBtnActive: {
    backgroundColor: colors.purple,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toggleText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: colors.white,
  },
  heroCard: {
    padding: spacing.xl,
    backgroundColor: '#1E1B4B',
    borderRadius: radius.xl,
    borderWidth: 0,
  },
  heroCorpusLabel: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.7)',
  },
  heroCorpusValue: {
    ...typography.hero,
    fontSize: 36,
    color: colors.amberBright,
    marginTop: spacing.xs,
    fontWeight: '900',
  },
  splitBar: {
    flexDirection: 'row',
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: spacing.lg,
    overflow: 'hidden',
  },
  splitInvested: {
    backgroundColor: colors.purple,
    height: '100%',
  },
  splitGain: {
    backgroundColor: colors.greenBright,
    height: '100%',
  },
  heroBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroBreakdownCol: {},
  legendDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
  },
  breakdownNum: {
    ...typography.h3,
    color: colors.white,
    fontWeight: '800',
  },
  inflationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.15)',
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.amberBright,
    borderColor: colors.amberBright,
  },
  checkMark: {
    fontSize: 12,
    color: colors.black,
    fontWeight: '900',
  },
  inflationTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  inflationSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
  },
  trajectoryCard: {
    padding: spacing.lg,
  },
  trajectoryTitle: {
    ...typography.h3,
    color: colors.text,
  },
  trajectorySub: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  milestoneList: {
    gap: spacing.xs,
  },
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  milestoneYearBadge: {
    width: 36,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.indigoChip,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  milestoneYearText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purple,
  },
  milestoneInvested: {
    ...typography.caption,
    color: colors.textMuted,
  },
  milestoneCorpus: {
    ...typography.bodyBold,
    color: colors.text,
  },
  actionContainer: {
    marginTop: spacing.md,
  },
});
