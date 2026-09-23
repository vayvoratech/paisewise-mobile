import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { MutualFund } from '../mutualfunds.types';
import { mutualFundsService } from '../mutualfunds.service';
import { NAVGraph } from '../components/NAVGraph';
import { ReturnsTable } from '../components/ReturnsTable';
import { HoldingsBreakdown } from '../components/HoldingsBreakdown';
import { AIRecommendationCard } from '../components/AIRecommendationCard';
import { watchlistManager } from '../../watchlist/watchlistManager';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';
import analyticsService from '../../../core/analyticsService';

const SIP_PRESETS = [500, 1000, 2500, 5000];
const SIP_DATES = [1, 5, 10, 15, 20, 25];

export default function FundDetailScreen({ route, navigation }: { route: any; navigation: any }) {
  const { fundId = 'hdfc-top-100', fundName } = route.params || {};

  const [fund, setFund] = useState<MutualFund | null>(null);
  const [loading, setLoading] = useState(true);

  // Watchlist state
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [watchConfirmVisible, setWatchConfirmVisible] = useState(false);

  // SIP Modal state
  const [sipModalVisible, setSipModalVisible] = useState(false);
  const [sipAmount, setSipAmount] = useState('1000');
  const [selectedDate, setSelectedDate] = useState(10);
  const [sipCreatedSuccess, setSipCreatedSuccess] = useState(false);

  // Jargon explainer state
  const [activeJargon, setActiveJargon] = useState<string | null>(null);

  // Fetch fund details
  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await mutualFundsService.getFundById(fundId);
        if (isMounted && data) {
          setFund(data);

          // Track analytics
          analyticsService.fundDetailViewed({
            fund_id: data.id,
            fund_name: data.name,
            fund_category: data.category,
            returns_1y_pct: data.returns1Y,
            expense_ratio_pct: data.expenseRatio,
            risk_level: data.riskLevel,
          });

          analyticsService.riskOmeterViewed({
            fund_id: data.id,
            risk_level: data.riskLevel,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [fundId]);

  // Watchlist sync
  useEffect(() => {
    const symbolKey = `MF:${fundId}`;
    setIsWatchlisted(watchlistManager.isInWatchlist(symbolKey));

    const syncWatch = () => {
      setIsWatchlisted(watchlistManager.isInWatchlist(symbolKey));
    };

    watchlistManager.on('change', syncWatch);
    return () => {
      watchlistManager.off('change', syncWatch);
    };
  }, [fundId]);

  const handleToggleWatchlist = () => {
    setWatchConfirmVisible(true);
  };

  const handleConfirmWatchlist = () => {
    const symbolKey = `MF:${fundId}`;
    if (isWatchlisted) {
      watchlistManager.removeFromWatchlist(symbolKey);
    } else {
      watchlistManager.addToWatchlist(symbolKey, fund?.name || fundName || 'Mutual Fund');
    }
    setWatchConfirmVisible(false);
  };

  const handleShare = async () => {
    if (!fund) return;
    try {
      await Share.share({
        message: `Check out ${fund.name} on PaiseWise! 3-Year CAGR: +${fund.returns3Y}% with an expense ratio of only ${fund.expenseRatio}%.`,
      });
    } catch {
      // ignore
    }
  };

  // Open SIP Modal
  const handleOpenSipModal = () => {
    if (!fund) return;
    analyticsService.sipSetupStarted({
      fund_id: fund.id,
      fund_name: fund.name,
      entry_source: 'fund_detail_screen',
    });
    setSipCreatedSuccess(false);
    setSipModalVisible(true);
  };

  // Select SIP Amount
  const handleAmountChange = (amt: string) => {
    const prev = parseFloat(sipAmount) || 0;
    setSipAmount(amt);
    const parsed = parseFloat(amt) || 0;
    if (fund && parsed > 0) {
      analyticsService.sipAmountEntered({
        fund_id: fund.id,
        amount: parsed,
        amount_previous: prev,
        input_method: 'keypad',
      });
    }
  };

  // Select SIP Date
  const handleDateChange = (date: number) => {
    const prev = selectedDate;
    setSelectedDate(date);
    if (fund) {
      analyticsService.sipDateSelected({
        fund_id: fund.id,
        debit_date: date,
        debit_date_previous: prev,
      });
    }
  };

  // Confirm SIP Creation
  const handleConfirmSip = () => {
    if (!fund) return;
    const amountNum = parseFloat(sipAmount) || 1000;
    const clientSipId = `sip_${Date.now()}`;

    analyticsService.sipConfirmed({
      fund_id: fund.id,
      amount: amountNum,
      debit_date: selectedDate,
      client_sip_id: clientSipId,
    });

    const nextMonthDate = new Date();
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
    nextMonthDate.setDate(selectedDate);

    analyticsService.sipCreated({
      sip_id: `srv_${Date.now()}`,
      client_sip_id: clientSipId,
      fund_id: fund.id,
      amount: amountNum,
      debit_date: selectedDate,
      first_debit_date: nextMonthDate.toISOString().split('T')[0],
    });

    setSipCreatedSuccess(true);
    setTimeout(() => {
      setSipModalVisible(false);
      setSipCreatedSuccess(false);
    }, 2200);
  };

  if (loading || !fund) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple} />
        <Text style={styles.loadingText}>Loading fund details...</Text>
      </SafeAreaView>
    );
  }

  // Riskometer badge color
  const riskColor =
    fund.riskLevel === 'Low'
      ? colors.green
      : fund.riskLevel === 'Moderate'
      ? colors.amber
      : colors.pink;

  // Category badge color
  const categoryTheme =
    fund.category === 'large'
      ? { bg: '#E0F2FE', text: '#0284C7' }
      : fund.category === 'mid'
      ? { bg: '#FEF3C7', text: '#D97706' }
      : { bg: '#F3E8FF', text: '#7E22CE' };

  // SIP Calculator projection for modal
  const parsedSip = parseFloat(sipAmount) || 1000;
  const cagrRate = fund.returns3Y / 100;
  const monthlyRate = cagrRate / 12;
  const totalMonths = 36;
  const totalInvested = parsedSip * totalMonths;
  const estimatedFutureValue = Math.round(
    parsedSip * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Navigation Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>

        <View style={styles.navTitleWrap}>
          <Text style={styles.navTitle} numberOfLines={1}>
            {fund.name}
          </Text>
          <Text style={styles.navSubTitle}>{fund.amc}</Text>
        </View>

        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Text style={styles.iconEmoji}>📤</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, isWatchlisted && styles.starBtnActive]}
            onPress={handleToggleWatchlist}
          >
            <Text style={styles.iconEmoji}>{isWatchlisted ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Badges & Meta */}
        <View style={styles.badgesRow}>
          <View style={[styles.categoryPill, { backgroundColor: categoryTheme.bg }]}>
            <Text style={[styles.categoryPillText, { color: categoryTheme.text }]}>
              {fund.categoryLabel}
            </Text>
          </View>
          <View style={styles.planPill}>
            <Text style={styles.planPillText}>{fund.planType}</Text>
          </View>
          <View style={[styles.riskPill, { borderColor: riskColor }]}>
            <Text style={[styles.riskPillText, { color: riskColor }]}>
              ● {fund.riskLevel} Risk
            </Text>
          </View>
        </View>

        {/* Fund Title & Rating */}
        <View style={styles.titleSection}>
          <Text style={styles.fundMainTitle}>{fund.name}</Text>
          <View style={styles.ratingRow}>
            <View style={styles.starWrap}>
              <Text style={styles.starEmoji}>⭐</Text>
              <Text style={styles.starRatingVal}>{fund.rating.toFixed(1)} / 5.0</Text>
            </View>
            <Text style={styles.ratingSource}>• Crisil 5-Star Equivalent</Text>
          </View>
        </View>

        {/* NAV & Performance Graph */}
        <View style={styles.sectionBlock}>
          <NAVGraph
            navHistory={fund.navHistory}
            currentNav={fund.currentNav}
            accentColor={fund.category === 'debt' ? colors.purple : colors.green}
          />
        </View>

        {/* AI Recommendations & Analysis Card */}
        <View style={styles.sectionBlock}>
          <AIRecommendationCard
            recommendation={fund.aiRecommendation}
            fundName={fund.name}
          />
        </View>

        {/* Returns Average Tables */}
        <View style={styles.sectionBlock}>
          <ReturnsTable
            returnsComparison={fund.returnsComparison}
            fundName={fund.name}
            benchmarkName={fund.benchmark}
          />
        </View>

        {/* Fund Fundamentals & Expense Ratio Grid */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Fund Fundamentals & Expense Ratios</Text>

          <View style={styles.statsGrid}>
            {/* Expense Ratio with direct explanation */}
            <TouchableOpacity
              style={styles.statCard}
              onPress={() =>
                setActiveJargon(
                  `Expense Ratio: ${fund.expenseRatio}% (Direct Plan). You save ~${(
                    (fund.regularExpenseRatio || 1.6) - fund.expenseRatio
                  ).toFixed(2)}% annually compared to regular plans because there are no distributor commissions.`
                )
              }
            >
              <Text style={styles.statLabel}>Expense Ratio ⓘ</Text>
              <Text style={styles.statValueHighlight}>{fund.expenseRatio}%</Text>
              <Text style={styles.statSubText}>
                Reg: {fund.regularExpenseRatio || '1.60'}%
              </Text>
            </TouchableOpacity>

            {/* AUM */}
            <TouchableOpacity
              style={styles.statCard}
              onPress={() =>
                setActiveJargon(
                  `AUM (Assets Under Management): ₹${fund.aumCrores.toLocaleString('en-IN')} Crores. Total investor wealth managed by this fund scheme.`
                )
              }
            >
              <Text style={styles.statLabel}>AUM ⓘ</Text>
              <Text style={styles.statValue}>₹{fund.aumCrores.toLocaleString('en-IN')} Cr</Text>
              <Text style={styles.statSubText}>Total Fund Size</Text>
            </TouchableOpacity>

            {/* Exit Load */}
            <TouchableOpacity
              style={styles.statCard}
              onPress={() =>
                setActiveJargon(
                  `Exit Load: ${fund.exitLoad}. Fee deducted only if redeemed before minimum holding period.`
                )
              }
            >
              <Text style={styles.statLabel}>Exit Load ⓘ</Text>
              <Text style={styles.statValue} numberOfLines={1}>
                {fund.exitLoad.includes('Nil') ? 'Nil (0%)' : '1.0%'}
              </Text>
              <Text style={styles.statSubText} numberOfLines={1}>
                {fund.exitLoad.includes('Nil') ? 'Zero Penalty' : 'Within 365 Days'}
              </Text>
            </TouchableOpacity>

            {/* Lock-in Period */}
            <TouchableOpacity
              style={styles.statCard}
              onPress={() =>
                setActiveJargon(
                  `Lock-in: ${fund.lockInPeriod}. Open-ended funds have zero lock-in, meaning full liquidity at any time.`
                )
              }
            >
              <Text style={styles.statLabel}>Lock-in ⓘ</Text>
              <Text style={styles.statValue}>{fund.lockInPeriod}</Text>
              <Text style={styles.statSubText}>Open-Ended</Text>
            </TouchableOpacity>

            {/* Min SIP */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Min SIP Amount</Text>
              <Text style={styles.statValue}>₹{fund.minSipAmount}</Text>
              <Text style={styles.statSubText}>Monthly</Text>
            </View>

            {/* Min Lumpsum */}
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Min Lumpsum</Text>
              <Text style={styles.statValue}>₹{fund.minLumpsumAmount}</Text>
              <Text style={styles.statSubText}>One-Time</Text>
            </View>
          </View>

          {/* Active Jargon Popup Note */}
          {activeJargon && (
            <View style={styles.jargonBox}>
              <Text style={styles.jargonText}>{activeJargon}</Text>
              <TouchableOpacity onPress={() => setActiveJargon(null)} style={styles.jargonCloseBtn}>
                <Text style={styles.jargonCloseText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Fund Manager Info Card */}
          <View style={styles.managerCard}>
            <View style={styles.managerAvatar}>
              <Text style={styles.managerAvatarText}>
                {fund.manager.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </Text>
            </View>
            <View style={styles.managerDetails}>
              <Text style={styles.managerTitleLabel}>FUND MANAGER</Text>
              <Text style={styles.managerName}>{fund.manager.name}</Text>
              <Text style={styles.managerEdu}>{fund.manager.education}</Text>
              <View style={styles.managerStatsRow}>
                <Text style={styles.managerMeta}>
                  💼 {fund.manager.experienceYears}+ Yrs Industry Exp
                </Text>
                <Text style={styles.managerMeta}>
                  ⏱️ {fund.manager.tenureWithFund} Tenure
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Holdings Breakdown (Stocks / Debt Bonds & Sector Allocation) */}
        <View style={styles.sectionBlock}>
          <Text style={styles.sectionHeading}>Holdings & Portfolio Structure</Text>
          <HoldingsBreakdown
            holdings={fund.topHoldings}
            sectors={fund.sectorAllocations}
            onHoldingPress={(h) => {
              if (h.symbol) {
                navigation.navigate('StockDetail', {
                  symbol: h.symbol,
                  companyName: h.name,
                });
              }
            }}
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom Investment Action Bar */}
      <View style={styles.footerActionsBar}>
        <TouchableOpacity
          style={[styles.footerBtn, styles.lumpsumBtn]}
          onPress={handleOpenSipModal}
          activeOpacity={0.8}
        >
          <Text style={styles.lumpsumBtnText}>One-Time</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.footerBtn, styles.sipBtn]}
          onPress={handleOpenSipModal}
          activeOpacity={0.8}
        >
          <Text style={styles.sipBtnEmoji}>⚡</Text>
          <Text style={styles.sipBtnText}>Start SIP</Text>
        </TouchableOpacity>
      </View>

      {/* Watchlist Confirmation Modal */}
      <ConfirmModal
        visible={watchConfirmVisible}
        title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
        message={
          isWatchlisted
            ? `Remove ${fund.name} from your Watchlist?`
            : `Add ${fund.name} to your Watchlist for daily NAV updates?`
        }
        confirmText={isWatchlisted ? 'Yes, Remove' : 'Yes, Add'}
        confirmVariant={isWatchlisted ? 'danger' : 'primary'}
        onConfirm={handleConfirmWatchlist}
        onCancel={() => setWatchConfirmVisible(false)}
      />

      {/* Interactive SIP Setup Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={sipModalVisible}
        onRequestClose={() => setSipModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Set Up Monthly SIP</Text>
                <Text style={styles.modalFundSub} numberOfLines={1}>
                  {fund.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setSipModalVisible(false)}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {sipCreatedSuccess ? (
              <View style={styles.sipSuccessBox}>
                <Text style={styles.successIcon}>🎉</Text>
                <Text style={styles.successTitle}>SIP Successfully Scheduled!</Text>
                <Text style={styles.successSub}>
                  ₹{parsedSip} will be auto-debited on the {selectedDate}th of each month.
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Amount Input */}
                <Text style={styles.formSectionLabel}>Monthly Investment Amount</Text>
                <View style={styles.amountInputRow}>
                  <Text style={styles.currencySymbol}>₹</Text>
                  <TextInput
                    style={styles.amountInput}
                    value={sipAmount}
                    onChangeText={handleAmountChange}
                    keyboardType="numeric"
                    placeholder="1000"
                  />
                </View>

                {/* Amount Presets */}
                <View style={styles.presetChipsRow}>
                  {SIP_PRESETS.map((amt) => {
                    const isSelected = parsedSip === amt;
                    return (
                      <TouchableOpacity
                        key={amt}
                        style={[styles.presetChip, isSelected && styles.presetChipActive]}
                        onPress={() => handleAmountChange(amt.toString())}
                      >
                        <Text
                          style={[
                            styles.presetChipText,
                            isSelected && styles.presetChipTextActive,
                          ]}
                        >
                          ₹{amt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Debit Date Selector */}
                <Text style={[styles.formSectionLabel, { marginTop: spacing.md }]}>
                  Monthly Debit Date
                </Text>
                <View style={styles.datesRow}>
                  {SIP_DATES.map((d) => {
                    const isDateSelected = selectedDate === d;
                    return (
                      <TouchableOpacity
                        key={d}
                        style={[styles.dateCircle, isDateSelected && styles.dateCircleActive]}
                        onPress={() => handleDateChange(d)}
                      >
                        <Text
                          style={[
                            styles.dateCircleText,
                            isDateSelected && styles.dateCircleTextActive,
                          ]}
                        >
                          {d}th
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3-Year Projection Card */}
                <View style={styles.projectionCard}>
                  <View style={styles.projectionHead}>
                    <Text style={styles.projectionEmoji}>📈</Text>
                    <Text style={styles.projectionTitle}>3-Year Wealth Estimate</Text>
                  </View>
                  <View style={styles.projectionRow}>
                    <View>
                      <Text style={styles.projectionSubLabel}>Total Invested</Text>
                      <Text style={styles.projectionInvested}>
                        ₹{totalInvested.toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.projectionSubLabel}>Estimated Value (+{fund.returns3Y}%)</Text>
                      <Text style={styles.projectionEstimated}>
                        ₹{estimatedFutureValue.toLocaleString('en-IN')}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Confirm Button */}
                <TouchableOpacity
                  style={styles.confirmSipBtn}
                  onPress={handleConfirmSip}
                  activeOpacity={0.85}
                >
                  <Text style={styles.confirmSipText}>
                    Confirm SIP of ₹{parsedSip}/month 🚀
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  loadingText: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  backBtnText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  navTitleWrap: {
    flex: 1,
  },
  navTitle: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  navSubTitle: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  starBtnActive: {
    backgroundColor: '#FEF9C3',
    borderColor: '#FDE047',
  },
  iconEmoji: {
    fontSize: 16,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 110,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.xs,
  },
  categoryPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  planPill: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  planPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  riskPill: {
    backgroundColor: colors.white,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  riskPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  titleSection: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  fundMainTitle: {
    ...typography.h1,
    fontSize: 22,
    color: colors.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  starWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  starEmoji: {
    fontSize: 10,
  },
  starRatingVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#854D0E',
  },
  ratingSource: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  sectionBlock: {
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    ...typography.h3,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    width: '48.5%',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textMuted,
  },
  statValue: {
    ...typography.h3,
    fontSize: 15,
    color: colors.text,
    marginTop: 3,
  },
  statValueHighlight: {
    ...typography.h3,
    fontSize: 16,
    color: colors.purple,
    fontWeight: '800',
    marginTop: 3,
  },
  statSubText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  jargonBox: {
    backgroundColor: colors.yellowCard,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.yellowBorder,
  },
  jargonText: {
    ...typography.body,
    fontSize: 12,
    color: '#854D0E',
    lineHeight: 18,
  },
  jargonCloseBtn: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  jargonCloseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#854D0E',
  },
  managerCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: 12,
  },
  managerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  managerAvatarText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  managerDetails: {
    flex: 1,
  },
  managerTitleLabel: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textMuted,
  },
  managerName: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
    marginTop: 1,
  },
  managerEdu: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  managerStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  managerMeta: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.purpleDeep,
  },
  footerActionsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },
  footerBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lumpsumBtn: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
  },
  lumpsumBtnText: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  sipBtn: {
    flex: 1.6,
    backgroundColor: colors.purple,
    flexDirection: 'row',
    gap: 6,
  },
  sipBtnEmoji: {
    fontSize: 14,
    color: colors.amberBright,
  },
  sipBtnText: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h2,
    fontSize: 18,
    color: colors.text,
  },
  modalFundSub: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    maxWidth: 240,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textMuted,
    padding: 4,
  },
  formSectionLabel: {
    ...typography.overline,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: spacing.xs,
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.purple,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F8F7FF',
    height: 52,
  },
  currencySymbol: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    padding: 0,
  },
  presetChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: spacing.sm,
  },
  presetChip: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
  },
  presetChipActive: {
    backgroundColor: colors.navy,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  presetChipTextActive: {
    color: colors.white,
  },
  datesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  dateCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateCircleActive: {
    backgroundColor: colors.purple,
  },
  dateCircleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  dateCircleTextActive: {
    color: colors.white,
  },
  projectionCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  projectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  projectionEmoji: {
    fontSize: 14,
  },
  projectionTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: '#166534',
    fontSize: 12,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  projectionSubLabel: {
    fontSize: 10,
    color: '#166534',
  },
  projectionInvested: {
    ...typography.bodyBold,
    fontSize: 13,
    color: '#14532D',
    marginTop: 2,
  },
  projectionEstimated: {
    ...typography.h3,
    fontSize: 16,
    color: '#15803D',
    fontWeight: '800',
    marginTop: 2,
  },
  confirmSipBtn: {
    backgroundColor: colors.purple,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    shadowColor: colors.purple,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  confirmSipText: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.white,
  },
  sipSuccessBox: {
    paddingVertical: 36,
    alignItems: 'center',
  },
  successIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  successTitle: {
    ...typography.h2,
    fontSize: 18,
    color: colors.green,
    marginBottom: 6,
  },
  successSub: {
    ...typography.caption,
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
