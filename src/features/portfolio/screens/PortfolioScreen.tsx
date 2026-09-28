/** Screen 08 — Portfolio. Plain-English P&L, "Why changed?", holdings. */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card } from '../../../shared/ui/Card';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR, formatPct } from '../../../shared/format';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import type { RootState, AppDispatch } from '../../../app/store';
import { resetPortfolio } from '../slices/portfolioSlice';
import mixpanel from '@core/mixpanel';

const TABS = ['HOLDINGS', 'MUT. FUNDS', 'P&L REPORT'] as const;
type Tab = (typeof TABS)[number];

export default function PortfolioScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();
  const holdings = useSelector((state: RootState) => state.portfolio.holdings);
  const holdingsValue = useSelector((state: RootState) => state.portfolio.holdingsValue);
  const mfHoldings = useSelector((state: RootState) => state.mfPortfolio.holdings);
  const cash = useSelector((state: RootState) => state.portfolio.cash);
  const starting = 100_000;
  const [tab, setTab] = useState<Tab>('HOLDINGS');
  const totalValue = cash + holdingsValue;
  const gain = totalValue - starting;
  const gainPct = (gain / starting) * 100;

  useEffect(() => {
    // 1. Track portfolio viewed with exact Week 2 spec parameters
    mixpanel.track('portfolio_viewed', {
      holdings_count: holdings.length,
      total_invested: starting,
      current_value: totalValue,
      total_pnl: gain,
      total_pnl_pct: gainPct,
      has_mf_holdings: false, // Update if your slice tracks mutual funds
      has_stock_holdings: holdings.length > 0,
    });

    // 2. Track AI insight viewed since the insight card renders on mount
    mixpanel.track('ai_insight_viewed', {
      insight_scope: 'portfolio',
      holding_id: null,
      insight_category: 'market_movement',
    });
  }, []);

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
              <TouchableOpacity 
                key={t} 
                onPress={() => {
                  setTab(t);
                  mixpanel.track('portfolio_tab_changed', { selected_tab: t });
                }} 
                style={styles.tabItem}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{t}</Text>
                {tab === t && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </View>

          {tab === 'HOLDINGS' &&
            holdings.map((h, index) => {
              const change = (h.currentPrice - h.avgPrice) * h.shares;
              const changePct = ((h.currentPrice - h.avgPrice) / h.avgPrice) * 100;
              const up = change >= 0;
              const tint = up ? colors.green : colors.pink;
              return (
                <TouchableOpacity
                  key={h.symbol}
                  activeOpacity={0.9}
                  onPress={() => {
                    // Track holding tapped as per spec
                    mixpanel.track('holding_tapped', {
                      holding_id: h.symbol,
                      holding_type: 'stock',
                      symbol_or_fund_id: h.symbol,
                      source_position: index + 1,
                    });
                  }}
                >
                  <Card style={styles.holding}>
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
                </TouchableOpacity>
              );
            })}

          {tab === 'MUT. FUNDS' && (
            <View style={{ gap: spacing.md }}>
              <Card style={{ backgroundColor: '#1E1B4B', padding: spacing.lg, borderRadius: radius.lg }}>
                <Text style={{ ...typography.overline, color: 'rgba(255,255,255,0.7)' }}>MUTUAL FUNDS VALUATION</Text>
                <Text style={{ ...typography.hero, color: colors.white, marginTop: 4 }}>
                  {formatINR(mfHoldings.reduce((sum, h) => sum + h.currentValue, 0))}
                </Text>
                <Text style={{ ...typography.caption, color: colors.greenBright, marginTop: 2 }}>
                  +{formatINR(mfHoldings.reduce((sum, h) => sum + h.totalReturns, 0))} overall returns
                </Text>
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('MFPortfolio')}
                    style={{ flex: 1, backgroundColor: colors.purple, paddingVertical: spacing.sm, borderRadius: radius.md, alignItems: 'center' }}
                  >
                    <Text style={{ color: colors.white, fontWeight: '700', fontSize: 13 }}>Open MF Portfolio</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('SIPSetup')}
                    style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: spacing.sm, borderRadius: radius.md, alignItems: 'center' }}
                  >
                    <Text style={{ color: colors.white, fontWeight: '700', fontSize: 13 }}>+ Start SIP</Text>
                  </TouchableOpacity>
                </View>
              </Card>

              {mfHoldings.slice(0, 3).map((h) => (
                <TouchableOpacity key={h.id} onPress={() => navigation.navigate('MFPortfolio')}>
                  <Card style={styles.holding}>
                    <View style={styles.holdingHead}>
                      <View style={[styles.holdingIcon, { backgroundColor: '#F3E8FF' }]}>
                        <Text style={{ fontSize: 20 }}>📊</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.holdingSym} numberOfLines={1}>{h.fundName}</Text>
                        <Text style={styles.holdingMeta}>{h.units.toFixed(2)} units · NAV {formatINR(h.currentNav)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.holdingValue}>{formatINR(h.currentValue)}</Text>
                        <Text style={[styles.holdingChange, { color: colors.green }]}>+{h.xirr}% XIRR</Text>
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {tab === 'P&L REPORT' && (
            <View style={{ gap: spacing.md }}>
              <Card style={{ padding: spacing.lg }}>
                <Text style={{ ...typography.h3, color: colors.text }}>Capital Gains & Tax Estimator</Text>
                <Text style={{ ...typography.body, color: colors.textMuted, marginTop: 4, fontSize: 13 }}>
                  View LTCG (Section 112A), STCG (Section 111A), ELSS 80C benefits, and download official PDF tax statement.
                </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('TaxReport')}
                  style={{ backgroundColor: colors.purple, paddingVertical: spacing.md, borderRadius: radius.md, alignItems: 'center', marginTop: spacing.md }}
                >
                  <Text style={{ color: colors.white, fontWeight: '700', fontSize: 14 }}>🧾 View Capital Gains Tax Report</Text>
                </TouchableOpacity>
              </Card>

              <Card style={{ padding: spacing.lg, backgroundColor: colors.surfaceMuted }}>
                <Text style={{ ...typography.overline, color: colors.textMuted }}>NET PRACTICE PORTFOLIO P&L</Text>
                <Text style={{ ...typography.h2, color: gain >= 0 ? colors.green : colors.pink, marginTop: 4 }}>
                  {gain >= 0 ? '+' : ''}{formatINR(gain)} ({formatPct(gainPct)})
                </Text>
              </Card>
            </View>
          )}
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
  tabUnderline: { height: 3, backgroundColor: colors.purple, borderRadius: radius.md, position: 'absolute', bottom: -7, left: 0, right: 0 },
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