/** Screen 06 — Buy / Sell Modal (bottom sheet). Order placement, practice money.
 *  State is managed by Redux: portfolioSlice (cash/holdings) + orderSlice (order log).
 */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { RootStackParamList } from '../../../app/navigation/types';
import { marketService } from '../../market/market.service';
import { Stock } from '../../market/market.types';
import { buyStock, sellStock } from '../../portfolio/slices/portfolioSlice'; // Import sellStock action
import { addLocalOrder } from '../slices/orderSlice';
import type { RootState, AppDispatch } from '../../../app/store';
import mixpanel from '@core/mixpanel';

type Props = NativeStackScreenProps<RootStackParamList, 'BuySell'>;
type OrderType = 'MARKET' | 'LIMIT' | 'STOP LOSS';

export default function BuySellScreen({ navigation, route }: Props) {
  // Safely extract mode, defaulting to 'buy' if missing
  const { symbol, mode = 'buy' } = route.params;
  const isBuyMode = mode === 'buy';
  
  const dispatch = useDispatch<AppDispatch>();
  const cash = useSelector((state: RootState) => state.portfolio.cash);
  const [stock, setStock] = useState<Stock | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [qty, setQty] = useState(5);

  useEffect(() => {
    marketService.getStock(symbol).then((s) => {
      if (s) {
        setStock(s);
      } else {
        // Fallback for custom indices like NIFTY if service misses them
        setStock({
          symbol: symbol,
          name: symbol === 'NIFTY' ? 'NIFTY 50 Index' : symbol,
          price: symbol === 'NIFTY' ? 22456.00 : 1000,
          changePct: 0.5,
          emoji: '📈'
        } as any);
      }
    }).catch(() => {
      setStock({
        symbol: symbol,
        name: symbol,
        price: 22456.00,
        changePct: 0.0,
        emoji: '📊'
      } as any);
    });
  }, [symbol]);

  if (!stock) {
    return <View style={styles.root} />;
  }

  // Safely parse price with explicit type casting to avoid TypeScript 'never' errors
  const rawPrice: any = stock.price ?? 0;
  const numericPrice = typeof rawPrice === 'string'
    ? parseFloat(rawPrice.replace(/[^0-9.]/g, ''))
    : Number(rawPrice);

  const safePrice = isNaN(numericPrice) ? 0 : numericPrice;
  const total = Math.round(safePrice * qty);
  const up = stock.changePct >= 0;

  const handleOrderTypeChange = (t: OrderType) => {
    setOrderType(t);
    mixpanel.track('order_type_selected', {
      order_type: t,
      symbol: stock.symbol,
    });
  };

  const handleQuantityChange = (newQty: number) => {
    setQty(newQty);
    mixpanel.track('quantity_changed', {
      symbol: stock.symbol,
      quantity: newQty,
      total_cost: Math.round(safePrice * newQty),
    });
  };

  const onConfirm = () => {
    const totalAmount = Math.round(safePrice * qty);
    const xpEarned = 25;

    mixpanel.track('paper_order_confirmed', {
      symbol: stock!.symbol,
      order_mode: mode,
      order_type: orderType,
      shares: qty,
      total_amount: totalAmount,
    });

    // BRANCH: Dispatch either buyStock or sellStock based on mode
    if (isBuyMode) {
      dispatch(buyStock({
        symbol: stock!.symbol,
        name: stock!.name ?? symbol,
        emoji: stock!.emoji ?? '📊',
        shares: qty,
        price: safePrice,
      }));
    } else {
      // Dispatch sell action to update portfolio holdings and increase cash
      dispatch(sellStock({
        symbol: stock!.symbol,
        shares: qty,
        price: safePrice,
      }));
    }
    
    // Record in orderSlice order log with dynamic type
    dispatch(addLocalOrder({
      symbol: stock!.symbol,
      shares: qty,
      pricePerShare: safePrice,
      type: isBuyMode ? 'BUY' : 'SELL',
      timestamp: new Date().toISOString(),
    }));

    mixpanel.track('paper_order_placed', {
      symbol: stock!.symbol,
      order_mode: mode,
      shares: qty,
      price: safePrice,
      total_amount: totalAmount,
    });

    // Option A: If navigating to TradeSuccess, you can also pop stack or handle from there.
    // Alternatively, use popToTop() to instantly clear stack and safely take the user back to the root Watchlist/Home screen:
    try {
      navigation.replace('TradeSuccess', {
        symbol: stock!.symbol,
        shares: qty,
        pricePerShare: safePrice,
        totalPaid: totalAmount,
        xpEarned,
        mode,
      });
    } catch {
      // Fallback reset if TradeSuccess isn't found in stack
      navigation.popToTop();
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.sheet}>
        <View style={styles.grabber} />

        {/* Header with quick exit safety option back to root */}
        <View style={styles.header}>
          <View>
            <Text style={styles.sym}>{stock.symbol}</Text>
            <Text style={styles.name}>{stock.name}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>{formatINR(safePrice)}</Text>
              <Text style={[styles.changePct, { color: up ? colors.green : colors.pink }]}>
                {up ? '↑' : '↓'} {stock.changePct >= 0 ? '+' : ''}{stock.changePct}%
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => navigation.popToTop()} 
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order type */}
        <Text style={styles.label}>ORDER TYPE</Text>
        <View style={styles.segment}>
          {(['MARKET', 'LIMIT', 'STOP LOSS'] as OrderType[]).map((t) => {
            const active = orderType === t;
            return (
              <TouchableOpacity key={t} style={[styles.segItem, active && styles.segItemActive]} onPress={() => handleOrderTypeChange(t)}>
                <Text style={[styles.segText, active && styles.segTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quantity */}
        <Text style={styles.label}>QUANTITY (SHARES)</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => handleQuantityChange(Math.max(1, qty - 1))}>
            <Text style={styles.stepText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{qty}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => handleQuantityChange(qty + 1)}>
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Total Cost / Proceeds */}
        <View style={[styles.totalBox, !isBuyMode && styles.totalBoxSell]}>
          <Text style={styles.totalLabel}>{isBuyMode ? 'Total Cost' : 'Total Proceeds'}</Text>
          <Text style={[styles.totalValue, !isBuyMode && { color: colors.pink }]}>{formatINR(total)}</Text>
        </View>

        {/* Practice notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>🎮  This is <Text style={{ fontWeight: '800' }}>practice money</Text> only. No real funds used. Learn safely!</Text>
        </View>

        <SafeAreaView edges={['bottom']}>
          <Button
            label={`✓ Confirm Practice ${isBuyMode ? 'Buy' : 'Sell'}`}
            variant="success"
            onPress={onConfirm}
          />
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl },
  grabber: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sym: { ...typography.h1, color: colors.text },
  name: { ...typography.body, color: colors.textMuted, marginTop: 2 },
  price: { ...typography.h1, color: colors.green },
  changePct: { ...typography.caption, marginTop: 2 },
  closeBtn: { padding: 4, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { fontSize: 18, fontWeight: 'bold', color: colors.textMuted },
  label: { ...typography.overline, color: colors.textMuted, marginTop: spacing.xl, marginBottom: spacing.md },
  segment: { flexDirection: 'row', gap: spacing.md },
  segItem: { flex: 1, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  segItemActive: { backgroundColor: colors.black },
  segText: { ...typography.caption, color: colors.textMuted, fontWeight: '700', letterSpacing: 0.5 },
  segTextActive: { color: colors.amber },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 72, height: 64, backgroundColor: colors.surfaceMuted, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 30, color: colors.text, fontWeight: '600' },
  qtyValue: { ...typography.hero, color: colors.text },
  totalBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#EAFBF3', borderWidth: 1, borderColor: '#BFEFD9', borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.xl },
  totalBoxSell: { backgroundColor: '#FDF2F2', borderColor: '#F5C6C6' },
  totalLabel: { ...typography.h3, color: colors.text },
  totalValue: { ...typography.h2, color: colors.green },
  notice: { backgroundColor: colors.yellowCard, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.md, marginBottom: spacing.xl },
  noticeText: { ...typography.body, color: '#92722A', lineHeight: 22 },
});