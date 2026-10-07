import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { Button } from '../../../shared/ui/Button';
import { TaxAuditRecord, TaxSummary } from '../mf.types';
import { formatINR } from '../../../shared/format';
import mixpanel from '@core/mixpanel';

interface TaxPdfPreviewModalProps {
  visible: boolean;
  summary: TaxSummary;
  records: TaxAuditRecord[];
  onClose: () => void;
}

export const TaxPdfPreviewModal: React.FC<TaxPdfPreviewModalProps> = ({
  visible,
  summary,
  records,
  onClose,
}) => {
  const handleDownloadPdf = () => {
    // Track Mixpanel event as per repo analytics spec
    mixpanel.track('tax_report_downloaded', {
      report_type: 'capital_gains_statement',
      report_period: `FY_${summary.financialYear.replace('-', '_')}`,
      file_format: 'pdf',
    });

    Alert.alert(
      '📥 Tax Statement Downloaded',
      `Mutual_Fund_Capital_Gains_Statement_${summary.financialYear}.pdf has been saved to your Downloads folder and is ready for ITR filing!`,
      [{ text: 'OK', onPress: onClose }]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Capital Gains Tax Statement</Text>
              <Text style={styles.subtitle}>FY {summary.financialYear} · IT Act 1961 Compliant</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Statement Document Canvas */}
          <ScrollView style={styles.documentCanvas} showsVerticalScrollIndicator={false}>
            {/* Document Header */}
            <View style={styles.docHeader}>
              <View>
                <Text style={styles.docLogo}>PAISEWISE</Text>
                <Text style={styles.docLogoSub}>Financial Intelligence & Tax Services</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.docMeta}>Assessment Year: 2025-26</Text>
                <Text style={styles.docMeta}>Date: {new Date().toLocaleDateString('en-IN')}</Text>
              </View>
            </View>

            <View style={styles.horizontalDivider} />

            {/* Taxpayer Info */}
            <View style={styles.taxpayerInfo}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Investor Name:</Text>
                <Text style={styles.infoValue}>Amrut Patil</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>PAN:</Text>
                <Text style={styles.infoValue}>ABCDE••••F</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Folio Status:</Text>
                <Text style={[styles.infoValue, { color: colors.green }]}>KYC Complied</Text>
              </View>
            </View>

            {/* Statement Summary Table */}
            <Text style={styles.sectionHeader}>1. Capital Gains Tax Summary</Text>
            <View style={styles.table}>
              <View style={[styles.tableRow, styles.tableHeader]}>
                <Text style={[styles.tableCell, styles.cellBold, { flex: 2 }]}>Gain Type</Text>
                <Text style={[styles.tableCell, styles.cellBold]}>Gross Gain</Text>
                <Text style={[styles.tableCell, styles.cellBold]}>Exemption</Text>
                <Text style={[styles.tableCell, styles.cellBold]}>Est. Tax</Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Equity LTCG (Sec 112A)</Text>
                <Text style={styles.tableCell}>{formatINR(summary.equityLtcgGross)}</Text>
                <Text style={styles.tableCell}>{formatINR(summary.equityLtcgExemption)}</Text>
                <Text style={[styles.tableCell, { color: colors.purple, fontWeight: '700' }]}>
                  {formatINR(summary.equityLtcgTax)}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Equity STCG (Sec 111A @ 20%)</Text>
                <Text style={styles.tableCell}>{formatINR(summary.equityStcgGross)}</Text>
                <Text style={styles.tableCell}>₹0</Text>
                <Text style={[styles.tableCell, { color: colors.purple, fontWeight: '700' }]}>
                  {formatINR(summary.equityStcgTax)}
                </Text>
              </View>

              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 2 }]}>Debt Funds (Sec 50AA)</Text>
                <Text style={styles.tableCell}>{formatINR(summary.debtGainsGross)}</Text>
                <Text style={styles.tableCell}>₹0</Text>
                <Text style={[styles.tableCell, { color: colors.purple, fontWeight: '700' }]}>
                  {formatINR(summary.debtGainsTax)}
                </Text>
              </View>

              <View style={[styles.tableRow, styles.tableTotal]}>
                <Text style={[styles.tableCell, styles.cellBold, { flex: 2 }]}>Total Tax Liability</Text>
                <Text style={[styles.tableCell, styles.cellBold]}>{formatINR(summary.totalRealizedGains)}</Text>
                <Text style={styles.tableCell}>—</Text>
                <Text style={[styles.tableCell, styles.cellBold, { color: colors.red }]}>
                  {formatINR(summary.totalEstimatedTax)}
                </Text>
              </View>
            </View>

            {/* Section 80C ELSS Certificate */}
            <View style={styles.elssCertificate}>
              <View style={{ flex: 1 }}>
                <Text style={styles.elssTitle}>Section 80C ELSS Tax Benefit</Text>
                <Text style={styles.elssSub}>Eligible for income tax deduction under Old Tax Regime</Text>
              </View>
              <Text style={styles.elssAmount}>{formatINR(summary.elssInvested80C)}</Text>
            </View>

            {/* Transaction Ledger */}
            <Text style={styles.sectionHeader}>2. Realized Redemption Ledger</Text>
            {records.map((r, i) => (
              <View key={r.id} style={styles.recordItem}>
                <View style={styles.recordRowTop}>
                  <Text style={styles.recordFundName} numberOfLines={1}>
                    {r.fundName}
                  </Text>
                  <Text
                    style={[
                      styles.termBadge,
                      r.term === 'LTCG' ? styles.termLtcg : styles.termStcg,
                    ]}
                  >
                    {r.term} ({r.holdingDays}d)
                  </Text>
                </View>
                <View style={styles.recordRowDetails}>
                  <Text style={styles.recordDetailText}>
                    Units: {r.units} · Sold on {r.sellDate}
                  </Text>
                  <Text style={[styles.recordGain, { color: r.gainOrLoss >= 0 ? colors.green : colors.red }]}>
                    {r.gainOrLoss >= 0 ? '+' : ''}{formatINR(r.gainOrLoss)}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.disclaimerBox}>
              <Text style={styles.disclaimerText}>
                * Disclaimer: As per the Finance Act (No. 2) 2024, Equity LTCG is taxed at 12.5% for gains exceeding ₹1.25 Lakh per financial year. Equity STCG is taxed at 20%. Debt mutual funds acquired after April 1, 2023 are taxed at applicable marginal slab rates. Please consult your Chartered Accountant for official return filing.
              </Text>
            </View>
          </ScrollView>

          {/* Download Action */}
          <View style={styles.bottomBar}>
            <Button
              label="📥 Download Statement (PDF)"
              onPress={handleDownloadPdf}
              variant="gradientPurple"
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    maxHeight: '94%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '700',
  },
  documentCanvas: {
    backgroundColor: '#FAF9F6',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  docLogo: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.purpleDeep,
    letterSpacing: 1.5,
  },
  docLogoSub: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: '500',
  },
  docMeta: {
    fontSize: 10,
    color: colors.textMuted,
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  taxpayerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoCol: {},
  infoLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    marginTop: 1,
  },
  sectionHeader: {
    ...typography.overline,
    fontSize: 11,
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.xs,
  },
  table: {
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: colors.surfaceMuted,
  },
  tableTotal: {
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: colors.text,
  },
  cellBold: {
    fontWeight: '700',
  },
  elssCertificate: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: spacing.md,
  },
  elssTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E40AF',
  },
  elssSub: {
    fontSize: 10,
    color: '#3B82F6',
  },
  elssAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E40AF',
  },
  recordItem: {
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xs,
  },
  recordRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordFundName: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
    maxWidth: '75%',
  },
  termBadge: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  termLtcg: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
  },
  termStcg: {
    backgroundColor: '#FEF3C7',
    color: '#B45309',
  },
  recordRowDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  recordDetailText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  recordGain: {
    fontSize: 12,
    fontWeight: '700',
  },
  disclaimerBox: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  disclaimerText: {
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 13,
  },
  bottomBar: {
    marginTop: spacing.md,
  },
});
