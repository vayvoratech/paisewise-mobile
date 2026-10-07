import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { RootState, AppDispatch } from '../../../app/store';
import { setSelectedFinancialYear } from '../slices/mfPortfolioSlice';
import { TaxPdfPreviewModal } from '../components/TaxPdfPreviewModal';
import { TaxSummary } from '../mf.types';
import mixpanel from '@core/mixpanel';

const FINANCIAL_YEARS = ['2024-25', '2023-24', '2022-23'];

export default function TaxReportScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const selectedFY = useSelector((state: RootState) => state.mfPortfolio.selectedFinancialYear);
  const taxRecords = useSelector((state: RootState) => state.mfPortfolio.taxRecords);
  const holdings = useSelector((state: RootState) => state.mfPortfolio.holdings);

  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);

  // Filter records by selected Financial Year
  const currentFYRecords = taxRecords.filter((r) => r.financialYear === selectedFY);

  // Compute Tax Summary based on Budget 2024 & Indian Income Tax rules
  const equityLtcgRecords = currentFYRecords.filter(
    (r) => r.fundType === 'EQUITY' && r.term === 'LTCG'
  );
  const equityStcgRecords = currentFYRecords.filter(
    (r) => r.fundType === 'EQUITY' && r.term === 'STCG'
  );
  const debtRecords = currentFYRecords.filter((r) => r.fundType === 'DEBT');

  const equityLtcgGross = equityLtcgRecords.reduce((sum, r) => sum + Math.max(0, r.gainOrLoss), 0);
  const equityStcgGross = equityStcgRecords.reduce((sum, r) => sum + Math.max(0, r.gainOrLoss), 0);
  const debtGainsGross = debtRecords.reduce((sum, r) => sum + Math.max(0, r.gainOrLoss), 0);

  // Budget 2024 LTCG Exemption: ₹1.25 Lakh per financial year
  const LTCG_EXEMPTION_LIMIT = selectedFY === '2024-25' ? 125000 : 100000;
  const equityLtcgExemption = Math.min(equityLtcgGross, LTCG_EXEMPTION_LIMIT);
  const equityLtcgTaxable = Math.max(0, equityLtcgGross - equityLtcgExemption);
  const ltcgRate = selectedFY === '2024-25' ? 0.125 : 0.10;
  const equityLtcgTax = Math.round(equityLtcgTaxable * ltcgRate);

  // STCG Rate: 20% in Budget 2024, 15% previously
  const stcgRate = selectedFY === '2024-25' ? 0.20 : 0.15;
  const equityStcgTax = Math.round(equityStcgGross * stcgRate);

  // Debt Funds post April 2023: Taxed at slab rate (assume ~30%)
  const debtGainsTax = Math.round(debtGainsGross * 0.30);

  const totalRealizedGains = equityLtcgGross + equityStcgGross + debtGainsGross;
  const totalEstimatedTax = equityLtcgTax + equityStcgTax + debtGainsTax;

  // Unrealized portfolio gains
  const unrealizedGains = holdings.reduce((sum, h) => sum + Math.max(0, h.totalReturns), 0);

  // ELSS 80C Investment
  const elssHolding = holdings.find((h) => h.category === 'ELSS Tax Saver');
  const elssInvested80C = elssHolding ? elssHolding.investedAmount : 0;
  const elssTaxSaved = Math.round(elssInvested80C * 0.30); // 30% slab saving

  const summary: TaxSummary = {
    financialYear: selectedFY,
    totalRealizedGains,
    equityLtcgGross,
    equityLtcgExemption,
    equityLtcgTaxable,
    equityLtcgTax,
    equityStcgGross,
    equityStcgTax,
    debtGainsGross,
    debtGainsTax,
    totalEstimatedTax,
    unrealizedGains,
    elssInvested80C,
    elssTaxSaved,
  };

  useEffect(() => {
    // Track pnl/tax report viewed per repo analytics spec
    mixpanel.track('pnl_report_viewed', {
      report_period: `FY_${selectedFY.replace('-', '_')}`,
      total_realized_pnl: totalRealizedGains,
      total_unrealized_pnl: unrealizedGains,
    });
  }, [selectedFY, totalRealizedGains, unrealizedGains]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mutual Funds Tax Report</Text>
        <TouchableOpacity
          onPress={() => setIsPdfModalVisible(true)}
          style={styles.pdfDownloadBtn}
        >
          <Text style={styles.pdfDownloadText}>📥 PDF</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* FY Selector Pills */}
        <View style={styles.fySelectorRow}>
          <Text style={styles.fyLabel}>Financial Year:</Text>
          <View style={styles.fyChips}>
            {FINANCIAL_YEARS.map((fy) => {
              const active = selectedFY === fy;
              return (
                <TouchableOpacity
                  key={fy}
                  onPress={() => dispatch(setSelectedFinancialYear(fy))}
                  style={[styles.fyChip, active && styles.fyChipActive]}
                >
                  <Text style={[styles.fyChipText, active && styles.fyChipTextActive]}>
                    FY {fy}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Hero Tax Liability Card */}
        <Card style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroLabel}>Total Estimated Tax Payable</Text>
              <Text style={styles.heroValue}>{formatINR(totalEstimatedTax)}</Text>
            </View>
            <View style={styles.fyBadge}>
              <Text style={styles.fyBadgeText}>FY {selectedFY}</Text>
            </View>
          </View>

          <View style={styles.heroDivider} />

          <View style={styles.heroStatsRow}>
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>Realized Gains</Text>
              <Text style={styles.heroStatVal}>{formatINR(totalRealizedGains)}</Text>
            </View>
            <View style={styles.subStatDivider} />
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>Unrealized Gains</Text>
              <Text style={[styles.heroStatVal, { color: colors.amberBright }]}>
                {formatINR(unrealizedGains)}
              </Text>
            </View>
            <View style={styles.subStatDivider} />
            <View style={styles.heroStatCol}>
              <Text style={styles.heroStatLabel}>Redemptions</Text>
              <Text style={styles.heroStatVal}>{currentFYRecords.length} Trades</Text>
            </View>
          </View>
        </Card>

        {/* Indian Tax Law Breakdown (Budget 2024) */}
        <Text style={styles.sectionHeading}>TAX ESTIMATES BREAKDOWN (BUDGET 2024)</Text>

        {/* 1. Equity LTCG */}
        <Card style={styles.taxCard}>
          <View style={styles.taxCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.taxCardTitle}>Equity Long Term Capital Gains (LTCG)</Text>
              <Text style={styles.taxCardSub}>Holding period {'>'} 12 months · Section 112A</Text>
            </View>
            <View style={styles.rateBadge}>
              <Text style={styles.rateBadgeText}>12.5% Tax</Text>
            </View>
          </View>

          <View style={styles.taxNumbersGrid}>
            <View style={styles.taxGridItem}>
              <Text style={styles.taxGridLabel}>Gross LTCG</Text>
              <Text style={styles.taxGridVal}>{formatINR(equityLtcgGross)}</Text>
            </View>
            <View style={styles.taxGridItem}>
              <Text style={styles.taxGridLabel}>Exempt Limit</Text>
              <Text style={[styles.taxGridVal, { color: colors.green }]}>
                {formatINR(equityLtcgExemption)}
              </Text>
            </View>
            <View style={styles.taxGridItem}>
              <Text style={styles.taxGridLabel}>Taxable LTCG</Text>
              <Text style={styles.taxGridVal}>{formatINR(equityLtcgTaxable)}</Text>
            </View>
            <View style={[styles.taxGridItem, { alignItems: 'flex-end' }]}>
              <Text style={styles.taxGridLabel}>Tax Liability</Text>
              <Text style={[styles.taxGridVal, { color: colors.purple, fontWeight: '800' }]}>
                {formatINR(equityLtcgTax)}
              </Text>
            </View>
          </View>

          <View style={styles.taxNote}>
            <Text style={styles.taxNoteText}>
              💡 First ₹1.25 Lakhs of long-term capital gains in a financial year are 100% tax-free under Section 112A.
            </Text>
          </View>
        </Card>

        {/* 2. Equity STCG */}
        <Card style={styles.taxCard}>
          <View style={styles.taxCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.taxCardTitle}>Equity Short Term Capital Gains (STCG)</Text>
              <Text style={styles.taxCardSub}>Holding period ≤ 12 months · Section 111A</Text>
            </View>
            <View style={[styles.rateBadge, { backgroundColor: '#FEF3C7' }]}>
              <Text style={[styles.rateBadgeText, { color: '#B45309' }]}>20% Tax</Text>
            </View>
          </View>

          <View style={styles.taxNumbersGrid}>
            <View style={styles.taxGridItem}>
              <Text style={styles.taxGridLabel}>Gross STCG</Text>
              <Text style={styles.taxGridVal}>{formatINR(equityStcgGross)}</Text>
            </View>
            <View style={styles.taxGridItem}>
              <Text style={styles.taxGridLabel}>Exemption</Text>
              <Text style={styles.taxGridVal}>₹0 (No Exemption)</Text>
            </View>
            <View style={[styles.taxGridItem, { alignItems: 'flex-end', flex: 2 }]}>
              <Text style={styles.taxGridLabel}>Tax at 20%</Text>
              <Text style={[styles.taxGridVal, { color: colors.purple, fontWeight: '800' }]}>
                {formatINR(equityStcgTax)}
              </Text>
            </View>
          </View>
        </Card>

        {/* 3. Debt Funds Section 50AA */}
        <Card style={styles.taxCard}>
          <View style={styles.taxCardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.taxCardTitle}>Debt & Liquid Mutual Funds</Text>
              <Text style={styles.taxCardSub}>Section 50AA · Purchases after 1-Apr-2023</Text>
            </View>
            <View style={[styles.rateBadge, { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.rateBadgeText, { color: colors.text }]}>Slab Rate</Text>
            </View>
          </View>

          <View style={styles.taxNumbersGrid}>
            <View style={styles.taxGridItem}>
              <Text style={styles.taxGridLabel}>Realized Gain</Text>
              <Text style={styles.taxGridVal}>{formatINR(debtGainsGross)}</Text>
            </View>
            <View style={[styles.taxGridItem, { alignItems: 'flex-end', flex: 2 }]}>
              <Text style={styles.taxGridLabel}>Est. Tax @ 30% Slab</Text>
              <Text style={[styles.taxGridVal, { color: colors.purple, fontWeight: '800' }]}>
                {formatINR(debtGainsTax)}
              </Text>
            </View>
          </View>
        </Card>

        {/* 4. Section 80C ELSS Benefits */}
        <Card style={styles.elssBannerCard}>
          <View style={styles.elssBannerRow}>
            <Text style={{ fontSize: 28 }}>🛡️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.elssBannerTitle}>Section 80C ELSS Tax Exemption</Text>
              <Text style={styles.elssBannerDesc}>
                Invested: {formatINR(elssInvested80C)} · Tax Saved: {formatINR(elssTaxSaved)} (at 30% slab)
              </Text>
            </View>
          </View>
        </Card>

        {/* Realized Trades Audit Ledger */}
        <Text style={styles.sectionHeading}>
          REALIZED TRANSACTIONS AUDIT LEDGER ({currentFYRecords.length})
        </Text>

        <View style={styles.recordsList}>
          {currentFYRecords.map((rec) => (
            <Card key={rec.id} style={styles.auditCard}>
              <View style={styles.auditCardTopRow}>
                <Text style={styles.auditFundName} numberOfLines={1}>
                  {rec.fundName}
                </Text>
                <View
                  style={[
                    styles.termChip,
                    rec.term === 'LTCG' ? styles.termChipLtcg : styles.termChipStcg,
                  ]}
                >
                  <Text
                    style={[
                      styles.termChipText,
                      rec.term === 'LTCG' ? styles.termTextLtcg : styles.termTextStcg,
                    ]}
                  >
                    {rec.term} · {rec.holdingDays} Days
                  </Text>
                </View>
              </View>

              <View style={styles.auditDetailsRow}>
                <Text style={styles.auditDateText}>
                  Bought: {rec.buyDate} → Sold: {rec.sellDate}
                </Text>
                <Text style={styles.auditUnitsText}>{rec.units} units</Text>
              </View>

              <View style={styles.auditFinancialsRow}>
                <View>
                  <Text style={styles.auditFinLabel}>Buy Value / Sell Value</Text>
                  <Text style={styles.auditFinVal}>
                    {formatINR(rec.buyValue)} → {formatINR(rec.sellValue)}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.auditFinLabel}>
                    Gain ({rec.applicableRatePct}% Tax)
                  </Text>
                  <Text
                    style={[
                      styles.auditGainVal,
                      { color: rec.gainOrLoss >= 0 ? colors.green : colors.pink },
                    ]}
                  >
                    {rec.gainOrLoss >= 0 ? '+' : ''}{formatINR(rec.gainOrLoss)}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Download PDF Statement CTA */}
        <View style={styles.downloadCtaBox}>
          <Button
            label="Download Capital Gains Statement (PDF)"
            onPress={() => setIsPdfModalVisible(true)}
            variant="gradientPurple"
          />
        </View>
      </ScrollView>

      {/* PDF Download / Statement Preview Modal */}
      <TaxPdfPreviewModal
        visible={isPdfModalVisible}
        summary={summary}
        records={currentFYRecords}
        onClose={() => setIsPdfModalVisible(false)}
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
  pdfDownloadBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    backgroundColor: colors.purple,
  },
  pdfDownloadText: {
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
  fySelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fyLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  fyChips: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fyChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
  },
  fyChipActive: {
    backgroundColor: colors.purple,
  },
  fyChipText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  fyChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  heroCard: {
    padding: spacing.xl,
    backgroundColor: '#1E1B4B',
    borderRadius: radius.xl,
    borderWidth: 0,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    ...typography.overline,
    color: 'rgba(255,255,255,0.7)',
  },
  heroValue: {
    ...typography.hero,
    fontSize: 34,
    color: colors.amberBright,
    fontWeight: '900',
    marginTop: 2,
  },
  fyBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  fyBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginVertical: spacing.md,
  },
  heroStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  heroStatCol: {
    alignItems: 'center',
  },
  heroStatLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.65)',
  },
  heroStatVal: {
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
  sectionHeading: {
    ...typography.overline,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  taxCard: {
    padding: spacing.lg,
    gap: spacing.sm,
  },
  taxCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taxCardTitle: {
    ...typography.h3,
    fontSize: 14,
    color: colors.text,
  },
  taxCardSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  rateBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  rateBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  taxNumbersGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  taxGridItem: {
    flex: 1,
  },
  taxGridLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  taxGridVal: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
    marginTop: 2,
  },
  taxNote: {
    backgroundColor: colors.yellowCard,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.yellowBorder,
  },
  taxNoteText: {
    fontSize: 10,
    color: '#92722A',
    lineHeight: 14,
  },
  elssBannerCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: spacing.md,
  },
  elssBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  elssBannerTitle: {
    ...typography.bodyBold,
    fontSize: 13,
    color: '#1E40AF',
  },
  elssBannerDesc: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
  recordsList: {
    gap: spacing.sm,
  },
  auditCard: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  auditCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  auditFundName: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
    maxWidth: '70%',
  },
  termChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  termChipLtcg: {
    backgroundColor: '#DCFCE7',
  },
  termChipStcg: {
    backgroundColor: '#FEF3C7',
  },
  termChipText: {
    fontSize: 10,
    fontWeight: '700',
  },
  termTextLtcg: {
    color: '#15803D',
  },
  termTextStcg: {
    color: '#B45309',
  },
  auditDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  auditDateText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  auditUnitsText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  auditFinancialsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceMuted,
  },
  auditFinLabel: {
    fontSize: 9,
    color: colors.textMuted,
  },
  auditFinVal: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  auditGainVal: {
    ...typography.bodyBold,
    fontSize: 12,
  },
  downloadCtaBox: {
    marginTop: spacing.md,
  },
});
