/** Screen 08 — Portfolio. Plain-English P&L, "Why changed?", holdings. */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../shared/ui/Card';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR, formatPct } from '../../../shared/format';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { resetPortfolio } from '../slices/portfolioSlice';
import mixpanel from '@core/mixpanel';

const TABS = ['HOLDINGS', 'MUT. FUNDS', 'P&L REPORT'] as const;
type Tab = (typeof TABS)[number];

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

  useEffect(() => {
    mixpanel.track('paper_portfolio_viewed', {
      total_portfolio_value: totalValue,
      device_type: Platform.OS,
    });
  }, [totalValue]);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          {/* Why insight */}
          <View style={styles.insight}>
            <Text style={styles.insightIcon}>💡</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.insightTitle}>Why is portfolio up today?</Text>
              <Text style={styles.insightText}>Reliance rose 1.2% — RBI kept interest rates unchanged. Good news for big companies!</Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            {TABS.map((t) => (
              <TouchableOpacity key={t} onPress={() => setTab(t)} style={styles.tabItem}>
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
                {tab === t && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <Card style={{ marginTop: spacing.md, alignItems: 'center', paddingVertical: spacing.xxl }}>
      <Text style={{ ...typography.body, color: colors.textMuted, textAlign: 'center' }}>{text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  scrollContent: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: 120 },
  sheet: { gap: spacing.lg },
  insight: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.yellowCard, borderRadius: radius.md, padding: spacing.lg },
  insightIcon: { fontSize: 22 },
  insightTitle: { ...typography.bodyBold, color: '#92722A' },
  insightText: { ...typography.body, color: '#92722A', marginTop: spacing.xs, lineHeight: 22 },
  tabsContainer: { flexDirection: 'row', justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: colors.border, paddingBottom: spacing.sm, marginTop: spacing.xs },
  tabItem: { paddingBottom: spacing.xs, position: 'relative' },
  tabText: { ...typography.overline, color: colors.textMuted },
  tabTextActive: { color: colors.purple, fontWeight: '700' },
  tabUnderline: { height: 3, backgroundColor: colors.purple, borderRadius: 2, position: 'absolute', bottom: -7, left: 0, right: 0 },
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