import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { SIPSlider } from '../components/SIPSlider';
import { UpiMandateSheet } from '../components/UpiMandateSheet';
import { RootState, AppDispatch } from '../../../app/store';
import { createSIP } from '../slices/sipSlice';
import mixpanel from '@core/mixpanel';
import { TOP_MUTUAL_FUNDS } from '../sip.data';

const DEBIT_DATES = [1, 5, 10, 15, 20, 25];

export default function SIPSetupScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const dispatch = useDispatch<AppDispatch>();

  const funds = useSelector((state: RootState) => state.sip.funds);
  const goals = useSelector((state: RootState) => state.sip.goals);

  // Initialize selected fund
  const initialFundId = route.params?.fundId || funds[0]?.id || 'mf-ppfas-flexi';
  const [selectedFundId, setSelectedFundId] = useState<string>(initialFundId);
  const selectedFund = funds.find((f) => f.id === selectedFundId) || funds[0];

  // State
  const [sipAmount, setSipAmount] = useState<number>(route.params?.defaultAmount || 5000);
  const [debitDay, setDebitDay] = useState<number>(10);
  const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(route.params?.goalId);
  const [isMandateSheetVisible, setIsMandateSheetVisible] = useState(false);
  const [confirmedSip, setConfirmedSip] = useState<any | null>(null);

  useEffect(() => {
    // Track SIP setup started event per repo analytics spec
    mixpanel.track('sip_setup_started', {
      fund_id: selectedFund.id,
      fund_name: selectedFund.name,
      entry_source: route.params?.entrySource || 'direct_flow',
    });
  }, [selectedFund.id]);

  // Projected 5-Year CAGR calculation
  const cagrRate = (selectedFund.cagr3Y || 15) / 100 / 12;
  const projected5Y = Math.round(
    sipAmount * (((Math.pow(1 + cagrRate, 60) - 1) / cagrRate) * (1 + cagrRate))
  );

  const handleDebitDateSelect = (day: number) => {
    const prev = debitDay;
    setDebitDay(day);
    mixpanel.track('sip_date_selected', {
      fund_id: selectedFund.id,
      debit_date: day,
      debit_date_previous: prev,
    });
  };

  const handleAmountChange = (newAmount: number) => {
    const prev = sipAmount;
    setSipAmount(newAmount);
    mixpanel.track('sip_amount_entered', {
      fund_id: selectedFund.id,
      amount: newAmount,
      amount_previous: prev,
      input_method: 'slider',
    });
  };

  const handleMandateSuccess = (mandate: {
    upiApp: string;
    upiId: string;
    bankName: string;
    accountLast4: string;
    mandateUrn: string;
  }) => {
    setIsMandateSheetVisible(false);

    // Dispatch Redux action
    dispatch(
      createSIP({
        fundId: selectedFund.id,
        amount: sipAmount,
        frequency: 'monthly',
        debitDay,
        goalId: selectedGoalId,
        bankName: mandate.bankName,
        accountLast4: mandate.accountLast4,
        upiApp: mandate.upiApp,
        upiId: mandate.upiId,
      })
    );

    const clientSipId = `SIP-${selectedFund.amc.slice(0, 4).toUpperCase()}-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

    // Track analytics events
    mixpanel.track('sip_confirmed', {
      fund_id: selectedFund.id,
      amount: sipAmount,
      debit_date: debitDay,
      client_sip_id: clientSipId,
    });

    mixpanel.track('sip_created', {
      sip_id: `sip-${Date.now()}`,
      client_sip_id: clientSipId,
      fund_id: selectedFund.id,
      amount: sipAmount,
      debit_date: debitDay,
      first_debit_date: `${debitDay} Oct 2026`,
    });

    setConfirmedSip({
      clientSipId,
      mandateUrn: mandate.mandateUrn,
      fundName: selectedFund.name,
      amount: sipAmount,
      debitDay,
      bankName: mandate.bankName,
      accountLast4: mandate.accountLast4,
      upiApp: mandate.upiApp,
      firstDebitDate: `${debitDay} Oct 2026`,
    });
  };

  if (confirmedSip) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <ScrollView contentContainerStyle={styles.successScroll}>
          <View style={styles.successCard}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>SIP Successfully Registered!</Text>
            <Text style={styles.successSub}>
              Your automated monthly wealth creation plan is live.
            </Text>

            {/* Receipt Details */}
            <View style={styles.receiptContainer}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Client SIP ID:</Text>
                <Text style={styles.receiptVal}>{confirmedSip.clientSipId}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Mutual Fund:</Text>
                <Text style={[styles.receiptVal, { maxWidth: '60%' }]} numberOfLines={1}>
                  {confirmedSip.fundName}
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Monthly Installment:</Text>
                <Text style={[styles.receiptVal, { color: colors.purple, fontWeight: '800' }]}>
                  {formatINR(confirmedSip.amount)}/month
                </Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>First Debit Date:</Text>
                <Text style={styles.receiptVal}>{confirmedSip.firstDebitDate}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>NPCI Mandate URN:</Text>
                <Text style={styles.receiptVal}>{confirmedSip.mandateUrn}</Text>
              </View>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptLabel}>Payment Mode:</Text>
                <Text style={styles.receiptVal}>
                  {confirmedSip.upiApp} ({confirmedSip.bankName} •••• {confirmedSip.accountLast4})
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.successActions}>
              <Button
                label="View in Goals Tracker"
                onPress={() => navigation.navigate('Goals')}
                variant="gradientPurple"
              />
              <Button
                label="Go to Mutual Funds Portfolio"
                onPress={() => navigation.navigate('MFPortfolio')}
                variant="outline"
                style={{ marginTop: spacing.sm }}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SIP Setup</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step 1: Fund Selection Card */}
        <Card style={styles.fundHeaderCard}>
          <View style={styles.fundRow}>
            <View style={styles.fundIconWrap}>
              <Text style={{ fontSize: 26 }}>{selectedFund.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fundName}>{selectedFund.name}</Text>
              <Text style={styles.fundAmc}>
                {selectedFund.amc} · {selectedFund.category}
              </Text>
            </View>
          </View>

          {/* Fund Metrics Badges */}
          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Latest NAV</Text>
              <Text style={styles.metricVal}>{formatINR(selectedFund.nav)}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>3Y Return</Text>
              <Text style={[styles.metricVal, { color: colors.green }]}>
                +{selectedFund.cagr3Y}%
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Risk Level</Text>
              <Text style={styles.metricVal}>{selectedFund.risk}</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Rating</Text>
              <Text style={[styles.metricVal, { color: colors.star }]}>
                {'★'.repeat(selectedFund.rating)}
              </Text>
            </View>
          </View>

          {/* Quick Fund Switcher Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.fundPickerScroll}
          >
            {funds.map((f) => (
              <TouchableOpacity
                key={f.id}
                onPress={() => setSelectedFundId(f.id)}
                style={[
                  styles.fundChip,
                  selectedFundId === f.id && styles.fundChipActive,
                ]}
              >
                <Text style={styles.fundChipText}>
                  {f.icon} {f.name.split(' ')[0]} {f.category.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {/* Step 2: SIP Amount Slider */}
        <SIPSlider
          label="Choose Monthly SIP Amount"
          value={sipAmount}
          min={selectedFund.minSip || 500}
          max={50000}
          step={500}
          unitPrefix="₹"
          presetChips={[
            { label: '₹1K', value: 1000 },
            { label: '₹2.5K', value: 2500 },
            { label: '₹5K', value: 5000 },
            { label: '₹10K', value: 10000 },
            { label: '₹20K', value: 20000 },
          ]}
          onChange={handleAmountChange}
        />

        {/* Step 3: Debit Date Picker */}
        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Select Monthly Auto-Debit Date</Text>
          <Text style={styles.sectionSub}>
            Funds will automatically debit from your bank on this date each month
          </Text>

          <View style={styles.datesRow}>
            {DEBIT_DATES.map((day) => {
              const active = debitDay === day;
              return (
                <TouchableOpacity
                  key={day}
                  activeOpacity={0.8}
                  onPress={() => handleDebitDateSelect(day)}
                  style={[styles.dateChip, active && styles.dateChipActive]}
                >
                  <Text style={[styles.dateNumber, active && styles.dateNumberActive]}>
                    {day}
                  </Text>
                  <Text style={[styles.dateSuffix, active && styles.dateSuffixActive]}>
                    {day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.nextDebitBanner}>
            <Text style={styles.calendarIcon}>📅</Text>
            <Text style={styles.nextDebitText}>
              First installment debit: <Text style={{ fontWeight: '700' }}>{debitDay} Oct 2026</Text>
            </Text>
          </View>
        </Card>

        {/* Step 4: CAGR Growth Preview Badge */}
        <View style={styles.cagrBanner}>
          <Text style={styles.cagrIcon}>📈</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.cagrTitle}>Compounding Projection</Text>
            <Text style={styles.cagrDesc}>
              At this fund's ~{selectedFund.cagr3Y}% CAGR, your {formatINR(sipAmount)}/mo can grow into{' '}
              <Text style={{ fontWeight: '800', color: colors.purple }}>{formatINR(projected5Y)}</Text> in 5 years!
            </Text>
          </View>
        </View>

        {/* Step 5: Link to a Goal */}
        <Card style={styles.sectionCard}>
          <View style={styles.goalHeaderRow}>
            <Text style={styles.sectionTitle}>Link to a Financial Goal</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Goals')}>
              <Text style={styles.manageGoalsLink}>Manage Goals</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.sectionSub}>
            Linking an SIP keeps your savings disciplined and tracks completion progress
          </Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.goalsScroll}>
            <TouchableOpacity
              onPress={() => setSelectedGoalId(undefined)}
              style={[styles.goalSelectChip, !selectedGoalId && styles.goalSelectChipActive]}
            >
              <Text style={styles.goalSelectText}>✨ No Goal / Wealth</Text>
            </TouchableOpacity>

            {goals.map((g) => {
              const active = selectedGoalId === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  onPress={() => setSelectedGoalId(g.id)}
                  style={[styles.goalSelectChip, active && styles.goalSelectChipActive]}
                >
                  <Text style={styles.goalSelectText}>
                    {g.emoji} {g.title.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Card>

        {/* Step 6: CTA to Open UPI Mandate */}
        <View style={styles.ctaContainer}>
          <Button
            label={`Proceed to Mandate Setup (${formatINR(sipAmount)}/mo)`}
            onPress={() => setIsMandateSheetVisible(true)}
            variant="gradientPurple"
          />
        </View>
      </ScrollView>

      {/* UPI Mandate Bottom Sheet */}
      <UpiMandateSheet
        visible={isMandateSheetVisible}
        sipAmount={sipAmount}
        fundName={selectedFund.name}
        debitDay={debitDay}
        onClose={() => setIsMandateSheetVisible(false)}
        onSuccess={handleMandateSuccess}
      />
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
  fundHeaderCard: {
    padding: spacing.lg,
  },
  fundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  fundIconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.indigoChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fundName: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
  },
  fundAmc: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.md,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
  fundPickerScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  fundChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fundChipActive: {
    borderColor: colors.purple,
    backgroundColor: '#F5F3FF',
  },
  fundChipText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  sectionCard: {
    padding: spacing.lg,
  },
  sectionTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  sectionSub: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  dateChip: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  dateChipActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  dateNumber: {
    ...typography.h3,
    fontSize: 17,
    color: colors.text,
  },
  dateNumberActive: {
    color: colors.white,
  },
  dateSuffix: {
    fontSize: 10,
    color: colors.textMuted,
  },
  dateSuffixActive: {
    color: 'rgba(255,255,255,0.85)',
  },
  nextDebitBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.md,
  },
  calendarIcon: {
    fontSize: 14,
  },
  nextDebitText: {
    fontSize: 12,
    color: colors.text,
  },
  cagrBanner: {
    flexDirection: 'row',
    backgroundColor: colors.yellowCard,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.yellowBorder,
    alignItems: 'center',
    gap: spacing.md,
  },
  cagrIcon: {
    fontSize: 28,
  },
  cagrTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: '#92722A',
  },
  cagrDesc: {
    ...typography.caption,
    color: '#92722A',
    lineHeight: 18,
    marginTop: 2,
  },
  goalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  manageGoalsLink: {
    fontSize: 12,
    color: colors.purple,
    fontWeight: '700',
  },
  goalsScroll: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  goalSelectChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  goalSelectChipActive: {
    borderColor: colors.purple,
    backgroundColor: '#F5F3FF',
  },
  goalSelectText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
  },
  ctaContainer: {
    marginTop: spacing.sm,
  },
  successScroll: {
    padding: spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  successCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  successEmoji: {
    fontSize: 54,
    marginBottom: spacing.sm,
  },
  successTitle: {
    ...typography.h2,
    textAlign: 'center',
    color: colors.text,
  },
  successSub: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  receiptContainer: {
    width: '100%',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  receiptLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  receiptVal: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },
  successActions: {
    width: '100%',
    gap: spacing.xs,
  },
});
