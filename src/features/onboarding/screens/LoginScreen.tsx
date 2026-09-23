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
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { loginUser } from '../slices/authSlice';
import mixpanel from '@core/mixpanel';
import { Analytics } from '../../../core/analyticsService'; 

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const dispatch = useDispatch();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isIdentifierFocused, setIsIdentifierFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const onSubmit = async () => {
    setError(null);
    const id = identifier.trim();
    const isPhone = /^\d{10}$/.test(id);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id);
    
    if (!isPhone && !isEmail) return setError('Enter a valid 10-digit phone number or email address.');
    if (password.length < 4) return setError('Enter your password.');

    setLoading(true);
    const startTime = Date.now(); // Track time taken to log in

    try {
      // Backend expects 'identifier' rather than separate phone/email parameters
      const payload = { identifier: id, password };

      // Dispatch Redux thunk to log in
      const resultAction = await dispatch(loginUser(payload) as any).unwrap();

      setLoading(false);

      const userId = resultAction?.userId || resultAction?.user?.id || 'unknown_user_id';
      const timeToLogin = Math.round((Date.now() - startTime) / 1000);

      // Identify user in Mixpanel
      mixpanel.identify(userId);

      // ✅ 1. Track login_success using the exact spec properties
      Analytics.loginSuccess({
        sessionId: 'sess_abc123', // Replace with your app's actual active session ID state/variable
        loginMethod: isPhone ? 'phone' : 'email',
        timeToLoginSeconds: timeToLogin,
        daysSinceLastLogin: 1, // Update this if you store last login days in MMKV/AsyncStorage
      });

      navigation.replace('MainTabs', { screen: 'Home' });
    } catch (err: any) {
      setLoading(false);

      const errorMessage = typeof err === 'string' ? err : err?.message || '';
      const failureReason = errorMessage.toLowerCase().includes('not found') 
        ? 'account_locked' 
        : 'wrong_password';

      // ✅ 2. Track login_failed using the exact spec properties
      Analytics.loginFailed({
        sessionId: 'sess_abc123', // Replace with your active session ID variable
        loginMethod: isPhone ? 'phone' : 'email',
        attemptNumber: 1,
        attemptsRemaining: 2,
        failureReason: failureReason === 'account_locked' ? 'account_locked' : 'wrong_password',
      });

      setError(errorMessage || 'Could not log in right now. Please try again.');
    }
  };

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => navigation.goBack()}><Text style={styles.back}>← Back</Text></TouchableOpacity>
            <View style={styles.logo}><Text style={styles.logoEmoji}>🏛️</Text></View>
            <Text style={styles.title}>Welcome back 👋</Text>

            <Text style={styles.fieldLabel}>Phone number or Email</Text>
            <View style={[styles.inputWrapper, isIdentifierFocused && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Phone number or Email address"
                placeholderTextColor={colors.textFaint}
                keyboardType="default"
                autoCapitalize="none"
                value={identifier}
                onChangeText={setIdentifier}
                onFocus={() => setIsIdentifierFocused(true)}
                onBlur={() => setIsIdentifierFocused(false)}
              />
            </View>

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Your password"
                placeholderTextColor={colors.textFaint}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
              />
              <TouchableOpacity style={styles.icon} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={22} color={colors.textMutedDark} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPassword} onPress={() => navigation.navigate('ForgotPasswordScreen')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label="Log in" variant="gradientAmber" loading={loading} onPress={onSubmit} />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  back: { ...typography.body, color: colors.textMutedDark, marginBottom: spacing.lg },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: spacing.lg },
  logoEmoji: { fontSize: 36 },
  title: { ...typography.h1, color: colors.textOnDark, textAlign: 'center', marginBottom: spacing.xxl },
  fieldLabel: { ...typography.caption, color: colors.textMutedDark, marginBottom: spacing.sm },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  icon: { position: 'absolute', right: spacing.md },
  forgotPassword: { alignSelf: 'flex-end', marginTop: -8, marginBottom: spacing.md },
  forgotPasswordText: { color: colors.amber, fontWeight: '700' },
  error: { color: colors.pink, marginBottom: spacing.md },
});