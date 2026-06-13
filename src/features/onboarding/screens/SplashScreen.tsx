/** Screen 01 — Splash / Landing. Brand + primary CTA. */
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { Pill } from '../../../shared/ui/Pill';
import { colors, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>🏛️</Text>
          </View>
          <Text style={styles.brand}>
            Paise<Text style={{ color: colors.amber }}>Wise</Text>
          </Text>
          <Text style={styles.tagHi}>पैसे की पाठशाला</Text>
          <Text style={styles.tagEn}>India's investing school in your pocket</Text>

          <View style={styles.pills}>
            <Pill label="🔒 SEBI Regulated" color={colors.textOnDark} bg="rgba(255,255,255,0.06)" borderColor={colors.borderDark} />
            <Pill label="🇮🇳 Made in India" color={colors.textOnDark} bg="rgba(255,255,255,0.06)" borderColor={colors.borderDark} />
            <Pill label="📱 Hindi First" color={colors.textOnDark} bg="rgba(255,255,255,0.06)" borderColor={colors.borderDark} />
          </View>
        </View>

        <View style={styles.footer}>
          <Button label="शुरू करें — Start Free 🚀" variant="gradientAmber" onPress={() => navigation.navigate('Signup')} />
          <Button
            label="Already have an account? Log in"
            variant="outline"
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Login')}
          />
          <Text style={styles.terms}>By continuing, you agree to our Terms & Privacy Policy</Text>
        </View>
      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: {
    width: 104,
    height: 104,
    borderRadius: 28,
    backgroundColor: colors.orange,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.orange,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  logoEmoji: { fontSize: 52 },
  brand: { ...typography.hero, color: colors.textOnDark },
  tagHi: { ...typography.body, color: colors.textMutedDark, marginTop: spacing.md },
  tagEn: { ...typography.body, color: colors.textMutedDark, marginTop: spacing.xs },
  pills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xxl },
  footer: { paddingBottom: spacing.lg, gap: spacing.md },
  loginBtn: {},
  terms: { ...typography.caption, color: colors.textFaint, textAlign: 'center', marginTop: spacing.xs },
});
