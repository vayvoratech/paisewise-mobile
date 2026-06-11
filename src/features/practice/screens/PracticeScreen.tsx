/** Screen 11 — Practice Trading. Virtual ₹1L, top stocks with BUY/SELL/WHY. */
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Card } from '../../../shared/ui/Card';
import { Pill } from '../../../shared/ui/Pill';
import { Sparkline } from '../../../shared/ui/Sparkline';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { MainTabsParamList, RootStackParamList } from '../../../app/navigation/types';
import { marketService } from '../../market/market.service';
import { Stock } from '../../market/market.types';
import { usePracticeAccount } from '../../portfolio/PracticeAccountContext';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Practice'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function PracticeScreen({ navigation }: Props) {
  const { cash, invested, holdingsValue, starting } = usePracticeAccount();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const profit = cash + holdingsValue - starting;

  useEffect(() => {
    marketService.getTopStocks().then(setStocks);
  }, []);

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
                <Stat label="PROFIT" value={formatINR(profit)} positive />
              </View>
            </Card>
          </View>
        </SafeAreaView>
      </HeroBackground>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Top Stocks</Text>
          <Pill label="● LIVE" color={colors.green} bg={colors.greenSoft} />
        </View>

        {stocks.map((s) => {
          const up = s.changePct >= 0;
          const tint = up ? colors.green : colors.pink;
          return (
            <Card key={s.symbol} style={styles.stockCard}>
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
                <TouchableOpacity style={[styles.action, { backgroundColor: '#E6FAF1' }]} onPress={() => navigation.navigate('BuySell', { symbol: s.symbol, mode: 'buy' })}>
                  <Text style={[styles.actionText, { color: colors.green }]}>▲  BUY</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.action, { backgroundColor: colors.redSoft }]} onPress={() => navigation.navigate('BuySell', { symbol: s.symbol, mode: 'sell' })}>
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
  heroInner: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, paddingTop: spacing.md },
  title: { ...typography.h1, color: colors.textOnDark, marginTop: spacing.lg },
  subtitle: { ...typography.body, color: colors.textMutedDark, marginTop: spacing.xs },
  statCard: { marginTop: spacing.lg, paddingVertical: spacing.lg },
  statRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.sm },
  statDivider: { width: 1, height: 36, backgroundColor: colors.borderDark },
  statLabel: { ...typography.overline, color: colors.textMutedDark, fontSize: 11 },
  statValue: { ...typography.h3, color: colors.textOnDark, marginTop: spacing.xs },
  sheet: { flex: 1, backgroundColor: colors.surfaceAlt, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, marginTop: -spacing.md },
  sheetContent: { padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.h2, color: colors.text },
  stockCard: {},
  stockHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  stockSym: { ...typography.h3, color: colors.text },
  stockName: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  stockPrice: { ...typography.h3, color: colors.text },
  stockPct: { ...typography.caption, marginTop: 2 },
  chartWrap: { borderRadius: radius.md, marginTop: spacing.md, paddingVertical: spacing.sm, alignItems: 'center', overflow: 'hidden' },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  action: { flex: 1, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center' },
  actionText: { ...typography.bodyBold },
});
