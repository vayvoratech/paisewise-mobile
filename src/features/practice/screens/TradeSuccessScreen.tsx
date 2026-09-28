/**
 * TradeSuccessScreen — Practice trade execution confirmation screen.
 * Features: Confetti celebration animation, full trade stats receipt, clientOrderId,
 * gamification XP, and dual navigation CTAs.
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { useSelector } from 'react-redux';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { RootStackParamList } from '../../../app/navigation/types';
import { ConfettiView } from '../components/ConfettiView';
import type { RootState } from '../../../app/store';

type Props = NativeStackScreenProps<RootStackParamList, 'TradeSuccess'>;

export default function TradeSuccessScreen({ navigation, route }: Props) {
  const currentCash = useSelector((state: RootState) => state.portfolio.cash);

  const params = route.params as {
    symbol: string;
    shares: number;
    pricePerShare: number;
    totalPaid: number;
    xpEarned: number;
    mode?: 'buy' | 'sell';
    clientOrderId?: string;
  };

  const {
    symbol,
    shares,
    pricePerShare,
    totalPaid,
    xpEarned = 25,
    mode = 'buy',
    clientOrderId = `PW-${Date.now().toString(36).toUpperCase()}`,
  } = params;

  const isBuy = mode === 'buy';
  const now = new Date();
  const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const statsRows: [string, string, boolean?][] = [
    ['ORDER ID', clientOrderId, true],
    ['STOCK SYMBOL', symbol],
    ['TRANSACTION', isBuy ? 'PRACTICE BUY' : 'PRACTICE SELL'],
    ['QUANTITY', `${shares} ${shares === 1 ? 'Share' : 'Shares'}`],
    ['EXECUTION PRICE', `₹${pricePerShare.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
    [isBuy ? 'TOTAL INVESTED' : 'TOTAL PROCEEDS', formatINR(totalPaid)],
    ['PRODUCT / ORDER', 'MARKET · DELIVERY (CNC)'],
    ['BROKERAGE & TAXES', '₹0.00 (Zero Fee Practice)'],
    ['PRACTICE CASH LEFT', formatINR(currentCash)],
  ];

  return (
    <LinearGradient colors={['#05150E', '#092316', '#030D08']} style={styles.root}>
      {/* Confetti Celebration Burst */}
      <ConfettiView count={60} />

      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Animated Glow Circle */}
          <View style={styles.checkCircle}>
            <View style={styles.checkInnerCircle}>
              <Text style={styles.checkEmoji}>🎉</Text>
            </View>
          </View>

          {/* Title & Subtitle */}
          <Text style={styles.title}>Practice Trade</Text>
          <Text style={[styles.titleAccent, !isBuy && { color: colors.pink }]}>
            {isBuy ? 'Executed Successfully!' : 'Sold Successfully!'}
          </Text>

          <Text style={styles.sub}>
            {isBuy
              ? `You added ${shares} ${shares === 1 ? 'share' : 'shares'} of ${symbol} to your Practice Portfolio.`
              : `You successfully sold ${shares} ${shares === 1 ? 'share' : 'shares'} of ${symbol}. Cash proceeds credited.`}
          </Text>

          {/* Stats Receipt Card */}
          <View style={styles.receipt}>
            <View style={styles.receiptHeader}>
              <View style={styles.receiptBadge}>
                <Text style={styles.receiptBadgeText}>OFFICIAL PRACTICE RECEIPT</Text>
              </View>
              <Text style={styles.receiptTime}>{timeFormatted}</Text>
            </View>

            {statsRows.map(([label, val, isMono]) => (
              <View key={label} style={styles.receiptRow}>
                <Text style={styles.receiptKey}>{label}</Text>
                <Text style={[styles.receiptVal, isMono && styles.monoVal]}>{val}</Text>
              </View>
            ))}

            <View style={[styles.receiptRow, styles.receiptRowLast]}>
              <Text style={styles.receiptKey}>EXECUTION STATUS</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusDot}>●</Text>
                <Text style={styles.statusText}>FILLED</Text>
              </View>
            </View>
          </View>

          {/* Gamification XP Card */}
          <View style={styles.xpBox}>
            <View style={styles.xpStarBox}>
              <Text style={styles.xpStar}>⭐</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.xpLabel}>PRACTICE TRADER XP</Text>
              <Text style={styles.xpValue}>+{xpEarned} XP Earned · Great job!</Text>
              <Text style={styles.xpSub}>Learning by doing without risking real capital.</Text>
            </View>
          </View>

          {/* Educational Insight Tip */}
          <View style={styles.tipBox}>
            <Text style={styles.tipTitle}>💡 Investor Learning Note</Text>
            <Text style={styles.tipText}>
              {isBuy
                ? 'Check your Portfolio screen to see live unrealized gains as market prices update!'
                : 'Taking profits or cutting losses is a key discipline of successful traders.'}
            </Text>
          </View>

          {/* Navigation Action Buttons */}
          <View style={styles.actionsWrap}>
            <Button
              label="View Practice Portfolio  →"
              variant="success"
              onPress={() => navigation.replace('MainTabs', { screen: 'Portfolio' })}
            />

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.replace('MainTabs', { screen: 'Practice' })}
            >
              <Text style={styles.secondaryBtnText}>🎮 Trade More Stocks</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  checkCircle: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(52, 211, 153, 0.08)',
  },
  checkInnerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(52, 211, 153, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkEmoji: { fontSize: 42 },
  title: {
    ...typography.h2,
    color: colors.textOnDark,
    marginTop: spacing.lg,
  },
  titleAccent: {
    ...typography.hero,
    fontSize: 26,
    color: colors.greenBright,
    marginTop: 2,
    textAlign: 'center',
  },
  sub: {
    ...typography.body,
    color: colors.textMutedDark,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 22,
    paddingHorizontal: spacing.md,
  },
  receipt: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginTop: spacing.xl,
  },
  receiptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
    marginBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  receiptBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  receiptBadgeText: {
    ...typography.overline,
    fontSize: 9,
    color: colors.greenBright,
    letterSpacing: 1,
  },
  receiptTime: {
    fontSize: 12,
    color: colors.textMutedDark,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  receiptRowLast: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  receiptKey: {
    ...typography.overline,
    fontSize: 11,
    color: colors.textMutedDark,
    letterSpacing: 0.8,
  },
  receiptVal: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.textOnDark,
    letterSpacing: 0.3,
  },
  monoVal: {
    fontSize: 12,
    color: colors.greenBright,
    letterSpacing: 1,
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    color: colors.greenBright,
    fontSize: 12,
  },
  statusText: {
    ...typography.caption,
    color: colors.greenBright,
    fontWeight: '800',
    letterSpacing: 1,
  },
  xpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    width: '100%',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.35)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  xpStarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  xpStar: { fontSize: 26 },
  xpLabel: {
    ...typography.overline,
    fontSize: 10,
    color: colors.amberBright,
  },
  xpValue: {
    ...typography.bodyBold,
    color: colors.amberBright,
    fontSize: 15,
  },
  xpSub: {
    fontSize: 12,
    color: colors.textMutedDark,
    marginTop: 1,
  },
  tipBox: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tipTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  tipText: {
    fontSize: 12,
    color: colors.textMutedDark,
    marginTop: 2,
    lineHeight: 18,
  },
  actionsWrap: {
    width: '100%',
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  secondaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...typography.bodyBold,
    color: colors.textOnDark,
  },
});