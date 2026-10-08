import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { RootStackParamList } from '../../../app/navigation/types';
import { OrderReceipt } from '../order.types';
import { orderService } from '../order.service';
import { cancelRealOrderThunk } from '../../practice/slices/orderSlice';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';
import Analytics from '../../../core/analyticsService';
import type { AppDispatch } from '../../../app/store';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

export default function OrderDetailScreen({ route, navigation }: Props) {
  const { orderId, order: initialOrder } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const [order, setOrder] = useState<OrderReceipt | null>(initialOrder || null);
  const [loading, setLoading] = useState(!initialOrder);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);

  useEffect(() => {
    orderService.getOrder(orderId).then((fetched) => {
      if (fetched) {
        setOrder(fetched);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orderId]);

  if (loading || !order) {
    return (
      <SafeAreaView style={styles.root} edges={['top']}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#D97706" />
          <Text style={styles.loadingText}>Loading order #{orderId} details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isBuy = order.side === 'BUY';
  const isComplete = order.status === 'COMPLETE';
  const isOpen = order.status === 'OPEN' || order.status === 'PENDING';
  const isCancelled = order.status === 'CANCELLED';
  const isRejected = order.status === 'REJECTED';

  const totalValue = Math.round(
    (order.avgPrice > 0 ? order.avgPrice : order.price) * order.quantity
  );

  const handleShare = async () => {
    try {
      await Share.share({
        message: `PaiseWise Order Receipt\nSymbol: ${order.symbol}\nSide: ${order.side}\nQuantity: ${order.quantity}\nPrice: ₹${order.price}\nStatus: ${order.status}\nBroker ID: ${order.brokerOrderId || 'N/A'}`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleCancelOrder = async () => {
    const updated = await dispatch(cancelRealOrderThunk(order.orderId)).unwrap();
    if (updated) {
      setOrder(updated);
    }
    Analytics.orderCancelled({
      order_id: order.orderId,
      symbol: order.symbol,
      side: order.side,
      order_type: order.orderType,
      time_since_placed_seconds: Math.floor((Date.now() - new Date(order.placedAt).getTime()) / 1000),
      cancel_reason: 'Cancelled via Order Detail Screen',
    });
    setCancelModalVisible(false);
  };

  // Status timeline steps
  const steps = [
    {
      title: 'Order Created & Submitted',
      description: `Client ID: ${order.clientOrderId}`,
      timestamp: new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'DONE',
    },
    {
      title: 'Risk Engine Validated',
      description: 'KYC verified & Ledger margin checks passed',
      timestamp: new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'DONE',
    },
    {
      title: 'Transmitted to Exchange',
      description: `Broker ref: ${order.brokerOrderId || 'Pending transmit'} (${order.exchange})`,
      timestamp: order.brokerOrderId ? new Date(order.placedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Processing',
      status: order.brokerOrderId ? 'DONE' : isOpen ? 'ACTIVE' : 'DONE',
    },
    {
      title: isCancelled ? 'Order Cancelled' : isRejected ? 'Order Rejected' : isComplete ? 'Order Executed & Filled' : 'Awaiting Market Match',
      description: isComplete 
        ? `Filled ${order.filledQty}/${order.quantity} shares @ ₹${order.avgPrice || order.price}`
        : isCancelled 
        ? order.message || 'Cancelled by user'
        : isRejected
        ? order.message || 'Rejected by risk engine'
        : `Active in order book at ₹${order.price}`,
      timestamp: order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '',
      status: isComplete ? 'DONE' : isCancelled || isRejected ? 'FAILED' : 'ACTIVE',
    },
  ];

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      {/* Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>Order Receipt</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Status Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroSymbol}>{order.symbol}</Text>
              <Text style={styles.heroExchange}>NSE · {order.product || 'CNC'}</Text>
            </View>
            <View style={[styles.sideBadge, isBuy ? styles.sideBuy : styles.sideSell]}>
              <Text style={[styles.sideText, isBuy ? styles.sideBuyText : styles.sideSellText]}>
                {order.side}
              </Text>
            </View>
          </View>

          <View style={styles.heroPriceRow}>
            <View>
              <Text style={styles.heroLabel}>Total Value</Text>
              <Text style={styles.heroValue}>{formatINR(totalValue)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.heroLabel}>Shares</Text>
              <Text style={styles.heroShares}>{order.filledQty}/{order.quantity} Filled</Text>
            </View>
          </View>

          <View style={[
            styles.statusBanner,
            isComplete && styles.statusBannerComplete,
            isOpen && styles.statusBannerOpen,
            (isCancelled || isRejected) && styles.statusBannerFailed,
          ]}>
            <Text style={[
              styles.statusBannerText,
              isComplete && styles.statusBannerTextComplete,
              isOpen && styles.statusBannerTextOpen,
              (isCancelled || isRejected) && styles.statusBannerTextFailed,
            ]}>
              {isComplete ? '✓ Fully Executed on NSE' : isOpen ? '⏳ Active in Market' : `✕ ${order.status}`}
            </Text>
          </View>
        </View>

        {/* Status Timeline Progress Bar */}
        <View style={styles.timelineSection}>
          <Text style={styles.sectionHeader}>Status Timeline Progress</Text>
          <View style={styles.timelineContainer}>
            {steps.map((step, index) => {
              const isLast = index === steps.length - 1;
              return (
                <View key={index} style={styles.timelineRow}>
                  {/* Left Column: Icon + Vertical line */}
                  <View style={styles.timelineLeftCol}>
                    <View style={[
                      styles.timelineDot,
                      step.status === 'DONE' && styles.timelineDotDone,
                      step.status === 'ACTIVE' && styles.timelineDotActive,
                      step.status === 'FAILED' && styles.timelineDotFailed,
                    ]}>
                      <Text style={styles.timelineDotIcon}>
                        {step.status === 'DONE' ? '✓' : step.status === 'FAILED' ? '✕' : '•'}
                      </Text>
                    </View>
                    {!isLast && (
                      <View style={[
                        styles.timelineLine,
                        step.status === 'DONE' && styles.timelineLineDone,
                      ]} />
                    )}
                  </View>

                  {/* Right Column: Content */}
                  <View style={[styles.timelineContent, !isLast && { paddingBottom: 24 }]}>
                    <View style={styles.timelineTitleRow}>
                      <Text style={[
                        styles.timelineTitle,
                        step.status === 'FAILED' && { color: colors.pink },
                        step.status === 'DONE' && { color: colors.text },
                      ]}>
                        {step.title}
                      </Text>
                      {step.timestamp !== '' && (
                        <Text style={styles.timelineTimestamp}>{step.timestamp}</Text>
                      )}
                    </View>
                    <Text style={styles.timelineDesc}>{step.description}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order Details Breakdown */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionHeader}>Order Specifications</Text>

          <View style={styles.detailRow}>
            <Text style={styles.rowLabel}>Order Type</Text>
            <Text style={styles.rowValue}>{order.orderType}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.rowLabel}>Order Placed Price</Text>
            <Text style={styles.rowValue}>{formatINR(order.price)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.rowLabel}>Avg Executed Price</Text>
            <Text style={styles.rowValue}>{formatINR(order.avgPrice || order.price)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.rowLabel}>Product Mode</Text>
            <Text style={styles.rowValue}>{order.product || 'CNC'} (Delivery)</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.rowLabel}>Validity</Text>
            <Text style={styles.rowValue}>DAY</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.rowLabel}>Trading Environment</Text>
            <Text style={[styles.rowValue, { color: '#D97706', fontWeight: '800' }]}>
              {order.isPaper ? '🎮 Practice' : '💼 Real Money'}
            </Text>
          </View>
        </View>

        {/* System & Broker Identifiers */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionHeader}>Audit & Broker IDs</Text>

          <View style={styles.detailRow}>
            <Text style={styles.rowLabel}>Order UUID</Text>
            <Text style={styles.rowValueMono}>{order.orderId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.rowLabel}>Client Order ID</Text>
            <Text style={styles.rowValueMono}>{order.clientOrderId}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.rowLabel}>Broker Ref ID</Text>
            <Text style={styles.rowValueMono}>{order.brokerOrderId || 'N/A'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.rowLabel}>Placed At</Text>
            <Text style={styles.rowValue}>{new Date(order.placedAt).toLocaleString()}</Text>
          </View>
        </View>

        {/* Bottom Actions */}
        {isOpen && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => setCancelModalVisible(true)}
          >
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.tradeAgainBtn}
          onPress={() => navigation.navigate('StockDetail', { symbol: order.symbol })}
        >
          <Text style={styles.tradeAgainBtnText}>View {order.symbol} Market Chart 📈</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Confirmation Modal for Order Cancellation */}
      <ConfirmModal
        visible={cancelModalVisible}
        title="Cancel Order"
        message={`Are you sure you want to cancel this pending ${order.side} order for ${order.symbol}?`}
        confirmText="Yes, Cancel"
        confirmVariant="danger"
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelModalVisible(false)}
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
  navTitle: { ...typography.h3, color: colors.text },
  shareBtn: { padding: 4 },
  shareIcon: { fontSize: 18 },
  scrollContent: { padding: spacing.lg, gap: spacing.lg, paddingBottom: 120 },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { ...typography.caption, color: colors.textMuted, marginTop: 12 },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  heroSymbol: { ...typography.hero, color: colors.text, fontSize: 26 },
  heroExchange: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  sideBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.sm },
  sideBuy: { backgroundColor: '#DCFCE7' },
  sideSell: { backgroundColor: '#FEE2E2' },
  sideText: { fontSize: 12, fontWeight: '800' },
  sideBuyText: { color: '#15803D' },
  sideSellText: { color: '#B91C1C' },
  heroPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  heroLabel: { ...typography.caption, color: colors.textMuted, fontSize: 11 },
  heroValue: { ...typography.h2, color: colors.text },
  heroShares: { ...typography.h3, color: colors.text },
  statusBanner: {
    paddingVertical: 10,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  statusBannerComplete: { backgroundColor: '#DCFCE7' },
  statusBannerOpen: { backgroundColor: '#FEF3C7' },
  statusBannerFailed: { backgroundColor: '#FEE2E2' },
  statusBannerText: { ...typography.caption, fontWeight: '800' },
  statusBannerTextComplete: { color: '#15803D' },
  statusBannerTextOpen: { color: '#B45309' },
  statusBannerTextFailed: { color: '#B91C1C' },
  timelineSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: { ...typography.h3, color: colors.text, marginBottom: spacing.lg },
  timelineContainer: { marginTop: spacing.xs },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeftCol: { alignItems: 'center', width: 24 },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  timelineDotDone: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  timelineDotActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#D97706',
  },
  timelineDotFailed: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  timelineDotIcon: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.white,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
  timelineLineDone: {
    backgroundColor: colors.green,
  },
  timelineContent: { flex: 1 },
  timelineTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timelineTitle: { ...typography.bodyBold, color: colors.text, fontSize: 13 },
  timelineTimestamp: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  timelineDesc: { ...typography.caption, color: colors.textMuted, marginTop: 2, lineHeight: 16 },
  detailsCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceMuted,
  },
  rowLabel: { ...typography.caption, color: colors.textMuted },
  rowValue: { ...typography.bodyBold, color: colors.text },
  rowValueMono: { ...typography.caption, color: colors.textMuted, fontSize: 11, fontFamily: 'monospace' },
  cancelBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  cancelBtnText: { ...typography.bodyBold, color: '#B91C1C' },
  tradeAgainBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  tradeAgainBtnText: { ...typography.bodyBold, color: colors.purple },
});
