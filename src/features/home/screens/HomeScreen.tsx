/** Screen 03 — Home Dashboard.*/
import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
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
import { tokenStorage } from '../../../core/api/tokenStorage';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;


const MARKET = [
  { symbol: 'RELIANCE', value: 2952, pct: 1.2 },
  { symbol: 'TCS', value: 3801, pct: -0.8 },
  { symbol: 'NIFTY', value: 22456, pct: 0.5 },
];

const QUICK_ACTIONS: { emoji: string; label: string; go: keyof MainTabsParamList | 'Community' | 'Watchlist' }[] = [
  { emoji: '⭐', label: 'WATCHLIST', go: 'Watchlist' },
  { emoji: '📚', label: 'LEARN', go: 'Learn' },
  { emoji: '🧮', label: 'CALCULATE', go: 'Learn' },
  { emoji: '👥', label: 'COMMUNITY', go: 'Community' },
];

export default function HomeScreen({ navigation }: Props) {
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log('Stored Access Token:', tokenStorage.getAccessToken());
    console.log('Stored User ID:', tokenStorage.getUserId());
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const gain = 4320;
  const gainPct = 4.3;

  return (
    <View style={styles.root}>
      {/* SafeAreaView applied at the root container level to push content below Dynamic Island/notch */}
      <SafeAreaView edges={['top']} style={styles.safeAreaHeader}>
        <HeroBackground tone="dark" style={styles.hero}>
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

            {/* Production Search Bar: Tapping this opens SymbolSearchScreen */}
            <TouchableOpacity 
              style={styles.searchBarContainer}
              activeOpacity={0.9}
              onPress={() => navigation.navigate('SymbolSearch' as any)}
            >
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchPlaceholder}>Search stocks, ETFs, indices...</Text>
            </TouchableOpacity>

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
        </HeroBackground>
      </SafeAreaView>

      <ScrollView 
        style={styles.sheet} 
        contentContainerStyle={styles.sheetContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.amber} />
        }
      >
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

        {/* Market Now */}
        <View style={[styles.sectionHead, { marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Market Now</Text>
          <Pill label="● LIVE" color={colors.green} bg={colors.greenSoft} />
        </View>
        <View style={styles.marketRow}>
          {MARKET.map((m) => (
            <Card 
              key={m.symbol} 
              style={styles.marketCard} 
              onPress={() => navigation.navigate('StockDetail', { symbol: m.symbol })}
            >
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
              <Text numberOfLines={1} adjustsFontSizeToFit style={styles.quickLabel}>{q.label}</Text>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  safeAreaHeader: { backgroundColor: 'transparent' },
  hero: { flexGrow: 0 },
  heroInner: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  greetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: spacing.xs },
  namaste: { ...typography.overline, color: colors.textMutedDark },
  morning: { ...typography.h1, color: colors.textOnDark, marginTop: 4 },
  bell: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' },
  bellEmoji: { fontSize: 22 },
  bellBadge: { position: 'absolute', top: 6, right: 6, backgroundColor: colors.pink, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  bellBadgeText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 12, marginTop: spacing.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  searchIcon: { fontSize: 16, marginRight: spacing.sm },
  searchPlaceholder: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '500' },
  statCard: { marginTop: spacing.md },
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
  marketRow: { flexDirection: 'row', gap: spacing.md },
  marketCard: { flex: 1, paddingVertical: spacing.lg, paddingHorizontal: spacing.md },
  marketSym: { ...typography.bodyBold, color: colors.text, fontSize: 15 },
  marketVal: { ...typography.body, color: colors.text, marginTop: 4 },
  marketPct: { ...typography.caption, marginTop: 4 },
  quickRow: { flexDirection: 'row', gap: spacing.sm },
  quickCard: { flex: 1, alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: 4 },
  quickEmoji: { fontSize: 22 },
  quickLabel: { ...typography.overline, color: colors.textMuted, marginTop: spacing.xs, fontSize: 9, letterSpacing: -0.2, fontWeight: '700' },
});