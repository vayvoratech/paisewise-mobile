/** Screen 03 — Home Dashboard. Greeting, stats, today's lesson, market, quick actions. */
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Card } from '../../../shared/ui/Card';
import { Pill } from '../../../shared/ui/Pill';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR, formatPct } from '../../../shared/format';
import { MainTabsParamList, RootStackParamList } from '../../../app/navigation/types';
import { PROFILE } from '../../profile/profile.data';
import { TODAYS_LESSON } from '../../learn/learn.data';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import { tokenStorage } from '../../../core/api/tokenStorage';
import UITestScreen from './UITestScreen';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const MARKET = [
  { symbol: 'RELIANCE', value: 2952, pct: 1.2 },
  { symbol: 'TCS', value: 3801, pct: -0.8 },
  { symbol: 'NIFTY', value: 22456, pct: 0.5 },
];

const QUICK_ACTIONS: { emoji: string; label: string; go: keyof MainTabsParamList | 'Community' }[] = [
  { emoji: '🎮', label: 'PRACTICE', go: 'Practice' },
  { emoji: '📚', label: 'LEARN', go: 'Learn' },
  { emoji: '🧮', label: 'CALCULATE', go: 'Learn' },
  { emoji: '👥', label: 'COMMUNITY', go: 'Community' },
];

export default function HomeScreen({ navigation }: Props) {
  useEffect(() => {
    // Test reading the stored tokens and user ID
    console.log('Stored Access Token:', tokenStorage.getAccessToken());
    console.log('Stored User ID:', tokenStorage.getUserId());
  }, []);

  const holdingsValue = useSelector((state: RootState) => state.portfolio.holdingsValue);
  const gain = 4320;
  const gainPct = 4.3;

  return (
    <View style={styles.root}>
      <HeroBackground tone="dark" style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroInner}>
            <View style={styles.greetRow}>
              <View>
                <Text style={styles.namaste}>NAMASTE, RAHUL 👋</Text>
                <Text style={styles.morning}>Good morning!</Text>
              </View>
              <TouchableOpacity style={styles.bell}>
                <Text style={styles.bellEmoji}>🔔</Text>
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>3</Text>
                </View>
              </TouchableOpacity>
            </View>

            <Pill label="🔥 7 day streak" color={colors.amber} bg="rgba(245,158,11,0.12)" borderColor="rgba(245,158,11,0.4)" style={styles.streak} />

            <Card dark style={styles.statCard}>
              <View style={styles.statRow}>
                <View>
                  <Text style={styles.statLabel}>PRACTICE VALUE</Text>
                  <Text style={styles.statValue}>{formatINR(104320)}</Text>
                  <Text style={styles.statGain}>↑ {formatINR(gain)} ({formatPct(gainPct)})</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.statLabel}>LEARNING XP</Text>
                  <Text style={styles.statXp}>⭐ {PROFILE.xpTotal.toLocaleString('en-IN')}</Text>
                  <Text style={styles.statLevel}>LVL {PROFILE.level} INVESTOR</Text>
                </View>
              </View>
            </Card>
          </View>
        </SafeAreaView>
      </HeroBackground>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
        {/* Today's lesson */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Today's Lesson</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Learn')}>
            <Text style={styles.seeAll}>SEE ALL →</Text>
          </TouchableOpacity>
        </View>

        <Card onPress={() => navigation.navigate('Lesson', { lessonId: TODAYS_LESSON.id })} style={styles.lessonCard}>
          <View style={styles.lessonRow}>
            <View style={styles.lessonIcon}><Text style={{ fontSize: 22 }}>📊</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonTitle}>{TODAYS_LESSON.title}</Text>
              <Text style={styles.lessonMeta}>3 MIN · HINDI AVAILABLE</Text>
              <View style={{ marginTop: spacing.sm }}>
                <ProgressBar progress={0.4} color={colors.amber} trackColor={colors.border} />
              </View>
            </View>
            <Pill label="NEW" color={colors.purple} bg={colors.indigoChip} />
          </View>
        </Card>

        <Card style={[styles.lessonCard, { marginTop: spacing.md }]}>
          <View style={styles.lessonRow}>
            <View style={[styles.lessonIcon, { backgroundColor: colors.greenSoft }]}><Text style={{ fontSize: 22 }}>💰</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.lessonTitle}>SIP: ₹500/month magic</Text>
              <Text style={styles.lessonMeta}>4 MIN · DONE YESTERDAY</Text>
              <View style={{ marginTop: spacing.sm }}>
                <ProgressBar progress={1} color={colors.orange} trackColor={colors.border} />
              </View>
            </View>
            <View style={styles.doneBadge}><Text style={styles.doneCheck}>✓</Text></View>
          </View>
        </Card>

        {/* Market now */}
        <View style={[styles.sectionHead, { marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Market Now</Text>
          <Pill label="● LIVE" color={colors.green} bg={colors.greenSoft} />
        </View>
        <View style={styles.marketRow}>
          {MARKET.map((m) => (
            <Card key={m.symbol} style={styles.marketCard}>
              <Text style={styles.marketSym}>{m.symbol}</Text>
              <Text style={styles.marketVal}>{formatINR(m.value)}</Text>
              <Text style={[styles.marketPct, { color: m.pct >= 0 ? colors.green : colors.pink }]}>
                {m.pct >= 0 ? '↑' : '↓'} {Math.abs(m.pct)}%
              </Text>
            </Card>
          ))}
        </View>

        {/* Quick actions */}
        <Text style={[styles.sectionTitle, { marginTop: spacing.xl, marginBottom: spacing.md }]}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {QUICK_ACTIONS.map((q) => (
            <Card key={q.label} style={styles.quickCard} onPress={() => navigation.navigate(q.go as any)}>
              <Text style={styles.quickEmoji}>{q.emoji}</Text>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  hero: { flexGrow: 0 },
  heroInner: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  greetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: spacing.md },
  namaste: { ...typography.overline, color: colors.textMutedDark },
  morning: { ...typography.h1, color: colors.textOnDark, marginTop: 4 },
  bell: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  bellEmoji: { fontSize: 22 },
  bellBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.pink, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  bellBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  streak: { marginTop: spacing.lg },
  statCard: { marginTop: spacing.lg },
  statRow: { flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { ...typography.overline, color: colors.textMutedDark },
  statValue: { ...typography.h1, color: colors.textOnDark, marginTop: 4 },
  statGain: { ...typography.caption, color: colors.green, marginTop: 2 },
  statXp: { ...typography.h1, color: colors.star, marginTop: 4 },
  statLevel: { ...typography.caption, color: colors.textMutedDark, marginTop: 2 },
  sheet: { flex: 1, backgroundColor: colors.surfaceAlt, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, marginTop: -spacing.md },
  sheetContent: { padding: spacing.xl, paddingBottom: spacing.xxl },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { ...typography.h2, color: colors.text },
  seeAll: { ...typography.overline, color: colors.textMuted },
  lessonCard: { paddingVertical: spacing.lg },
  lessonRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  lessonIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: '#E5EDFF', alignItems: 'center', justifyContent: 'center' },
  lessonTitle: { ...typography.bodyBold, color: colors.text },
  lessonMeta: { ...typography.overline, color: colors.textMuted, marginTop: 2 },
  doneBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  doneCheck: { color: colors.green, fontWeight: '800' },
  marketRow: { flexDirection: 'row', gap: spacing.md },
  marketCard: { flex: 1, paddingVertical: spacing.lg, paddingHorizontal: spacing.md },
  marketSym: { ...typography.bodyBold, color: colors.text, fontSize: 15 },
  marketVal: { ...typography.body, color: colors.text, marginTop: 4 },
  marketPct: { ...typography.caption, marginTop: 4 },
  quickRow: { flexDirection: 'row', gap: spacing.md },
  quickCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.lg, paddingHorizontal: 4 },
  quickEmoji: { fontSize: 26 },
  quickLabel: { ...typography.overline, color: colors.textMuted, marginTop: spacing.sm, fontSize: 10 },
});