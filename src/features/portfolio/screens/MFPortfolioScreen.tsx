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
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR, formatPct } from '../../../shared/format';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { RootState, AppDispatch } from '../../../app/store';
import { MFHolding } from '../mf.types';
import { redeemUnits } from '../slices/mfPortfolioSlice';
import { RedeemModal } from '../components/RedeemModal';
import mixpanel from '@core/mixpanel';

export default function MFPortfolioScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const holdings = useSelector((state: RootState) => state.mfPortfolio.holdings);
  const [selectedHoldingForRedeem, setSelectedHoldingForRedeem] = useState<MFHolding | null>(null);

  // Overall Portfolio Aggregates
  const totalInvested = holdings.reduce((sum, h) => sum + h.investedAmount, 0);
  const totalCurrentValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalGain = totalCurrentValue - totalInvested;
  const totalGainPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;
  const total1DayGain = holdings.reduce((sum, h) => sum + h.oneDayChange, 0);

  // Portfolio weighted XIRR
  const weightedXirr =
    totalCurrentValue > 0
      ? holdings.reduce((sum, h) => sum + h.xirr * h.currentValue, 0) / totalCurrentValue
      : 0;

  // Asset Allocation calculation
  const equityValue = holdings
    .filter((h) => h.category !== 'Debt & Liquid')
    .reduce((sum, h) => sum + h.currentValue, 0);
  const debtValue = holdings
    .filter((h) => h.category === 'Debt & Liquid')
    .reduce((sum, h) => sum + h.currentValue, 0);

  const equityPct = totalCurrentValue > 0 ? (equityValue / totalCurrentValue) * 100 : 0;
  const debtPct = totalCurrentValue > 0 ? (debtValue / totalCurrentValue) * 100 : 0;

  useEffect(() => {
    // Track portfolio viewed with mutual fund flag
    mixpanel.track('portfolio_viewed', {
      holdings_count: holdings.length,
      total_invested: totalInvested,
      current_value: totalCurrentValue,
      total_pnl: totalGain,
      total_pnl_pct: totalGainPct,
      has_mf_holdings: holdings.length > 0,
      has_stock_holdings: true,
    });
  }, [holdings.length, totalInvested, totalCurrentValue, totalGain, totalGainPct]);

  const handleConfirmRedeem = (holdingId: string, unitsToRedeem: number, bankAccount: string) => {
    dispatch(redeemUnits({ holdingId, units: unitsToRedeem, bankAccount }));

    Alert.alert(
      '✅ Redemption Order Placed',
      `Your request to redeem ${unitsToRedeem.toFixed(3)} units has been submitted. Net payout will be credited to ${bankAccount} within T+2 business days. Realized capital gain/loss has been updated in your Tax Report.`,
      [{ text: 'View Tax Report', onPress: () => navigation.navigate('TaxReport') }, { text: 'Done' }]
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mutual Funds Portfolio</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('TaxReport')}
          style={styles.taxBtn}
        >
          <Text style={styles.taxBtnText}>🧾 Tax Report</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Portfolio Summary Hero Card */}
        <Card style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Mutual Funds Value</Text>
          <Text style={styles.heroValue}>{formatINR(totalCurrentValue)}</Text>

          <View style={styles.heroReturnsRow}>
            <Text style={[styles.heroReturnText, { color: totalGain >= 0 ? colors.greenBright : colors.pink }]}>
              {totalGain >= 0 ? '↑ +' : '↓ '}{formatINR(totalGain)} ({formatPct(totalGainPct)})
            </Text>
            <View style={styles.xirrBadge}>
              <Text style={styles.xirrText}>XIRR: +{weightedXirr.toFixed(1)}%</Text>
            </View>
          </View>

          {/* Sub Stats Row */}
          <View style={styles.subStatsRow}>
            <View style={styles.subStatCol}>
              <Text style={styles.subStatLabel}>Total Invested</Text>
              <Text style={styles.subStatVal}>{formatINR(totalInvested)}</Text>
            </View>
            <View style={styles.subStatDivider} />
            <View style={styles.subStatCol}>
              <Text style={styles.subStatLabel}>1-Day Returns</Text>
              <Text style={[styles.subStatVal, { color: colors.greenBright }]}>
                +{formatINR(total1DayGain)}
              </Text>
            </View>
            <View style={styles.subStatDivider} />
            <View style={styles.subStatCol}>
              <Text style={styles.subStatLabel}>Holdings</Text>
              <Text style={styles.subStatVal}>{holdings.length} Funds</Text>
            </View>
          </View>

          {/* Asset Allocation Bar */}
          <View style={styles.assetAllocationContainer}>
            <View style={styles.allocationLabelsRow}>
              <Text style={styles.allocationTitle}>Asset Allocation</Text>
              <Text style={styles.allocationBreakdown}>
                Equity: {equityPct.toFixed(0)}% · Debt/Liquid: {debtPct.toFixed(0)}%
              </Text>
            </View>
            <View style={styles.allocationTrack}>
              <View style={[styles.allocationEquity, { width: `${equityPct}%` }]} />
              <View style={[styles.allocationDebt, { width: `${debtPct}%` }]} />
            </View>
          </View>
        </Card>

        {/* Quick Action Navigation Bar */}
        <View style={styles.quickActionsBar}>
          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('SIPSetup')}
          >
            <Text style={styles.actionChipIcon}>⚡</Text>
            <Text style={styles.actionChipText}>Start SIP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('SIPCalculator')}
          >
            <Text style={styles.actionChipIcon}>🧮</Text>
            <Text style={styles.actionChipText}>SIP Calculator</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('Goals')}
          >
            <Text style={styles.actionChipIcon}>🎯</Text>
            <Text style={styles.actionChipText}>Goal Tracker</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionChip}
            onPress={() => navigation.navigate('TaxReport')}
          >
            <Text style={styles.actionChipIcon}>📊</Text>
            <Text style={styles.actionChipText}>Tax Estimates</Text>
          </TouchableOpacity>
        </View>

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionHeading}>YOUR MUTUAL FUND HOLDINGS ({holdings.length})</Text>
        </View>

        {/* Holdings List */}
        <View style={styles.holdingsList}>
          {holdings.map((h, index) => {
            const isProfit = h.totalReturns >= 0;
            return (
              <Card key={h.id} style={styles.holdingCard}>
                {/* Header: Fund Name & Category */}
                <View style={styles.holdingTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.holdingFundName}>{h.fundName}</Text>
                    <Text style={styles.holdingAmc}>
                      {h.amc} · <Text style={{ color: colors.purple, fontWeight: '700' }}>{h.category}</Text>
                    </Text>
                  </View>
                  <View style={styles.fundXirrBadge}>
                    <Text style={styles.fundXirrText}>+{h.xirr}% XIRR</Text>
                  </View>
                </View>

                {/* Primary Data Grid: Units, NAV, Invested, Current Value */}
                <View style={styles.holdingDataGrid}>
                  <View style={styles.gridCol}>
                    <Text style={styles.gridLabel}>Holding Units</Text>
                    <Text style={styles.gridVal}>{h.units.toFixed(3)}</Text>
                    <Text style={styles.gridSub}>Avg: {formatINR(h.avgNav)}</Text>
                  </View>

                  <View style={styles.gridCol}>
                    <Text style={styles.gridLabel}>Current NAV</Text>
                    <Text style={styles.gridVal}>{formatINR(h.currentNav)}</Text>
                    <Text style={styles.gridSub}>as of {h.navDate}</Text>
                  </View>

                  <View style={[styles.gridCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.gridLabel}>Current Value</Text>
                    <Text style={[styles.gridVal, { color: colors.text, fontWeight: '800' }]}>
                      {formatINR(h.currentValue)}
                    </Text>
                    <Text style={[styles.gridSub, { color: isProfit ? colors.green : colors.pink, fontWeight: '700' }]}>
                      {isProfit ? '+' : ''}{formatINR(h.totalReturns)} ({h.totalReturnsPct}%)
                    </Text>
                  </View>
                </View>

                {/* SIP tag & Exit load info */}
                <View style={styles.holdingFooterRow}>
                  {h.activeSipAmount > 0 ? (
                    <View style={styles.sipTag}>
                      <Text style={styles.sipTagText}>
                        🟢 Active SIP: {formatINR(h.activeSipAmount)}/mo
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.lumpsumTag}>
                      <Text style={styles.lumpsumTagText}>Lumpsum Holding</Text>
                    </View>
                  )}

                  {/* Redeem Button */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => {
                      mixpanel.track('holding_tapped', {
                        holding_id: h.id,
                        holding_type: 'mutual_fund',
                        symbol_or_fund_id: h.fundId,
                        source_position: index + 1,
                      });
                      setSelectedHoldingForRedeem(h);
                    }}
                    style={styles.redeemBtn}
                  >
                    <Text style={styles.redeemBtnText}>Redeem Units</Text>
                  </TouchableOpacity>
                </View>

                {/* Exit load disclosure */}
                <View style={styles.exitLoadBox}>
                  <Text style={styles.exitLoadText}>ℹ️ {h.exitLoadText}</Text>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>

      {/* Redeem Modal */}
      <RedeemModal
        visible={!!selectedHoldingForRedeem}
        holding={selectedHoldingForRedeem}
        onClose={() => setSelectedHoldingForRedeem(null)}
        onConfirmRedeem={handleConfirmRedeem}
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
  taxBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  taxBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.purple,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 100,
    gap: spacing.sm,
  },
  heroCard: {
    padding: spacing.xl,
    backgroundColor: '#1E1B4B',
    borderRadius: radius.xl,
    borderWidth: 0,
  },
  heroLabel: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.7)',
  },
  heroValue: {
    ...typography.hero,
    fontSize: 34,
    color: colors.white,
    fontWeight: '900',
    marginTop: 2,
  },
  heroReturnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  heroReturnText: {
    ...typography.bodyBold,
    fontSize: 15,
  },
  xirrBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  xirrText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.greenBright,
  },
  subStatsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  subStatCol: {
    alignItems: 'center',
  },
  subStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
  },
  subStatVal: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.white,
    marginTop: 2,
  },
  subStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  assetAllocationContainer: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
  allocationLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  allocationTitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  allocationBreakdown: {
    fontSize: 11,
    color: colors.amberBright,
    fontWeight: '600',
  },
  allocationTrack: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  allocationEquity: {
    backgroundColor: colors.purple,
    height: '100%',
  },
  allocationDebt: {
    backgroundColor: colors.greenBright,
    height: '100%',
  },
  quickActionsBar: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
    marginVertical: spacing.xs,
  },
  actionChip: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionChipIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  actionChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text,
  },
  sectionHeaderRow: {
    marginTop: spacing.xs,
  },
  sectionHeading: {
    ...typography.overline,
    color: colors.textMuted,
  },
  holdingsList: {
    gap: spacing.md,
  },
  holdingCard: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  holdingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  holdingFundName: {
    ...typography.h3,
    fontSize: 15,
    color: colors.text,
  },
  holdingAmc: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  fundXirrBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  fundXirrText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  holdingDataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  gridCol: {},
  gridLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  gridVal: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },
  gridSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  holdingFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  sipTag: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  sipTagText: {
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '700',
  },
  lumpsumTag: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  lumpsumTagText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  redeemBtn: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  redeemBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
  },
  exitLoadBox: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    padding: spacing.xs + 2,
  },
  exitLoadText: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
  },
});
