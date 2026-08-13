/** Screen 01 — Splash / Landing. Brand + primary CTA. */
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { Pill } from '../../../shared/ui/Pill';
import { colors, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { tokenStore } from '../../../core/security/secureStore';
import { setTokens } from '../slices/authSlice';
import mixpanel from '@core/mixpanel'; // Import mixpanel instance

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const dispatch = useDispatch();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const accessToken = await tokenStore.getAccessToken();
        const refreshToken = await tokenStore.getRefreshToken();
        if (accessToken && refreshToken) {
          dispatch(setTokens({ accessToken, refreshToken }));
          navigation.replace('MainTabs', undefined as any);
        }
      } catch (err) {
        console.warn('Failed to restore login session on startup:', err);
      }
    };
    checkSession();
  }, [dispatch, navigation]);

  const handleStartFreePress = () => {
    // Track signup_started as per specification
    mixpanel.track('signup_started', {
      app_version: '1.0.0',
      device_type: Platform.OS,
    });

    navigation.navigate('Signup');
  };

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
          <Button label="शुरू करें — Start Free 🚀" variant="gradientAmber" onPress={handleStartFreePress} />
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
  },
  logoEmoji: { fontSize: 56 },
  brand: { ...typography.h1, color: colors.textOnDark },
  tagHi: { ...typography.h2, color: colors.textOnDark, marginTop: spacing.md, textAlign: 'center' },
  tagEn: { ...typography.body, color: colors.textMutedDark, marginTop: spacing.sm, textAlign: 'center' },
  pills: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  footer: { paddingBottom: spacing.lg },
  loginBtn: { marginTop: spacing.md },
  terms: { ...typography.caption, color: colors.textMutedDark, marginTop: spacing.lg, textAlign: 'center' },
});