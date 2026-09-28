/**
 * PracticeScreen — Practice Trading Dashboard.
 * Features:
 * - Green Practice Mode Banner (with Virtual ₹1L guarantee and Reset Account option)
 * - Cash / Invested / Net Worth Summaries
 * - Returns Percentage (+X.XX% / -X.XX%)
 * - Portfolio Equity Curve Sparkline + Individual Stock Trend Sparklines
 * - Actionable BUY / SELL / WHY buttons
 * - Integrated BuyModal, SellModal, and WhyModal
 * - Current Practice Holdings / Positions Quick Access
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import { Card } from '../../../shared/ui/Card';
import { Pill } from '../../../shared/ui/Pill';
import { Sparkline } from '../../../shared/ui/Sparkline';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { MainTabsParamList, RootStackParamList } from '../../../app/navigation/types';
import { marketService } from '../../market/market.service';
import { Stock } from '../../market/market.types';
import { resetPortfolio } from '../../portfolio/slices/portfolioSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import mixpanel from '@core/mixpanel';
import { TOP_PRACTICE_STOCKS, PracticeStock } from '../practice.data';
import { BuyModal } from '../components/BuyModal';
import { SellModal } from '../components/SellModal';
import { WhyModal } from '../components/WhyModal';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Practice'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CATEGORIES = ['All', 'Nifty 50', 'Top Gainers', 'Tech', 'Banking'] as const;
type Category = (typeof CATEGORIES)[number];

export default function PracticeScreen({ navigation }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const cash = useSelector((state: RootState) => state.portfolio.cash);
  const invested = useSelector((state: RootState) => state.portfolio.invested);
  const holdingsValue = useSelector((state: RootState) => state.portfolio.holdingsValue);
  const holdings = useSelector((state: RootState) => state.portfolio.holdings);

  const startingSeed = 100_000; // Virtual ₹1,00,000 seed
  const totalPortfolioValue = cash + holdingsValue;
  const netProfit = totalPortfolioValue - startingSeed;
  const returnsPct = (netProfit / startingSeed) * 100;
  const isOverallPositive = netProfit >= 0;

  const [stocks, setStocks] = useState<PracticeStock[]>(TOP_PRACTICE_STOCKS);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  // Modal states
  const [buyModalStock, setBuyModalStock] = useState<Stock | null>(null);
  const [sellModalStock, setSellModalStock] = useState<Stock | null>(null);
  const [whyModalStock, setWhyModalStock] = useState<PracticeStock | null>(null);

  // Portfolio equity curve sparkline data points
  const portfolioTrend = useMemo(() => {
    const base = 100_000;
    const mid1 = base + netProfit * 0.2;
    const mid2 = base + netProfit * 0.45;
    const mid3 = base + netProfit * 0.7;
    const mid4 = base + netProfit * 0.85;
    return [base, mid1, mid2, mid3, mid4, totalPortfolioValue];
  }, [totalPortfolioValue, netProfit]);

  const loadMarketData = useCallback(async () => {
    try {
      const [quotes, statusRes] = await Promise.all([
        marketService.getTopStocks(),
        marketService.getMarketStatus(),
      ]);

      if (statusRes) {
        setIsMarketOpen(statusRes.isMarketOpen);
      }

      if (Array.isArray(quotes) && quotes.length > 0) {
        // Merge real-time quotes with our practice metadata
        setStocks((prev) =>
          prev.map((item) => {
            const remote = quotes.find(
              (q) => q.symbol.toUpperCase() === item.symbol.toUpperCase()
            );
            if (remote) {
              return {
                ...item,
                price: remote.price,
                changePct: remote.changePct,
                trend: remote.trend?.length ? remote.trend : item.trend,
              };
            }
            return item;
          })
        );
      }
    } catch {
      // Fallback kept intact
    }
  }, []);

  useEffect(() => {
    mixpanel.track('practice_screen_viewed', {
      available_balance: cash,
      holdings_count: holdings.length,
      unrealized_pnl: netProfit,
    });

    loadMarketData();
  }, [loadMarketData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMarketData();
    setRefreshing(false);
  };

  const handleResetAccount = () => {
    Alert.alert(
      'Reset Practice Balance?',
      'This will reset your virtual funds back to ₹1,00,000 and clear practice open positions. You can practice again from scratch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to ₹1,00,000',
          style: 'destructive',
          onPress: () => {
            mixpanel.track('paper_reset_confirmed', {
              previous_balance: cash,
              previous_pnl: netProfit,
              reset_reason: 'user_manual_reset',
            });
            dispatch(resetPortfolio());
          },
        },
      ]
    );
  };

  // Filter stocks by category
  const filteredStocks = useMemo(() => {
    if (selectedCategory === 'All') return stocks;
    if (selectedCategory === 'Nifty 50') return stocks.slice(0, 5);
    if (selectedCategory === 'Top Gainers') return stocks.filter((s) => s.changePct > 0);
    if (selectedCategory === 'Tech') return stocks.filter((s) => s.sector === 'IT Services');
    if (selectedCategory === 'Banking') return stocks.filter((s) => s.sector === 'Banking');
    return stocks;
  }, [stocks, selectedCategory]);

  const handleStockTap = (stock: PracticeStock) => {
    mixpanel.track('stock_tapped', {
      symbol: stock.symbol,
      company_name: stock.name,
      source: 'practice_screen',
      ltp: stock.price,
    });
  };

  const handleOpenBuy = (stock: PracticeStock | Stock) => {
    mixpanel.track('buy_modal_opened', {
      symbol: stock.symbol,
      company_name: stock.name,
      current_ltp: stock.price,
      source: 'practice_screen',
      is_paper: true,
      available_balance: cash,
    });
    setBuyModalStock(stock);
  };

  const handleOpenSell = (stock: PracticeStock | Stock) => {
    const userHolding = holdings.find((h) => h.symbol.toUpperCase() === stock.symbol.toUpperCase());
    mixpanel.track('sell_modal_opened', {
      symbol: stock.symbol,
      company_name: stock.name,
      current_ltp: stock.price,
      source: 'practice_screen',
      is_paper: true,
      quantity_owned: userHolding?.shares || 0,
    });
    setSellModalStock(stock);
  };

  const handleOpenWhy = (stock: PracticeStock) => {
    setWhyModalStock(stock);
  };

  const handleTradeSuccess = (data: {
    symbol: string;
    shares: number;
    pricePerShare: number;
    totalPaid: number;
    xpEarned: number;
    clientOrderId: string;
    mode: 'buy' | 'sell';
  }) => {
    setBuyModalStock(null);
    setSellModalStock(null);
    navigation.navigate('TradeSuccess', {
      symbol: data.symbol,
      shares: data.shares,
      pricePerShare: data.pricePerShare,
      totalPaid: data.totalPaid,
      xpEarned: data.xpEarned,
      mode: data.mode,
      clientOrderId: data.clientOrderId,
    });
  };

  return (
    <View style={styles.root}>
      {/* 1. GREEN BANNER: Practice Mode Virtual Capital Header */}
      <LinearGradient
        colors={['#062A1B', '#0B3B26', '#052317']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.greenBanner}
      >
        <SafeAreaView edges={['top']}>
          <View style={styles.bannerInner}>
            {/* Banner Top Badge & Reset button */}
            <View style={styles.bannerTopRow}>
              <View style={styles.bannerPill}>
                <View style={styles.liveGreenDot} />
                <Text style={styles.bannerPillText}>PRACTICE TRADING · NO REAL MONEY</Text>
              </View>

              <TouchableOpacity style={styles.resetBtn} onPress={handleResetAccount}>
                <Text style={styles.resetBtnText}>🔄 Reset ₹1L</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.bannerTitle}>🎮 Paper Trading</Text>
            <Text style={styles.bannerSubtitle}>
              Test strategies with real NSE market quotes — 100% risk-free.
            </Text>

            {/* 2. CASH / INVESTED / RETURNS SUMMARIES CARD */}
            <View style={styles.portfolioCard}>
              <View style={styles.portfolioCardTop}>
                <View>
                  <Text style={styles.portfolioLabel}>TOTAL PRACTICE VALUE</Text>
                  <Text style={styles.portfolioValue}>{formatINR(totalPortfolioValue)}</Text>
                </View>

                {/* 3. RETURNS PERCENTAGE BADGE */}
                <View
                  style={[
                    styles.returnsBadge,
                    { backgroundColor: isOverallPositive ? 'rgba(52,211,153,0.18)' : 'rgba(244,63,94,0.18)' },
                  ]}
                >
                  <Text
                    style={[
                      styles.returnsPctText,
                      { color: isOverallPositive ? colors.greenBright : colors.pink },
                    ]}
                  >
                    {isOverallPositive ? '▲ +' : '▼ '}
                    {returnsPct >= 0 ? '+' : ''}
                    {returnsPct.toFixed(2)}%
                  </Text>
                  <Text style={styles.returnsSubText}>Overall Return</Text>
                </View>
              </View>

              {/* 4. EQUITY CURVE SPARKLINE */}
              <View style={styles.sparklineContainer}>
                <View style={styles.sparklineHeader}>
                  <Text style={styles.sparklineTitle}>Performance Trajectory</Text>
                  <Text
                    style={[
                      styles.netProfitText,
                      { color: isOverallPositive ? colors.greenBright : colors.pink },
                    ]}
                  >
                    {isOverallPositive ? '+' : ''}
                    {formatINR(netProfit)} P&L
                  </Text>
                </View>
                <Sparkline
                  data={portfolioTrend}
                  width={310}
                  height={52}
                  color={isOverallPositive ? colors.greenBright : colors.pink}
                  fill={true}
                />
              </View>

              {/* Cash & Invested Breakdown Row */}
              <View style={styles.statRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>AVAILABLE CASH</Text>
                  <Text style={styles.statNumber}>{formatINR(cash)}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>TOTAL INVESTED</Text>
                  <Text style={styles.statNumber}>{formatINR(invested)}</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>HOLDINGS VALUE</Text>
                  <Text style={[styles.statNumber, { color: colors.white }]}>
                    {formatINR(holdingsValue)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Main Scrollable Sheet */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.sheetContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.green} />
        }
      >
        {/* Practice Positions Quick Card if user has active holdings */}
        {holdings.length > 0 && (
          <View style={styles.holdingsSection}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Your Practice Positions ({holdings.length})</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Portfolio')}>
                <Text style={styles.seeAllText}>View All →</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.holdingScroll}>
              {holdings.map((h) => {
                const pnl = (h.currentPrice - h.avgPrice) * h.shares;
                const isGain = pnl >= 0;
                return (
                  <View key={h.symbol} style={styles.holdingMiniCard}>
                    <View style={styles.holdingMiniHead}>
                      <Text style={styles.holdingMiniEmoji}>{h.emoji}</Text>
                      <View>
                        <Text style={styles.holdingMiniSym}>{h.symbol}</Text>
                        <Text style={styles.holdingMiniShares}>{h.shares} shares</Text>
                      </View>
                    </View>
                    <View style={styles.holdingMiniBottom}>
                      <Text style={styles.holdingMiniVal}>{formatINR(h.currentPrice * h.shares)}</Text>
                      <Text
                        style={[
                          styles.holdingMiniPnl,
                          { color: isGain ? colors.green : colors.pink },
                        ]}
                      >
                        {isGain ? '+' : ''}
                        {formatINR(pnl)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.quickSellBtn}
                      onPress={() => {
                        const targetStock = stocks.find((s) => s.symbol === h.symbol) || {
                          symbol: h.symbol,
                          name: h.name,
                          price: h.currentPrice,
                          changePct: 0.5,
                          trend: [h.avgPrice, h.currentPrice],
                          emoji: h.emoji,
                          sector: 'Holding',
                          whyReason: '',
                        };
                        handleOpenSell(targetStock);
                      }}
                    >
                      <Text style={styles.quickSellText}>Sell</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Section Header: Top Stocks & Live Indicator */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Top Stocks to Practice</Text>
          <Pill
            label={isMarketOpen ? '● NSE LIVE' : '● SIMULATED'}
            color={isMarketOpen ? colors.green : colors.amber}
            bg={isMarketOpen ? colors.greenSoft : '#FEF3C7'}
          />
        </View>

        {/* Category Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {CATEGORIES.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* 5. STOCKS LIST WITH SPARKLINES, BUY / SELL / WHY */}
        {filteredStocks.map((stock) => {
          const up = stock.changePct >= 0;
          const tint = up ? colors.green : colors.pink;
          const chartBg = up ? '#EAFBF3' : colors.redSoft;

          return (
            <Card key={stock.symbol} style={styles.stockCard} onPress={() => handleStockTap(stock)}>
              {/* Card Header */}
              <View style={styles.stockHead}>
                <View style={styles.stockInfo}>
                  <View style={styles.symRow}>
                    <Text style={styles.stockSym}>{stock.symbol}</Text>
                    <View style={styles.sectorBadge}>
                      <Text style={styles.sectorBadgeText}>{stock.sector}</Text>
                    </View>
                  </View>
                  <Text style={styles.stockName}>{stock.name}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.stockPrice}>{formatINR(stock.price)}</Text>
                  <Text style={[styles.stockPct, { color: tint }]}>
                    {up ? '▲ +' : '▼ '}
                    {Math.abs(stock.changePct)}% today
                  </Text>
                </View>
              </View>

              {/* Individual Stock Sparkline Chart */}
              <View style={[styles.stockChartWrap, { backgroundColor: chartBg }]}>
                <Sparkline data={stock.trend} width={290} height={50} color={tint} fill={true} />
              </View>

              {/* Action Buttons: BUY, SELL, WHY */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.buyBtn]}
                  onPress={() => handleOpenBuy(stock)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buyBtnText}>▲ BUY</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.sellBtn]}
                  onPress={() => handleOpenSell(stock)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.sellBtnText}>▼ SELL</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionBtn, styles.whyBtn]}
                  onPress={() => handleOpenWhy(stock)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.whyBtnText}>💡 WHY</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Embedded Modals */}
      {buyModalStock && (
        <BuyModal
          visible={!!buyModalStock}
          stock={buyModalStock}
          onClose={() => setBuyModalStock(null)}
          onSuccess={handleTradeSuccess}
          onSwitchToSell={() => {
            const current = buyModalStock;
            setBuyModalStock(null);
            setSellModalStock(current);
          }}
        />
      )}

      {sellModalStock && (
        <SellModal
          visible={!!sellModalStock}
          stock={sellModalStock}
          onClose={() => setSellModalStock(null)}
          onSuccess={handleTradeSuccess}
          onSwitchToBuy={() => {
            const current = sellModalStock;
            setSellModalStock(null);
            setBuyModalStock(current);
          }}
        />
      )}

      <WhyModal
        visible={!!whyModalStock}
        stock={whyModalStock}
        onClose={() => setWhyModalStock(null)}
        onBuyPress={(s) => {
          setWhyModalStock(null);
          handleOpenBuy(s);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  greenBanner: {
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  bannerInner: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xs,
  },
  bannerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  bannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 6,
  },
  liveGreenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.greenBright,
  },
  bannerPillText: {
    ...typography.overline,
    fontSize: 9,
    color: colors.greenBright,
    letterSpacing: 0.8,
  },
  resetBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  bannerTitle: {
    ...typography.h1,
    color: colors.textOnDark,
    marginTop: spacing.xs,
  },
  bannerSubtitle: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMutedDark,
    marginTop: 2,
  },
  portfolioCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  portfolioCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  portfolioLabel: {
    ...typography.overline,
    fontSize: 10,
    color: colors.textMutedDark,
    letterSpacing: 1,
  },
  portfolioValue: {
    ...typography.hero,
    fontSize: 28,
    color: colors.textOnDark,
    marginTop: 2,
  },
  returnsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.md,
    alignItems: 'flex-end',
  },
  returnsPctText: {
    ...typography.bodyBold,
    fontSize: 14,
  },
  returnsSubText: {
    fontSize: 10,
    color: colors.textMutedDark,
    marginTop: 1,
  },
  sparklineContainer: {
    marginTop: spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: radius.md,
    padding: spacing.sm,
    alignItems: 'center',
  },
  sparklineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  sparklineTitle: {
    fontSize: 10,
    color: colors.textMutedDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  netProfitText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textMutedDark,
    letterSpacing: 0.5,
  },
  statNumber: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textOnDark,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  sheetContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  holdingsSection: {
    marginBottom: spacing.xs,
  },
  seeAllText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.purple,
  },
  holdingScroll: {
    marginTop: spacing.sm,
    flexDirection: 'row',
  },
  holdingMiniCard: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginRight: spacing.sm,
    width: 160,
    borderWidth: 1,
    borderColor: colors.border,
  },
  holdingMiniHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  holdingMiniEmoji: { fontSize: 20 },
  holdingMiniSym: { ...typography.bodyBold, fontSize: 13, color: colors.text },
  holdingMiniShares: { fontSize: 11, color: colors.textMuted },
  holdingMiniBottom: {
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holdingMiniVal: { ...typography.caption, fontWeight: '700', color: colors.text },
  holdingMiniPnl: { fontSize: 11, fontWeight: '700' },
  quickSellBtn: {
    backgroundColor: colors.redSoft,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  quickSellText: { fontSize: 11, fontWeight: '800', color: colors.pink },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 20,
    color: colors.text,
  },
  filterScroll: {
    flexDirection: 'row',
    marginTop: 2,
    marginBottom: spacing.xs,
  },
  filterChip: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  filterChipText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: colors.white,
  },
  stockCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  stockHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stockInfo: { flex: 1 },
  symRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stockSym: {
    ...typography.h3,
    color: colors.text,
  },
  sectorBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  sectorBadgeText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  stockName: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  stockPrice: {
    ...typography.h3,
    color: colors.text,
  },
  stockPct: {
    ...typography.caption,
    fontWeight: '700',
    marginTop: 2,
  },
  stockChartWrap: {
    borderRadius: radius.md,
    marginTop: spacing.md,
    paddingVertical: 4,
    alignItems: 'center',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyBtn: {
    backgroundColor: '#E6FAF1',
  },
  buyBtnText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.green,
  },
  sellBtn: {
    backgroundColor: colors.redSoft,
  },
  sellBtnText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.pink,
  },
  whyBtn: {
    backgroundColor: colors.indigoChip,
  },
  whyBtnText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.purple,
  },
});