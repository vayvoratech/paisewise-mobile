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
import { useSelector } from 'react-redux';
import type { RootState } from '../../../app/store';
import mixpanel from '@core/mixpanel';
import { HeroBackground } from '../../../shared/ui/HeroBackground';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Practice'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function PracticeScreen({ navigation }: Props) {
  const cash = useSelector((state: RootState) => state.portfolio.cash);
  const invested = useSelector((state: RootState) => state.portfolio.invested);
  const holdingsValue = useSelector((state: RootState) => state.portfolio.holdingsValue);
  const starting = 100_000; // virtual ₹1L seed
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const profit = cash + holdingsValue - starting;

  // Track practice_screen_viewed once on mount
  useEffect(() => {
    mixpanel.track('practice_screen_viewed', {
      available_balance: cash,
      holdings_count: Number(invested > 0),
      unrealized_pnl: profit,
    });
    marketService.getTopStocks().then(setStocks);
    marketService.getMarketStatus().then((res) => {
      if (res) {
        setIsMarketOpen(res.isMarketOpen);
      }
    });
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
      available_balance: cash,
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
    <View style={styles.root}>
      <HeroBackground tone="dark" style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroInner}>
            <Pill label="● PRACTICE MODE — NO REAL MONEY" color={colors.greenBright} bg="rgba(45,227,164,0.1)" borderColor="rgba(45,227,164,0.4)" mono />
            <Text style={styles.title}>🎮 Practice Trading</Text>
            <Text style={styles.subtitle}>Learn by doing — safely!</Text>

            <Card dark style={styles.statCard} padded={false}>
              <View style={styles.statRow}>
                <Stat label="CASH LEFT" value={formatINR(cash)} />
                <View style={styles.statDivider} />
                <Stat label="INVESTED" value={formatINR(invested)} />
                <View style={styles.statDivider} />
                <Stat label="PROFIT" value={formatINR(profit)} positive={profit >= 0} />
              </View>
            </Card>
          </View>
        </SafeAreaView>
      </HeroBackground>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Top Stocks</Text>
          <Pill
            label={isMarketOpen ? "● LIVE" : "● CLOSED"}
            color={isMarketOpen ? colors.green : colors.pink}
            bg={isMarketOpen ? colors.greenSoft : colors.redSoft}
          />
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
      </ScrollView>
    </View>
  );
}

function Stat({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, positive && { color: colors.greenBright }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  hero: { flexGrow: 0 },
  heroInner: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  title: { ...typography.h1, color: colors.textOnDark, marginTop: spacing.md },
  subtitle: { ...typography.body, color: colors.textMutedDark, marginTop: spacing.xs },
  statCard: { marginTop: spacing.xl, paddingVertical: spacing.lg },
  statRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  stat: { alignItems: 'center', flex: 1 },
  statLabel: { ...typography.overline, color: colors.textMutedDark },
  statValue: { ...typography.h2, color: colors.textOnDark, marginTop: 4 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.1)' },
  sheet: { flex: 1, backgroundColor: colors.surfaceAlt, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, marginTop: -spacing.md },
  sheetContent: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
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