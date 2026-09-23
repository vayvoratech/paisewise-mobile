import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { Button } from '../../../shared/ui/Button';

interface UpiMandateSheetProps {
  visible: boolean;
  sipAmount: number;
  fundName: string;
  debitDay: number;
  onClose: () => void;
  onSuccess: (mandateDetails: {
    upiApp: string;
    upiId: string;
    bankName: string;
    accountLast4: string;
    mandateUrn: string;
  }) => void;
}

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', icon: '🟢', vpaSuffix: '@okhdfcbank' },
  { id: 'phonepe', name: 'PhonePe', icon: '🟣', vpaSuffix: '@ybl' },
  { id: 'paytm', name: 'Paytm UPI', icon: '🔵', vpaSuffix: '@paytm' },
  { id: 'bhim', name: 'BHIM UPI', icon: '🇮🇳', vpaSuffix: '@upi' },
];

const BANK_ACCOUNTS = [
  { id: 'hdfc', name: 'HDFC Bank', last4: '4821', type: 'Savings A/c' },
  { id: 'icici', name: 'ICICI Bank', last4: '9924', type: 'Salary A/c' },
];

export const UpiMandateSheet: React.FC<UpiMandateSheetProps> = ({
  visible,
  sipAmount,
  fundName,
  debitDay,
  onClose,
  onSuccess,
}) => {
  const [selectedApp, setSelectedApp] = useState(UPI_APPS[0].id);
  const [selectedBank, setSelectedBank] = useState(BANK_ACCOUNTS[0].id);
  const [customUpiId, setCustomUpiId] = useState('investor@okhdfcbank');
  const [status, setStatus] = useState<'idle' | 'authorizing' | 'success'>('idle');

  const handleAuthorize = () => {
    setStatus('authorizing');
    setTimeout(() => {
      setStatus('success');
      setTimeout(() => {
        const app = UPI_APPS.find((a) => a.id === selectedApp) || UPI_APPS[0];
        const bank = BANK_ACCOUNTS.find((b) => b.id === selectedBank) || BANK_ACCOUNTS[0];
        const mandateUrn = `UMRN/${bank.name.slice(0, 4).toUpperCase()}/${new Date().getFullYear()}/${Math.floor(
          1000000 + Math.random() * 9000000
        )}`;

        onSuccess({
          upiApp: app.name,
          upiId: customUpiId || `user${app.vpaSuffix}`,
          bankName: bank.name,
          accountLast4: bank.last4,
          mandateUrn,
        });
        setStatus('idle');
      }, 1200);
    }, 1800);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.sheetTitle}>UPI Auto-Debit e-Mandate</Text>
              <Text style={styles.sheetSubtitle}>Powered by NPCI & RBI Framework</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {status === 'authorizing' ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.purple} />
              <Text style={styles.loadingTitle}>Connecting to NPCI Gateway...</Text>
              <Text style={styles.loadingDesc}>
                Authorizing auto-debit of ₹{sipAmount.toLocaleString('en-IN')}/mo on the {debitDay}th of each month.
              </Text>
              <View style={styles.securityBadge}>
                <Text style={styles.securityText}>🔒 256-bit Encrypted Banking Channel</Text>
              </View>
            </View>
          ) : status === 'success' ? (
            <View style={styles.successContainer}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successTitle}>Mandate Approved!</Text>
              <Text style={styles.successDesc}>
                Your UPI Auto-Pay mandate has been authorized. Monthly installments will automatically debit without manual intervention.
              </Text>
            </View>
          ) : (
            <View style={styles.content}>
              {/* Fund Summary Chip */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Fund:</Text>
                  <Text style={styles.summaryValue} numberOfLines={1}>
                    {fundName}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>SIP Amount:</Text>
                  <Text style={[styles.summaryValue, { color: colors.purple, fontWeight: '800' }]}>
                    ₹{sipAmount.toLocaleString('en-IN')}/month
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Debit Schedule:</Text>
                  <Text style={styles.summaryValue}>{debitDay}th of every month</Text>
                </View>
              </View>

              {/* UPI App Selection */}
              <Text style={styles.sectionHeading}>Select UPI App for Auto-Pay</Text>
              <View style={styles.appsRow}>
                {UPI_APPS.map((app) => {
                  const isSelected = selectedApp === app.id;
                  return (
                    <TouchableOpacity
                      key={app.id}
                      activeOpacity={0.8}
                      onPress={() => {
                        setSelectedApp(app.id);
                        setCustomUpiId(`investor${app.vpaSuffix}`);
                      }}
                      style={[styles.appCard, isSelected && styles.appCardSelected]}
                    >
                      <Text style={styles.appIcon}>{app.icon}</Text>
                      <Text style={[styles.appName, isSelected && styles.appNameSelected]}>
                        {app.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* UPI ID input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>UPI Virtual Payment Address (VPA)</Text>
                <TextInput
                  value={customUpiId}
                  onChangeText={setCustomUpiId}
                  placeholder="yourname@bank"
                  style={styles.textInput}
                  autoCapitalize="none"
                />
              </View>

              {/* Bank Account Selection */}
              <Text style={styles.sectionHeading}>Debiting Bank Account</Text>
              <View style={styles.bankList}>
                {BANK_ACCOUNTS.map((bank) => {
                  const isSelected = selectedBank === bank.id;
                  return (
                    <TouchableOpacity
                      key={bank.id}
                      activeOpacity={0.8}
                      onPress={() => setSelectedBank(bank.id)}
                      style={[styles.bankCard, isSelected && styles.bankCardSelected]}
                    >
                      <View style={styles.bankRadio}>
                        <View style={[styles.radioInner, isSelected && styles.radioInnerActive]} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bankName}>
                          {bank.name} •••• {bank.last4}
                        </Text>
                        <Text style={styles.bankType}>{bank.type}</Text>
                      </View>
                      <Text style={styles.verifiedTag}>✓ Verified</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* NPCI Regulatory Note */}
              <View style={styles.mandateNotice}>
                <Text style={styles.noticeIcon}>ℹ️</Text>
                <Text style={styles.noticeText}>
                  Max mandate authorization limit is ₹15,000 as per RBI auto-debit circular. You will receive an SMS reminder 24 hours prior to each debit. Can be cancelled anytime with 1 tap.
                </Text>
              </View>

              {/* Authorize Button */}
              <Button
                label={`Authorize Auto-Pay (₹${sipAmount.toLocaleString('en-IN')})`}
                onPress={handleAuthorize}
                variant="gradientPurple"
                style={{ marginTop: spacing.md }}
              />
            </View>
          )}
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sheetSubtitle: {
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
  content: {
    gap: spacing.sm,
  },
  summaryCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  summaryValue: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
    maxWidth: '65%',
  },
  sectionHeading: {
    ...typography.overline,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  appsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'space-between',
  },
  appCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  appCardSelected: {
    borderColor: colors.purple,
    backgroundColor: '#F5F3FF',
  },
  appIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  appName: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  appNameSelected: {
    color: colors.purple,
    fontWeight: '700',
  },
  inputGroup: {
    marginVertical: spacing.xs,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.xs,
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
  bankList: {
    gap: spacing.xs,
  },
  bankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  bankCardSelected: {
    borderColor: colors.purple,
    backgroundColor: '#F5F3FF',
  },
  bankRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
  },
  radioInnerActive: {
    backgroundColor: colors.purple,
  },
  bankName: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  bankType: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  verifiedTag: {
    fontSize: 11,
    color: colors.green,
    fontWeight: '700',
  },
  mandateNotice: {
    flexDirection: 'row',
    backgroundColor: colors.yellowCard,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.yellowBorder,
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  noticeIcon: {
    fontSize: 14,
  },
  noticeText: {
    fontSize: 11,
    color: '#92722A',
    flex: 1,
    lineHeight: 16,
  },
  loadingContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingTitle: {
    ...typography.h3,
    color: colors.text,
    marginTop: spacing.sm,
  },
  loadingDesc: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  securityBadge: {
    marginTop: spacing.md,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  securityText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  successContainer: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    gap: spacing.md,
  },
  successIcon: {
    fontSize: 52,
  },
  successTitle: {
    ...typography.h2,
    color: colors.green,
  },
  successDesc: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});
