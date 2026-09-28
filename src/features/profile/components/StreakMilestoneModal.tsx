import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';

export interface StreakMilestoneModalProps {
  visible: boolean;
  streakCount: number;
  bonusXp?: number;
  onClose: () => void;
}

export const StreakMilestoneModal: React.FC<StreakMilestoneModalProps> = ({
  visible,
  streakCount,
  bonusXp = 50,
  onClose,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.flameCircle}>
            <Text style={styles.flameEmoji}>🔥</Text>
          </View>
          <Text style={styles.subtitle}>DAILY CONSISTENCY</Text>
          <Text style={styles.title}>{streakCount}-DAY STREAK!</Text>
          <Text style={styles.description}>
            You're on fire! Learning financial concepts daily builds unstoppable momentum.
          </Text>

          <View style={styles.rewardContainer}>
            <Text style={styles.rewardIcon}>⚡</Text>
            <View>
              <Text style={styles.rewardTitle}>Streak Bonus Awarded</Text>
              <Text style={styles.rewardVal}>+{bonusXp} Extra XP</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.btn} activeOpacity={0.85} onPress={onClose}>
            <Text style={styles.btnText}>Keep it Up! 🔥</Text>
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
    backgroundColor: '#431407',
    borderRadius: radius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F97316',
    elevation: 10,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  flameCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(249, 115, 22, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: '#FDBA74',
  },
  flameEmoji: {
    fontSize: 44,
  },
  subtitle: {
    ...typography.overline,
    color: '#FDBA74',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  title: {
    ...typography.h1,
    color: '#FFEDD5',
    fontSize: 30,
    fontWeight: '900',
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: '#FED7AA',
    textAlign: 'center',
    marginVertical: spacing.md,
    lineHeight: 20,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    width: '100%',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(253, 186, 116, 0.3)',
  },
  rewardIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  rewardTitle: {
    ...typography.caption,
    color: '#FDBA74',
  },
  rewardVal: {
    ...typography.h3,
    color: '#FFEDD5',
    fontWeight: '800',
  },
  btn: {
    backgroundColor: '#EA580C',
    paddingVertical: spacing.md,
    width: '100%',
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  btnText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 16,
  },
});
