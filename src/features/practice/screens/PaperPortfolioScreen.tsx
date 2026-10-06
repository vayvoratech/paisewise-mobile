/**
 * PaperPortfolioScreen — Practice Portfolio Dashboard with:
 * - Real-time Portfolio Valuation, Invested, and Cash breakdown
 * - Victory Native Area Chart with 1D, 1W, 1M intervals
 * - Interactive Holdings Cards with live P&L, plain-English notes, and Quick Buy/Sell
 * - Open Limit Orders section with real-time target distance and active Cancel button
 * - Order cancellation confirmation modal with virtual cash refund
 * - Order History view with executed and cancelled orders
 */
import React, { useState, useMemo, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSelector, useDispatch } from 'react-redux';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR, formatPct } from '../../../shared/format';
import { RootStackParamList } from '../../../app/navigation/types';
import type { RootState, AppDispatch } from '../../../app/store';
import { resetPortfolio, refundCash } from '../../portfolio/slices/portfolioSlice';
import { cancelOrder, Order } from '../slices/orderSlice';
import { Holding } from '../../portfolio/portfolio.types';
import { TOP_PRACTICE_STOCKS } from '../practice.data';
import { Stock } from '../../market/market.types';
import { PaperPortfolioChart } from '../components/PaperPortfolioChart';
import { BuyModal } from '../components/BuyModal';
import { SellModal } from '../components/SellModal';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';
import mixpanel from '@core/mixpanel';

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type TabKey = 'ALL' | 'HOLDINGS' | 'OPEN_ORDERS' | 'HISTORY';

export default function PaperPortfolioScreen() {
  const navigation = useNavigation<NavProp>();
  const dispatch = useDispatch<AppDispatch>();

  // Portfolio Redux state
  const cash = useSelector((state: RootState) => state.portfolio.cash);
  const invested = useSelector((state: RootState) => state.portfolio.invested);
  const holdingsValue = useSelector((state: RootState) => state.portfolio.holdingsValue);
  const holdings = useSelector((state: RootState) => state.portfolio.holdings);
  const orders = useSelector((state: RootState) => state.order.orders);

  const startingSeed = 100_000;
  const totalPortfolioValue = cash + holdingsValue;
  const totalGain = totalPortfolioValue - startingSeed;
  const totalGainPct = (totalGain / startingSeed) * 100;
  const isOverallPositive = totalGain >= 0;

  // Active tab filter
  const [activeTab, setActiveTab] = useState<TabKey>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  // Order cancellation state
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);

  // Trading modal states
  const [selectedStockForTrade, setSelectedStockForTrade] = useState<Stock | null>(null);
  const [tradeModalMode, setTradeModalMode] = useState<'buy' | 'sell' | null>(null);

  // Filter orders
  const openLimitOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'OPEN' || (!o.status && o.orderCategory === 'LIMIT')
    );
  }, [orders]);

  const pastOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'EXECUTED' || o.status === 'CANCELLED'
    );
  }, [orders]);

  // Track screen entry
  useEffect(() => {
    mixpanel.track('paper_portfolio_screen_viewed', {
      total_portfolio_value: totalPortfolioValue,
      cash_balance: cash,
      holdings_count: holdings.length,
      open_limit_orders_count: openLimitOrders.length,
      unrealized_pnl: totalGain,
    });
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  };

  // Reset virtual account handler
  const handleResetPortfolio = () => {
    Alert.alert(
      'Reset Practice Portfolio?',
      'This will reset your virtual funds back to ₹1,00,000 and clear all practice holdings and open orders.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to ₹1,00,000',
          style: 'destructive',
          onPress: () => {
            dispatch(resetPortfolio());
            mixpanel.track('paper_portfolio_reset', {
              previous_value: totalPortfolioValue,
              previous_gain: totalGain,
            });
          },
        },
      ]
    );
  };

  // Cancel Limit Order Confirmation
  const promptCancelOrder = (order: Order) => {
    setOrderToCancel(order);
  };

  const handleConfirmCancelOrder = () => {
    if (!orderToCancel) return;

    const orderId = orderToCancel.id || orderToCancel.clientOrderId || '';
    dispatch(cancelOrder(orderId));

    // If it was a BUY limit order, refund the reserved cash back to the virtual balance
    if (orderToCancel.type === 'BUY' && orderToCancel.limitPrice && orderToCancel.shares) {
      const refundAmount = Math.round(orderToCancel.limitPrice * orderToCancel.shares);
      dispatch(refundCash({ amount: refundAmount }));
    }

    mixpanel.track('paper_order_cancelled', {
      order_id: orderId,
      symbol: orderToCancel.symbol,
      type: orderToCancel.type,
      shares: orderToCancel.shares,
      limit_price: orderToCancel.limitPrice || orderToCancel.pricePerShare,
      is_paper: true,
    });

    setOrderToCancel(null);
  };

  // Quick trade launchers from holding cards
  const openBuyModalForHolding = (h: Holding) => {
    const practiceStock = TOP_PRACTICE_STOCKS.find(
      (s) => s.symbol.toUpperCase() === h.symbol.toUpperCase()
    );
    setSelectedStockForTrade({
      symbol: h.symbol,
      name: h.name,
      price: h.currentPrice,
      changePct: practiceStock?.changePct || 0,
      trend: practiceStock?.trend || [h.avgPrice, h.currentPrice],
      emoji: h.emoji,
    });
    setTradeModalMode('buy');
  };

  const openSellModalForHolding = (h: Holding) => {
    const practiceStock = TOP_PRACTICE_STOCKS.find(
      (s) => s.symbol.toUpperCase() === h.symbol.toUpperCase()
    );
    setSelectedStockForTrade({
      symbol: h.symbol,
      name: h.name,
      price: h.currentPrice,
      changePct: practiceStock?.changePct || 0,
      trend: practiceStock?.trend || [h.avgPrice, h.currentPrice],
      emoji: h.emoji,
    });
    setTradeModalMode('sell');
  };

  const handleTradeSuccess = (data: any) => {
    setTradeModalMode(null);
    setSelectedStockForTrade(null);
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
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right']}>
      {/* Top Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.backBtnText}>‹</Text>
        </TouchableOpacity>

        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>Paper Portfolio</Text>
          <View style={styles.practicePill}>
            <View style={styles.practiceDot} />
            <Text style={styles.practicePillText}>PRACTICE MODE</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.resetBtn}
          onPress={handleResetPortfolio}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Text style={styles.resetBtnText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.green}
          />
        }
      >
        {/* Hero Account Overview Banner */}
        <LinearGradient
          colors={['#1F2038', '#141527']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroSubtitle}>NET PORTFOLIO VALUATION</Text>
              <Text style={styles.heroValue}>{formatINR(totalPortfolioValue)}</Text>
            </View>
            <View
              style={[
                styles.heroGainBadge,
                {
                  backgroundColor: isOverallPositive
                    ? 'rgba(16, 185, 129, 0.18)'
                    : 'rgba(244, 63, 94, 0.18)',
                },
              ]}
            >
              <Text
                style={[
                  styles.heroGainText,
                  { color: isOverallPositive ? colors.green : colors.pink },
                ]}
              >
                {isOverallPositive ? '▲ ' : '▼ '}
                {formatPct(totalGainPct)} ({formatINR(totalGain, true)})
              </Text>
            </View>
          </View>

          {/* Account Breakdown Grid */}
          <View style={styles.breakdownGrid}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Virtual Cash</Text>
              <Text style={styles.breakdownVal}>{formatINR(cash)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Total Invested</Text>
              <Text style={styles.breakdownVal}>{formatINR(invested)}</Text>
            </View>
            <View style={styles.breakdownDivider} />
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Holdings Value</Text>
              <Text
                style={[
                  styles.breakdownVal,
                  { color: holdingsValue >= invested ? colors.green : colors.pink },
                ]}
              >
                {formatINR(holdingsValue)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Victory Native Area Chart with 1D / 1W / 1M intervals */}
        <PaperPortfolioChart
          portfolioValue={totalPortfolioValue}
          initialInterval="1D"
          height={210}
        />

        {/* Tab Selection Filter */}
        <View style={styles.tabFilterRow}>
          {(
            [
              { key: 'ALL', label: 'Overview' },
              { key: 'HOLDINGS', label: `Holdings (${holdings.length})` },
              { key: 'OPEN_ORDERS', label: `Open Orders (${openLimitOrders.length})` },
              { key: 'HISTORY', label: 'History' },
            ] as const
          ).map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => {
                  setActiveTab(tab.key);
                  mixpanel.track('paper_portfolio_tab_clicked', { tab: tab.key });
                }}
                style={[styles.tabFilterBtn, isActive && styles.tabFilterBtnActive]}
              >
                <Text
                  style={[
                    styles.tabFilterText,
                    isActive && styles.tabFilterTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SECTION 1: Open Limit Orders with Cancel Button */}
        {(activeTab === 'ALL' || activeTab === 'OPEN_ORDERS') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Open Limit Orders</Text>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>{openLimitOrders.length}</Text>
                </View>
              </View>
              <Text style={styles.sectionSubtitle}>
                Pending execution when target price is hit
              </Text>
            </View>

            {openLimitOrders.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>⏱️</Text>
                <Text style={styles.emptyTitle}>No Open Limit Orders</Text>
                <Text style={styles.emptyText}>
                  Limit orders execute automatically when the market price reaches your target.
                  Try placing a Limit Buy or Sell order from the practice market!
                </Text>
              </View>
            ) : (
              openLimitOrders.map((order, idx) => {
                const isBuy = order.type === 'BUY';
                const sideColor = isBuy ? colors.green : colors.pink;
                const limitPrice = order.limitPrice || order.pricePerShare;
                const orderTotal = Math.round(order.shares * limitPrice);

                // Find live/practice market stock price for comparison
                const matchedStock = TOP_PRACTICE_STOCKS.find(
                  (s) => s.symbol.toUpperCase() === order.symbol.toUpperCase()
                );
                const ltp = matchedStock?.price || limitPrice;
                const diffPct = ((limitPrice - ltp) / ltp) * 100;

                return (
                  <View key={order.id || order.clientOrderId || idx} style={styles.orderCard}>
                    {/* Order Card Header */}
                    <View style={styles.orderCardHeader}>
                      <View style={styles.orderStockInfo}>
                        <Text style={styles.stockEmoji}>{order.emoji || '📈'}</Text>
                        <View>
                          <Text style={styles.orderSymbol}>{order.symbol}</Text>
                          <Text style={styles.orderName} numberOfLines={1}>
                            {order.name || order.symbol}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.orderBadgesRow}>
                        <View
                          style={[
                            styles.sideTag,
                            {
                              backgroundColor: isBuy
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(244, 63, 94, 0.15)',
                            },
                          ]}
                        >
                          <Text style={[styles.sideTagText, { color: sideColor }]}>
                            LIMIT {order.type}
                          </Text>
                        </View>
                        <View style={styles.openStatusTag}>
                          <View style={styles.openStatusDot} />
                          <Text style={styles.openStatusText}>OPEN</Text>
                        </View>
                      </View>
                    </View>

                    {/* Order Details Grid */}
                    <View style={styles.orderDetailsGrid}>
                      <View style={styles.orderDetailCol}>
                        <Text style={styles.detailLabel}>Target Limit Price</Text>
                        <Text style={styles.detailValue}>{formatINR(limitPrice)}</Text>
                      </View>

                      <View style={styles.orderDetailCol}>
                        <Text style={styles.detailLabel}>Current LTP</Text>
                        <Text style={styles.detailValue}>{formatINR(ltp)}</Text>
                        <Text
                          style={[
                            styles.distanceText,
                            { color: diffPct >= 0 ? colors.green : colors.pink },
                          ]}
                        >
                          {diffPct > 0 ? '+' : ''}
                          {diffPct.toFixed(1)}% to fill
                        </Text>
                      </View>

                      <View style={styles.orderDetailCol}>
                        <Text style={styles.detailLabel}>Quantity</Text>
                        <Text style={styles.detailValue}>{order.shares} Shares</Text>
                      </View>

                      <View style={styles.orderDetailCol}>
                        <Text style={styles.detailLabel}>Total Value</Text>
                        <Text style={styles.detailValue}>{formatINR(orderTotal)}</Text>
                      </View>
                    </View>

                    {/* Cancel Button Action Bar */}
                    <View style={styles.orderFooterRow}>
                      <Text style={styles.timestampText}>
                        Order ID: {order.clientOrderId || order.id || 'PW-LIMIT'}
                      </Text>

                      <TouchableOpacity
                        style={styles.cancelBtn}
                        onPress={() => promptCancelOrder(order)}
                        activeOpacity={0.75}
                      >
                        <Text style={styles.cancelIcon}>✕</Text>
                        <Text style={styles.cancelBtnText}>Cancel Order</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* SECTION 2: Practice Holdings Cards */}
        {(activeTab === 'ALL' || activeTab === 'HOLDINGS') && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Holdings & Positions</Text>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>{holdings.length}</Text>
                </View>
              </View>
              <Text style={styles.sectionSubtitle}>
                Active virtual stock investments with real-time P&L
              </Text>
            </View>

            {holdings.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyIcon}>📊</Text>
                <Text style={styles.emptyTitle}>No Practice Holdings Yet</Text>
                <Text style={styles.emptyText}>
                  Use your virtual ₹1,00,000 to buy blue-chip stocks like Reliance, TCS, or Infosys.
                  Practice buying and selling risk-free!
                </Text>
                <TouchableOpacity
                  style={styles.exploreBtn}
                  onPress={() => navigation.navigate('MainTabs', { screen: 'Practice' })}
                >
                  <Text style={styles.exploreBtnText}>Explore Practice Stocks</Text>
                </TouchableOpacity>
              </View>
            ) : (
              holdings.map((h, idx) => {
                const totalInvestedForStock = Math.round(h.avgPrice * h.shares);
                const currentValForStock = Math.round(h.currentPrice * h.shares);
                const pnl = currentValForStock - totalInvestedForStock;
                const pnlPct =
                  totalInvestedForStock > 0 ? (pnl / totalInvestedForStock) * 100 : 0;
                const isHoldingPositive = pnl >= 0;

                return (
                  <View key={h.symbol || idx} style={styles.holdingCard}>
                    {/* Holding Header */}
                    <View style={styles.holdingHeaderRow}>
                      <View style={styles.holdingInfoLeft}>
                        <Text style={styles.stockEmoji}>{h.emoji || '📈'}</Text>
                        <View>
                          <Text style={styles.holdingSymbol}>{h.symbol}</Text>
                          <Text style={styles.holdingName} numberOfLines={1}>
                            {h.name}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.pnlPill,
                          {
                            backgroundColor: isHoldingPositive
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(244, 63, 94, 0.15)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.pnlPillText,
                            { color: isHoldingPositive ? colors.green : colors.pink },
                          ]}
                        >
                          {isHoldingPositive ? '▲ ' : '▼ '}
                          {formatPct(pnlPct)}
                        </Text>
                      </View>
                    </View>

                    {/* Holding Valuation Details */}
                    <View style={styles.holdingMetricsGrid}>
                      <View style={styles.metricCell}>
                        <Text style={styles.metricLabel}>Shares</Text>
                        <Text style={styles.metricValue}>{h.shares} Qty</Text>
                      </View>

                      <View style={styles.metricCell}>
                        <Text style={styles.metricLabel}>Avg. Buy Price</Text>
                        <Text style={styles.metricValue}>{formatINR(h.avgPrice)}</Text>
                      </View>

                      <View style={styles.metricCell}>
                        <Text style={styles.metricLabel}>Current LTP</Text>
                        <Text style={styles.metricValue}>{formatINR(h.currentPrice)}</Text>
                      </View>

                      <View style={styles.metricCell}>
                        <Text style={styles.metricLabel}>Unrealized P&L</Text>
                        <Text
                          style={[
                            styles.metricValue,
                            { color: isHoldingPositive ? colors.green : colors.pink },
                          ]}
                        >
                          {formatINR(pnl, true)}
                        </Text>
                      </View>
                    </View>

                    {/* Educational Note Banner */}
                    {h.note && (
                      <View style={styles.noteBanner}>
                        <Text style={styles.noteIcon}>💡</Text>
                        <Text style={styles.noteText}>{h.note}</Text>
                      </View>
                    )}

                    {/* Action Buttons: Buy More & Sell */}
                    <View style={styles.holdingActionRow}>
                      <TouchableOpacity
                        style={styles.holdingBuyBtn}
                        onPress={() => openBuyModalForHolding(h)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.holdingBuyText}>+ Buy More</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.holdingSellBtn}
                        onPress={() => openSellModalForHolding(h)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.holdingSellText}>Sell</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* SECTION 3: Order History */}
        {(activeTab === 'ALL' || activeTab === 'HISTORY') && pastOrders.length > 0 && (
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Order History</Text>
                <View style={styles.counterBadge}>
                  <Text style={styles.counterBadgeText}>{pastOrders.length}</Text>
                </View>
              </View>
              <Text style={styles.sectionSubtitle}>Filled and cancelled practice orders</Text>
            </View>

            {pastOrders.map((ord, idx) => {
              const isExecuted = ord.status === 'EXECUTED';
              const isBuy = ord.type === 'BUY';

              return (
                <View key={ord.id || ord.clientOrderId || idx} style={styles.historyCard}>
                  <View style={styles.historyRow}>
                    <View style={styles.historyLeft}>
                      <Text style={styles.historySymbol}>{ord.symbol}</Text>
                      <Text style={styles.historySub}>
                        {ord.shares} shares @ {formatINR(ord.pricePerShare || ord.limitPrice || 0)}
                      </Text>
                    </View>

                    <View style={styles.historyRight}>
                      <View
                        style={[
                          styles.statusTag,
                          {
                            backgroundColor: isExecuted
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(244, 63, 94, 0.15)',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusTagText,
                            { color: isExecuted ? colors.green : colors.pink },
                          ]}
                        >
                          {ord.status || 'EXECUTED'}
                        </Text>
                      </View>
                      <Text style={styles.historyDate}>
                        {new Date(ord.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Confirmation Modal for Cancelling Limit Order */}
      {orderToCancel && (
        <ConfirmModal
          visible={true}
          title="Cancel Limit Order?"
          message={`Are you sure you want to cancel your limit ${orderToCancel.type} order for ${orderToCancel.shares} shares of ${orderToCancel.symbol} at ${formatINR(orderToCancel.limitPrice || orderToCancel.pricePerShare)}?`}
          confirmText="Yes, Cancel Order"
          cancelText="Keep Order"
          confirmVariant="danger"
          onConfirm={handleConfirmCancelOrder}
          onCancel={() => setOrderToCancel(null)}
        />
      )}

      {/* Quick Trade Buy Modal */}
      {tradeModalMode === 'buy' && selectedStockForTrade && (
        <BuyModal
          visible={true}
          stock={selectedStockForTrade}
          onClose={() => {
            setTradeModalMode(null);
            setSelectedStockForTrade(null);
          }}
          onSuccess={handleTradeSuccess}
          onSwitchToSell={() => setTradeModalMode('sell')}
        />
      )}

      {/* Quick Trade Sell Modal */}
      {tradeModalMode === 'sell' && selectedStockForTrade && (
        <SellModal
          visible={true}
          stock={selectedStockForTrade}
          onClose={() => {
            setTradeModalMode(null);
            setSelectedStockForTrade(null);
          }}
          onSuccess={handleTradeSuccess}
          onSwitchToBuy={() => setTradeModalMode('buy')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0A0B14',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: colors.textOnDark,
    lineHeight: 26,
    marginLeft: -2,
  },
  navTitleContainer: {
    alignItems: 'center',
  },
  navTitle: {
    ...typography.h3,
    color: colors.textOnDark,
    fontWeight: '700',
  },
  practicePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  practiceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.green,
  },
  practicePillText: {
    ...typography.overline,
    color: colors.green,
    fontSize: 10,
    fontWeight: '800',
  },
  resetBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
  },
  resetBtnText: {
    ...typography.caption,
    color: colors.pink,
    fontWeight: '700',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  heroCard: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing.xs,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  heroSubtitle: {
    ...typography.overline,
    color: colors.textMutedDark,
    letterSpacing: 1.2,
  },
  heroValue: {
    ...typography.hero,
    fontSize: 32,
    color: colors.textOnDark,
    fontWeight: '800',
    marginTop: 2,
  },
  heroGainBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  heroGainText: {
    ...typography.caption,
    fontWeight: '800',
    fontSize: 12,
  },
  breakdownGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  breakdownItem: {
    flex: 1,
    alignItems: 'center',
  },
  breakdownDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  breakdownLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMutedDark,
    marginBottom: 2,
  },
  breakdownVal: {
    ...typography.mono,
    fontSize: 13,
    color: colors.textOnDark,
    fontWeight: '700',
  },
  tabFilterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginVertical: spacing.md,
    backgroundColor: '#141628',
    padding: 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabFilterBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabFilterBtnActive: {
    backgroundColor: colors.purpleDeep || '#3B2486',
  },
  tabFilterText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMutedDark,
    fontWeight: '600',
  },
  tabFilterTextActive: {
    color: colors.textOnDark,
    fontWeight: '800',
  },
  sectionContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  sectionHeaderRow: {
    marginBottom: spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textOnDark,
    fontWeight: '700',
    fontSize: 18,
  },
  counterBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: radius.full,
  },
  counterBadgeText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textOnDark,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...typography.caption,
    color: colors.textMutedDark,
    marginTop: 2,
  },
  orderCard: {
    backgroundColor: '#15172A',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing.md,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  orderStockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  stockEmoji: {
    fontSize: 28,
  },
  orderSymbol: {
    ...typography.bodyBold,
    color: colors.textOnDark,
    fontSize: 16,
  },
  orderName: {
    ...typography.caption,
    color: colors.textMutedDark,
    fontSize: 12,
    maxWidth: 160,
  },
  orderBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sideTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  sideTagText: {
    ...typography.caption,
    fontWeight: '800',
    fontSize: 11,
  },
  openStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  openStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  openStatusText: {
    ...typography.caption,
    color: '#F59E0B',
    fontWeight: '800',
    fontSize: 11,
  },
  orderDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  orderDetailCol: {
    width: '47%',
    marginBottom: 4,
  },
  detailLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMutedDark,
    marginBottom: 2,
  },
  detailValue: {
    ...typography.mono,
    fontSize: 14,
    color: colors.textOnDark,
    fontWeight: '700',
  },
  distanceText: {
    ...typography.caption,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  timestampText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMutedDark,
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  cancelIcon: {
    color: colors.pink,
    fontSize: 12,
    fontWeight: '800',
  },
  cancelBtnText: {
    ...typography.caption,
    color: colors.pink,
    fontWeight: '700',
  },
  holdingCard: {
    backgroundColor: '#15172A',
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing.md,
  },
  holdingHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  holdingInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  holdingSymbol: {
    ...typography.bodyBold,
    color: colors.textOnDark,
    fontSize: 16,
  },
  holdingName: {
    ...typography.caption,
    color: colors.textMutedDark,
    fontSize: 12,
    maxWidth: 180,
  },
  pnlPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  pnlPillText: {
    ...typography.caption,
    fontWeight: '800',
    fontSize: 12,
  },
  holdingMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  metricCell: {
    alignItems: 'center',
  },
  metricLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMutedDark,
    marginBottom: 2,
  },
  metricValue: {
    ...typography.mono,
    fontSize: 13,
    color: colors.textOnDark,
    fontWeight: '700',
  },
  noteBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.amber,
  },
  noteIcon: {
    fontSize: 14,
  },
  noteText: {
    ...typography.caption,
    color: colors.textMutedDark,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  holdingActionRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  holdingBuyBtn: {
    flex: 1,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  holdingBuyText: {
    ...typography.caption,
    color: colors.green,
    fontWeight: '700',
  },
  holdingSellBtn: {
    flex: 1,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  holdingSellText: {
    ...typography.caption,
    color: colors.pink,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: '#141628',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    ...typography.bodyBold,
    color: colors.textOnDark,
    marginBottom: spacing.xs,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMutedDark,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.md,
  },
  exploreBtn: {
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.full,
  },
  exploreBtnText: {
    ...typography.caption,
    color: colors.white,
    fontWeight: '700',
  },
  historyCard: {
    backgroundColor: '#141628',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyLeft: {
    gap: 2,
  },
  historySymbol: {
    ...typography.bodyBold,
    color: colors.textOnDark,
    fontSize: 14,
  },
  historySub: {
    ...typography.caption,
    color: colors.textMutedDark,
    fontSize: 11,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  statusTagText: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
  },
  historyDate: {
    ...typography.caption,
    color: colors.textMutedDark,
    fontSize: 10,
  },
});
