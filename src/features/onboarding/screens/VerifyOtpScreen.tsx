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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';

import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import type { AppDispatch, RootState } from '../../../app/store';
import { verifyOtpThunk, clearError } from '../slices/authSlice';

type VerifyOtpScreenProp = NativeStackNavigationProp<RootStackParamList, 'VerifyOtp'>;

export default function VerifyOtpScreen({ route, navigation }: { route: any, navigation: VerifyOtpScreenProp }) {
  const { email } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isOtpFocused, setIsOtpFocused] = useState(false);

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) {
      setLocalError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setLocalError(null);
    dispatch(clearError());

    const resultAction = await dispatch(verifyOtpThunk({ identifier: email, otp: otp.toString() }));

    if (verifyOtpThunk.fulfilled.match(resultAction)) {
      navigation.navigate('ResetPassword', { email });
    } else {
      setLocalError((resultAction.payload as string) || 'OTP verification failed. Please try again.');
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

            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

            <View style={styles.field}>
              <View style={[styles.inputWrapper, isOtpFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="6-digit code"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="numeric"
                  maxLength={6}
                  value={otp}
                  onChangeText={(text) => {
                    setOtp(text);
                    if (localError) setLocalError(null);
                  }}
                  onFocus={() => setIsOtpFocused(true)}
                  onBlur={() => setIsOtpFocused(false)}
                />
              </View>
            </View>

            {(localError || error) && (
              <Text style={styles.errorText}>{localError || error}</Text>
            )}

            <Button
              label={loading ? "Verifying..." : "Verify OTP"}
              variant="gradientAmber" 
              onPress={handleVerifyOtp}
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
    fontSize: 16,
    textAlign: 'center',
    // @ts-ignore - web-only property, RN Web draws a native focus ring otherwise
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  errorText: {
    ...typography.caption,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
});