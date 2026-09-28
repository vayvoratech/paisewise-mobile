import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { BADGES, Badge, BadgeCategory } from '../profile.data';
import { Card } from '../../../shared/ui/Card';

const CATEGORIES: { label: string; value: BadgeCategory }[] = [
  { label: 'All Badges', value: 'ALL' },
  { label: 'Consistency', value: 'CONSISTENCY' },
  { label: 'Learner', value: 'LEARNER' },
  { label: 'Practitioner', value: 'PRACTITIONER' },
  { label: 'Milestones', value: 'MILESTONES' },
];

export default function BadgesScreen() {
  const navigation = useNavigation<any>();
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory>('ALL');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const filteredBadges = BADGES.filter(
    (b) => selectedCategory === 'ALL' || b.category === selectedCategory
  );

  const unlockedCount = BADGES.filter((b) => b.isUnlocked).length;
  const totalCount = BADGES.length;

  return (
    <SafeAreaView style={styles.root}>
      {/* Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Badges & Achievements</Text>
          <Text style={styles.headerSubtitle}>
            {unlockedCount} of {totalCount} Badges Unlocked 🏆
          </Text>
        </View>
      </View>

      {/* Category Tabs */}
      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContent}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <TouchableOpacity
                key={cat.value}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => setSelectedCategory(cat.value)}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Grid of Badges */}
      <ScrollView contentContainerStyle={styles.gridContent}>
        <View style={styles.grid}>
          {filteredBadges.map((badge) => (
            <TouchableOpacity
              key={badge.id}
              style={styles.cardWrapper}
              activeOpacity={0.85}
              onPress={() => setSelectedBadge(badge)}
            >
              <Card style={[styles.badgeCard, !badge.isUnlocked && styles.badgeCardLocked]}>
                {!badge.isUnlocked && (
                  <View style={styles.lockBadge}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}

                <Text style={[styles.badgeEmoji, !badge.isUnlocked && styles.emojiLocked]}>
                  {badge.emoji}
                </Text>

                <Text style={styles.badgeTitle} numberOfLines={1}>
                  {badge.title}
                </Text>
                
                <Text style={styles.categoryTag}>{badge.category}</Text>

                {badge.isUnlocked ? (
                  <View style={styles.unlockedTag}>
                    <Text style={styles.unlockedText}>✓ EARNED</Text>
                  </View>
                ) : (
                  <View style={styles.progressContainer}>
                    <View style={styles.progressBarBg}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${Math.min(100, (badge.progress / badge.maxProgress) * 100)}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {badge.progress} / {badge.maxProgress}
                    </Text>
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <Modal
          transparent
          visible={!!selectedBadge}
          animationType="fade"
          onRequestClose={() => setSelectedBadge(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalEmoji}>{selectedBadge.emoji}</Text>
              <Text style={styles.modalTitle}>{selectedBadge.title}</Text>
              <Text style={styles.modalCategory}>{selectedBadge.category} BADGE</Text>

              <Text style={styles.modalDescription}>{selectedBadge.description}</Text>

              <View style={styles.modalMetricsBox}>
                <Text style={styles.metricItem}>
                  🎁 XP Reward: <Text style={styles.metricVal}>+{selectedBadge.xpBonus} XP</Text>
                </Text>
                <Text style={styles.metricItem}>
                  STATUS:{' '}
                  <Text style={[styles.metricVal, selectedBadge.isUnlocked ? styles.textEarned : styles.textLocked]}>
                    {selectedBadge.isUnlocked ? '✓ EARNED' : '🔒 LOCKED'}
                  </Text>
                </Text>
                {selectedBadge.unlockedAt && (
                  <Text style={styles.metricItem}>
                    UNLOCKED ON: <Text style={styles.metricVal}>{selectedBadge.unlockedAt}</Text>
                  </Text>
                )}
              </View>

              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setSelectedBadge(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.md,
  },
  backArrow: {
    fontSize: 24,
    color: colors.text,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.text,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.purple,
    fontWeight: '700',
    marginTop: 2,
  },
  tabContainer: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabsContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  tabPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabPillActive: {
    backgroundColor: colors.purple,
    borderColor: colors.purple,
  },
  tabLabel: {
    ...typography.bodyBold,
    fontSize: 13,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.white,
  },
  gridContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  cardWrapper: {
    width: '47.5%',
  },
  badgeCard: {
    padding: spacing.lg,
    alignItems: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  badgeCardLocked: {
    backgroundColor: 'rgba(241, 245, 249, 0.7)',
    borderColor: colors.border,
    opacity: 0.85,
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 12,
  },
  badgeEmoji: {
    fontSize: 42,
    marginBottom: spacing.xs,
  },
  emojiLocked: {
    opacity: 0.5,
  },
  badgeTitle: {
    ...typography.bodyBold,
    color: colors.text,
    textAlign: 'center',
    fontSize: 14,
  },
  categoryTag: {
    ...typography.overline,
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  unlockedTag: {
    marginTop: spacing.md,
    backgroundColor: colors.greenSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  unlockedText: {
    ...typography.caption,
    color: colors.green,
    fontWeight: '800',
    fontSize: 10,
  },
  progressContainer: {
    width: '100%',
    marginTop: spacing.md,
    alignItems: 'center',
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.purple,
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    elevation: 5,
  },
  modalEmoji: {
    fontSize: 56,
    marginBottom: spacing.xs,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  modalCategory: {
    ...typography.overline,
    color: colors.purple,
    fontWeight: '800',
    marginTop: 2,
    marginBottom: spacing.md,
  },
  modalDescription: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  modalMetricsBox: {
    width: '100%',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: 6,
  },
  metricItem: {
    ...typography.caption,
    color: colors.textMuted,
  },
  metricVal: {
    ...typography.bodyBold,
    color: colors.text,
  },
  textEarned: {
    color: colors.green,
  },
  textLocked: {
    color: '#e53e3e',
  },
  closeBtn: {
    backgroundColor: colors.purple,
    paddingVertical: spacing.md,
    width: '100%',
    borderRadius: radius.md,
    alignItems: 'center',
  },
  closeBtnText: {
    ...typography.bodyBold,
    color: colors.white,
  },
});
