import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { OrderReceipt, OrderStatus } from '../order.types';
import { fetchRealOrdersThunk, cancelRealOrderThunk, setSelectedTab } from '../../practice/slices/orderSlice';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';
import Analytics from '../../../core/analyticsService';
import type { RootState, AppDispatch } from '../../../app/store';

type OrderTab = 'OPEN' | 'COMPLETED' | 'CANCELLED';

export default function OrdersScreen() {
  const navigation = useNavigation<any>();
  const dispatch = useDispatch<AppDispatch>();

  const realOrders = useSelector((state: RootState) => state.order.realOrders);
  const loading = useSelector((state: RootState) => state.order.loading);
  const selectedTab = useSelector((state: RootState) => state.order.selectedTab);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<OrderReceipt | null>(null);

  const loadOrders = useCallback(async () => {
    await dispatch(fetchRealOrdersThunk());
  }, [dispatch]);

  useEffect(() => {
    loadOrders();
    // Live refresh polling interval every 8 seconds
    const interval = setInterval(() => {
      dispatch(fetchRealOrdersThunk());
    }, 8000);

    return () => clearInterval(interval);
  }, [dispatch, loadOrders]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleTabChange = (tab: OrderTab) => {
    dispatch(setSelectedTab(tab));
  };

  const handleCancelClick = (order: OrderReceipt) => {
    setOrderToCancel(order);
    setCancelModalVisible(true);
  };

  const handleConfirmCancel = async () => {
    if (orderToCancel) {
      await dispatch(cancelRealOrderThunk(orderToCancel.orderId));
      Analytics.orderCancelled({
        order_id: orderToCancel.orderId,
        symbol: orderToCancel.symbol,
        side: orderToCancel.side,
        order_type: orderToCancel.orderType,
        time_since_placed_seconds: Math.floor((Date.now() - new Date(orderToCancel.placedAt).getTime()) / 1000),
        cancel_reason: 'User cancelled via Orders screen',
      });
      setCancelModalVisible(false);
      setOrderToCancel(null);
    }
  };

  const filteredOrders = realOrders.filter((o) => {
    const matchesSearch = o.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedTab === 'OPEN') {
      return o.status === 'OPEN' || o.status === 'PENDING' || o.status === 'PARTIAL';
    } else if (selectedTab === 'COMPLETED') {
      return o.status === 'COMPLETE';
    } else if (selectedTab === 'CANCELLED') {
      return o.status === 'CANCELLED' || o.status === 'REJECTED';
    }
    return true;
  });

  const openCount = realOrders.filter((o) => o.status === 'OPEN' || o.status === 'PENDING' || o.status === 'PARTIAL').length;
  const completedCount = realOrders.filter((o) => o.status === 'COMPLETE').length;
  const cancelledCount = realOrders.filter((o) => o.status === 'CANCELLED' || o.status === 'REJECTED').length;

  const renderOrderItem = ({ item }: { item: OrderReceipt }) => {
    const isBuy = item.side === 'BUY';
    const isComplete = item.status === 'COMPLETE';
    const isOpen = item.status === 'OPEN' || item.status === 'PENDING';
    const isCancelled = item.status === 'CANCELLED' || item.status === 'REJECTED';

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('OrderDetail', { orderId: item.orderId, order: item })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.symbolRow}>
            <Text style={styles.symbolText}>{item.symbol}</Text>
            <View style={[styles.sideBadge, isBuy ? styles.sideBuy : styles.sideSell]}>
              <Text style={[styles.sideText, isBuy ? styles.sideBuyText : styles.sideSellText]}>
                {item.side}
              </Text>
            </View>
            <View style={styles.productBadge}>
              <Text style={styles.productText}>{item.product || 'CNC'}</Text>
            </View>
          </View>

          <View style={[
            styles.statusPill,
            isComplete && styles.statusComplete,
            isOpen && styles.statusOpen,
            isCancelled && styles.statusCancelled,
          ]}>
            <Text style={[
              styles.statusText,
              isComplete && styles.statusCompleteText,
              isOpen && styles.statusOpenText,
              isCancelled && styles.statusCancelledText,
            ]}>
              {item.status}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Qty (Filled/Total)</Text>
            <Text style={styles.detailValue}>
              {item.filledQty} / {item.quantity}
            </Text>
          </View>

          <View style={styles.detailCol}>
            <Text style={styles.detailLabel}>Order Price</Text>
            <Text style={styles.detailValue}>{formatINR(item.price)}</Text>
          </View>

          <View style={styles.detailColRight}>
            <Text style={styles.detailLabel}>Type & Exch</Text>
            <Text style={styles.detailValue}>{item.orderType} · {item.exchange}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.timeText}>
            Placed: {new Date(item.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </Text>

          {isOpen && (
            <TouchableOpacity
              style={styles.cancelActionBtn}
              onPress={() => handleCancelClick(item)}
            >
              <Text style={styles.cancelActionText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Top Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.navTitle}>Real Orders</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchWrapper}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search orders by symbol e.g. RELIANCE"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {/* Segmented Tabs with Counters */}
      <View style={styles.tabContainer}>
        {(['OPEN', 'COMPLETED', 'CANCELLED'] as OrderTab[]).map((tab) => {
          const active = selectedTab === tab;
          const count = tab === 'OPEN' ? openCount : tab === 'COMPLETED' ? completedCount : cancelledCount;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, active && styles.tabItemActive]}
              onPress={() => handleTabChange(tab)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {tab} ({count})
              </Text>
              {active && <View style={styles.tabUnderline} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Orders List */}
      {loading && realOrders.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Fetching real order book...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.orderId}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#D97706']} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>No {selectedTab.toLowerCase()} orders</Text>
              <Text style={styles.emptySubtitle}>
                {selectedTab === 'OPEN'
                  ? 'You have no pending orders in the market book right now.'
                  : `No ${selectedTab.toLowerCase()} orders found for this session.`}
              </Text>
              <TouchableOpacity
                style={styles.exploreBtn}
                onPress={() => navigation.navigate('Watchlist')}
              >
                <Text style={styles.exploreBtnText}>Explore Stocks to Trade</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Cancellation Confirmation Modal */}
      <ConfirmModal
        visible={cancelModalVisible}
        title="Cancel Order"
        message={`Are you sure you want to cancel the ${orderToCancel?.side} order for ${orderToCancel?.quantity} shares of ${orderToCancel?.symbol}?`}
        confirmText="Yes, Cancel Order"
        confirmVariant="danger"
        onConfirm={handleConfirmCancel}
        onCancel={() => {
          setCancelModalVisible(false);
          setOrderToCancel(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: { paddingVertical: 4 },
  backBtnText: { ...typography.bodyBold, color: colors.purple },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navTitle: { ...typography.h3, color: colors.text },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  liveText: { fontSize: 9, fontWeight: '800', color: colors.green },
  refreshBtn: { padding: 4 },
  refreshBtnText: { fontSize: 18 },
  searchWrapper: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  searchInput: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...typography.caption,
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActive: {},
  tabText: {
    ...typography.overline,
    color: colors.textMuted,
    fontSize: 11,
  },
  tabTextActive: {
    color: '#D97706',
    fontWeight: '800',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 12,
    right: 12,
    height: 3,
    backgroundColor: '#D97706',
    borderRadius: 2,
  },
  listContent: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbolText: {
    ...typography.h3,
    color: colors.text,
  },
  sideBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  sideBuy: { backgroundColor: '#DCFCE7' },
  sideSell: { backgroundColor: '#FEE2E2' },
  sideText: { fontSize: 10, fontWeight: '800' },
  sideBuyText: { color: '#15803D' },
  sideSellText: { color: '#B91C1C' },
  productBadge: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productText: { fontSize: 10, fontWeight: '700', color: colors.textMuted },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusComplete: { backgroundColor: '#DCFCE7' },
  statusOpen: { backgroundColor: '#FEF3C7' },
  statusCancelled: { backgroundColor: '#F3F4F6' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusCompleteText: { color: '#15803D' },
  statusOpenText: { color: '#B45309' },
  statusCancelledText: { color: '#6B7280' },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  detailCol: { gap: 2 },
  detailColRight: { alignItems: 'flex-end', gap: 2 },
  detailLabel: { ...typography.caption, color: colors.textMuted, fontSize: 11 },
  detailValue: { ...typography.bodyBold, color: colors.text, fontSize: 13 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  timeText: { ...typography.caption, color: colors.textMuted, fontSize: 11 },
  cancelActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#FEE2E2',
    borderRadius: radius.sm,
  },
  cancelActionText: { fontSize: 11, fontWeight: '700', color: '#B91C1C' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.caption, color: colors.textMuted, marginTop: 12 },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: { fontSize: 44, marginBottom: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },
  emptySubtitle: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.lg },
  exploreBtn: {
    backgroundColor: '#D97706',
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.md,
  },
  exploreBtnText: { ...typography.bodyBold, color: colors.white },
});
