/** Screen 12 — Profile & Settings. Badges, stats, preferences. */
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Card } from '../../../shared/ui/Card';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { BADGES, PROFILE } from '../profile.data';
import { logoutUser } from '../../onboarding/slices/authSlice';
import { RootState } from '../../../app/store';

export default function ProfileScreen() {
  const [reminders, setReminders] = useState(PROFILE.dailyReminders);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);

  const performLogout = async () => {
    try {
      await dispatch(logoutUser(refreshToken) as any).unwrap();
    } catch (err) {
      console.warn('API logout failed, clearing session anyway:', err);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Splash' }],
      });
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      setShowLogoutModal(true);
    } else {
      Alert.alert(
        "Confirm Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Yes",
            style: "destructive",
            onPress: performLogout
          }
        ]
      );
    }
  };

  return (
    <View style={styles.root}>
      <HeroBackground tone="dark" style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroInner}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}><Text style={styles.avatarEmoji}>👦</Text></View>
              <View style={styles.lvlBadge}><Text style={styles.lvlText}>LVL {PROFILE.level}</Text></View>
            </View>
            <Text style={styles.name}>{PROFILE.name}</Text>
            <Text style={styles.handle}>{PROFILE.handle} · {PROFILE.city}</Text>

            <Card dark style={styles.statsCard} padded={false}>
              <View style={styles.statsRow}>
                <Stat value={`${PROFILE.dayStreak}`} label="DAY STREAK" />
                <Stat value={PROFILE.xpTotal.toLocaleString('en-IN')} label="XP TOTAL" />
                <Stat value={`${PROFILE.lessonsCompleted}`} label="LESSONS" />
              </View>
            </Card>
          </View>
        </SafeAreaView>
      </HeroBackground>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Badges Earned</Text>
          <Text style={styles.seeAll}>SEE ALL →</Text>
        </View>
        <View style={styles.badges}>
          {BADGES.map((b) => (
            <Card key={b.title} style={styles.badge}>
              <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              <Text style={styles.badgeTitle}>{b.title}</Text>
              <Text style={styles.badgeCat}>{b.category}</Text>
            </Card>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xl, marginBottom: spacing.md }]}>Settings</Text>

        <SettingRow emoji="🇮🇳" label={`Language: ${PROFILE.language}`} chevron />
        <View style={styles.settingRow}>
          <Text style={styles.settingEmoji}>🔔</Text>
          <Text style={styles.settingLabel}>Daily reminders</Text>
          <Switch value={reminders} onValueChange={setReminders} trackColor={{ true: colors.greenBright, false: colors.border }} thumbColor={colors.white} />
        </View>
        <SettingRow emoji="🔒" label="Security & MPIN" chevron />
        <View style={styles.settingRow}>
          <Text style={styles.settingEmoji}>📄</Text>
          <Text style={styles.settingLabel}>KYC Status: Verified</Text>
          <View style={styles.kycBadge}><Text style={styles.kycCheck}>✓</Text></View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.settingRow, styles.logoutButton]} 
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <Text style={styles.settingEmoji}>🚪</Text>
          <Text style={[styles.settingLabel, styles.logoutText]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      {showLogoutModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>🚪</Text>
            <Text style={styles.modalTitle}>Confirm Logout</Text>
            <Text style={styles.modalDescription}>Are you sure you want to log out?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalCancelButton]} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalConfirmButton]} 
                onPress={() => {
                  setShowLogoutModal(false);
                  performLogout();
                }}
              >
                <Text style={styles.modalConfirmText}>Yes, Log Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SettingRow({ emoji, label, chevron }: { emoji: string; label: string; chevron?: boolean }) {
  return (
    <TouchableOpacity style={styles.settingRow} activeOpacity={0.8}>
      <Text style={styles.settingEmoji}>{emoji}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
      {chevron && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  hero: { flexGrow: 0 },
  heroInner: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xl, alignItems: 'center' },
  avatarWrap: { alignItems: 'center' },
  avatar: { width: 110, height: 110, borderRadius: 55, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 56 },
  lvlBadge: { position: 'absolute', bottom: -4, backgroundColor: colors.amber, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 4 },
  lvlText: { ...typography.overline, color: colors.black, fontSize: 12 },
  name: { ...typography.h1, color: colors.textOnDark, marginTop: spacing.lg },
  handle: { ...typography.body, color: colors.textMutedDark, marginTop: spacing.xs },
  statsCard: { marginTop: spacing.lg, paddingVertical: spacing.lg, width: '100%' },
  statsRow: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.h1, color: colors.amber },
  statLabel: { ...typography.overline, color: colors.textMutedDark, marginTop: 2, fontSize: 11 },
  sheet: { flex: 1, backgroundColor: colors.surfaceAlt, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, marginTop: -spacing.md },
  sheetContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h2, color: colors.text },
  seeAll: { ...typography.overline, color: colors.textMuted },
  badges: { flexDirection: 'row', gap: spacing.md },
  badge: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.sm },
  badgeEmoji: { fontSize: 34 },
  badgeTitle: { ...typography.caption, color: colors.text, fontWeight: '700', marginTop: spacing.sm, textAlign: 'center' },
  badgeCat: { ...typography.overline, color: colors.textMuted, fontSize: 10, marginTop: 2 },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md },
  settingEmoji: { fontSize: 22 },
  settingLabel: { ...typography.bodyBold, color: colors.text, flex: 1 },
  chevron: { fontSize: 24, color: colors.textMuted },
  kycBadge: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  kycCheck: { color: colors.green, fontWeight: '800' },
  logoutButton: {
    borderColor: '#e53e3e',
    borderWidth: 1,
    backgroundColor: '#fff5f5'
  },
  logoutText: {
    color: '#e53e3e'
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '90%',
    maxWidth: 380,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelText: {
    ...typography.bodyBold,
    color: colors.textMuted,
  },
  modalConfirmButton: {
    backgroundColor: '#e53e3e',
  },
  modalConfirmText: {
    ...typography.bodyBold,
    color: colors.white,
  }
});