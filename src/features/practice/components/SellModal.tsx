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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { Stock } from '../../market/market.types';
import { sellStock } from '../../portfolio/slices/portfolioSlice';
import { addLocalOrder } from '../slices/orderSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import mixpanel from '@core/mixpanel';
import { generateClientOrderId, estimateTradingCharges } from '../utils/orderUtils';
import { OrderType, ProductType } from './BuyModal';

interface SellModalProps {
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
    mode: 'sell';
  }) => void;
  onSwitchToBuy?: () => void;
}

export function SellModal({
  visible,
  stock,
  onClose,
  onSuccess,
  onSwitchToBuy,
}: SellModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const holdings = useSelector((state: RootState) => state.portfolio.holdings);
  const cash = useSelector((state: RootState) => state.portfolio.cash);

  // Find if user owns this stock in practice portfolio
  const userHolding = holdings.find((h) => h.symbol.toUpperCase() === stock.symbol.toUpperCase());
  const ownedShares = userHolding ? userHolding.shares : 0;
  const avgBuyPrice = userHolding ? userHolding.avgPrice : 0;

  const rawPrice: any = stock.price ?? 0;
  const ltp = typeof rawPrice === 'string'
    ? parseFloat(rawPrice.replace(/[^0-9.]/g, ''))
    : Number(rawPrice);
  const safeLtp = isNaN(ltp) ? 1000 : ltp;

  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [productType, setProductType] = useState<ProductType>('DELIVERY');
  const [qty, setQty] = useState(ownedShares > 0 ? Math.min(ownedShares, 5) : 1);
  const [limitPrice, setLimitPrice] = useState(safeLtp.toFixed(2));
  const [triggerPrice, setTriggerPrice] = useState((safeLtp * 1.05).toFixed(2));

  const effectivePrice = orderType === 'LIMIT'
    ? parseFloat(limitPrice) || safeLtp
    : safeLtp;

  const totalProceeds = Math.round(qty * effectivePrice);
  const canSell = ownedShares > 0 && qty <= ownedShares;
  const costBasis = Math.round(qty * avgBuyPrice);
  const estimatedPnl = totalProceeds - costBasis;
  const pnlPct = costBasis > 0 ? ((estimatedPnl / costBasis) * 100).toFixed(1) : '0.0';

  const charges = estimateTradingCharges(totalProceeds, 'sell', productType);

  const handleQtyChange = (newQty: number) => {
    const val = Math.max(1, Math.min(newQty, ownedShares || 1));
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

  const handleConfirmSell = () => {
    if (!canSell) return;

    const clientOrderId = generateClientOrderId('PW-SELL');
    const orderId = `ord_${Date.now()}`;

    mixpanel.track('paper_order_confirmed', {
      symbol: stock.symbol,
      side: 'SELL',
      order_type: orderType,
      quantity: qty,
      price: effectivePrice,
      total_value: totalProceeds,
      is_paper: true,
      client_order_id: clientOrderId,
      balance_after_estimate: cash + totalProceeds,
    });

    // 1. Dispatch sellStock to portfolioSlice
    dispatch(
      sellStock({
        symbol: stock.symbol,
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
        type: 'SELL',
        timestamp: new Date().toISOString(),
      })
    );

    mixpanel.track('paper_order_placed', {
      order_id: orderId,
      client_order_id: clientOrderId,
      symbol: stock.symbol,
      side: 'SELL',
      quantity: qty,
      fill_price: effectivePrice,
      total_value: totalProceeds,
      is_paper: true,
      time_to_confirm_ms: 120,
    });

    onClose();
    onSuccess({
      symbol: stock.symbol,
      shares: qty,
      pricePerShare: effectivePrice,
      totalPaid: totalProceeds,
      xpEarned: 25,
      clientOrderId,
      mode: 'sell',
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />

          {/* Mode Switcher Segmented Control */}
          <View style={styles.topTabs}>
            <TouchableOpacity
              style={styles.modeTab}
              onPress={() => {
                if (onSwitchToBuy) onSwitchToBuy();
              }}
            >
              <Text style={styles.modeTextIdle}>SWITCH TO BUY</Text>
            </TouchableOpacity>
            <View style={[styles.modeTab, styles.modeTabActiveSell]}>
              <Text style={styles.modeTextActiveSell}>SELL (Practice)</Text>
            </View>
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
            {/* Holdings Summary Bar */}
            <View style={styles.holdingBanner}>
              <View>
                <Text style={styles.holdingBannerLabel}>YOU OWN IN PRACTICE</Text>
                <Text style={styles.holdingBannerVal}>
                  {ownedShares} {ownedShares === 1 ? 'Share' : 'Shares'}
                </Text>
              </View>
              {ownedShares > 0 && (
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.holdingBannerLabel}>AVG PURCHASE PRICE</Text>
                  <Text style={styles.holdingBannerVal}>{formatINR(avgBuyPrice)}</Text>
                </View>
              )}
            </View>

            {/* Order Type Segmented Control */}
            <Text style={styles.label}>ORDER TYPE</Text>
            <View style={styles.segmentedControl}>
              {(['MARKET', 'LIMIT', 'STOP LOSS'] as OrderType[]).map((type) => {
                const active = orderType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.segBtn, active && styles.segBtnActiveSell]}
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
              <Text style={styles.label}>QUANTITY TO SELL</Text>
              <Text style={styles.maxQtyNote}>Available: {ownedShares} shares</Text>
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
                disabled={ownedShares > 0 && qty >= ownedShares}
              >
                <Text style={[styles.stepText, ownedShares > 0 && qty >= ownedShares && styles.stepTextDisabled]}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Add Chips */}
            <View style={styles.quickChipsRow}>
              {[1, 5, 10].map((addVal) => (
                <TouchableOpacity
                  key={addVal}
                  style={styles.chip}
                  onPress={() => handleQtyChange(Math.min(ownedShares || 1, qty + addVal))}
                  disabled={ownedShares <= 0}
                >
                  <Text style={styles.chipText}>+{addVal}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.chip, styles.chipMax]}
                onPress={() => handleQtyChange(ownedShares || 1)}
                disabled={ownedShares <= 0}
              >
                <Text style={styles.chipMaxText}>SELL ALL ({ownedShares})</Text>
              </TouchableOpacity>
            </View>

            {/* Live Proceeds & P&L Breakdown */}
            <View style={styles.costCard}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Total Sale Proceeds</Text>
                <Text style={[styles.costValue, { color: colors.pink }]}>{formatINR(totalProceeds)}</Text>
              </View>
              {ownedShares > 0 && (
                <View style={styles.costRow}>
                  <Text style={styles.costLabelSub}>Estimated Realized P&L</Text>
                  <Text style={[styles.costValueSub, { color: estimatedPnl >= 0 ? colors.green : colors.pink }]}>
                    {estimatedPnl >= 0 ? '+' : ''}{formatINR(estimatedPnl)} ({estimatedPnl >= 0 ? '+' : ''}{pnlPct}%)
                  </Text>
                </View>
              )}
              <View style={styles.costRow}>
                <Text style={styles.costLabelSub}>Brokerage & Taxes</Text>
                <Text style={[styles.costValueSub, { color: colors.green }]}>₹0.00 (Practice Mode)</Text>
              </View>
              <View style={styles.costDivider} />
              <View style={styles.costRow}>
                <Text style={styles.costLabelBold}>Estimated Cash After Sale</Text>
                <Text style={[styles.costValueBold, { color: colors.text }]}>
                  {formatINR(cash + totalProceeds)}
                </Text>
              </View>
            </View>

            {/* Warnings if cannot sell */}
            {ownedShares <= 0 && (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>⚠️ Zero Holdings in Practice Portfolio</Text>
                <Text style={styles.warningText}>
                  You don't own any shares of {stock.symbol}. You can only sell shares after buying them in Practice Mode.
                </Text>
              </View>
            )}

            {ownedShares > 0 && qty > ownedShares && (
              <View style={styles.warningBox}>
                <Text style={styles.warningTitle}>⚠️ Quantity Exceeds Holdings</Text>
                <Text style={styles.warningText}>
                  You only have {ownedShares} shares to sell.
                </Text>
              </View>
            )}

            {/* Practice Guarantee Badge */}
            <View style={styles.practiceNotice}>
              <Text style={styles.practiceNoticeIcon}>🛡️</Text>
              <Text style={styles.practiceNoticeText}>
                Proceeds are credited immediately to your virtual practice balance.
              </Text>
            </View>
          </ScrollView>

          {/* Action CTA */}
          <SafeAreaView edges={['bottom']}>
            <TouchableOpacity
              style={[styles.submitBtn, !canSell && styles.submitBtnDisabled]}
              onPress={handleConfirmSell}
              disabled={!canSell}
            >
              <Text style={styles.submitBtnText}>
                {canSell ? `✓ Place Practice Sell · ${formatINR(totalProceeds)}` : 'Cannot Sell (No Holdings)'}
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
  modeTabActiveSell: {
    backgroundColor: colors.pink,
  },
  modeTextActiveSell: {
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
    backgroundColor: '#FDE8EC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  practiceTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.pink,
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
  holdingBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: spacing.sm,
  },
  holdingBannerLabel: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textMuted,
  },
  holdingBannerVal: {
    ...typography.bodyBold,
    color: colors.text,
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
  segBtnActiveSell: {
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
    borderColor: colors.pink,
    backgroundColor: '#FDE8EC',
  },
  productChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
  },
  productChipTextActive: {
    color: colors.pink,
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
    backgroundColor: '#FEE2E2',
  },
  chipMaxText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#991B1B',
  },
  costCard: {
    backgroundColor: '#FDF2F2',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#FECDD3',
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
    color: colors.pink,
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
    backgroundColor: '#FCA5A5',
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
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: '#F87171',
  },
  warningTitle: {
    ...typography.caption,
    fontWeight: '800',
    color: '#B91C1C',
  },
  warningText: {
    fontSize: 12,
    color: '#7F1D1D',
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
    backgroundColor: colors.pink,
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
