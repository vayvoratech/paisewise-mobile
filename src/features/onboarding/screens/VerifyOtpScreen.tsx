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

import axios from 'axios';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { BASE_URL } from '../../../core/api/apiEndpoints';

type VerifyOtpScreenProp = NativeStackNavigationProp<RootStackParamList, 'VerifyOtp'>;

export default function VerifyOtpScreen({ route, navigation }: { route: any, navigation: VerifyOtpScreenProp }) {
  const { email, mode = 'password' } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOtpFocused, setIsOtpFocused] = useState(false);

  const handleVerifyOtp = async () => {
    setLoading(true);
    const payload = {
        email: email, 
        otp: otp.toString() 
    };

    console.log("Sending Payload:", JSON.stringify(payload)); 

    try {
        await axios.post(`${BASE_URL}/auth/verify-otp`, payload);
        setLoading(false);
        if (mode === 'mpin') {
            navigation.navigate('ResetMpin', { email });
        } else {
            navigation.navigate('ResetPassword', { email });
        }
    } catch (err: any) {
        setLoading(false);
        if (err.response) {
            console.error("Server responded with:", err.response.data); 
        }
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
                  onChangeText={setOtp}
                  onFocus={() => setIsOtpFocused(true)}
                  onBlur={() => setIsOtpFocused(false)}
                />
              </View>
            </View>

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
});