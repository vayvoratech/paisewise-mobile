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
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import {
  colors,
  radius,
  spacing,
  typography,
} from '../../../core/theme/theme';
import axios from 'axios';
import { RootStackParamList } from '../../../app/navigation/types';

type ForgotPasswordScreenProp = NativeStackNavigationProp<RootStackParamList, 'ForgotPasswordScreen'>;

export default function ForgotPasswordScreen({ navigation }: { navigation: ForgotPasswordScreenProp }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isEmailFocused, setIsEmailFocused] = useState(false);

  const onSendOtp = async () => {
    const url = 'http://localhost:8080/auth/forgot-password';

    try {
        const payload = { email: email.trim() };
        await axios.post(url, payload);

        console.log('Success: OTP request successful');
        // CHANGE: Navigating to VerifyOtp
        navigation.navigate('VerifyOtp', { email: email.trim() }); 
    } catch (err: any) {
        if (err.response) {
            console.error("API Error:", err.response.status);
        } else {
            console.error("Connection Error:", err.message);
        }
        setError('Failed to send OTP. Please try again later.');
    }
};

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Forgot Password</Text>

            <Text style={styles.subtitle}>Enter your email to receive an OTP.</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <View style={[styles.inputWrapper, isEmailFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textFaint}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                />
              </View>
            </View>

            {error && (
              <Text style={styles.error}>{error}</Text>
            )}

            <Button
              label="Send OTP"
              variant="gradientAmber"
              onPress={onSendOtp}
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
    fontSize: 16,
    // @ts-ignore - web-only property, RN Web draws a native focus ring otherwise
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  error: { color: colors.pink, marginBottom: spacing.md },
});
