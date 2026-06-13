/** Login — phone + password. On success, goes straight to the main tabs. */
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    if (!/^\d{10}$/.test(phone.trim())) return setError('Enter a valid 10-digit phone number.');
    if (password.length < 4) return setError('Enter your password.');

    setLoading(true);
    // TODO: call auth-service /auth/login via the API client (mock for now).
    setTimeout(() => {
      setLoading(false);
      navigation.replace('MainTabs', { screen: 'Home' });
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
            <Text style={styles.title}>Welcome back 👋</Text>
            <Text style={styles.subtitle}>Log in to continue learning</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Phone number</Text>
              <TextInput style={styles.input} placeholder="10-digit mobile" placeholderTextColor={colors.textFaint}
                keyboardType="phone-pad" maxLength={10} autoCapitalize="none" value={phone} onChangeText={setPhone} />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Password</Text>
              <TextInput style={styles.input} placeholder="Your password" placeholderTextColor={colors.textFaint}
                secureTextEntry value={password} onChangeText={setPassword} />
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Button label="Log in" variant="gradientAmber" loading={loading} onPress={onSubmit} style={{ marginTop: spacing.lg }} />

            <TouchableOpacity style={styles.switchRow} onPress={() => navigation.replace('Signup')}>
              <Text style={styles.switchText}>New here? <Text style={styles.switchLink}>Create an account</Text></Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  scroll: { paddingTop: spacing.md, paddingBottom: spacing.xl, flexGrow: 1 },
  back: { ...typography.body, color: colors.textMutedDark, marginBottom: spacing.lg },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.orange, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: spacing.xxl },
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
});
