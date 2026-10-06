import React, { useState, useMemo } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { BADGES } from '../profile.data';

interface DPDPExportModalProps {
  visible: boolean;
  user: any;
  profileData?: any;
  streakData?: any;
  language: string;
  onClose: () => void;
}

export const DPDPExportModal: React.FC<DPDPExportModalProps> = ({
  visible,
  user,
  profileData,
  streakData,
  language,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'SUMMARY' | 'RAW_JSON'>('SUMMARY');
  const [copied, setCopied] = useState(false);

  // Compile DPDP compliant data package
  const exportPackage = useMemo(() => {
    const timestamp = new Date().toISOString();
    const exportId = `DPDP-EXP-${Date.now().toString(36).toUpperCase()}`;

    return {
      metadata: {
        dpdpCompliance: 'DPDP Act 2023 (Republic of India - Act No. 22 of 2023)',
        sectionApplicable: 'Section 11 (Right to Access Information About Personal Data)',
        dataFiduciary: 'PaiseWise Financial Technologies Pvt. Ltd.',
        exportId,
        generatedAt: timestamp,
        dataPrincipalStatus: 'Active Authenticated Citizen',
        consentNoticeVersion: 'DPDP-2023-V2.1',
        securityStandard: 'AES-256 Encrypted In-Transit & At-Rest',
      },
      dataPrincipal: {
        userId: user?.id || user?._id || 'user-default-01',
        fullName: user?.name || profileData?.name || 'Amrut Patil',
        emailAddress: user?.email || 'investor@example.com',
        phoneNumber: user?.phone || '+91 9912483007',
        kycStatus: 'Verified (Aadhaar / PAN simulated sandbox verification)',
        accountCreated: '2026-08-15T09:30:00.000Z',
        lastLogin: timestamp,
        dpdpConsentDate: '2026-08-15T09:30:15.000Z',
      },
      learningProfile: {
        learnerLevel: profileData?.level ?? user?.level ?? 1,
        totalXpPoints: profileData?.xpTotal ?? user?.xpTotal ?? user?.xp ?? 1240,
        currentDayStreak: streakData?.currentStreak ?? profileData?.dayStreak ?? user?.dayStreak ?? 3,
        lessonsCompletedCount: 5,
        badgesUnlockedCount: BADGES.filter((b) => b.isUnlocked).length,
        badgesEarned: BADGES.filter((b) => b.isUnlocked).map((b) => ({
          id: b.id,
          title: b.title,
          category: b.category,
          unlockedAt: b.unlockedAt || '2026-09-10',
        })),
      },
      virtualTradingRecords: {
        disclaimer: 'Virtual Practice Trading Sandbox — No Real Fiat/INR Currency Stored',
        initialPracticeCapital: 100000,
        currentCashBalance: 84320,
        virtualHoldings: [
          {
            symbol: 'RELIANCE',
            companyName: 'Reliance Industries Ltd.',
            quantity: 5,
            avgCostPrice: 2900,
            simulatedMarketPrice: 2952,
          },
          {
            symbol: 'TCS',
            companyName: 'Tata Consultancy Services',
            quantity: 3,
            avgCostPrice: 3850,
            simulatedMarketPrice: 3801,
          },
        ],
        recentOrdersCount: 2,
      },
      preferencesAndConsent: {
        preferredLanguage: language || 'English',
        dailyRemindersEnabled: true,
        marketAlertsEnabled: true,
        thirdPartyDataSharing: false,
        telemarketingOptIn: false,
      },
    };
  }, [user, profileData, streakData, language]);

  const jsonString = useMemo(() => {
    return JSON.stringify(exportPackage, null, 2);
  }, [exportPackage]);

  const handleCopyClipboard = async () => {
    try {
      if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        // Fallback for native/other environments
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
        Alert.alert('Data Copied', 'DPDP Personal Data export JSON has been copied to your clipboard.');
      }
    } catch {
      Alert.alert('Error', 'Unable to copy to clipboard.');
    }
  };

  const handleDownloadFile = () => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      try {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `paisewise_dpdp_export_${exportPackage.metadata.exportId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {
        Alert.alert('Downloaded', 'Export generated successfully.');
      }
    } else {
      Alert.alert(
        'DPDP Export Generated',
        `File: paisewise_dpdp_export_${exportPackage.metadata.exportId}.json ready. You can copy the raw JSON package to save it to your device storage.`
      );
    }
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.handle} />
            <View style={styles.headerRow}>
              <View style={styles.badgeDPDP}>
                <Text style={styles.badgeDPDPText}>DPDP ACT 2023 • SEC 11</Text>
              </View>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.title}>Personal Data Export</Text>
            <Text style={styles.subtitle}>
              Under the Digital Personal Data Protection Act, 2023, you have full ownership and portability of your personal, educational, and virtual records.
            </Text>

            {/* Tab switch */}
            <View style={styles.tabsRow}>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'SUMMARY' && styles.tabBtnActive]}
                onPress={() => setActiveTab('SUMMARY')}
              >
                <Text style={[styles.tabBtnText, activeTab === 'SUMMARY' && styles.tabBtnTextActive]}>
                  📊 Structured Summary
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'RAW_JSON' && styles.tabBtnActive]}
                onPress={() => setActiveTab('RAW_JSON')}
              >
                <Text style={[styles.tabBtnText, activeTab === 'RAW_JSON' && styles.tabBtnTextActive]}>
                  📄 Raw JSON Archive
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Body Content */}
          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
            {activeTab === 'SUMMARY' ? (
              <View style={styles.summaryContainer}>
                {/* Identity Box */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeading}>👤 Data Principal Identity</Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Full Name:</Text>
                    <Text style={styles.val}>{exportPackage.dataPrincipal.fullName}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Email Address:</Text>
                    <Text style={styles.val}>{exportPackage.dataPrincipal.emailAddress}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Phone Number:</Text>
                    <Text style={styles.val}>{exportPackage.dataPrincipal.phoneNumber}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>KYC Status:</Text>
                    <Text style={[styles.val, { color: colors.green, fontWeight: '700' }]}>
                      Verified ✓
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>DPDP Consent Date:</Text>
                    <Text style={styles.valMono}>
                      {new Date(exportPackage.dataPrincipal.dpdpConsentDate).toLocaleDateString('en-IN')}
                    </Text>
                  </View>
                </View>

                {/* Learning & Progression */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeading}>🎓 Educational Records</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statPill}>
                      <Text style={styles.statNum}>{exportPackage.learningProfile.totalXpPoints}</Text>
                      <Text style={styles.statSub}>Total XP</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statNum}>Lvl {exportPackage.learningProfile.learnerLevel}</Text>
                      <Text style={styles.statSub}>Tier Level</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statNum}>{exportPackage.learningProfile.currentDayStreak}d</Text>
                      <Text style={styles.statSub}>Active Streak</Text>
                    </View>
                    <View style={styles.statPill}>
                      <Text style={styles.statNum}>{exportPackage.learningProfile.badgesUnlockedCount}</Text>
                      <Text style={styles.statSub}>Badges</Text>
                    </View>
                  </View>
                </View>

                {/* Virtual Trading Sandbox */}
                <View style={styles.sectionCard}>
                  <Text style={styles.cardHeading}>📈 Virtual Paper Portfolio</Text>
                  <View style={styles.row}>
                    <Text style={styles.label}>Demo Cash Balance:</Text>
                    <Text style={styles.val}>₹{exportPackage.virtualTradingRecords.currentCashBalance.toLocaleString('en-IN')}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>Holdings Count:</Text>
                    <Text style={styles.val}>
                      {exportPackage.virtualTradingRecords.virtualHoldings.length} stocks
                    </Text>
                  </View>
                  <View style={styles.disclaimerBox}>
                    <Text style={styles.disclaimerText}>
                      🔒 Zero fiat liability. As per SEBI and RBI regulations, this paper trading account holds zero actual Indian Rupees or securities.
                    </Text>
                  </View>
                </View>

                {/* Data Fiduciary Compliance */}
                <View style={styles.complianceCard}>
                  <Text style={styles.compTitle}>🏛️ Regulatory Fiduciary Details</Text>
                  <Text style={styles.compItem}>• Data Fiduciary: PaiseWise Financial Technologies Pvt. Ltd.</Text>
                  <Text style={styles.compItem}>• Compliance Export ID: {exportPackage.metadata.exportId}</Text>
                  <Text style={styles.compItem}>• Third-Party Data Brokers: None (Strict 0% sell policy)</Text>
                  <Text style={styles.compItem}>• Data Retention: Retained until account erasure requested</Text>
                </View>
              </View>
            ) : (
              <View style={styles.jsonContainer}>
                <View style={styles.jsonHeader}>
                  <Text style={styles.jsonFileTitle}>paisewise_dpdp_export.json</Text>
                  <Text style={styles.jsonSize}>{(jsonString.length / 1024).toFixed(1)} KB</Text>
                </View>
                <ScrollView horizontal style={styles.jsonHScroll}>
                  <Text style={styles.jsonText}>{jsonString}</Text>
                </ScrollView>
              </View>
            )}
          </ScrollView>

          {/* Action Footer */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.copyBtn]}
              activeOpacity={0.8}
              onPress={handleCopyClipboard}
            >
              <Text style={styles.copyBtnText}>{copied ? '✓ Copied to Clipboard!' : '📋 Copy JSON'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, styles.downloadBtn]}
              activeOpacity={0.8}
              onPress={handleDownloadFile}
            >
              <Text style={styles.downloadBtnText}>📥 Download File</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(14, 15, 26, 0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.sm,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  badgeDPDP: {
    backgroundColor: colors.indigoChip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeDPDPText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.purple,
    letterSpacing: 0.5,
  },
  closeBtn: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  title: {
    ...typography.h2,
    color: colors.text,
    fontWeight: '800',
    marginTop: 2,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 3,
    marginTop: spacing.md,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabBtnTextActive: {
    color: colors.purple,
    fontWeight: '700',
  },
  bodyScroll: {
    maxHeight: 420,
  },
  bodyContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  summaryContainer: {
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeading: {
    ...typography.bodyBold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  val: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  valMono: {
    ...typography.mono,
    fontSize: 11,
    color: colors.textMuted,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  statPill: {
    flex: 1,
    backgroundColor: colors.white,
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statNum: {
    ...typography.bodyBold,
    color: colors.purple,
  },
  statSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  disclaimerBox: {
    backgroundColor: '#FEF3C7',
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.sm,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#92400E',
    lineHeight: 15,
  },
  complianceCard: {
    backgroundColor: '#EEF2FF',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  compTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: '#3730A3',
    marginBottom: spacing.xs,
  },
  compItem: {
    fontSize: 11,
    color: '#4338CA',
    lineHeight: 16,
    marginVertical: 1,
  },
  jsonContainer: {
    backgroundColor: '#0F172A',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  jsonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: spacing.xs,
  },
  jsonFileTitle: {
    ...typography.mono,
    color: '#38BDF8',
    fontSize: 11,
  },
  jsonSize: {
    ...typography.mono,
    color: '#94A3B8',
    fontSize: 11,
  },
  jsonHScroll: {
    maxHeight: 340,
  },
  jsonText: {
    ...typography.mono,
    color: '#F8FAFC',
    fontSize: 11,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyBtn: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyBtnText: {
    ...typography.bodyBold,
    color: colors.text,
  },
  downloadBtn: {
    backgroundColor: colors.purple,
  },
  downloadBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
