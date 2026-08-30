/** Screen 03 — Home Dashboard. Greeting, stats, today's lesson, market, quick actions. */
import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';

import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Card } from '../../../shared/ui/Card';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { Pill } from '../../../shared/ui/Pill';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/utils/format';
import { MainTabsParamList, RootStackParamList } from '../../../app/navigation/types';
import { PROFILE } from '../../profile/profile.data';
import { tokenStorage } from '../../../core/api/tokenStorage';
import type { RootState } from '../../../app/store';
import { marketService } from '../../market/market.service';
import { Stock } from '../../market/market.types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

const QUICK_ACTIONS = [
  { emoji: '📚', label: 'Lessons', go: 'Learn' },
  { emoji: '📈', label: 'Watchlist', go: 'Watchlist' },
  { emoji: '📊', label: 'Practice', go: 'Practice' },
  { emoji: '💼', label: 'Portfolio', go: 'Portfolio' },
];

export default function HomeScreen({ navigation }: Props) {
  const holdingsValue = useSelector((state: RootState) => state.portfolio.holdingsValue);
  const [refreshing, setRefreshing] = useState(false);

  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [gainers, setGainers] = useState<Stock[]>([]);
  const [losers, setLosers] = useState<Stock[]>([]);

  const fetchHomeData = () => {
    marketService.getMarketStatus().then((res) => {
      if (res) {
        setIsMarketOpen(res.isMarketOpen);
      }
    });
    marketService.getTopMovers().then((res) => {
      if (res) {
        setGainers(res.gainers.slice(0, 3));
        setLosers(res.losers.slice(0, 3));
      }
    });
  };

  useEffect(() => {
    console.log('Stored Access Token:', tokenStorage.getAccessToken());
    console.log('Stored User ID:', tokenStorage.getUserId());
    fetchHomeData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHomeData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const gain = 4320;
  const gainPct = 4.3;

  return (
    <View style={styles.root}>
      {/* SafeAreaView applied at the root container level to push content below notch */}
      <SafeAreaView edges={['top']} style={styles.safeAreaHeader}>
        <HeroBackground tone="dark" style={styles.hero}>
          <View style={styles.heroInner}>
            <View style={styles.greetRow}>
              <View>
                <Text style={styles.namaste}>NAMASTE 🙏</Text>
                <Text style={styles.morning}>Hello, {PROFILE.name}</Text>
              </View>
              <TouchableOpacity style={styles.bell} activeOpacity={0.7}>
                <Text style={styles.bellEmoji}>🔔</Text>
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>2</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Dynamic Search Bar Trigger */}
            <TouchableOpacity 
              activeOpacity={0.85} 
              onPress={() => navigation.navigate('SymbolSearch')}
              style={styles.searchBarContainer}
            >
              <Text style={styles.searchIcon}>🔍</Text>
              <Text style={styles.searchPlaceholder}>Search stocks, mutual funds...</Text>
            </TouchableOpacity>

            {/* Quick stats card */}
            <Card style={styles.statCard}>
              <View style={styles.statRow}>
                <View>
                  <Text style={styles.statLabel}>VIRTUAL HOLDINGS</Text>
                  <Text style={styles.statValue}>{formatINR(holdingsValue)}</Text>
                  <Text style={styles.statGain}>+{formatINR(gain)} (+{gainPct}%)</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.statLabel}>LEVEL 4 LEARNER</Text>
                  <Text style={styles.statXp}>{PROFILE.xp} XP</Text>
                  <Text style={styles.statLevel}>120 XP to next level</Text>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Today's lesson Progress */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Today's Lesson</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Learn')}>
            <Text style={styles.seeAll}>GO TO SCHOOL</Text>
          </TouchableOpacity>
        </View>

        {/* Market Now */}
        <View style={[styles.sectionHead, { marginTop: spacing.xl }]}>
          <Text style={styles.sectionTitle}>Market Now</Text>
          <Pill
            label={isMarketOpen ? "● LIVE" : "● CLOSED"}
            color={isMarketOpen ? colors.green : colors.pink}
            bg={isMarketOpen ? colors.greenSoft : colors.redSoft}
          />
        </View>

        <Text style={{ ...typography.overline, color: colors.textMuted, marginBottom: spacing.sm }}>
          TOP GAINERS
        </Text>
        <View style={styles.marketRow}>
          {gainers.length > 0 ? (
            gainers.map((m) => {
              const up = m.changePct >= 0;
              const sym = m.symbol.replace("NSE:", "");
              return (
                <Card 
                  key={m.symbol} 
                  style={styles.marketCard}
                  onPress={() => navigation.navigate('StockDetail', { symbol: sym })}
                >
                  <Text style={styles.marketSym}>{sym}</Text>
                  <Text style={styles.marketVal}>{formatINR(m.price)}</Text>
                  <Text style={[styles.marketPct, { color: up ? colors.green : colors.pink }]}>
                    {up ? '↑' : '↓'} {Math.abs(m.changePct).toFixed(2)}%
                  </Text>
                </Card>
              );
            })
          ) : (
            <Text style={{ ...typography.caption, color: colors.textMuted }}>No top gainers active.</Text>
          )}
        </View>

        {losers.length > 0 && (
          <>
            <Text style={{ ...typography.overline, color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm }}>
              TOP LOSERS
            </Text>
            <View style={styles.marketRow}>
              {losers.map((m) => {
                const up = m.changePct >= 0;
                const sym = m.symbol.replace("NSE:", "");
                return (
                  <Card 
                    key={m.symbol} 
                    style={styles.marketCard}
                    onPress={() => navigation.navigate('StockDetail', { symbol: sym })}
                  >
                    <Text style={styles.marketSym}>{sym}</Text>
                    <Text style={styles.marketVal}>{formatINR(m.price)}</Text>
                    <Text style={[styles.marketPct, { color: up ? colors.green : colors.pink }]}>
                      {up ? '↑' : '↓'} {Math.abs(m.changePct).toFixed(2)}%
                    </Text>
                  </Card>
                );
              })}
            </View>
          </>
        )}

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