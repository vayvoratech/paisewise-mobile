/** Screen 08 — Portfolio. Plain-English P&L, "Why changed?", holdings. */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Card } from '../../../shared/ui/Card';
import { Pill } from '../../../shared/ui/Pill';
import { Sparkline } from '../../../shared/ui/Sparkline';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR, formatPct } from '../../../shared/format';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
; // Adjust import based on your store slice
import { resetPortfolio } from '../slices/portfolioSlice';
import mixpanel from '@core/mixpanel'; // Import mixpanel

const TABS = ['HOLDINGS', 'MUT. FUNDS', 'P&L REPORT'] as const;
type Tab = (typeof TABS)[number];

const VALUE_SERIES = [98000, 99200, 98600, 100200, 101000, 100400, 102100, 103200, 103800, 104320];

export default function PortfolioScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const holdings = useSelector((state: RootState) => state.portfolio.holdings);
  const holdingsValue = useSelector((state: RootState) => state.portfolio.holdingsValue);
  const cash = useSelector((state: RootState) => state.portfolio.cash);
  const starting = 100_000;
  const [tab, setTab] = useState<Tab>('HOLDINGS');
  const totalValue = cash + holdingsValue;
  const gain = totalValue - starting;
  const gainPct = (gain / starting) * 100;

  // Track paper_portfolio_viewed when the Portfolio screen loads
  useEffect(() => {
    mixpanel.track('paper_portfolio_viewed', {
      total_portfolio_value: totalValue,
      device_type: Platform.OS,
    });
  }, [totalValue]);

  // Handle Portfolio Reset with Mixpanel tracking
  const handleResetRequest = () => {
    mixpanel.track('paper_reset_requested', {
      current_portfolio_value: totalValue,
    });

    Alert.alert(
      'Reset Portfolio',
      'Are you sure you want to reset your practice portfolio back to ₹1,00,000?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            mixpanel.track('paper_reset_confirmed', {
              previous_value: totalValue,
            });
            dispatch(resetPortfolio());
          },
        },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <HeroBackground tone="dark" style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroInner}>
            <View style={styles.topRow}>
              <Text style={styles.label}>MY PORTFOLIO</Text>
              <TouchableOpacity onPress={handleResetRequest}>
                <Pill label="● PRACTICE (RESET)" color={colors.greenBright} bg="rgba(45,227,164,0.1)" borderColor="rgba(45,227,164,0.4)" />
              </TouchableOpacity>
            </View>
            <Text style={styles.total}>{formatINR(totalValue)}</Text>
            <Text style={styles.gain}>
              {gain >= 0 ? '↑' : '↓'} {formatINR(gain)} ({formatPct(gainPct)}) <Text style={styles.gainMuted}>since you started</Text>
            </Text>

            <View style={styles.chart}>
              <Sparkline data={VALUE_SERIES} width={320} height={90} color={colors.greenBright} />
            </View>

            <View style={styles.tabs}>
              {TABS.map((t) => (
                <TouchableOpacity key={t} onPress={() => setTab(t)} style={styles.tabItem}>
                  <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
                  {tab === t && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </HeroBackground>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
        {/* Why insight */}
        <View style={styles.insight}>
          <Text style={styles.insightIcon}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.insightTitle}>Why is portfolio up today?</Text>
            <Text style={styles.insightText}>Reliance rose 1.2% — RBI kept interest rates unchanged. Good news for big companies!</Text>
          </View>
        </View>

        {tab === 'HOLDINGS' &&
          holdings.map((h) => {
            const change = (h.currentPrice - h.avgPrice) * h.shares;
            const changePct = ((h.currentPrice - h.avgPrice) / h.avgPrice) * 100;
            const up = change >= 0;
            const tint = up ? colors.green : colors.pink;
            return (
              <Card key={h.symbol} style={styles.holding}>
                <View style={styles.holdingHead}>
                  <View style={[styles.holdingIcon, { backgroundColor: up ? '#FDEBDD' : '#DDE7FB' }]}>
                    <Text style={{ fontSize: 22 }}>{h.emoji}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.holdingSym}>{h.symbol}</Text>
                    <Text style={styles.holdingMeta}>{h.shares} shares · avg {formatINR(h.avgPrice)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.holdingValue}>{formatINR(h.currentPrice * h.shares)}</Text>
                    <Text style={[styles.holdingChange, { color: tint }]}>{up ? '↑' : '↓'} {up ? '+' : ''}{formatINR(change)} ({changePct.toFixed(1)}%)</Text>
                  </View>
                </View>
                <View style={styles.holdingNote}>
                  <Text style={styles.holdingNoteText}>{h.note}</Text>
                </View>
              </Card>
            );
          })}

        {tab === 'MUT. FUNDS' && <Empty text="No mutual funds yet. Start a SIP from the Learn tab!" />}
        {tab === 'P&L REPORT' && <Empty text={`Net practice P&L: ${formatINR(gain)} (${formatPct(gainPct)})`} />}
      </ScrollView>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Card style={{ marginTop: spacing.lg, alignItems: 'center', paddingVertical: spacing.xxl }}>
      <Text style={{ ...typography.body, color: colors.textMuted, textAlign: 'center' }}>{text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  hero: { flexGrow: 0 },
  heroInner: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.overline, color: colors.textMutedDark },
  total: { ...typography.hero, fontSize: 44, color: colors.textOnDark, marginTop: spacing.sm },
  gain: { ...typography.bodyBold, color: colors.greenBright, marginTop: spacing.xs },
  gainMuted: { color: colors.textMutedDark, fontWeight: '400' },
  chart: { marginTop: spacing.md, alignItems: 'center' },
  tabs: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.lg },
  tabItem: { paddingBottom: spacing.md },
  tabText: { ...typography.overline, color: colors.textMutedDark },
  tabTextActive: { color: colors.amber },
  tabUnderline: { height: 3, backgroundColor: colors.amber, borderRadius: 2, marginTop: spacing.sm },
  sheet: { flex: 1, backgroundColor: colors.surfaceAlt, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl },
  sheetContent: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  insight: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.yellowCard, borderRadius: radius.md, padding: spacing.lg },
  insightIcon: { fontSize: 22 },
  insightTitle: { ...typography.bodyBold, color: '#92722A' },
  insightText: { ...typography.body, color: '#92722A', marginTop: spacing.xs, lineHeight: 22 },
  holding: {},
  holdingHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  holdingIcon: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  holdingSym: { ...typography.h3, color: colors.text },
  holdingMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  holdingValue: { ...typography.h3, color: colors.text },
  holdingChange: { ...typography.caption, marginTop: 2 },
  holdingNote: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md },
  holdingNoteText: { ...typography.body, color: colors.textFaint, lineHeight: 22 },
});