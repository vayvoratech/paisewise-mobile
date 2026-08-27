/** Screen 11 — Practice Trading. Virtual ₹1L, top stocks with BUY/SELL/WHY. */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../../../shared/ui/Card';
import { Pill } from '../../../shared/ui/Pill';
import { Sparkline } from '../../../shared/ui/Sparkline';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { MainTabsParamList, RootStackParamList } from '../../../app/navigation/types';
import { marketService } from '../../market/market.service';
import { Stock } from '../../market/market.types';
import mixpanel from '@core/mixpanel';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Practice'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function PracticeScreen({ navigation }: Props) {
  const [stocks, setStocks] = useState<Stock[]>([]);

  // Track practice_screen_viewed once on mount with fixed dependency array
  useEffect(() => {
    mixpanel.track('practice_screen_viewed', {
      available_balance: 100000,
      holdings_count: 0,
      unrealized_pnl: 0,
    });
    marketService.getTopStocks().then(setStocks);
  }, []);

  const handleStockTap = (stock: Stock) => {
    const rawPrice: any = stock.price ?? 0;
    const ltp = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : Number(rawPrice);

    mixpanel.track('stock_tapped', {
      symbol: stock.symbol,
      company_name: stock.name,
      source: 'practice_screen',
      ltp: isNaN(ltp) ? 0 : ltp,
    });
  };

  const handleBuyPress = (stock: Stock) => {
    const rawPrice: any = stock.price ?? 0;
    const ltpValue = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : Number(rawPrice);

    mixpanel.track('buy_modal_opened', {
      symbol: stock.symbol,
      company_name: stock.name,
      current_ltp: isNaN(ltpValue) ? 0 : ltpValue,
      source: 'practice_screen',
      is_paper: true,
      available_balance: 100000,
    });
    navigation.navigate('BuySell', { symbol: stock.symbol, mode: 'buy' } as any);
  };

  const handleSellPress = (stock: Stock) => {
    const rawPrice: any = stock.price ?? 0;
    const ltpValue = typeof rawPrice === 'string' ? parseFloat(rawPrice.replace(/[^0-9.]/g, '')) : Number(rawPrice);

    mixpanel.track('sell_modal_opened', {
      symbol: stock.symbol,
      company_name: stock.name,
      current_ltp: isNaN(ltpValue) ? 0 : ltpValue,
      source: 'practice_screen',
      is_paper: true,
      quantity_owned: 5,
    });
    navigation.navigate('BuySell', { symbol: stock.symbol, mode: 'sell' } as any);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Top Stocks</Text>
            <Pill label="● LIVE" color={colors.green} bg={colors.greenSoft} />
          </View>

          {stocks.map((s) => {
            const up = s.changePct >= 0;
            const tint = up ? colors.green : colors.pink;
            return (
              <Card key={s.symbol} style={styles.stockCard} onPress={() => handleStockTap(s)}>
                <View style={styles.stockHead}>
                  <View>
                    <Text style={styles.stockSym}>{s.symbol}</Text>
                    <Text style={styles.stockName}>{s.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.stockPrice}>{formatINR(s.price)}</Text>
                    <Text style={[styles.stockPct, { color: tint }]}>{up ? '↑' : '↓'} {Math.abs(s.changePct)}% today</Text>
                  </View>
                </View>

                <View style={[styles.chartWrap, { backgroundColor: up ? '#EAFBF3' : colors.redSoft }]}>
                  <Sparkline data={s.trend} width={280} height={56} color={tint} />
                </View>

                <View style={styles.actions}>
                  <TouchableOpacity style={[styles.action, { backgroundColor: '#E6FAF1' }]} onPress={() => handleBuyPress(s)}>
                    <Text style={[styles.actionText, { color: colors.green }]}>▲  BUY</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.action, { backgroundColor: colors.redSoft }]} onPress={() => handleSellPress(s)}>
                    <Text style={[styles.actionText, { color: colors.pink }]}>▼  SELL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.action, { backgroundColor: colors.indigoChip }]}>
                    <Text style={[styles.actionText, { color: colors.purple }]}>?  WHY</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  scrollContent: { flexGrow: 1 },
  sheet: { flex: 1, backgroundColor: colors.surfaceAlt, padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.h2, color: colors.text },
  stockCard: {},
  stockHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stockSym: { ...typography.h3, color: colors.text },
  stockName: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
  stockPrice: { ...typography.h3, color: colors.text },
  stockPct: { ...typography.caption, marginTop: spacing.xs },
  chartWrap: { borderRadius: radius.md, marginTop: spacing.md, paddingVertical: spacing.sm, alignItems: 'center', overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  action: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  actionText: { ...typography.bodyBold },
});