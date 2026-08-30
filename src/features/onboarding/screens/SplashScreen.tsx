/** Screen 01 — Splash / Landing. Brand + primary CTA. */
import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch } from 'react-redux';

import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { Pill } from '../../../shared/ui/Pill';
import { colors, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { tokenStore, credentialsStore } from '../../../core/security/secureStore';
import { tokenStorage } from '../../../core/api/tokenStorage';
import { setTokens, refreshTokenThunk } from '../slices/authSlice';
import mixpanel from '@core/mixpanel'; // Import mixpanel instance

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export default function SplashScreen({ navigation }: Props) {
  const dispatch = useDispatch<any>();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  const replaceScreen = (name: string, params?: any) => {
    const parent = navigation.getParent();
    if (parent) {
      (parent as any).replace(name, params);
    } else {
      (navigation as any).replace(name, params);
    }
  };

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      // Enforce a minimum 2-second display timer for branding & loading experience
      const timerPromise = new Promise((resolve) => setTimeout(resolve, 2000));

      let sessionRestored = false;
      let savedPhone = '';
      let hasMpin = false;

      try {
        const accessToken = tokenStorage.getAccessToken() || await tokenStore.getAccessToken();
        const refreshToken = tokenStorage.getRefreshToken() || await tokenStore.getRefreshToken();
        savedPhone = await credentialsStore.getPhone() || '';
        hasMpin = await credentialsStore.getHasMpin();

        if (accessToken && refreshToken) {
          dispatch(setTokens({ accessToken, refreshToken }));
          sessionRestored = true;
        } else if (refreshToken && !accessToken) {
          // Attempt silent token refresh
          try {
            const result = await dispatch(refreshTokenThunk()).unwrap();
            sessionRestored = true;
          } catch (refreshErr) {
            console.warn('Silent token refresh failed during splash:', refreshErr);
            tokenStorage.clearTokens();
            await tokenStore.clear();
          }
        }
      } catch (err) {
        console.warn('Failed to restore login session on startup:', err);
      }

      await timerPromise;

      // Conditional navigation based on session status and MPIN setup
      if (sessionRestored) {
        if (savedPhone && hasMpin) {
          replaceScreen('MpinLogin', { phone: savedPhone });
        } else {
          replaceScreen('MainTabs', undefined as any);
        }
      } else {
        // If not authenticated, check if returning user with configured MPIN
        if (savedPhone && hasMpin) {
          replaceScreen('MpinLogin', { phone: savedPhone });
        }
      }
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
          <Animated.View style={[styles.logo, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.logoEmoji}>🏛️</Text>
          </Animated.View>
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