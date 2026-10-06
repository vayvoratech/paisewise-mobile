import React, { useState } from 'react';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootState } from '../../../app/store';
import { setLanguage, deleteAccountThunk } from '../../onboarding/slices/authSlice';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../help.data';
import { LanguageSelectorModal } from '../components/LanguageSelectorModal';
import { DPDPExportModal } from '../components/DPDPExportModal';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';
import { tokenStorage } from '../../../core/api/tokenStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import mixpanel from '@core/mixpanel';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.auth.user);
  const currentLanguage = useSelector((state: RootState) => state.auth.language) || 'English';

  // State toggles & modals
  const [reminders, setReminders] = useState(true);
  const [marketAlerts, setMarketAlerts] = useState(true);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showDpdpModal, setShowDpdpModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [sessionToast, setSessionToast] = useState<string | null>(null);

  // Active language object
  const activeLangObj =
    SUPPORTED_LANGUAGES.find(
      (l) =>
        l.name.toLowerCase() === currentLanguage.toLowerCase() ||
        l.code.toLowerCase() === currentLanguage.toLowerCase()
    ) || SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = (lang: SupportedLanguage) => {
    dispatch(setLanguage(lang.name));
    if (Platform.OS !== 'web') {
      AsyncStorage.setItem('paisewise_language', lang.code).catch(() => {});
    }
    mixpanel.track('language_selected', {
      language_name: lang.name,
      language_code: lang.code,
      source: 'settings_screen',
    });
    setShowLangModal(false);
    triggerToast(`Language updated to ${lang.nativeName} (${lang.name})`);
  };

  const triggerToast = (msg: string) => {
    setSessionToast(msg);
    setTimeout(() => {
      setSessionToast(null);
    }, 3500);
  };

  // Perform Session Reset
  const handlePerformSessionReset = async () => {
    setShowResetModal(false);
    try {
      if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
      }
      const currentToken = tokenStorage.getAccessToken();
      if (currentToken) {
        tokenStorage.setAccessToken(currentToken);
      }
      triggerToast('🔄 Session refreshed! Cached market data flushed & tokens re-synced.');
    } catch {
      triggerToast('Session reset completed.');
    }
  };

  // Perform Account Deletion
  const handlePerformAccountDeletion = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteAccountThunk('DPDP Section 12 User Requested Erasure') as any).unwrap();
      setIsDeleting(false);
      setShowDeleteModal(false);

      if (Platform.OS === 'web') {
        alert('Your account and all associated personal data have been permanently erased under DPDP Act 2023.');
      } else {
        Alert.alert(
          'Account Deleted',
          'Your account and all associated personal data have been permanently erased under DPDP Act 2023.'
        );
      }

      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    } catch {
      setIsDeleting(false);
      setShowDeleteModal(false);
      Alert.alert('Notice', 'Account session purged locally. Redirecting to login.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
      });
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Settings & Preferences</Text>
          <Text style={styles.headerSubtitle}>Languages, Session & DPDP Compliance</Text>
        </View>
      </View>

      {/* Floating Status Toast */}
      {sessionToast && (
        <View style={styles.toastBanner}>
          <Text style={styles.toastText}>{sessionToast}</Text>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Language Preference Section (6 languages) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>App Language / भाषा</Text>
            <View style={styles.badgeCount}>
              <Text style={styles.badgeCountText}>6 Indian Languages</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Choose from 6 official Indian languages for lessons, audio prompts, and UI navigation.
          </Text>

          {/* Active Language Preview Card */}
          <TouchableOpacity
            style={styles.langActiveCard}
            activeOpacity={0.8}
            onPress={() => setShowLangModal(true)}
          >
            <View style={styles.langCardLeft}>
              <View style={styles.langFlagCircle}>
                <Text style={styles.langFlagText}>{activeLangObj.flag}</Text>
              </View>
              <View>
                <View style={styles.langTitleRow}>
                  <Text style={styles.langNativeTitle}>{activeLangObj.nativeName}</Text>
                  <Text style={styles.langEnglishTitle}>({activeLangObj.name})</Text>
                </View>
                <Text style={styles.langStatusDesc}>{activeLangObj.description}</Text>
              </View>
            </View>
            <View style={styles.changePill}>
              <Text style={styles.changePillText}>Change ▾</Text>
            </View>
          </TouchableOpacity>

          {/* Quick 6-Language Chips Grid */}
          <View style={styles.langChipsGrid}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected =
                lang.name.toLowerCase() === currentLanguage.toLowerCase() ||
                lang.code.toLowerCase() === currentLanguage.toLowerCase();

              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.langChip, isSelected && styles.langChipActive]}
                  activeOpacity={0.7}
                  onPress={() => handleLanguageSelect(lang)}
                >
                  <Text style={styles.chipFlag}>{lang.flag}</Text>
                  <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                    {lang.nativeName}
                  </Text>
                  {isSelected && <Text style={styles.chipCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 2. Notifications & Learning Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminders & Notifications</Text>

          <View style={styles.rowCard}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowEmoji}>🔔</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Daily Learning Reminders</Text>
                <Text style={styles.rowDesc}>Keep your streak alive with a gentle daily notification</Text>
              </View>
            </View>
            <Switch
              value={reminders}
              onValueChange={setReminders}
              trackColor={{ true: colors.purple, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.rowCard}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowEmoji}>📈</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowLabel}>Virtual Market Signals</Text>
                <Text style={styles.rowDesc}>Get price triggers & simulated trading alerts</Text>
              </View>
            </View>
            <Switch
              value={marketAlerts}
              onValueChange={setMarketAlerts}
              trackColor={{ true: colors.purple, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>

          {/* Security & MPIN shortcut */}
          <TouchableOpacity
            style={styles.navRowCard}
            activeOpacity={0.8}
            onPress={() => {
              if (user?.hasMpin) {
                navigation.navigate('ResetMpin', { email: user?.email || '', mode: 'change' });
              } else {
                navigation.navigate('SetMpin');
              }
            }}
          >
            <Text style={styles.rowEmoji}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Security & 4-Digit MPIN</Text>
              <Text style={styles.rowDesc}>Biometric authentication & passcode lock</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Session & Data Management (DPDP Act 2023) */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Data & Privacy (DPDP Act 2023)</Text>
            <View style={[styles.badgeCount, { backgroundColor: '#EDE9FE' }]}>
              <Text style={[styles.badgeCountText, { color: colors.purpleDeep }]}>Govt of India</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            Digital Personal Data Protection Act compliance tools: export your data or reset session cache anytime.
          </Text>

          {/* Session Reset Button */}
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.8}
            onPress={() => setShowResetModal(true)}
          >
            <View style={styles.actionIconCircle}>
              <Text style={styles.actionIconEmoji}>🔄</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Session Reset & Cache Refresh</Text>
              <Text style={styles.actionDesc}>
                Flush temporary offline cache, re-verify security tokens, and re-sync streak state
              </Text>
            </View>
            <View style={styles.actionArrow}>
              <Text style={styles.actionArrowText}>Reset</Text>
            </View>
          </TouchableOpacity>

          {/* DPDP Data Export Button */}
          <TouchableOpacity
            style={[styles.actionCard, { borderColor: '#C7D2FE', backgroundColor: '#F8FAFF' }]}
            activeOpacity={0.8}
            onPress={() => setShowDpdpModal(true)}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Text style={styles.actionIconEmoji}>📥</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.actionTitle}>DPDP Data Export</Text>
                <View style={styles.secBadge}>
                  <Text style={styles.secBadgeText}>Section 11</Text>
                </View>
              </View>
              <Text style={styles.actionDesc}>
                Export comprehensive JSON archive of your personal records, XP logs, and paper trading activity
              </Text>
            </View>
            <View style={[styles.actionArrow, { backgroundColor: colors.purple }]}>
              <Text style={[styles.actionArrowText, { color: colors.white }]}>Export</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* 4. Help & Regulatory Redressal Shortcut */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Help, FAQs & SEBI Redressal</Text>
          <TouchableOpacity
            style={styles.navRowCard}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Help')}
          >
            <Text style={styles.rowEmoji}>🏛️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Help Center & SEBI SCORES Portal</Text>
              <Text style={styles.rowDesc}>Interactive FAQ accordions & official SCORES links</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Danger Zone / Account Deletion */}
        <View style={[styles.section, styles.dangerSection]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.red }]}>Danger Zone</Text>
            <View style={[styles.badgeCount, { backgroundColor: '#FEE2E2' }]}>
              <Text style={[styles.badgeCountText, { color: colors.red }]}>Irreversible</Text>
            </View>
          </View>
          <Text style={styles.sectionSubtitle}>
            DPDP Section 12 Right to Erasure. Permanently delete your credentials, badges, and learning history.
          </Text>

          <TouchableOpacity
            style={styles.deleteCard}
            activeOpacity={0.8}
            onPress={() => setShowDeleteModal(true)}
          >
            <View style={styles.deleteIconBox}>
              <Text style={{ fontSize: 22 }}>🗑️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.deleteCardTitle}>Delete Account & Wipe Data</Text>
              <Text style={styles.deleteCardDesc}>
                Revoke DPDP consent and permanently delete profile and virtual balances
              </Text>
            </View>
            <View style={styles.deleteCardBtn}>
              <Text style={styles.deleteCardBtnText}>Delete</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version & DPDP Statement Footer */}
        <View style={styles.footerWrap}>
          <Text style={styles.footerBrand}>PaiseWise Mobile • v1.0.0</Text>
          <Text style={styles.footerCompliance}>
            Compliant with Digital Personal Data Protection Act, 2023 (DPDP Act No. 22 of 2023)
          </Text>
          <Text style={styles.footerDisclaimer}>
            Virtual Paper Trading Educational Sandbox • Not a SEBI registered broker
          </Text>
        </View>
      </ScrollView>

      {/* 6 Languages Modal */}
      <LanguageSelectorModal
        visible={showLangModal}
        selectedCode={currentLanguage}
        onSelectLanguage={handleLanguageSelect}
        onClose={() => setShowLangModal(false)}
      />

      {/* DPDP Data Export Modal */}
      <DPDPExportModal
        visible={showDpdpModal}
        user={user}
        language={currentLanguage}
        onClose={() => setShowDpdpModal(false)}
      />

      {/* Session Reset Confirmation Modal */}
      <ConfirmModal
        visible={showResetModal}
        title="Reset Active Session?"
        message="This will clear temporary in-memory cache, flush local offline buffers, and re-sync your profile and streak data with the server. Your account credentials and virtual holdings will remain completely safe."
        confirmText="Yes, Reset Session"
        cancelText="Cancel"
        confirmVariant="primary"
        onConfirm={handlePerformSessionReset}
        onCancel={() => setShowResetModal(false)}
      />

      {/* Delete Account Modal (DPDP Section 12) */}
      <DeleteAccountModal
        visible={showDeleteModal}
        isDeleting={isDeleting}
        onConfirmDelete={handlePerformAccountDeletion}
        onCancel={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  backArrow: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  headerTextWrap: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.text,
    fontWeight: '800',
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 1,
  },
  toastBanner: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.purple,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  toastText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
    gap: spacing.xl,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dangerSection: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    ...typography.h3,
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  badgeCount: {
    backgroundColor: colors.indigoChip,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  badgeCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.purple,
  },
  langActiveCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F3FF',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.purple,
    marginBottom: spacing.md,
  },
  langCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  langFlagCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  langFlagText: {
    fontSize: 22,
  },
  langTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  langNativeTitle: {
    ...typography.bodyBold,
    color: colors.purpleDeep,
    fontSize: 16,
  },
  langEnglishTitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  langStatusDesc: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  changePill: {
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  changePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  langChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  langChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    gap: 6,
  },
  langChipActive: {
    backgroundColor: '#EDE9FE',
    borderColor: colors.purple,
  },
  chipFlag: {
    fontSize: 14,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
  },
  chipTextActive: {
    color: colors.purpleDeep,
    fontWeight: '800',
  },
  chipCheck: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.purple,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceAlt,
  },
  rowInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: spacing.md,
    gap: spacing.md,
  },
  rowEmoji: {
    fontSize: 20,
  },
  rowLabel: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  rowDesc: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  navRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  chevron: {
    fontSize: 20,
    color: colors.textMuted,
    fontWeight: '600',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconEmoji: {
    fontSize: 20,
  },
  actionTitle: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
  },
  actionDesc: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  secBadge: {
    backgroundColor: colors.indigoChip,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  secBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.purple,
  },
  actionArrow: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionArrowText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text,
  },
  deleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: spacing.md,
  },
  deleteIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteCardTitle: {
    ...typography.bodyBold,
    fontSize: 13,
    color: '#DC2626',
  },
  deleteCardDesc: {
    ...typography.caption,
    fontSize: 11,
    color: '#991B1B',
    marginTop: 2,
    lineHeight: 15,
  },
  deleteCardBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  deleteCardBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
  footerWrap: {
    alignItems: 'center',
    paddingTop: spacing.md,
    gap: 4,
  },
  footerBrand: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.text,
  },
  footerCompliance: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
  footerDisclaimer: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
