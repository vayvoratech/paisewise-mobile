import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { FaqItem } from '../help.data';

interface FaqAccordionItemProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
}

export const FaqAccordionItem: React.FC<FaqAccordionItemProps> = ({
  item,
  isOpen,
  onToggle,
}) => {
  const [feedback, setFeedback] = useState<'YES' | 'NO' | null>(null);

  const getCategoryColor = (category: FaqItem['category']) => {
    switch (category) {
      case 'TRADING':
        return { bg: '#E0F2FE', text: '#0369A1' };
      case 'LEARNING':
        return { bg: '#FEF3C7', text: '#B45309' };
      case 'DPDP':
        return { bg: '#EDE9FE', text: '#6D28D9' };
      case 'SEBI':
        return { bg: '#DCFCE7', text: '#15803D' };
      default:
        return { bg: colors.surfaceMuted, text: colors.textMuted };
    }
  };

  const catColors = getCategoryColor(item.category);

  return (
    <View style={[styles.container, isOpen && styles.containerExpanded]}>
      {/* Header / Question row */}
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.7}
        onPress={onToggle}
      >
        <View style={styles.titleContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: catColors.bg }]}>
            <Text style={[styles.categoryBadgeText, { color: catColors.text }]}>
              {item.category}
            </Text>
          </View>
          <Text style={[styles.questionText, isOpen && styles.questionTextExpanded]}>
            {item.question}
          </Text>
        </View>

        <View style={[styles.chevronBox, isOpen && styles.chevronBoxExpanded]}>
          <Text style={[styles.chevronText, isOpen && styles.chevronTextExpanded]}>
            {isOpen ? '▲' : '▼'}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Expandable Answer */}
      {isOpen && (
        <View style={styles.answerContainer}>
          <Text style={styles.answerText}>{item.answer}</Text>

          {item.highlights && item.highlights.length > 0 && (
            <View style={styles.highlightsBox}>
              <Text style={styles.highlightsHeading}>Key Highlights:</Text>
              {item.highlights.map((h, idx) => (
                <View key={idx} style={styles.highlightRow}>
                  <Text style={styles.highlightBullet}>•</Text>
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Feedback footer */}
          <View style={styles.feedbackRow}>
            <Text style={styles.feedbackPrompt}>Was this answer helpful?</Text>
            {feedback === null ? (
              <View style={styles.feedbackButtons}>
                <TouchableOpacity
                  style={styles.feedbackBtn}
                  onPress={() => setFeedback('YES')}
                >
                  <Text style={styles.feedbackBtnText}>👍 Yes</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.feedbackBtn}
                  onPress={() => setFeedback('NO')}
                >
                  <Text style={styles.feedbackBtnText}>👎 No</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.feedbackThankYou}>
                ✓ Thanks for your feedback!
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  containerExpanded: {
    borderColor: colors.purple,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  titleContainer: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  questionText: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  questionTextExpanded: {
    color: colors.purpleDeep,
  },
  chevronBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronBoxExpanded: {
    backgroundColor: colors.indigoChip,
  },
  chevronText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '800',
  },
  chevronTextExpanded: {
    color: colors.purple,
  },
  answerContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
  },
  answerText: {
    ...typography.body,
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: spacing.sm,
  },
  highlightsBox: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.sm,
    gap: 4,
  },
  highlightsHeading: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  highlightBullet: {
    color: colors.purple,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
  },
  highlightText: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 18,
    flex: 1,
  },
  feedbackRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceAlt,
  },
  feedbackPrompt: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  feedbackButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  feedbackBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedbackBtnText: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '600',
  },
  feedbackThankYou: {
    fontSize: 11,
    color: colors.green,
    fontWeight: '700',
  },
});
