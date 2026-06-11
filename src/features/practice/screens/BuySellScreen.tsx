/** Screen 06 — Buy / Sell Modal (bottom sheet). Order placement, practice money. */
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { RootStackParamList } from '../../../app/navigation/types';
import { marketService } from '../../market/market.service';
import { Stock } from '../../market/market.types';
import { usePracticeAccount } from '../../portfolio/PracticeAccountContext';

type Props = NativeStackScreenProps<RootStackParamList, 'BuySell'>;
type OrderType = 'MARKET' | 'LIMIT' | 'STOP LOSS';

export default function BuySellScreen({ navigation, route }: Props) {
  const { symbol, mode } = route.params;
  const { buy } = usePracticeAccount();
  const [stock, setStock] = useState<Stock | null>(null);
  const [orderType, setOrderType] = useState<OrderType>('MARKET');
  const [qty, setQty] = useState(5);

  useEffect(() => {
    marketService.getStock(symbol).then((s) => setStock(s ?? null));
  }, [symbol]);

  if (!stock) {
    return <View style={styles.root} />;
  }

  const total = Math.round(stock.price * qty);
  const up = stock.changePct >= 0;

  const onConfirm = () => {
    const result = buy(stock.symbol, stock.name, stock.emoji, qty, stock.price);
    navigation.replace('TradeSuccess', result);
  };

  return (
    <View style={styles.root}>
      <View style={styles.sheet}>
        <View style={styles.grabber} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.sym}>{stock.symbol}</Text>
            <Text style={styles.name}>{stock.name}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.price}>{formatINR(stock.price)}</Text>
            <Text style={[styles.changePct, { color: up ? colors.green : colors.pink }]}>{up ? '↑' : '↓'} +{Math.abs(stock.changePct)}%</Text>
          </View>
        </View>

        {/* Order type */}
        <Text style={styles.label}>ORDER TYPE</Text>
        <View style={styles.segment}>
          {(['MARKET', 'LIMIT', 'STOP LOSS'] as OrderType[]).map((t) => {
            const active = orderType === t;
            return (
              <TouchableOpacity key={t} style={[styles.segItem, active && styles.segItemActive]} onPress={() => setOrderType(t)}>
                <Text style={[styles.segText, active && styles.segTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quantity */}
        <Text style={styles.label}>QUANTITY (SHARES)</Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity style={styles.stepBtn} onPress={() => setQty((q) => Math.max(1, q - 1))}>
            <Text style={styles.stepText}>−</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{qty}</Text>
          <TouchableOpacity style={styles.stepBtn} onPress={() => setQty((q) => q + 1)}>
            <Text style={styles.stepText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* Total */}
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total Cost</Text>
          <Text style={styles.totalValue}>{formatINR(total)}</Text>
        </View>

        {/* Practice notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>🎮  This is <Text style={{ fontWeight: '800' }}>practice money</Text> only. No real funds used. Learn safely!</Text>
        </View>

        <SafeAreaView edges={['bottom']}>
          <Button
            label={`✓ Confirm Practice ${mode === 'buy' ? 'Buy' : 'Sell'}`}
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
  totalLabel: { ...typography.h3, color: colors.text },
  totalValue: { ...typography.h2, color: colors.green },
  notice: { backgroundColor: colors.yellowCard, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.md, marginBottom: spacing.xl },
  noticeText: { ...typography.body, color: '#92722A', lineHeight: 22 },
});
