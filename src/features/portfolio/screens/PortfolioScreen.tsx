/** Screen 08 — Portfolio. Plain-English P&L, "Why changed?", holdings. */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';
import { Card } from '../../../shared/ui/Card';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR, formatPct } from '../../../shared/format';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../app/store';
import { resetPortfolio, fetchPortfolioSummary } from '../slices/portfolioSlice';
import mixpanel from '@core/mixpanel';

const TABS = ['HOLDINGS', 'MUT. FUNDS', 'P&L REPORT'] as const;
type Tab = (typeof TABS)[number];
type Lang = 'en' | 'hi' | 'te';

export default function PortfolioScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const token = useSelector((state: RootState) => (state.auth as any).accessToken);
  const preferredLanguage = useSelector((state: RootState) => (state.auth as any).language || 'English');
  const holdings = useSelector((state: RootState) => state.portfolio.holdings);
  const holdingsValue = useSelector((state: RootState) => state.portfolio.holdingsValue);
  const cash = useSelector((state: RootState) => state.portfolio.cash);
  const starting = 100_000;
  const [tab, setTab] = useState<Tab>('HOLDINGS');
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const totalValue = cash + holdingsValue;
  const gain = totalValue - starting;
  const gainPct = (gain / starting) * 100;

  useEffect(() => {
    dispatch(fetchPortfolioSummary());
    
    // Track portfolio viewed with exact Week 2 spec parameters
    mixpanel.track('portfolio_viewed', {
      holdings_count: holdings.length,
      total_invested: starting,
      current_value: totalValue,
      total_pnl: gain,
      total_pnl_pct: gainPct,
      has_mf_holdings: false,
      has_stock_holdings: holdings.length > 0,
    });
  }, []);

  const handleFetchAiInsight = async () => {
    setLoadingAi(true);
    setAiInsight(null);
    mixpanel.track('ai_insight_requested', { language: preferredLanguage });

    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(
        API_ENDPOINTS.PORTFOLIO.AI_INSIGHT,
        { language: preferredLanguage },
        { headers }
      );
      if (res.data && res.data.insight) {
        setAiInsight(res.data.insight);
      } else {
        setAiInsight('Unable to generate AI insight at this time. Please try again.');
      }
    } catch (err: any) {
      console.warn('AI Insight Error:', err.message);
      setAiInsight('AI service is taking longer than expected. Please tap refresh to try again.');
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          {/* Interactive AI Portfolio Insight Card */}
          <View style={styles.insight}>
            <View style={{ flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' }}>
              <Text style={styles.insightIcon}>🤖</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.insightTitle}>AI Portfolio Insight</Text>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#92722A', opacity: 0.8 }}>
                    🌐 {preferredLanguage}
                  </Text>
                </View>

                {loadingAi ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <ActivityIndicator size="small" color="#92722A" />
                    <Text style={styles.insightText}>✨ Fetching AI insight in {preferredLanguage}...</Text>
                  </View>
                ) : aiInsight ? (
                  <View style={{ marginTop: 8 }}>
                    <Text style={styles.insightText}>{aiInsight}</Text>
                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                      <TouchableOpacity style={styles.fetchAiBtn} onPress={handleFetchAiInsight}>
                        <Text style={styles.fetchAiBtnText}>🔄 Refresh AI Insight</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.hideBtn} onPress={() => setAiInsight(null)}>
                        <Text style={styles.hideBtnText}>✕ Close</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <View style={{ marginTop: 4 }}>
                    <Text style={styles.insightText}>
                      Get an instant AI explanation of your stock holdings & market trend in {preferredLanguage}.
                    </Text>
                    <TouchableOpacity style={[styles.fetchAiBtn, { marginTop: 12, alignSelf: 'flex-start' }]} onPress={handleFetchAiInsight}>
                      <Text style={styles.fetchAiBtnText}>✨ View AI Portfolio Insight</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
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
  insight: { backgroundColor: colors.yellowCard, borderRadius: radius.md, padding: spacing.lg },
  insightIcon: { fontSize: 24 },
  insightTitle: { ...typography.bodyBold, color: '#92722A', fontSize: 16 },
  insightText: { ...typography.body, color: '#92722A', marginTop: spacing.xs, lineHeight: 22 },
  langContainer: { flexDirection: 'row', gap: 4, backgroundColor: 'rgba(146, 114, 42, 0.12)', borderRadius: 12, padding: 2 },
  langPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  langPillActive: { backgroundColor: '#92722A' },
  langPillText: { fontSize: 11, fontWeight: '700', color: '#92722A' },
  langPillTextActive: { color: '#FFF' },
  fetchAiBtn: { backgroundColor: '#92722A', borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 8 },
  fetchAiBtnText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  hideBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#92722A', borderRadius: radius.md, paddingHorizontal: 12, paddingVertical: 8 },
  hideBtnText: { color: '#92722A', fontWeight: '700', fontSize: 13 },
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