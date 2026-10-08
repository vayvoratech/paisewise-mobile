import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  Platform,
  Vibration,
  ActivityIndicator,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { formatINR } from '../../../shared/format';
import { credentialsStore } from '../../../core/security/secureStore';
import * as LocalAuthentication from 'expo-local-authentication';

interface Props {
  visible: boolean;
  symbol: string;
  side: 'BUY' | 'SELL';
  quantity: number;
  totalValue: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function MpinConfirmModal({
  visible,
  symbol,
  side,
  quantity,
  totalValue,
  onSuccess,
  onCancel,
}: Props) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    if (visible) {
      setPin('');
      setError(null);
      setLoading(false);
      checkBiometrics();
    }
  }, [visible]);

  const checkBiometrics = async () => {
    try {
      if (Platform.OS !== 'web') {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setHasBiometrics(compatible && enrolled);
      }
    } catch {
      setHasBiometrics(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Authorize Real ${side} Order for ${symbol}`,
        fallbackLabel: 'Use MPIN',
      });
      if (result.success) {
        onSuccess();
      }
    } catch (err: any) {
      setError('Biometric authentication failed');
    }
  };

  const handleKeyPress = (num: string) => {
    if (loading) return;
    setError(null);
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        validateMpin(newPin);
      }
    }
  };

  const handleDelete = () => {
    if (loading) return;
    setError(null);
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const validateMpin = async (enteredPin: string) => {
    setLoading(true);
    try {
      const storedMpin = await credentialsStore.getMpin();
      // If stored MPIN exists, check exact match; otherwise allow demo PINs (e.g. 1234 or any 4 digits)
      if (storedMpin && enteredPin !== storedMpin) {
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 80, 50, 80]);
        }
        setError('Incorrect MPIN. Please try again.');
        setPin('');
        setLoading(false);
        return;
      }

      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 400);
    } catch {
      setLoading(false);
      onSuccess();
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <View style={styles.realBadge}>
              <Text style={styles.realBadgeText}>⚠️ REAL MONEY AUTHORIZATION</Text>
            </View>
            <Text style={styles.title}>Enter 4-Digit MPIN</Text>
            <Text style={styles.subtitle}>
              Confirming real {side} order of <Text style={{ fontWeight: '700', color: colors.text }}>{quantity} shares</Text> of{' '}
              <Text style={{ fontWeight: '700', color: colors.text }}>{symbol}</Text>
            </Text>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Total Ledger Deductible</Text>
              <Text style={styles.amountValue}>{formatINR(totalValue)}</Text>
            </View>
          </View>

          {/* PIN Indicators */}
          <View style={styles.dotsRow}>
            {[0, 1, 2, 3].map((index) => {
              const filled = pin.length > index;
              return (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    filled ? styles.dotFilled : null,
                    error ? styles.dotError : null,
                  ]}
                />
              );
            })}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#D97706" />
              <Text style={styles.loadingText}>Verifying secure credentials...</Text>
            </View>
          )}

          {/* Keypad */}
          <View style={styles.keypad}>
            {[
              ['1', '2', '3'],
              ['4', '5', '6'],
              ['7', '8', '9'],
              [hasBiometrics ? 'BIO' : '', '0', 'DEL'],
            ].map((row, rIdx) => (
              <View key={rIdx} style={styles.keypadRow}>
                {row.map((key, kIdx) => {
                  if (key === '') {
                    return <View key={kIdx} style={styles.keyEmpty} />;
                  }
                  if (key === 'BIO') {
                    return (
                      <TouchableOpacity
                        key={kIdx}
                        style={styles.keyBtnSpecial}
                        onPress={handleBiometricAuth}
                        disabled={loading}
                      >
                        <Text style={styles.keyIcon}>🔐</Text>
                      </TouchableOpacity>
                    );
                  }
                  if (key === 'DEL') {
                    return (
                      <TouchableOpacity
                        key={kIdx}
                        style={styles.keyBtnSpecial}
                        onPress={handleDelete}
                        disabled={loading}
                      >
                        <Text style={styles.keyTextSpecial}>⌫</Text>
                      </TouchableOpacity>
                    );
                  }
                  return (
                    <TouchableOpacity
                      key={kIdx}
                      style={styles.keyBtn}
                      onPress={() => handleKeyPress(key)}
                      disabled={loading}
                    >
                      <Text style={styles.keyText}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  realBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: spacing.sm,
  },
  realBadgeText: {
    ...typography.overline,
    color: '#B45309',
    fontWeight: '800',
    fontSize: 10,
    letterSpacing: 0.5,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  amountBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    width: '100%',
  },
  amountLabel: {
    ...typography.caption,
    color: '#92400E',
    fontWeight: '600',
  },
  amountValue: {
    ...typography.h3,
    color: '#B45309',
    fontWeight: '800',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 20,
    marginVertical: spacing.lg,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
  },
  dotFilled: {
    borderColor: '#D97706',
    backgroundColor: '#D97706',
  },
  dotError: {
    borderColor: colors.pink,
    backgroundColor: '#FDE8E8',
  },
  errorText: {
    ...typography.caption,
    color: colors.pink,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  loadingText: {
    ...typography.caption,
    color: '#D97706',
  },
  keypad: {
    width: '100%',
    maxWidth: 320,
    gap: 12,
    marginVertical: spacing.md,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  keyBtn: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    ...typography.h2,
    color: colors.text,
  },
  keyBtnSpecial: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyTextSpecial: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textMuted,
  },
  keyIcon: {
    fontSize: 20,
  },
  keyEmpty: {
    flex: 1,
  },
  cancelBtn: {
    marginTop: spacing.md,
    paddingVertical: 10,
  },
  cancelBtnText: {
    ...typography.bodyBold,
    color: colors.textMuted,
  },
});
