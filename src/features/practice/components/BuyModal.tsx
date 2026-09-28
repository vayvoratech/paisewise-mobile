import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { Stock } from '../../market/market.types';
import { buyStock } from '../../portfolio/slices/portfolioSlice';
import { addLocalOrder } from '../slices/orderSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import mixpanel from '@core/mixpanel';
import { generateClientOrderId, estimateTradingCharges } from '../utils/orderUtils';

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP LOSS';
export type ProductType = 'DELIVERY' | 'INTRADAY';

interface BuyModalProps {
  visible: boolean;
  stock: Stock;
  onClose: () => void;
  onSuccess: (data: {
    symbol: string;
    shares: number;
    pricePerShare: number;
    totalPaid: number;
    xpEarned: number;
    clientOrderId: string;
    mode: 'buy';
  }) => void;
  onSwitchToSell?: () => void;
}

export function BuyModal({
  visible,
  stock,
  onClose,
  onSuccess,
  onSwitchToSell,
}: BuyModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const cash = useSelector((state: RootState) => state.portfolio.cash);

  const rawPrice: any = stock.price ?? 0;
  const ltp = typeof rawPrice === 'string'
    ? parseFloat(rawPrice.replace(/[^0-9.]/g, ''))
    : Number(rawPrice);
  const safeLtp = isNaN(ltp) ? 1000 : ltp;

  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [productType, setProductType] = useState<ProductType>('DELIVERY');
  const [qty, setQty] = useState(5);
  const [limitPrice, setLimitPrice] = useState(safeLtp.toFixed(2));
  const [triggerPrice, setTriggerPrice] = useState((safeLtp * 0.95).toFixed(2));

  // Determine effective execution price based on order type
  const effectivePrice = orderType === 'LIMIT'
    ? parseFloat(limitPrice) || safeLtp
    : safeLtp;

  const totalCost = Math.round(qty * effectivePrice);
  const isAffordable = totalCost <= cash;
  const deficit = totalCost - cash;
  const maxAffordableQty = Math.max(1, Math.floor(cash / (effectivePrice || 1)));

  const charges = estimateTradingCharges(totalCost, 'buy', productType);

  const handleQtyChange = (newQty: number) => {
    const val = Math.max(1, Math.min(newQty, 99999));
    setQty(val);
    mixpanel.track('quantity_changed', {
      symbol: stock.symbol,
      quantity: val,
      quantity_previous: qty,
      input_method: 'stepper',
    });
  };

  const handleOrderTypeChange = (t: OrderType) => {
    const prev = orderType;
    setOrderType(t);
    mixpanel.track('order_type_selected', {
      symbol: stock.symbol,
      order_type: t,
      order_type_previous: prev,
    });
  };

  const handleConfirmBuy = () => {
    if (!isAffordable) return;

    const clientOrderId = generateClientOrderId('PW-BUY');
    const orderId = `ord_${Date.now()}`;

    mixpanel.track('paper_order_confirmed', {
      symbol: stock.symbol,
      side: 'BUY',
      order_type: orderType,
      quantity: qty,
      price: effectivePrice,
      total_value: totalCost,
      is_paper: true,
      client_order_id: clientOrderId,
      balance_after_estimate: cash - totalCost,
    });

    // 1. Dispatch buyStock to portfolioSlice
    dispatch(
      buyStock({
        symbol: stock.symbol,
        name: stock.name || stock.symbol,
        emoji: stock.emoji || '📈',
        shares: qty,
        price: effectivePrice,
      })
    );

    // 2. Dispatch to orderSlice log
    dispatch(
      addLocalOrder({
        symbol: stock.symbol,
        shares: qty,
        pricePerShare: effectivePrice,
        type: 'BUY',
        timestamp: new Date().toISOString(),
      })
    );

    mixpanel.track('paper_order_placed', {
      order_id: orderId,
      client_order_id: clientOrderId,
      symbol: stock.symbol,
      side: 'BUY',
      quantity: qty,
      fill_price: effectivePrice,
      total_value: totalCost,
      is_paper: true,
      time_to_confirm_ms: 120,
    });

    onClose();
    onSuccess({
      symbol: stock.symbol,
      shares: qty,
      pricePerShare: effectivePrice,
      totalPaid: totalCost,
      xpEarned: 25,
      clientOrderId,
      mode: 'buy',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />

          {/* Mode Switcher Segmented Control */}
          <View style={styles.topTabs}>
            <View style={[styles.modeTab, styles.modeTabActiveBuy]}>
              <Text style={styles.modeTextActiveBuy}>BUY (Practice)</Text>
            </View>
            <TouchableOpacity
              style={styles.modeTab}
              onPress={() => {
                if (onSwitchToSell) onSwitchToSell();
              }}
            >
              <Text style={styles.modeTextIdle}>SWITCH TO SELL</Text>
            </TouchableOpacity>
          </View>

          {/* Stock Header */}
          <View style={styles.header}>
            <View>
              <View style={styles.symBadgeRow}>
                <Text style={styles.symbol}>{stock.symbol}</Text>
                <View style={styles.practiceTag}>
                  <Text style={styles.practiceTagText}>PRACTICE</Text>
                </View>
              </View>
              <Text style={styles.name}>{stock.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>{formatINR(safeLtp)}</Text>
              <Text style={[styles.pct, { color: stock.changePct >= 0 ? colors.green : colors.pink }]}>
                {stock.changePct >= 0 ? '▲ +' : '▼ '}{stock.changePct}%
              </Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {/* Order Type Segmented Control */}
            <Text style={styles.label}>ORDER TYPE</Text>
            <View style={styles.segmentedControl}>
              {(['MARKET', 'LIMIT', 'STOP LOSS'] as OrderType[]).map((type) => {
                const active = orderType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.segBtn, active && styles.segBtnActiveBuy]}
                    onPress={() => handleOrderTypeChange(type)}
                  >
                    <Text style={[styles.segBtnText, active && styles.segBtnTextActive]}>{type}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Product Type (Delivery / Intraday) */}
            <View style={styles.productRow}>
              <TouchableOpacity
                style={[styles.productChip, productType === 'DELIVERY' && styles.productChipActive]}
                onPress={() => setProductType('DELIVERY')}
              >
                <Text style={[styles.productChipText, productType === 'DELIVERY' && styles.productChipTextActive]}>
                  Delivery (CNC)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.productChip, productType === 'INTRADAY' && styles.productChipActive]}
                onPress={() => setProductType('INTRADAY')}
              >
                <Text style={[styles.productChipText, productType === 'INTRADAY' && styles.productChipTextActive]}>
                  Intraday (MIS)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Custom Limit / Trigger Price Inputs if not Market */}
            {orderType === 'LIMIT' && (
              <View style={styles.inputWrap}>
                <Text style={styles.label}>LIMIT PRICE (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={limitPrice}
                  onChangeText={setLimitPrice}
                  placeholder="Enter Limit Price"
                />
              </View>
            )}

            {orderType === 'STOP LOSS' && (
              <View style={styles.inputWrap}>
                <Text style={styles.label}>TRIGGER PRICE (₹)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={triggerPrice}
                  onChangeText={setTriggerPrice}
                  placeholder="Enter Trigger Price"
                />
              </View>
            )}

            {/* Quantity Stepper */}
            <View style={styles.qtyHeaderRow}>
              <Text style={styles.label}>QUANTITY (SHARES)</Text>
              <Text style={styles.maxQtyNote}>Max: {maxAffordableQty} shares</Text>
            </View>

            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleQtyChange(qty - 1)}
                disabled={qty <= 1}
              >
                <Text style={[styles.stepText, qty <= 1 && styles.stepTextDisabled]}>−</Text>
              </TouchableOpacity>

              <View style={styles.qtyInputBox}>
                <TextInput
                  style={styles.qtyValue}
                  keyboardType="number-pad"
                  value={String(qty)}
                  onChangeText={(val) => {
                    const parsed = parseInt(val.replace(/[^0-9]/g, ''), 10);
                    handleQtyChange(isNaN(parsed) ? 1 : parsed);
                  }}
                  selectTextOnFocus
                />
                <Text style={styles.sharesSuffix}>Shares</Text>
              </View>

              <TouchableOpacity
                style={styles.stepBtn}
                onPress={() => handleQtyChange(qty + 1)}
              >
                <Text style={styles.stepText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Add Chips */}
            <View style={styles.quickChipsRow}>
              {[1, 5, 10, 25].map((addVal) => (
                <TouchableOpacity
                  key={addVal}
                  style={styles.chip}
                  onPress={() => handleQtyChange(qty + addVal)}
                >
                  <Text style={styles.chipText}>+{addVal}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, styles.chipMax]}
                onPress={() => handleQtyChange(maxAffordableQty)}
              >
                <Text style={styles.chipMaxText}>MAX</Text>
              </TouchableOpacity>
            </View>

            {/* Live Cost Breakdown */}
            <View style={styles.costCard}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Required Capital</Text>
                <Text style={styles.costValue}>{formatINR(totalCost)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabelSub}>Virtual Cash Available</Text>
                <Text style={styles.costValueSub}>{formatINR(cash)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabelSub}>Brokerage & Taxes</Text>
                <Text style={[styles.costValueSub, { color: colors.green }]}>₹0.00 (Practice Mode)</Text>
              </View>
              <View style={styles.costDivider} />
              <View style={styles.costRow}>
                <Text style={styles.costLabelBold}>Estimated Cash Remaining</Text>
                <Text style={[styles.costValueBold, { color: isAffordable ? colors.text : colors.pink }]}>
                  {formatINR(Math.max(0, cash - totalCost))}
                </Text>
              </View>
            </View>

            {/* Insufficient Funds Warning */}
            {!isAffordable && (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>⚠️ Insufficient Practice Cash</Text>
                <Text style={styles.warningText}>
                  You need {formatINR(deficit)} more to buy {qty} shares. Reduce quantity or reset practice funds in dashboard.
                </Text>
              </View>
            )}

            {/* Practice Guarantee Badge */}
            <View style={styles.practiceNotice}>
              <Text style={styles.practiceNoticeIcon}>🛡️</Text>
              <Text style={styles.practiceNoticeText}>
                Zero real money used. Generated Client Order ID is tracked in your local order ledger.
              </Text>
            </View>
          </ScrollView>

          {/* Action CTA */}
          <SafeAreaView edges={['bottom']}>
            <TouchableOpacity
              style={[styles.submitBtn, !isAffordable && styles.submitBtnDisabled]}
              onPress={handleConfirmBuy}
              disabled={!isAffordable}
            >
              <Text style={styles.submitBtnText}>
                {isAffordable ? `✓ Place Practice Buy · ${formatINR(totalCost)}` : 'Insufficient Virtual Cash'}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  grabber: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  topTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 3,
    marginBottom: spacing.md,
  },
  modeTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  modeTabActiveBuy: {
    backgroundColor: colors.green,
  },
  modeTextActiveBuy: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  modeTextIdle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  symBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  symbol: {
    ...typography.h2,
    color: colors.text,
  },
  practiceTag: {
    backgroundColor: '#EAFBF3',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BFEFD9',
  },
  practiceTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.green,
  },
  name: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  price: {
    ...typography.h2,
    color: colors.text,
  },
  pct: {
    ...typography.caption,
    fontWeight: '700',
    marginTop: 2,
  },
  label: {
    ...typography.overline,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  segmentedControl: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  segBtn: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  segBtnActiveBuy: {
    backgroundColor: colors.text,
  },
  segBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textMuted,
  },
  segBtnTextActive: {
    color: colors.white,
  },
  productRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  productChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  productChipActive: {
    borderColor: colors.green,
    backgroundColor: '#EAFBF3',
  },
  productChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  productChipTextActive: {
    color: colors.green,
    fontWeight: '700',
  },
  inputWrap: {
    marginBottom: spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    backgroundColor: '#FAFAFA',
  },
  qtyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  maxQtyNote: {
    ...typography.caption,
    color: colors.textMuted,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  stepBtn: {
    width: 60,
    height: 52,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
  },
  stepTextDisabled: {
    color: '#CBD5E1',
  },
  qtyInputBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  qtyValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    padding: 0,
  },
  sharesSuffix: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
    paddingVertical: 6,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  chipMax: {
    backgroundColor: '#FEF3C7',
  },
  chipMaxText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  costCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: spacing.md,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  costLabel: {
    ...typography.bodyBold,
    color: colors.text,
  },
  costValue: {
    ...typography.h3,
    color: colors.green,
  },
  costLabelSub: {
    ...typography.caption,
    color: colors.textMuted,
  },
  costValueSub: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  costDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  costLabelBold: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },
  costValueBold: {
    ...typography.caption,
    fontWeight: '800',
  },
  warningBox: {
    backgroundColor: colors.redSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  warningTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.pink,
  },
  warningText: {
    fontSize: 12,
    color: '#9F1239',
    marginTop: 2,
    lineHeight: 16,
  },
  practiceNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.yellowCard,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  practiceNoticeIcon: {
    fontSize: 16,
  },
  practiceNoticeText: {
    flex: 1,
    fontSize: 11,
    color: '#92722A',
    lineHeight: 15,
  },
  submitBtn: {
    backgroundColor: colors.green,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  submitBtnText: {
    ...typography.bodyBold,
    color: colors.white,
    letterSpacing: 0.5,
  },
});
