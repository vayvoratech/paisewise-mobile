import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onStartKyc?: () => void;
}

export function KycGatedModal({ visible, onClose, onStartKyc }: Props) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🔒</Text>
          </View>

          <View style={styles.badge}>
            <Text style={styles.badgeText}>KYC VERIFICATION REQUIRED</Text>
          </View>

          <Text style={styles.title}>Real Trading Locked</Text>
          
          <Text style={styles.description}>
            Under SEBI & Exchange regulations, real stock market order execution requires a 100% verified KYC profile with linked PAN & Aadhaar.
          </Text>

          <View style={styles.checklist}>
            <View style={styles.checkItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.checkText}>100% Paperless DigiLocker instant verification</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.checkText}>Safe & encrypted SEBI registered broker account</Text>
            </View>
            <View style={styles.checkItem}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.checkText}>Unlocks live NSE / BSE real order execution</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => {
              if (onStartKyc) {
                onStartKyc();
              } else {
                onClose();
              }
            }}
          >
            <Text style={styles.primaryBtnText}>Complete KYC Now ➔</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onClose}>
            <Text style={styles.secondaryBtnText}>Continue with Practice Mode 🎮</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  icon: {
    fontSize: 30,
  },
  badge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  badgeText: {
    ...typography.overline,
    color: '#B45309',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  checklist: {
    width: '100%',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkIcon: {
    color: colors.green,
    fontWeight: '900',
    fontSize: 14,
  },
  checkText: {
    ...typography.caption,
    color: colors.text,
    flex: 1,
    fontSize: 12,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: '#D97706',
    paddingVertical: 14,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  primaryBtnText: {
    ...typography.bodyBold,
    color: colors.white,
    fontSize: 15,
  },
  secondaryBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  secondaryBtnText: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
