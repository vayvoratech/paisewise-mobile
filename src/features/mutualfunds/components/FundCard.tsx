import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { MutualFund } from '../mutualfunds.types';

interface Props {
  fund: MutualFund;
  onPress: (fund: MutualFund) => void;
  index?: number;
}

export function FundCard({ fund, onPress, index = 0 }: Props) {
  const isUp = fund.navChange >= 0;

  // Category badge color theme
  const categoryTheme =
    fund.category === 'large'
      ? { bg: '#E0F2FE', text: '#0284C7', border: '#BAE6FD' }
      : fund.category === 'mid'
      ? { bg: '#FEF3C7', text: '#D97706', border: '#FDE68A' }
      : { bg: '#F3E8FF', text: '#7E22CE', border: '#E9D5FF' };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(fund)}
      activeOpacity={0.85}
    >
      {/* Top Header Row */}
      <View style={styles.topRow}>
        <View style={styles.amcLogoBox}>
          <Text style={styles.amcLogoText}>{fund.amcCode.slice(0, 4)}</Text>
        </View>

        <View style={styles.fundHeaderInfo}>
          <Text style={styles.fundName} numberOfLines={1}>
            {fund.name}
          </Text>
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: categoryTheme.bg, borderColor: categoryTheme.border },
              ]}
            >
              <Text style={[styles.categoryBadgeText, { color: categoryTheme.text }]}>
                {fund.categoryLabel}
              </Text>
            </View>

            <View style={styles.ratingBadge}>
              <Text style={styles.starText}>⭐</Text>
              <Text style={styles.ratingText}>{fund.rating.toFixed(1)}</Text>
            </View>

            {fund.aiRecommendation.isRecommended && (
              <View style={styles.aiBadge}>
                <Text style={styles.aiBadgeText}>⚡ {fund.aiRecommendation.matchScore}% AI</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Metrics Row */}
      <View style={styles.metricsContainer}>
        {/* NAV Column */}
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>NAV (1D)</Text>
          <Text style={styles.navValue}>₹{fund.currentNav.toFixed(2)}</Text>
          <Text style={[styles.navChangeText, { color: isUp ? colors.green : colors.pink }]}>
            {isUp ? '↑ +' : '↓ '}{Math.abs(fund.navChangePct).toFixed(2)}%
          </Text>
        </View>

        <View style={styles.divider} />

        {/* 3Y Return Column */}
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>3Y Return</Text>
          <Text style={styles.returnVal}>+{fund.returns3Y.toFixed(1)}%</Text>
          <Text style={styles.metricSub}>Annualized</Text>
        </View>

        <View style={styles.divider} />

        {/* Expense Ratio / Min SIP Column */}
        <View style={[styles.metricCol, { alignItems: 'flex-end' }]}>
          <Text style={styles.metricLabel}>Min SIP</Text>
          <Text style={styles.minSipVal}>₹{fund.minSipAmount}/mo</Text>
          <Text style={styles.metricSub}>Exp: {fund.expenseRatio}%</Text>
        </View>
      </View>

      {/* Optional AI Tagline Footer */}
      {fund.aiRecommendation.badgeText ? (
        <View style={styles.footerTag}>
          <Text style={styles.footerTagEmoji}>💡</Text>
          <Text style={styles.footerTagText} numberOfLines={1}>
            {fund.aiRecommendation.badgeText} • {fund.riskLevel} Risk
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  amcLogoBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amcLogoText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  fundHeaderInfo: {
    flex: 1,
  },
  fundName: {
    ...typography.bodyBold,
    fontSize: 15,
    color: colors.text,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 200, 61, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  starText: {
    fontSize: 9,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#92400E',
  },
  aiBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.purple,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  metricCol: {
    flex: 1,
  },
  divider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(226, 232, 240, 0.8)',
    marginHorizontal: 8,
  },
  metricLabel: {
    ...typography.overline,
    fontSize: 9,
    color: colors.textMuted,
  },
  navValue: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
    marginTop: 1,
  },
  navChangeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  returnVal: {
    ...typography.bodyBold,
    fontSize: 14,
    color: colors.green,
    fontWeight: '800',
    marginTop: 1,
  },
  minSipVal: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.text,
    marginTop: 1,
  },
  metricSub: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
  },
  footerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(226, 232, 240, 0.6)',
  },
  footerTagEmoji: {
    fontSize: 12,
  },
  footerTagText: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
    flex: 1,
  },
});
