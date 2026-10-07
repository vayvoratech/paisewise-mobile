import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { Button } from '../../../shared/ui/Button';
import { MFHolding } from '../mf.types';
import { formatINR } from '../../../shared/format';

interface RedeemModalProps {
  visible: boolean;
  holding: MFHolding | null;
  onClose: () => void;
  onConfirmRedeem: (holdingId: string, unitsToRedeem: number, bankAccount: string) => void;
}

export const RedeemModal: React.FC<RedeemModalProps> = ({
  visible,
  holding,
  onClose,
  onConfirmRedeem,
}) => {
  if (!holding) return null;

  const [mode, setMode] = useState<'units' | 'amount'>('units');
  const [unitsInput, setUnitsInput] = useState(holding.units.toString());
  const [amountInput, setAmountInput] = useState(holding.currentValue.toString());
  const [selectedBank, setSelectedBank] = useState('HDFC Bank •••• 4821');

  // Compute numeric units
  const currentUnits = mode === 'units' 
    ? parseFloat(unitsInput) || 0 
    : (parseFloat(amountInput) || 0) / holding.currentNav;

  const validUnits = Math.min(holding.units, Math.max(0, currentUnits));
  const grossAmount = Math.round(validUnits * holding.currentNav);

  // Check exit load
  const purchaseDate = new Date(holding.purchaseDate).getTime();
  const daysHeld = Math.max(1, Math.floor((Date.now() - purchaseDate) / (1000 * 60 * 60 * 24)));
  const exitLoadPct = (holding.category === 'Debt & Liquid' || daysHeld >= 365 || holding.category === 'ELSS Tax Saver') ? 0 : 1.0;
  const exitLoadDeduction = Math.round((grossAmount * exitLoadPct) / 100);
  const netPayout = grossAmount - exitLoadDeduction;

  const handleQuickPercent = (pct: number) => {
    const u = Number(((holding.units * pct) / 100).toFixed(3));
    const a = Math.round(u * holding.currentNav);
    setUnitsInput(u.toString());
    setAmountInput(a.toString());
  };

  const handleConfirm = () => {
    if (validUnits <= 0) {
      Alert.alert('Invalid Units', 'Please enter a valid amount or units to redeem.');
      return;
    }
    if (holding.category === 'ELSS Tax Saver' && daysHeld < 1095) {
      Alert.alert(
        'ELSS Lock-in Restriction',
        'ELSS mutual fund units have a mandatory 3-year statutory lock-in from the date of purchase under Section 80C.'
      );
      return;
    }

    onConfirmRedeem(holding.id, validUnits, selectedBank);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Redeem Mutual Fund Units</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {holding.fundName}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Holding balance chip */}
          <View style={styles.holdingBalanceCard}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Available Units</Text>
              <Text style={styles.balanceVal}>{holding.units.toFixed(3)}</Text>
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Latest NAV</Text>
              <Text style={styles.balanceVal}>{formatINR(holding.currentNav)}</Text>
            </View>
            <View style={styles.dividerVertical} />
            <View style={styles.balanceItem}>
              <Text style={styles.balanceLabel}>Total Value</Text>
              <Text style={[styles.balanceVal, { color: colors.purple }]}>
                {formatINR(holding.currentValue)}
              </Text>
            </View>
          </View>

          {/* Mode Toggle: Units vs Amount */}
          <View style={styles.toggleRow}>
            <TouchableOpacity
              onPress={() => setMode('units')}
              style={[styles.toggleBtn, mode === 'units' && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, mode === 'units' && styles.toggleTextActive]}>
                Redeem by Units
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMode('amount')}
              style={[styles.toggleBtn, mode === 'amount' && styles.toggleBtnActive]}
            >
              <Text style={[styles.toggleText, mode === 'amount' && styles.toggleTextActive]}>
                Redeem by Amount (₹)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Input field */}
          <View style={styles.inputBox}>
            <Text style={styles.inputPrefix}>{mode === 'units' ? 'Units' : '₹'}</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={mode === 'units' ? unitsInput : amountInput}
              onChangeText={(text) => {
                if (mode === 'units') {
                  setUnitsInput(text);
                  const u = parseFloat(text) || 0;
                  setAmountInput(Math.round(u * holding.currentNav).toString());
                } else {
                  setAmountInput(text);
                  const a = parseFloat(text) || 0;
                  setUnitsInput((a / holding.currentNav).toFixed(3));
                }
              }}
            />
          </View>

          {/* Quick percentage shortcuts */}
          <View style={styles.quickPercentRow}>
            {[
              { label: '25%', pct: 25 },
              { label: '50%', pct: 50 },
              { label: '75%', pct: 75 },
              { label: 'All Units (100%)', pct: 100 },
            ].map((q) => (
              <TouchableOpacity
                key={q.label}
                onPress={() => handleQuickPercent(q.pct)}
                style={styles.percentChip}
              >
                <Text style={styles.percentText}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payout calculation card */}
          <View style={styles.payoutCard}>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Units to Redeem:</Text>
              <Text style={styles.payoutVal}>{validUnits.toFixed(3)} units</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Gross Redemption Value:</Text>
              <Text style={styles.payoutVal}>{formatINR(grossAmount)}</Text>
            </View>
            <View style={styles.payoutRow}>
              <Text style={styles.payoutLabel}>Exit Load ({exitLoadPct}%):</Text>
              <Text style={[styles.payoutVal, { color: exitLoadDeduction > 0 ? colors.red : colors.green }]}>
                {exitLoadDeduction > 0 ? `-${formatINR(exitLoadDeduction)}` : '₹0 (Nil)'}
              </Text>
            </View>
            <View style={styles.payoutDivider} />
            <View style={styles.payoutRow}>
              <Text style={styles.payoutNetLabel}>Estimated Net Payout:</Text>
              <Text style={styles.payoutNetVal}>{formatINR(netPayout)}</Text>
            </View>
          </View>

          {/* Bank credit notice */}
          <View style={styles.bankNotice}>
            <Text style={styles.bankNoticeIcon}>🏦</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.bankNoticeTitle}>Credit To: {selectedBank}</Text>
              <Text style={styles.bankNoticeSub}>
                Settlement timeline: T+2 business days as per SEBI regulations.
              </Text>
            </View>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            <Button
              label={`Confirm Redemption (${formatINR(netPayout)})`}
              onPress={handleConfirm}
              variant="primary"
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
    maxHeight: '92%',
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    maxWidth: 260,
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
  holdingBalanceCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.sm,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  balanceVal: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },
  dividerVertical: {
    width: 1,
    height: 28,
    backgroundColor: colors.border,
  },
  toggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    padding: 3,
    marginTop: spacing.xs,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.xs + 2,
    alignItems: 'center',
    borderRadius: radius.full,
  },
  toggleBtnActive: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  toggleText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  toggleTextActive: {
    color: colors.purple,
    fontWeight: '700',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  inputPrefix: {
    ...typography.bodyBold,
    color: colors.textMuted,
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    ...typography.h2,
    color: colors.text,
    padding: 0,
  },
  quickPercentRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    justifyContent: 'space-between',
  },
  percentChip: {
    flex: 1,
    paddingVertical: spacing.xs + 1,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  percentText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  payoutCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payoutLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  payoutVal: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
  },
  payoutDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  payoutNetLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  payoutNetVal: {
    ...typography.h3,
    color: colors.green,
    fontWeight: '800',
  },
  bankNotice: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bankNoticeIcon: {
    fontSize: 20,
  },
  bankNoticeTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: '#0369A1',
  },
  bankNoticeSub: {
    fontSize: 10,
    color: '#0284C7',
    marginTop: 1,
  },
  actionsRow: {
    marginTop: spacing.xs,
  },
});
