/** Sign Up — create account (phone + name + password). Validates, then onboards. */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (name.trim().length < 2) return setError('Please enter your name.');
    if (!/^\d{10}$/.test(phone.trim())) return setError('Enter a valid 10-digit phone number.');
    if (password.length < 4) return setError('Password must be at least 4 characters.');

    setLoading(true);
    // TODO: call auth-service /auth/register via the API client (mock for now).
    setTimeout(() => {
      setLoading(false);
      navigation.replace('Onboarding');
    }, 600);
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

            <Field label="Full name" placeholder="Rahul Sharma" value={name} onChangeText={setName} autoCapitalize="words" />
            <Field label="Phone number" placeholder="10-digit mobile" value={phone} onChangeText={setPhone} keyboardType="phone-pad" maxLength={10} />
            <Field label="Password" placeholder="At least 4 characters" value={password} onChangeText={setPassword} secureTextEntry />

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

function Field(props: React.ComponentProps<typeof TextInput> & { label: string }) {
  const { label, ...input } = props;
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor={colors.textFaint}
        autoCapitalize="none"
        {...input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  scroll: { paddingTop: spacing.md, paddingBottom: spacing.xl },
  back: { ...typography.body, color: colors.textMutedDark, marginBottom: spacing.lg },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  logoEmoji: { fontSize: 36 },
  title: { ...typography.h1, color: colors.textOnDark, textAlign: 'center', marginTop: spacing.lg },
  subtitle: { ...typography.body, color: colors.textMutedDark, textAlign: 'center', marginTop: spacing.xs, marginBottom: spacing.xl },
  field: { marginBottom: spacing.lg },
  fieldLabel: { ...typography.caption, color: colors.textMutedDark, marginBottom: spacing.sm },
  input: { backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: colors.borderDark, borderRadius: radius.md, padding: spacing.lg, fontSize: 16, color: colors.textOnDark },
  error: { color: colors.pink, marginTop: spacing.xs },
  switchRow: { alignItems: 'center', marginTop: spacing.xl },
  switchText: { ...typography.body, color: colors.textMutedDark },
  switchLink: { color: colors.amber, fontWeight: '700' },
  terms: { ...typography.caption, color: colors.textFaint, textAlign: 'center', marginTop: spacing.xl },
});
