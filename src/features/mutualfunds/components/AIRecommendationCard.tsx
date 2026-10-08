import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { AIRecommendation } from '../mutualfunds.types';

interface Props {
  recommendation: AIRecommendation;
  fundName: string;
}

export function AIRecommendationCard({ recommendation, fundName }: Props) {
  return (
    <View style={styles.container}>
      {/* AI Header */}
      <View style={styles.headerRow}>
        <View style={styles.aiBadge}>
          <Text style={styles.aiEmoji}>🤖</Text>
          <Text style={styles.aiBadgeTitle}>PaiseWise AI Analysis</Text>
        </View>

        <View style={styles.matchScorePill}>
          <Text style={styles.boltIcon}>⚡</Text>
          <Text style={styles.matchScoreText}>{recommendation.matchScore}% Match</Text>
        </View>
      </View>

      {/* Badge Tagline */}
      <View style={styles.taglineBox}>
        <Text style={styles.taglineText}>« {recommendation.badgeText} »</Text>
      </View>

      {/* Rationale */}
      <Text style={styles.rationaleText}>{recommendation.rationale}</Text>

      {/* Pros & Cons Section */}
      <View style={styles.listsContainer}>
        {recommendation.pros.length > 0 && (
          <View style={styles.prosBox}>
            <Text style={styles.listTitleGreen}>✓ Strengths & Why to Invest</Text>
            {recommendation.pros.map((pro, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.greenCheck}>•</Text>
                <Text style={styles.bulletText}>{pro}</Text>
              </View>
            ))}
          </View>
        )}

        {recommendation.cons.length > 0 && (
          <View style={styles.consBox}>
            <Text style={styles.listTitleOrange}>⚠️ Things to Keep in Mind</Text>
            {recommendation.cons.map((con, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <Text style={styles.orangeDot}>•</Text>
                <Text style={styles.bulletText}>{con}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F7F6FD',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: '#E2DBFC',
    shadowColor: colors.purple,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aiEmoji: {
    fontSize: 18,
  },
  aiBadgeTitle: {
    ...typography.overline,
    color: colors.purpleDeep,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.8,
  },
  matchScorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.purple,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    gap: 2,
  },
  boltIcon: {
    fontSize: 10,
    color: colors.amberBright,
  },
  matchScoreText: {
    color: colors.white,
    fontWeight: '800',
    fontSize: 11,
  },
  taglineBox: {
    marginVertical: 4,
  },
  taglineText: {
    ...typography.h3,
    fontSize: 15,
    color: colors.purpleDeep,
    fontWeight: '700',
  },
  rationaleText: {
    ...typography.body,
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
    marginTop: 4,
    marginBottom: spacing.sm,
  },
  listsContainer: {
    gap: 8,
    marginTop: 4,
  },
  prosBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  consBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: radius.md,
    padding: spacing.sm + 2,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  listTitleGreen: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.green,
    marginBottom: 4,
    fontSize: 11,
  },
  listTitleOrange: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.orange,
    marginBottom: 4,
    fontSize: 11,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 3,
  },
  greenCheck: {
    color: colors.green,
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 17,
  },
  orangeDot: {
    color: colors.orange,
    fontWeight: '800',
    fontSize: 13,
    lineHeight: 17,
  },
  bulletText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.text,
    lineHeight: 17,
    flex: 1,
  },
});
