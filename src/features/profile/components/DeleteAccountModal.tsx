import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';

interface DeleteAccountModalProps {
  visible: boolean;
  isDeleting: boolean;
  onConfirmDelete: () => void;
  onCancel: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  visible,
  isDeleting,
  onConfirmDelete,
  onCancel,
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const isInputValid = confirmationInput.trim().toUpperCase() === 'DELETE';

  const handleClose = () => {
    if (!isDeleting) {
      setConfirmationInput('');
      onCancel();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            {/* Warning Icon Badge */}
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>⚠️</Text>
            </View>

            <View style={styles.legalBadge}>
              <Text style={styles.legalBadgeText}>DPDP ACT 2023 • SECTION 12 ERASURE</Text>
            </View>

            <Text style={styles.title}>Permanent Account Erasure</Text>
            <Text style={styles.warningSubtitle}>
              This action is permanent and cannot be undone. All your data will be permanently wiped from PaiseWise servers.
            </Text>

            {/* List of consequences */}
            <View style={styles.consequencesCard}>
              <Text style={styles.consequenceItem}>
                ❌ <Text style={styles.boldText}>Credentials & KYC:</Text> Phone, email & secure MPIN permanently deleted.
              </Text>
              <Text style={styles.consequenceItem}>
                ❌ <Text style={styles.boldText}>Practice Portfolio:</Text> Virtual ₹1,00,000 cash balance & stock positions liquidated.
              </Text>
              <Text style={styles.consequenceItem}>
                ❌ <Text style={styles.boldText}>Learning Achievements:</Text> All XP points, streak days & earned badges destroyed.
              </Text>
              <Text style={styles.consequenceItem}>
                ❌ <Text style={styles.boldText}>Consent Revocation:</Text> All processing consent under DPDP Act 2023 terminated.
              </Text>
            </View>

            {/* Confirmation Instruction */}
            <Text style={styles.inputPrompt}>
              To confirm erasure, type <Text style={styles.deleteKeyword}>DELETE</Text> in the box below:
            </Text>

            <TextInput
              style={[
                styles.textInput,
                isInputValid && styles.textInputValid,
              ]}
              placeholder='Type "DELETE"'
              placeholderTextColor={colors.textMuted}
              value={confirmationInput}
              onChangeText={setConfirmationInput}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!isDeleting}
            />

            {/* Buttons */}
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={handleClose}
                disabled={isDeleting}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelBtnText}>Keep Account</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.btn,
                  styles.deleteBtn,
                  !isInputValid && styles.deleteBtnDisabled,
                ]}
                onPress={() => {
                  if (isInputValid && !isDeleting) {
                    onConfirmDelete();
                  }
                }}
                disabled={!isInputValid || isDeleting}
                activeOpacity={0.8}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.deleteBtnText}>Permanently Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  iconText: {
    fontSize: 28,
  },
  legalBadge: {
    backgroundColor: '#FEF2F2',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: spacing.xs,
  },
  legalBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 2,
  },
  warningSubtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  consequencesCard: {
    backgroundColor: '#FFF5F5',
    borderRadius: radius.md,
    padding: spacing.md,
    width: '100%',
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: '#FED7D7',
    gap: 6,
  },
  consequenceItem: {
    fontSize: 12,
    color: '#742A2A',
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
  },
  inputPrompt: {
    ...typography.caption,
    color: colors.text,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  deleteKeyword: {
    fontWeight: '800',
    color: '#DC2626',
  },
  textInput: {
    width: '100%',
    height: 46,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    ...typography.bodyBold,
    color: colors.text,
    backgroundColor: colors.surfaceAlt,
    textAlign: 'center',
    letterSpacing: 2,
    marginBottom: spacing.lg,
  },
  textInputValid: {
    borderColor: '#DC2626',
    backgroundColor: '#FFF5F5',
    color: '#DC2626',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },
  deleteBtn: {
    backgroundColor: '#DC2626',
  },
  deleteBtnDisabled: {
    backgroundColor: '#FCA5A5',
    opacity: 0.6,
  },
  deleteBtnText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.white,
  },
});
