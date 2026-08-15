/** Screen 01 — Splash / Landing. Brand + primary CTA. */
import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { Pill } from '../../../shared/ui/Pill';
import { colors, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { tokenStorage } from '../../../core/api/tokenStorage'; // Using your verified tokenStorage utility from Week 12
import { setTokens, refreshTokenThunk } from '../slices/authSlice';
import mixpanel from '@core/mixpanel'; // Import mixpanel instance

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const dispatch = useDispatch<any>();

  useEffect(() => {
    const initializeApp = async () => {
      // 1. Enforce a minimum 2-second display timer for branding & loading experience
      const timerPromise = new Promise((resolve) => setTimeout(resolve, 2000));

      let sessionRestored = false;

      try {
        const accessToken = tokenStorage.getAccessToken();
        const refreshToken = tokenStorage.getRefreshToken();

        if (accessToken && refreshToken) {
          // Tokens exist locally, populate store and flag success
          dispatch(setTokens({ accessToken, refreshToken }));
          sessionRestored = true;
        } else if (refreshToken && !accessToken) {
          // Edge case: Access token expired, attempt silent token refresh
          try {
            await dispatch(refreshTokenThunk()).unwrap();
            sessionRestored = true;
          } catch (refreshErr) {
            console.warn('Silent token refresh failed during splash:', refreshErr);
            // Clear dead tokens safely using verified tokenStorage method
            tokenStorage.clearTokens();
          }
        }
      } catch (err) {
        console.warn('Failed to restore login session on startup:', err);
      }

      // Ensure minimum 2 seconds have elapsed before routing
      await timerPromise;

      // 2. Conditional navigation based on session status
      if (sessionRestored) {
        navigation.replace('MainTabs', undefined as any);
      }
      // If not authenticated, user stays on this Splash/Landing screen layout to interact with CTAs
    };

    initializeApp();
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