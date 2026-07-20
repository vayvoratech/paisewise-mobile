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
import {
  colors,
  radius,
  spacing,
  typography,
} from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Focus states
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!/^\d{10}$/.test(phone.trim())) return setError('Enter a valid 10-digit phone number.');
    if (password.length < 4) return setError('Enter your password.');

    setLoading(true);

    try {
      // Matches LoginRequest DTO: phone, password
      const payload = { phone: phone.trim(), password };

      const url = 'http://192.168.29.14:8080/auth/login';
      const response = await axios.post(url, payload);

      // AuthResponse: { user: { id, name, phone }, tokens: { accessToken, refreshToken } }
      const { user, tokens } = response.data;

      // TODO: persist tokens/user (e.g. AsyncStorage or your existing auth store)
      // so the app stays logged in and can attach the accessToken to future requests.
      console.log('Login success:', user, tokens);

      setLoading(false);
      navigation.replace('MainTabs', { screen: 'Home' });
    } catch (err: any) {
      setLoading(false);

      if (err.response) {
        console.error('Login API Error:', err.response.status, err.response.data);
        const status = err.response.status;

        if (status === 401 || status === 400 || status === 403 || status === 404) {
          // Wrong phone number or wrong password — backend now returns 401
          // for both cases (ResponseStatusException in AuthService.login),
          // so we don't leak which part of the credentials was wrong.
          setError('Your phone number or password is incorrect. Please enter valid credentials.');
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Could not log in right now. Please try again.');
        }
      } else {
        console.error('Login Connection Error:', err.message);
        setError('Could not reach the server. Please try again later.');
      }
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
            {/* <Text style={styles.subtitle}>Log in to continue learning</Text> */}

            <Text style={styles.fieldLabel}>Phone number</Text>
            <View style={[styles.inputWrapper, isPhoneFocused && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                placeholder="10-digit mobile"
                placeholderTextColor={colors.textFaint}
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                onFocus={() => setIsPhoneFocused(true)}
                onBlur={() => setIsPhoneFocused(false)}
              />
            </View>

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperFocused]}>
              <TextInput
                style={styles.input}
                placeholder="Your password"
                placeholderTextColor={colors.textFaint}
                secureTextEntry={showPassword}
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
