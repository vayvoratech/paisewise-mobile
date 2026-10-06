/** Screen 12 — Profile & Settings. Badges, stats, preferences, and navigation. */
import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Card } from '../../../shared/ui/Card';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { BADGES } from '../profile.data';
import { logoutUser, updateUserData } from '../../onboarding/slices/authSlice';
import { updateProfile } from '../slices/userSlice';
import { RootState } from '../../../app/store';
import { apiClient } from '../../../core/api/apiClient';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';
import { EditProfileModal } from '../components/EditProfileModal';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';

export default function ProfileScreen() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState<{
    name?: string;
    dayStreak?: number;
    xpTotal?: number;
    level?: number;
    city?: string;
    phone?: string;
  } | null>(null);
  const [streakData, setStreakData] = useState<{ currentStreak?: number; maxStreak?: number } | null>(null);

  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const user = useSelector((state: RootState) => state.auth.user);
  const currentLanguage = useSelector((state: RootState) => state.auth.language) || 'English';

  useFocusEffect(
    useCallback(() => {
      const baseUrl = API_ENDPOINTS.AUTH.REGISTER.replace('/auth/register', '');
      apiClient
        .get(`${baseUrl}/profile/me`)
        .then((res) => {
          if (res.data) {
            setProfileData(res.data);
          }
        })
        .catch((err) => console.log('Profile fetch note:', err.message));

      apiClient
        .get(`${baseUrl}/learn/streak`)
        .then((res) => {
          if (res.data) {
            setStreakData(res.data);
          }
        })
        .catch((err) => console.log('Streak fetch note:', err.message));
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
      Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Log Out',
          style: 'destructive',
          onPress: performLogout,
        },
      ]);
    }
  };

  const handleSaveProfile = (updated: { name: string; phone: string; city: string }) => {
    dispatch(updateUserData({ name: updated.name, phone: updated.phone }));
    dispatch(updateProfile({ name: updated.name, phone: updated.phone }));
    setProfileData((prev) => ({ ...prev, name: updated.name, phone: updated.phone, city: updated.city }));
  };

  const displayName =
    user?.name ||
    (profileData?.name && profileData?.name !== 'Investor' ? profileData.name : null) ||
    user?.email?.split('@')[0] ||
    'Amrutha Patil';

  const displayPhone = user?.phone || profileData?.phone || '+91 9912483007';

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        {/* User Profile Summary Card */}
        <Card style={styles.profileHeaderCard}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={{ fontSize: 28 }}>👤</Text>
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.nameHeaderRow}>
                <Text style={styles.userName}>{displayName}</Text>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => setShowEditModal(true)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.editBtnText}>✏️ Edit</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.userEmail}>{user?.email || 'investor@example.com'}</Text>
              <Text style={styles.userPhone}>{displayPhone}</Text>

              {/* Badges row: KYC & Investor Persona */}
              <View style={styles.tagRow}>
                <View style={styles.kycVerifiedBadge}>
                  <Text style={styles.kycCheckMark}>✓</Text>
                  <Text style={styles.kycText}>KYC Verified</Text>
                </View>

                <View style={styles.personaBadge}>
                  <Text style={styles.personaText}>🌱 Moderate Investor</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>⭐ {profileData?.xpTotal ?? user?.xpTotal ?? 1240} XP</Text>
              <Text style={styles.statLbl}>Total XP</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>🔥 {streakData?.currentStreak ?? profileData?.dayStreak ?? user?.dayStreak ?? 3} Days</Text>
              <Text style={styles.statLbl}>Current Streak</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>Lvl {profileData?.level ?? user?.level ?? 1}</Text>
              <Text style={styles.statLbl}>Learner Tier</Text>
            </View>
          </View>
        </Card>

        {/* Badges Section */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Badges Earned</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Badges')} activeOpacity={0.7}>
            <Text style={styles.seeAll}>SEE ALL →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.badges}>
          {BADGES.slice(0, 3).map((b) => (
            <TouchableOpacity
              key={b.title}
              style={{ flex: 1 }}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Badges')}
            >
              <Card style={styles.badge}>
                <Text style={styles.badgeEmoji}>{b.emoji}</Text>
                <Text style={styles.badgeTitle}>{b.title}</Text>
                <Text style={styles.badgeCat}>{b.category}</Text>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation & Preferences Section */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl, marginBottom: spacing.md }]}>
          Preferences & Support
        </Text>

        {/* Settings Navigation Item (6 languages, session reset, DPDP export, delete) */}
        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Settings')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: '#EDE9FE' }]}>
            <Text style={styles.menuEmoji}>⚙️</Text>
          </View>
          <View style={styles.menuInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.menuLabel}>Settings & Privacy</Text>
              <View style={styles.langPill}>
                <Text style={styles.langPillText}>{currentLanguage}</Text>
              </View>
            </View>
            <Text style={styles.menuSub}>6 Languages, Session Reset, DPDP Data Export</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* HelpScreen Navigation Item (FAQ accordion, SEBI SCORES portal links) */}
        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Help')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: '#E0F2FE' }]}>
            <Text style={styles.menuEmoji}>🏛️</Text>
          </View>
          <View style={styles.menuInfo}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.menuLabel}>Help & Grievance Redressal</Text>
              <View style={[styles.langPill, { backgroundColor: '#DBEAFE' }]}>
                <Text style={[styles.langPillText, { color: '#1D4ED8' }]}>SEBI SCORES</Text>
              </View>
            </View>
            <Text style={styles.menuSub}>Interactive FAQ Accordions & SCORES 2.0 Links</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Security & MPIN */}
        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.8}
          onPress={() => {
            if (user?.hasMpin) {
              navigation.navigate('ResetMpin', { email: user?.email || '', mode: 'change' });
            } else {
              navigation.navigate('SetMpin');
            }
          }}
        >
          <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.menuEmoji}>🔒</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>Security & 4-Digit MPIN</Text>
            <Text style={styles.menuSub}>Change MPIN, Biometrics & Lock Screen</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* View All Badges */}
        <TouchableOpacity
          style={styles.menuRow}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Badges')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: '#FCE7F3' }]}>
            <Text style={styles.menuEmoji}>🏆</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={styles.menuLabel}>All Achievements & Trophies</Text>
            <Text style={styles.menuSub}>Track milestone badges and XP reward unlocks</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.menuRow, styles.logoutButton]}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <View style={[styles.menuIconBox, { backgroundColor: '#FEE2E2' }]}>
            <Text style={styles.menuEmoji}>🚪</Text>
          </View>
          <View style={styles.menuInfo}>
            <Text style={[styles.menuLabel, styles.logoutText]}>Log Out</Text>
            <Text style={[styles.menuSub, { color: '#B91C1C' }]}>Sign out of your active session</Text>
          </View>
          <Text style={[styles.chevron, { color: '#EF4444' }]}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        initialName={displayName}
        initialPhone={displayPhone}
        initialCity={profileData?.city || 'Bengaluru, India'}
        onSave={handleSaveProfile}
        onClose={() => setShowEditModal(false)}
      />

      {/* Web Logout Modal */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Confirm Logout"
        message="Are you sure you want to log out of PaiseWise? You will need to log back in with your mobile number or MPIN."
        confirmText="Yes, Log Out"
        cancelText="Cancel"
        confirmVariant="danger"
        onConfirm={() => {
          setShowLogoutModal(false);
          performLogout();
        }}
        onCancel={() => setShowLogoutModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  scrollView: { flex: 1 },
  sheetContent: { padding: spacing.xl, paddingBottom: 140, flexGrow: 1 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: { ...typography.h2, fontSize: 18, color: colors.text, fontWeight: '800' },
  seeAll: { ...typography.overline, color: colors.purple, fontWeight: '700' },
  badges: { flexDirection: 'row', gap: spacing.md },
  badge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surface,
  },
  badgeEmoji: { fontSize: 34 },
  badgeTitle: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  badgeCat: { ...typography.overline, color: colors.textMuted, fontSize: 10, marginTop: 2 },
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
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.indigoChip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    ...typography.h2,
    fontSize: 18,
    color: colors.text,
    fontWeight: '800',
  },
  editBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.purple,
  },
  userEmail: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  userPhone: {
    ...typography.caption,
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 1,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  kycVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greenSoft,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 3,
  },
  kycCheckMark: {
    color: colors.green,
    fontWeight: '900',
    fontSize: 10,
  },
  kycText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.green,
  },
  personaBadge: {
    backgroundColor: colors.indigoChip,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  personaText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.purple,
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
    fontSize: 16,
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
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: {
    fontSize: 20,
  },
  menuInfo: {
    flex: 1,
  },
  menuLabel: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.text,
  },
  menuSub: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  langPill: {
    backgroundColor: colors.indigoChip,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  langPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.purple,
  },
  chevron: {
    fontSize: 22,
    color: colors.textMuted,
    fontWeight: '600',
  },
  logoutButton: {
    borderColor: '#FECACA',
    backgroundColor: '#FFFBFB',
    marginTop: spacing.sm,
  },
  logoutText: {
    color: '#DC2626',
  },
});