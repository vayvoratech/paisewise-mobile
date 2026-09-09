/** Screen 12 — Profile & Settings. Badges, stats, preferences. */
import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Card } from '../../../shared/ui/Card';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { BADGES, PROFILE } from '../profile.data';
import { logoutUser } from '../../onboarding/slices/authSlice';
import { RootState } from '../../../app/store';
import { apiClient } from '../../../core/api/apiClient';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

export default function ProfileScreen() {
  const [reminders, setReminders] = useState(PROFILE.dailyReminders);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profileData, setProfileData] = useState<{ name?: string; dayStreak?: number; xpTotal?: number; level?: number } | null>(null);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.auth.user);

  useFocusEffect(
    useCallback(() => {
      apiClient.get(`${API_ENDPOINTS.AUTH.REGISTER.replace('/auth/register', '')}/profile/me`)
        .then(res => {
          if (res.data) {
            setProfileData(res.data);
          }
        })
        .catch(err => console.log('Profile fetch note:', err.message));
    }, [])
  );

  const performLogout = async () => {
    try {
      await dispatch(logoutUser() as any).unwrap();
    } catch (err) {
      console.warn('API logout failed, clearing session anyway:', err);
    } finally {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' }],
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
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.sheetContent} 
        showsVerticalScrollIndicator={true}
        bounces={true}
        overScrollMode="always"
      >
        {/* User Profile Summary Card */}
        <Card style={styles.profileHeaderCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 28 }}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{user?.name || (profileData?.name && profileData?.name !== 'Investor' ? profileData.name : null) || user?.email?.split('@')[0] || 'Learner'}</Text>
              <Text style={styles.userEmail}>{user?.email || 'authenticated_user'}</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>⭐ {profileData?.xpTotal ?? user?.xpTotal ?? 0} XP</Text>
              <Text style={styles.statLbl}>Total XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>🔥 {profileData?.dayStreak ?? user?.dayStreak ?? 0} Days</Text>
              <Text style={styles.statLbl}>Current Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>Lvl {profileData?.level ?? user?.level ?? 1}</Text>
              <Text style={styles.statLbl}>Learner Level</Text>
            </View>
          </View>
        </Card>

        {/* Badges Section */}
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

        {/* Settings Section */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl, marginBottom: spacing.md }]}>Settings</Text>

        <SettingRow emoji="🇮🇳" label={`Language: ${PROFILE.language}`} chevron />
        <View style={styles.settingRow}>
          <Text style={styles.settingEmoji}>🔔</Text>
          <Text style={styles.settingLabel}>Daily reminders</Text>
          <Switch value={reminders} onValueChange={setReminders} trackColor={{ true: colors.green, false: colors.border }} thumbColor={colors.white} />
        </View>

        <SettingRow 
          emoji="🔒" 
          label="Security & MPIN" 
          chevron 
          onPress={() => {
            if (user?.hasMpin) {
              navigation.navigate('ResetMpin', { email: user.email || '', mode: 'change' });
            } else {
              navigation.navigate('SetMpin');
            }
          }} 
        />
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
    </SafeAreaView>
  );
}

function SettingRow({ emoji, label, chevron, onPress }: { emoji: string; label: string; chevron?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.settingRow} activeOpacity={0.8} onPress={onPress}>
      <Text style={styles.settingEmoji}>{emoji}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
      {chevron && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  scrollView: { flex: 1 },
  sheetContent: { padding: spacing.xl, paddingBottom: 140, flexGrow: 1 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, marginTop: spacing.sm },
  sectionTitle: { ...typography.h2, color: colors.text },
  seeAll: { ...typography.overline, color: colors.purple, fontWeight: '700' },
  badges: { flexDirection: 'row', gap: spacing.md },
  badge: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: spacing.sm, backgroundColor: colors.surface },
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
  },
  profileHeaderCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: radius.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.indigoChip,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  userName: {
    ...typography.h2,
    color: colors.text,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statBox: {
    alignItems: 'center',
  },
  statVal: {
    ...typography.h3,
    color: colors.purple,
  },
  statLbl: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  }
});