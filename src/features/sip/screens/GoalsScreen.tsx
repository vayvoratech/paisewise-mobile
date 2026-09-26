import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { RootState, AppDispatch } from '../../../app/store';
import { addGoal, deleteGoal } from '../slices/sipSlice';
import { FinancialGoal, GoalCategory } from '../sip.types';

const CATEGORIES: { label: string; cat: GoalCategory; emoji: string }[] = [
  { label: 'House', cat: 'House', emoji: '🏠' },
  { label: 'Retirement', cat: 'Retirement', emoji: '🌴' },
  { label: 'Vehicle', cat: 'Car', emoji: '🚗' },
  { label: 'Education', cat: 'Education', emoji: '🎓' },
  { label: 'Emergency', cat: 'Emergency', emoji: '🛡️' },
  { label: 'Wealth', cat: 'Wealth', emoji: '💎' },
];

export default function GoalsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const goals = useSelector((state: RootState) => state.sip.goals);
  const activeSips = useSelector((state: RootState) => state.sip.activeSips);

  const [selectedScenario, setSelectedScenario] = useState<'conservative' | 'expected' | 'aggressive'>('expected');
  const [isAddGoalModalVisible, setIsAddGoalModalVisible] = useState(false);

  // New Goal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏠');
  const [newCategory, setNewCategory] = useState<GoalCategory>('House');
  const [newTargetAmount, setNewTargetAmount] = useState('2000000');
  const [newInitialAmount, setNewInitialAmount] = useState('100000');
  const [newYears, setNewYears] = useState('5');

  // Summary Metrics
  const totalTargetCorpus = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCurrentSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalActiveSipCommitted = activeSips
    .filter((s) => s.status === 'ACTIVE' && s.goalId)
    .reduce((sum, s) => sum + s.amount, 0);

  // Goal meeting prediction calculation
  const calculatePrediction = (goal: FinancialGoal) => {
    // Determine linked SIPs monthly contribution
    const linked = activeSips.filter(
      (s) => s.status === 'ACTIVE' && (s.goalId === goal.id || goal.linkedSipIds.includes(s.id))
    );
    const monthlyContribution = linked.reduce((sum, s) => sum + s.amount, 0);

    // Calculate months remaining to target date
    const [targetYear, targetMonth] = goal.targetDate.split('-').map(Number);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const remainingMonths = Math.max(1, (targetYear - currentYear) * 12 + (targetMonth - currentMonth));

    // Return rates based on scenario
    const annualRate =
      selectedScenario === 'conservative' ? 10.0 : selectedScenario === 'expected' ? 13.0 : 16.0;
    const monthlyRate = annualRate / 100 / 12;

    // Future value of current savings: PV * (1 + r)^n
    const fvCurrent = Math.round(goal.currentAmount * Math.pow(1 + monthlyRate, remainingMonths));

    // Future value of ongoing SIPs: P * [((1+r)^n - 1) / r] * (1+r)
    let fvSip = 0;
    if (monthlyContribution > 0) {
      fvSip = Math.round(
        monthlyContribution *
          (((Math.pow(1 + monthlyRate, remainingMonths) - 1) / monthlyRate) * (1 + monthlyRate))
      );
    }

    const totalProjected = fvCurrent + fvSip;
    const difference = totalProjected - goal.targetAmount;
    const isCompleted = goal.currentAmount >= goal.targetAmount;
    const isAhead = difference >= 0;

    // Required monthly SIP to hit target exactly
    const deficitToFund = Math.max(0, goal.targetAmount - fvCurrent);
    let requiredMonthlySip = 0;
    if (deficitToFund > 0 && remainingMonths > 0) {
      const annuityFactor = ((Math.pow(1 + monthlyRate, remainingMonths) - 1) / monthlyRate) * (1 + monthlyRate);
      requiredMonthlySip = Math.round(deficitToFund / annuityFactor);
    }
    const sipDeltaRequired = Math.max(0, requiredMonthlySip - monthlyContribution);

    // Estimated completion months at current SIP
    let monthsToAchieve = remainingMonths;
    if (monthlyContribution > 0) {
      // rough month estimation
      const totalGrowthRate = 1 + monthlyRate;
      let accum = goal.currentAmount;
      let count = 0;
      while (accum < goal.targetAmount && count < 360) {
        accum = accum * totalGrowthRate + monthlyContribution;
        count++;
      }
      monthsToAchieve = count;
    }

    const monthsDelta = remainingMonths - monthsToAchieve;

    return {
      linkedCount: linked.length,
      monthlyContribution,
      remainingMonths,
      totalProjected,
      isCompleted,
      isAhead,
      difference,
      requiredMonthlySip,
      sipDeltaRequired,
      monthsDelta,
    };
  };

  const handleCreateGoal = () => {
    const target = parseFloat(newTargetAmount);
    const initial = parseFloat(newInitialAmount) || 0;
    const y = parseInt(newYears, 10) || 5;

    if (!newTitle.trim() || isNaN(target) || target <= 0) {
      Alert.alert('Invalid Details', 'Please specify a goal title and valid target amount.');
      return;
    }

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + y);
    const targetDateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`;

    dispatch(
      addGoal({
        title: newTitle.trim(),
        emoji: newEmoji,
        category: newCategory,
        targetAmount: target,
        initialAmount: initial,
        targetDate: targetDateStr,
        expectedReturnRate: 12,
      })
    );

    setIsAddGoalModalVisible(false);
    setNewTitle('');
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Goals Tracker</Text>
        <TouchableOpacity
          onPress={() => setIsAddGoalModalVisible(true)}
          style={styles.addBtn}
        >
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Goals Summary Header */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Goals Corpus</Text>
              <Text style={styles.summaryCorpus}>{formatINR(totalCurrentSaved)}</Text>
              <Text style={styles.summaryTarget}>Target: {formatINR(totalTargetCorpus)}</Text>
            </View>
            <View style={styles.activeSipBadge}>
              <Text style={styles.activeSipEmoji}>🚀</Text>
              <Text style={styles.activeSipLabel}>Linked SIPs</Text>
              <Text style={styles.activeSipVal}>{formatINR(totalActiveSipCommitted)}/mo</Text>
            </View>
          </View>

          {/* Overall Corpus Progress Bar */}
          <View style={{ marginTop: spacing.md }}>
            <ProgressBar
              progress={totalTargetCorpus > 0 ? totalCurrentSaved / totalTargetCorpus : 0}
              color={colors.amberBright}
              height={8}
            />
          </View>
        </Card>

        {/* Prediction Scenario Selector */}
        <View style={styles.scenarioBar}>
          <Text style={styles.scenarioLabel}>Prediction Engine Scenario:</Text>
          <View style={styles.scenarioChips}>
            {[
              { id: 'conservative', label: '10% Cons.' },
              { id: 'expected', label: '13% Exp.' },
              { id: 'aggressive', label: '16% Aggr.' },
            ].map((s) => {
              const active = selectedScenario === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => setSelectedScenario(s.id as any)}
                  style={[styles.scenarioChip, active && styles.scenarioChipActive]}
                >
                  <Text style={[styles.scenarioChipText, active && styles.scenarioChipTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Goals List */}
        <View style={styles.goalsContainer}>
          {goals.map((goal) => {
            const pred = calculatePrediction(goal);
            const progress = Math.min(1, goal.currentAmount / goal.targetAmount);
            const progressPct = (progress * 100).toFixed(0);

            return (
              <Card key={goal.id} style={styles.goalCard}>
                {/* Top Row: Emoji + Title + Target Date */}
                <View style={styles.goalTopRow}>
                  <View style={styles.goalIconWrap}>
                    <Text style={{ fontSize: 26 }}>{goal.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <Text style={styles.goalCategory}>
                      {goal.category} · Target: {goal.targetDate}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Delete Goal', `Are you sure you want to remove "${goal.title}"?`, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: () => dispatch(deleteGoal(goal.id)),
                        },
                      ]);
                    }}
                    style={styles.deleteGoalBtn}
                  >
                    <Text style={{ color: colors.textMuted, fontSize: 13 }}>•••</Text>
                  </TouchableOpacity>
                </View>

                {/* Progress Bar & Amount Numbers */}
                <View style={styles.goalAmountsRow}>
                  <View>
                    <Text style={styles.amountLabel}>Saved So Far</Text>
                    <Text style={styles.savedAmount}>{formatINR(goal.currentAmount)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.amountLabel}>Target Amount</Text>
                    <Text style={styles.targetAmount}>{formatINR(goal.targetAmount)}</Text>
                  </View>
                </View>

                <ProgressBar progress={progress} color={colors.purple} height={8} />
                <View style={styles.pctRow}>
                  <Text style={styles.pctText}>{progressPct}% Achieved</Text>
                  <Text style={styles.remainingText}>
                    {formatINR(Math.max(0, goal.targetAmount - goal.currentAmount))} to go
                  </Text>
                </View>

                {/* Linked SIP Info */}
                <View style={styles.linkedSipBox}>
                  <Text style={styles.linkedSipIcon}>🔄</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.linkedSipText}>
                      {pred.linkedCount > 0
                        ? `Linked: ${pred.linkedCount} SIP(s) totaling ${formatINR(pred.monthlyContribution)}/month`
                        : 'No SIP linked yet — start an SIP to automate this goal!'}
                    </Text>
                  </View>
                </View>

                {/* Meeting Predictions Engine Card */}
                <View
                  style={[
                    styles.predictionCard,
                    pred.isCompleted
                      ? styles.predSuccess
                      : pred.isAhead
                      ? styles.predAhead
                      : styles.predShortfall,
                  ]}
                >
                  <View style={styles.predictionHeadRow}>
                    <Text style={styles.predBadgeIcon}>
                      {pred.isCompleted ? '🎉' : pred.isAhead ? '🟢' : '🟡'}
                    </Text>
                    <Text style={styles.predBadgeTitle}>
                      {pred.isCompleted
                        ? 'Goal Accomplished!'
                        : pred.isAhead
                        ? 'On Track & Ahead of Schedule'
                        : 'Action Recommended: Shortfall Projected'}
                    </Text>
                  </View>

                  <Text style={styles.predDescription}>
                    {pred.isCompleted
                      ? `Congratulations! You have reached your target of ${formatINR(goal.targetAmount)}.`
                      : pred.isAhead
                      ? `Projected to accumulate ${formatINR(pred.totalProjected)} by ${goal.targetDate} (${Math.abs(
                          pred.monthsDelta
                        )} months ahead of target). Surplus: +${formatINR(pred.difference)}.`
                      : `At current SIP rate, projected to reach ${formatINR(
                          pred.totalProjected
                        )} with a shortfall of ${formatINR(Math.abs(pred.difference))}. Increase SIP by ${formatINR(
                          pred.sipDeltaRequired
                        )}/mo to hit target on time.`}
                  </Text>
                </View>

                {/* Quick Action to Link / Start SIP */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    navigation.navigate('SIPSetup', {
                      goalId: goal.id,
                      defaultAmount: pred.sipDeltaRequired > 0 ? pred.sipDeltaRequired : 2500,
                    })
                  }
                  style={styles.linkSipBtn}
                >
                  <Text style={styles.linkSipBtnText}>
                    {pred.linkedCount > 0 ? '+ Increase or Add Another SIP' : '+ Start Linked SIP for this Goal'}
                  </Text>
                </TouchableOpacity>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Add New Goal Modal */}
      <Modal
        visible={isAddGoalModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New Financial Goal</Text>
              <TouchableOpacity
                onPress={() => setIsAddGoalModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Category selector */}
              <Text style={styles.inputLabel}>Goal Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.label}
                    onPress={() => {
                      setNewCategory(c.cat);
                      setNewEmoji(c.emoji);
                    }}
                    style={[
                      styles.categoryChip,
                      newCategory === c.cat && styles.categoryChipActive,
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>{c.emoji}</Text>
                    <Text
                      style={[
                        styles.categoryText,
                        newCategory === c.cat && styles.categoryTextActive,
                      ]}
                    >
                      {c.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Goal Title */}
              <Text style={styles.inputLabel}>Goal Name / Title</Text>
              <TextInput
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="e.g. Higher Studies in UK, Goa Trip, Child Fund"
                style={styles.textInput}
              />

              {/* Target Amount */}
              <Text style={styles.inputLabel}>Target Amount (₹)</Text>
              <TextInput
                value={newTargetAmount}
                onChangeText={setNewTargetAmount}
                keyboardType="numeric"
                placeholder="2000000"
                style={styles.textInput}
              />

              {/* Initial Saved Amount */}
              <Text style={styles.inputLabel}>Already Saved (Initial Corpus ₹)</Text>
              <TextInput
                value={newInitialAmount}
                onChangeText={setNewInitialAmount}
                keyboardType="numeric"
                placeholder="100000"
                style={styles.textInput}
              />

              {/* Target Horizon in Years */}
              <Text style={styles.inputLabel}>Target Timeline (Years)</Text>
              <View style={styles.yearChipsRow}>
                {['1', '3', '5', '7', '10', '15'].map((yr) => (
                  <TouchableOpacity
                    key={yr}
                    onPress={() => setNewYears(yr)}
                    style={[styles.yearChip, newYears === yr && styles.yearChipActive]}
                  >
                    <Text
                      style={[styles.yearChipText, newYears === yr && styles.yearChipTextActive]}
                    >
                      {yr}Y
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Auto Reverse-SIP Suggestion Card */}
              {(() => {
                const t = parseFloat(newTargetAmount) || 0;
                const i = parseFloat(newInitialAmount) || 0;
                const m = (parseInt(newYears, 10) || 5) * 12;
                const r = 12 / 100 / 12;
                const fvInit = i * Math.pow(1 + r, m);
                const needed = Math.max(0, t - fvInit);
                const reqSip = Math.round(
                  needed / (((Math.pow(1 + r, m) - 1) / r) * (1 + r))
                );

                return (
                  <View style={styles.recomSipCard}>
                    <Text style={styles.recomIcon}>💡</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.recomTitle}>Recommended Monthly SIP</Text>
                      <Text style={styles.recomText}>
                        Invest <Text style={{ fontWeight: '800', color: colors.purple }}>{formatINR(reqSip)}/month</Text> at 12% CAGR to hit {formatINR(t)} in {newYears} years!
                      </Text>
                    </View>
                  </View>
                );
              })()}

              <Button
                label="Save Financial Goal"
                onPress={handleCreateGoal}
                variant="primary"
                style={{ marginTop: spacing.md, marginBottom: spacing.xl }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.purple,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  summaryCard: {
    padding: spacing.lg,
    backgroundColor: '#1E1B4B',
    borderRadius: radius.xl,
    borderWidth: 0,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.7)',
  },
  summaryCorpus: {
    ...typography.hero,
    fontSize: 30,
    color: colors.amberBright,
    fontWeight: '900',
    marginTop: 2,
  },
  summaryTarget: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  activeSipBadge: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  activeSipEmoji: { fontSize: 18 },
  activeSipLabel: { fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  activeSipVal: { fontSize: 13, fontWeight: '700', color: colors.white, marginTop: 1 },
  scenarioBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scenarioLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  scenarioChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  scenarioChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  scenarioChipActive: {
    backgroundColor: colors.purple,
  },
  scenarioChipText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  scenarioChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  goalsContainer: {
    gap: spacing.md,
  },
  goalCard: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  goalTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  goalIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.indigoChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalTitle: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
  },
  goalCategory: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  deleteGoalBtn: {
    padding: spacing.xs,
  },
  goalAmountsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  amountLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  savedAmount: {
    ...typography.bodyBold,
    color: colors.text,
  },
  targetAmount: {
    ...typography.bodyBold,
    color: colors.text,
  },
  pctRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pctText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purple,
  },
  remainingText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  linkedSipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  linkedSipIcon: { fontSize: 13 },
  linkedSipText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '500',
  },
  predictionCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  predSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  predAhead: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  predShortfall: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  predictionHeadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  predBadgeIcon: { fontSize: 14 },
  predBadgeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  predDescription: {
    fontSize: 11,
    color: colors.textFaint,
    lineHeight: 16,
  },
  linkSipBtn: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  linkSipBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purple,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: { ...typography.h3, color: colors.text },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { fontSize: 16, color: colors.textMuted, fontWeight: '700' },
  inputLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    borderColor: colors.purple,
    backgroundColor: '#F5F3FF',
  },
  categoryText: {
    fontSize: 12,
    color: colors.text,
  },
  categoryTextActive: {
    color: colors.purple,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    color: colors.text,
  },
  yearChipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  yearChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  yearChipActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  yearChipText: { fontSize: 13, color: colors.text, fontWeight: '600' },
  yearChipTextActive: { color: colors.white, fontWeight: '700' },
  recomSipCard: {
    flexDirection: 'row',
    backgroundColor: colors.yellowCard,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.yellowBorder,
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  recomIcon: { fontSize: 24 },
  recomTitle: { ...typography.caption, fontWeight: '700', color: '#92722A' },
  recomText: { fontSize: 11, color: '#92722A', lineHeight: 16, marginTop: 2 },
});
