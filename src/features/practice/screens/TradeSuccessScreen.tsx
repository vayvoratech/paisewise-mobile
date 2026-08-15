/** Trade Success — confirmation + XP earned + order receipt. */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { RootStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TradeSuccess'>;

export default function TradeSuccessScreen({ navigation, route }: Props) {
  const { symbol, shares, pricePerShare, totalPaid, xpEarned } = route.params;

  const rows: [string, string][] = [
    ['STOCK', symbol],
    ['QUANTITY', `${shares} shares`],
    ['PRICE/SHARE', `₹${pricePerShare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
    ['TOTAL PAID', formatINR(totalPaid)],
    ['ORDER TYPE', 'MARKET · CNC'],
  ];

  return (
    <LinearGradient colors={['#06140E', '#0B2018', '#06140E']} style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.checkCircle}>
            <Text style={styles.check}>✅</Text>
          </View>

          <Text style={styles.title}>Trade</Text>
          <Text style={styles.titleAccent}>Successful!</Text>
          <Text style={styles.sub}>You just bought {shares} shares of {symbol}.{'\n'}You're officially an investor now!</Text>

          {/* Receipt */}
          <View style={styles.receipt}>
            {rows.map(([k, v]) => (
              <View key={k} style={styles.receiptRow}>
                <Text style={styles.receiptKey}>{k}</Text>
                <Text style={styles.receiptVal}>{v}</Text>
              </View>
            ))}
            <View style={[styles.receiptRow, styles.receiptRowLast]}>
              <Text style={styles.receiptKey}>STATUS</Text>
              <Text style={[styles.receiptVal, { color: colors.greenBright }]}>● FILLED</Text>
            </View>
          </View>

          {/* XP */}
          <View style={styles.xpBox}>
            <Text style={styles.xpStar}>⭐</Text>
            <View>
              <Text style={styles.xpLabel}>XP Earned for this trade</Text>
              <Text style={styles.xpValue}>+{xpEarned} XP — Level up soon!</Text>
            </View>
          </View>
        </ScrollView>

        <Button label="Back to Portfolio  →" variant="success" onPress={() => navigation.replace('MainTabs', { screen: 'Portfolio' })} />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.lg },
  content: { alignItems: 'center', paddingTop: spacing.xxl },
  checkCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: 'rgba(45,227,164,0.4)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(45,227,164,0.06)' },
  check: { fontSize: 56 },
  title: { ...typography.hero, color: colors.textOnDark, marginTop: spacing.xl },
  titleAccent: { ...typography.hero, color: colors.greenBright, marginTop: -spacing.xs },
  sub: { ...typography.body, color: colors.textMutedDark, textAlign: 'center', marginTop: spacing.lg, lineHeight: 24 },
  receipt: { width: '100%', backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.borderDark, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.xl },
  receiptRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  receiptRowLast: { borderBottomWidth: 0 },
  receiptKey: { ...typography.overline, color: colors.textMutedDark, letterSpacing: 1 },
  receiptVal: { ...typography.bodyBold, color: colors.textOnDark, letterSpacing: 0.5 },
  xpBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, width: '100%', backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)', borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.lg },
  xpStar: { fontSize: 40 },
  xpLabel: { ...typography.caption, color: colors.textMutedDark },
  xpValue: { ...typography.h3, color: colors.amber, marginTop: 2, flexShrink: 1 },
});
