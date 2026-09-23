import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';

export interface LevelUpModalProps {
  visible: boolean;
  level: number;
  levelTitle?: string;
  xpAwarded?: number;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  visible,
  level,
  levelTitle = 'Smart Investor',
  xpAwarded = 100,
  onClose,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.iconRing}>
            <Text style={styles.iconEmoji}>⚡</Text>
          </View>
          <Text style={styles.headerSubtitle}>GAMIFICATION MILESTONE</Text>
          <Text style={styles.title}>LEVEL UP!</Text>
          
          <View style={styles.levelBadgeContainer}>
            <Text style={styles.levelText}>LEVEL {level}</Text>
          </View>

          <Text style={styles.rankTitle}>{levelTitle}</Text>
          <Text style={styles.description}>
            Congratulations! You've advanced to Level {level}. Keep learning to unlock premium market tools and badges!
          </Text>

          <View style={styles.bonusBox}>
            <Text style={styles.bonusText}>🎁 Bonus Reward: +{xpAwarded} XP</Text>
          </View>

          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.8} onPress={onClose}>
            <Text style={styles.actionBtnText}>Awesome! 🎉</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#1E1B4B',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
    elevation: 10,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  iconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#A5B4FC',
  },
  iconEmoji: {
    fontSize: 44,
  },
  headerSubtitle: {
    ...typography.overline,
    color: '#818CF8',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    ...typography.h1,
    color: '#FBBF24',
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'center',
  },
  levelBadgeContainer: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    marginVertical: spacing.md,
  },
  levelText: {
    ...typography.bodyBold,
    color: colors.white,
    letterSpacing: 1,
  },
  rankTitle: {
    ...typography.h3,
    color: '#E0E7FF',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: '#C7D2FE',
    textAlign: 'center',
    marginVertical: spacing.sm,
    lineHeight: 20,
  },
  bonusBox: {
    backgroundColor: 'rgba(251, 191, 36, 0.15)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FBBF24',
    marginVertical: spacing.md,
    width: '100%',
    alignItems: 'center',
  },
  bonusText: {
    ...typography.bodyBold,
    color: '#FBBF24',
  },
  actionBtn: {
    backgroundColor: '#4F46E5',
    paddingVertical: spacing.md,
    width: '100%',
    borderRadius: radius.lg,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  actionBtnText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
  },
});
