import React, { useState, useEffect, useRef } from 'react';
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
import axios from 'axios';

import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import type { AppDispatch, RootState } from '../../../app/store';
import { verifyOtpThunk, clearError } from '../slices/authSlice';
import { BASE_URL } from '../../../core/api/apiEndpoints';

type VerifyOtpScreenProp = NativeStackNavigationProp<RootStackParamList, 'VerifyOtp'>;

export default function VerifyOtpScreen({ route, navigation }: { route: any, navigation: VerifyOtpScreenProp }) {
  const { email, mode = 'password' } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [otpVal, setOtpVal] = useState<string[]>(['', '', '', '', '', '']);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(120); // 2-minute countdown timer
  const [attemptsRemaining, setAttemptsRemaining] = useState(5); // Attempts remaining warnings
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // 120s countdown timer implementation
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    if (!cleanText) {
      const newOtp = [...otpVal];
      newOtp[index] = '';
      setOtpVal(newOtp);
      return;
    }

    const newOtp = [...otpVal];
    // If user pasted a 6-digit code
    if (cleanText.length === 6) {
      const digits = cleanText.split('');
      setOtpVal(digits);
      inputRefs[5].current?.focus();
      return;
    }

    newOtp[index] = cleanText.slice(-1);
    setOtpVal(newOtp);

    // Auto-focus shifting to next input
    if (index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (otpVal[index] === '' && index > 0) {
        const newOtp = [...otpVal];
        newOtp[index - 1] = '';
        setOtpVal(newOtp);
        inputRefs[index - 1].current?.focus();
      } else {
        const newOtp = [...otpVal];
        newOtp[index] = '';
        setOtpVal(newOtp);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otpVal.join('');
    if (fullOtp.length < 6) {
      setLocalError('Please enter a valid 6-digit OTP code.');
      return;
    }
    if (attemptsRemaining === 0) {
      setLocalError('Too many failed attempts. Your session is locked.');
      return;
    }

    setLocalError(null);
    dispatch(clearError());

    const resultAction = await dispatch(verifyOtpThunk({ identifier: email, otp: fullOtp }));

    if (verifyOtpThunk.fulfilled.match(resultAction)) {
      if (mode === 'mpin') {
        navigation.navigate('ResetMpin', { email });
      } else {
        navigation.navigate('ResetPassword', { email });
      }
    } else {
      setAttemptsRemaining((prev) => Math.max(0, prev - 1));
      const backendError = resultAction.payload as string;
      setLocalError(backendError || 'OTP verification failed. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setResendLoading(true);
    setLocalError(null);
    try {
      if (email.includes('@')) {
        // Email forgot-password flow
        await axios.post(`${BASE_URL}/auth/forgot-password`, { email });
      } else {
        // Phone verification flow
        await axios.post(`${BASE_URL}/auth/send-otp`, { phone: email });
      }
      setTimer(120); // Reset countdown timer to 2 minutes
      setAttemptsRemaining(5); // Reset attempts on fresh resend
      setOtpVal(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } catch (err: any) {
      setLocalError(err.response?.data?.message || err.message || 'Failed to resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const timerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

            {/* 6-box OTP entry fields with auto-focus shifting */}
            <View style={styles.otpContainer}>
              {otpVal.map((digit, index) => (
                <View
                  key={index}
                  style={[
                    styles.boxWrapper,
                    focusedIndex === index && styles.boxWrapperFocused,
                    digit !== '' && styles.boxWrapperFilled,
                  ]}
                >
                  <TextInput
                    ref={inputRefs[index]}
                    style={styles.boxInput}
                    keyboardType="numeric"
                    maxLength={6} // Allows paste detection
                    value={digit}
                    onChangeText={(text) => handleChangeText(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    onFocus={() => setFocusedIndex(index)}
                    onBlur={() => setFocusedIndex(null)}
                    selectTextOnFocus
                  />
                </View>
              ))}
            </View>

            {attemptsRemaining < 5 && attemptsRemaining > 0 && (
              <Text style={styles.attemptsWarn}>
                ⚠️ Warning: {attemptsRemaining} verification attempt{attemptsRemaining > 1 ? 's' : ''} left before lock.
              </Text>
            )}

            {(localError || error) && (
              <Text style={styles.errorText}>{localError || error}</Text>
            )}

            <Button
              label={loading ? "Verifying..." : "Verify OTP"}
              variant="gradientAmber" 
              onPress={handleVerifyOtp}
              disabled={attemptsRemaining === 0}
            />

            {/* Countdown timer and resend option */}
            <View style={styles.resendContainer}>
              {timer > 0 ? (
                <Text style={styles.resendText}>Resend code in <Text style={styles.timerText}>{timerText}</Text></Text>
              ) : (
                <TouchableOpacity onPress={handleResendOtp} disabled={resendLoading}>
                  <Text style={styles.resendLink}>
                    {resendLoading ? "Sending..." : "Resend OTP Code"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.sm,
  },
  boxWrapper: {
    width: 46,
    height: 52,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.borderDark,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxWrapperFocused: {
    borderColor: colors.textOnDark,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  boxWrapperFilled: {
    borderColor: colors.amber,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  boxInput: {
    width: '100%',
    height: '100%',
    color: colors.textOnDark,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    // @ts-ignore
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  attemptsWarn: {
    ...typography.caption,
    color: colors.amber,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: '#FF6B6B',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resendContainer: {
    marginTop: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: {
    ...typography.body,
    color: colors.textMutedDark,
    fontSize: 14,
  },
  timerText: {
    color: colors.amber,
    fontWeight: 'bold',
  },
  resendLink: {
    ...typography.body,
    color: colors.amber,
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});