import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { configureMpin } from '../slices/authSlice';
import { RootState } from '../../../app/store';

type Props = NativeStackScreenProps<RootStackParamList, 'SetMpin'>;

export default function SetMpinScreen({ navigation }: Props) {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const email = user?.email || '';

  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isMpinFocused, setIsMpinFocused] = useState(false);
  const [isConfirmMpinFocused, setIsConfirmMpinFocused] = useState(false);

  const handleSetMpin = async () => {
    setError(null);
    if (!/^\d{4}$/.test(mpin)) {
      return setError('MPIN must be exactly 4 digits.');
    }
    if (mpin !== confirmMpin) {
      return setError('MPINs do not match.');
    }
    if (!email) {
      return setError('User session email not found. Please log in again.');
    }

    setLoading(true);
    try {
      await dispatch(configureMpin({ email, mpin }) as any).unwrap();
      setLoading(false);
      Alert.alert('Success', 'MPIN configured successfully!');
      navigation.goBack();
    } catch (err: any) {
      setLoading(false);
      setError(err || 'Failed to configure MPIN. Please try again.');
    }
  };

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Configure MPIN 🔒</Text>
            <Text style={styles.subtitle}>Set a 4-digit PIN for quick biometric-friendly logins.</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Enter 4-Digit MPIN</Text>
              <View style={[styles.inputWrapper, isMpinFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="xxxx"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={mpin}
                  onChangeText={setMpin}
                  onFocus={() => setIsMpinFocused(true)}
                  onBlur={() => setIsMpinFocused(false)}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Confirm 4-Digit MPIN</Text>
              <View style={[styles.inputWrapper, isConfirmMpinFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="xxxx"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={confirmMpin}
                  onChangeText={setConfirmMpin}
                  onFocus={() => setIsConfirmMpinFocused(true)}
                  onBlur={() => setIsConfirmMpinFocused(false)}
                />
              </View>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              label={loading ? "Saving..." : "Configure MPIN"}
              variant="gradientAmber"
              loading={loading}
              onPress={handleSetMpin}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  scroll: { flexGrow: 1, paddingTop: spacing.md },
  back: { ...typography.body, color: colors.textMutedDark, marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.textOnDark, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMutedDark, textAlign: 'center', marginBottom: spacing.xxl },
  field: { marginBottom: spacing.lg },
  fieldLabel: { ...typography.caption, color: colors.textMutedDark, marginBottom: spacing.sm },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.borderDark,
    borderWidth: 1.5,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  inputWrapperFocused: {
    borderColor: colors.textOnDark,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  input: {
    flex: 1,
    padding: spacing.lg,
    color: colors.textOnDark,
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
    // @ts-ignore - web-only property
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  error: { color: colors.pink, marginBottom: spacing.md, textAlign: 'center' },
});