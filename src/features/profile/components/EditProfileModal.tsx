import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';

interface EditProfileModalProps {
  visible: boolean;
  initialName: string;
  initialPhone: string;
  initialCity?: string;
  onSave: (data: { name: string; phone: string; city: string }) => void;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  initialName,
  initialPhone,
  initialCity = 'Bengaluru, India',
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);
  const [city, setCity] = useState(initialCity);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setPhone(initialPhone);
      setCity(initialCity);
    }
  }, [visible, initialName, initialPhone, initialCity]);

  const handleSave = () => {
    onSave({
      name: name.trim() || initialName,
      phone: phone.trim() || initialPhone,
      city: city.trim() || initialCity,
    });
    onClose();
  };

  return (
    <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <View style={styles.header}>
              <Text style={styles.title}>Edit Profile Details</Text>
              <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Full Name / Display Name</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Amrutha Patil"
                  placeholderTextColor={colors.textMuted}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Mobile Phone Number</Text>
                <TextInput
                  style={styles.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+91 9912483007"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>City / Location</Text>
                <TextInput
                  style={styles.input}
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Bengaluru, India"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={[styles.btn, styles.cancelBtn]} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Changes</Text>
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
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  dialog: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 380,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h3,
    color: colors.text,
    fontWeight: '800',
  },
  closeBtn: {
    fontSize: 18,
    color: colors.textMuted,
    fontWeight: '700',
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  field: {
    gap: 4,
  },
  label: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    ...typography.body,
    fontSize: 14,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  btn: {
    flex: 1,
    height: 44,
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
    color: colors.textMuted,
  },
  saveBtn: {
    backgroundColor: colors.purple,
  },
  saveBtnText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.white,
  },
});
