import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

// Password rules:
// - Starts with a capital letter (A-Z)
// - Contains at least one digit (0-9)
// - Contains at least one special character
// - At least 8 characters total
const SPECIAL_CHARS = '!@#$%^&*()_+\\-=\\[\\]{};\':"\\\\|,.<>/?~`';
const PASSWORD_REGEX = new RegExp(
  `^[A-Z](?=.*\\d)(?=.*[${SPECIAL_CHARS}])[A-Za-z\\d${SPECIAL_CHARS}]{7,}$`
);

function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/^[A-Z]/.test(pwd)) {
    return 'Password must start with a capital letter.';
  }
  if (!/\d/.test(pwd)) {
    return 'Password must include at least one number.';
  }
  if (!new RegExp(`[${SPECIAL_CHARS}]`).test(pwd)) {
    return 'Password must include at least one special character (e.g. @, #, $, %).';
  }
  if (!PASSWORD_REGEX.test(pwd)) {
    return 'Password does not meet the required format.';
  }
  return null;
}

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const onSubmit = async () => {
    setError(null);

    if (name.trim().length < 2) {
      return setError('Please enter your name.');
    }

    if (!/^\d{10}$/.test(phone.trim())) {
      return setError('Enter a valid 10-digit phone number.');
    }

    if (!email.trim()) {
      return setError('Email is required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return setError('Please enter a valid email address.');
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return setError(passwordError);
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setLoading(true);

    try {
      // Matches RegisterRequest DTO: phone, name, email, password, confirmPassword
      const payload = {
        phone: phone.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      };

      const url = 'http://localhost:8080/auth/register';
      await axios.post(url, payload);

      setLoading(false);
      navigation.replace('Onboarding');
    } catch (err: any) {
      setLoading(false);

      if (err.response) {
        // Backend validation errors (e.g. duplicate phone/email) come back as 400/409
        console.error('Register API Error:', err.response.status, err.response.data);

        if (err.response.status === 409) {
          setError('An account with this phone or email already exists.');
        } else if (err.response.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Could not create account. Please check your details and try again.');
        }
      } else {
        console.error('Register Connection Error:', err.message);
        setError('Could not reach the server. Please try again later.');
      }
    }
  };

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.logo}><Text style={styles.logoEmoji}>🏛️</Text></View>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>शुरू करें — start learning for free 🚀</Text>

            <Field
              label="Full name"
              placeholder="Rahul Sharma"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

            <Field
              label="Phone number"
              placeholder="10-digit mobile"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Field
              label="Email"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Field
              label="Password"
              placeholder="Ex: Pass@123"
              value={password}
              onChangeText={setPassword}
              isPassword
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />
            <Text style={styles.hint}>
              Must start with a capital letter and include a number, a special
              character (@ # $ % etc.), and be at least 8 characters long.
            </Text>

            <Field
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              showPassword={showConfirmPassword}
              onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button label="Create account 🚀" variant="gradientAmber" loading={loading} onPress={onSubmit} style={{ marginTop: spacing.lg }} />

            <TouchableOpacity style={styles.switchRow} onPress={() => navigation.replace('Login')}>
              <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Log in</Text></Text>
            </TouchableOpacity>

            <Text style={styles.terms}>By continuing, you agree to our Terms & Privacy Policy</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </HeroBackground>
  );
}

type FieldProps = React.ComponentProps<typeof TextInput> & {
  label: string;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
};

function Field({
  label,
  isPassword = false,
  showPassword = false,
  onTogglePassword,
  ...input
}: FieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>

      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <TextInput
          style={styles.input}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.textFaint}
          autoCapitalize="none"
          secureTextEntry={isPassword && !showPassword}
          {...input}
        />

        {isPassword && (
          <TouchableOpacity
            onPress={onTogglePassword}
            style={styles.eyeButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textMutedDark}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  scroll: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  back: {
    ...typography.body,
    color: colors.textMutedDark,
    marginBottom: spacing.lg,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  logoEmoji: {
    fontSize: 36,
  },
  title: {
    ...typography.h1,
    color: colors.textOnDark,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  subtitle: {
    ...typography.body,
    color: colors.textMutedDark,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  field: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    ...typography.caption,
    color: colors.textMutedDark,
    marginBottom: spacing.sm,
  },
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
    fontSize: 16,
    color: colors.textOnDark,
    // @ts-ignore - web-only property, RN Web draws a native focus ring otherwise
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  eyeButton: {
    paddingHorizontal: spacing.md,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    color: colors.pink,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.textFaint,
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  switchRow: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  switchText: {
    ...typography.body,
    color: colors.textMutedDark,
  },
  switchLink: {
    color: colors.amber,
    fontWeight: '700',
  },
  terms: {
    ...typography.caption,
    color: colors.textFaint,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
