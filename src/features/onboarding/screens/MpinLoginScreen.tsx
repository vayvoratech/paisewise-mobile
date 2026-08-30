import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDispatch, useSelector } from 'react-redux';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { loginUserMpin } from '../slices/authSlice';
import { credentialsStore } from '../../../core/security/secureStore';

type Props = NativeStackScreenProps<RootStackParamList, 'MpinLogin'>;

const PIN_LENGTH = 4;

export default function MpinLoginScreen({ route, navigation }: Props) {
  const dispatch = useDispatch();

  const user = useSelector((state: any) => state.auth.user);
  const displayName = user?.name || '';
  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : '🔒';

  // Retrieve route params if passed, otherwise default to saved phone
  const routePhone = route.params?.phone;

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [lockoutSecs, setLockoutSecs] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSuccessful = useRef(false);

  // 1. Load cached phone and check biometric availability on mount
  useEffect(() => {
    const initializeScreen = async () => {
      const savedPhone = routePhone || (await credentialsStore.getPhone()) || '';
      const savedEmail = (await credentialsStore.getEmail()) || '';
      setPhone(savedPhone);
      setEmail(savedEmail);

      // Check biometrics
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricSupported = hasHardware && isEnrolled;
      setIsBiometricAvailable(biometricSupported);

      if (biometricSupported && savedPhone) {
        // Auto trigger biometrics
        triggerBiometrics(savedPhone);
      }
    };
    initializeScreen();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Intercept back actions to block lock screen bypasses during an active session
  useEffect(() => {
    const handleBeforeRemove = (e: any) => {
      if (route.params?.isUnlock && !isSuccessful.current) {
        e.preventDefault();
      }
    };
    navigation.addListener('beforeRemove', handleBeforeRemove);
    return () => navigation.removeListener('beforeRemove', handleBeforeRemove);
  }, [navigation, route.params?.isUnlock]);

  // 2. Lockout countdown timer logic
  useEffect(() => {
    if (lockoutSecs > 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setLockoutSecs((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [lockoutSecs]);

  // 3. Authenticate via Biometrics
  const triggerBiometrics = async (activePhone: string) => {
    if (lockoutSecs > 0) return;
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate with FaceID/Fingerprint',
        fallbackLabel: 'Use PIN code',
        disableDeviceFallback: true,
      });

      if (result.success) {
        const storedMpin = await credentialsStore.getMpin();
        if (storedMpin) {
          submitMpinLogin(activePhone, storedMpin);
        } else {
          Alert.alert('Setup Required', 'Please log in with your PIN code first to enable biometrics.');
        }
      }
    } catch (err) {
      console.warn('Biometric auth failed:', err);
    }
  };

  // 4. Submit MPIN credentials to backend
  const submitMpinLogin = async (phoneNum: string, mpinVal: string) => {
    if (lockoutSecs > 0) return;
    setError(null);
    setLoading(true);

    try {
      await dispatch(loginUserMpin({ phone: phoneNum, mpin: mpinVal }) as any).unwrap();
      setLoading(false);
      if (route.params?.isUnlock) {
        isSuccessful.current = true;
        navigation.goBack();
      } else {
        navigation.replace('MainTabs', { screen: 'Home' });
      }
    } catch (err: any) {
      setLoading(false);
      setPin(''); // Reset PIN input on failure

      if (err === 'ACCOUNT_LOCKED') {
        setLockoutSecs(600); // 10 minute lockout (600 seconds)
        setError('Too many failed attempts. Account locked for 10 minutes.');
      } else {
        setError(err || 'Invalid MPIN');
      }
    }
  };

  // 5. Handle key press inside custom keyboard grid
  const handleKeyPress = (key: string) => {
    if (lockoutSecs > 0 || loading) return;
    setError(null);

    if (key === 'back') {
      setPin((prev) => prev.slice(0, -1));
    } else if (key === 'biometric') {
      if (isBiometricAvailable && phone) {
        triggerBiometrics(phone);
      }
    } else {
      if (pin.length < PIN_LENGTH) {
        const newPin = pin + key;
        setPin(newPin);
        if (newPin.length === PIN_LENGTH) {
          submitMpinLogin(phone, newPin);
        }
      }
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.container}>
        {/* Header toolbar */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Login' } as any)}>
            <Text style={styles.backLink}>← Use Password</Text>
          </TouchableOpacity>
        </View>

        {/* Content body */}
        <View style={styles.body}>
          <View style={styles.avatar}>
            <Text style={[styles.avatarEmoji, displayName ? styles.avatarText : null]}>
              {avatarInitial}
            </Text>
          </View>
          <Text style={styles.title}>{displayName ? `Hi, ${displayName}` : 'Enter MPIN'}</Text>
          <Text style={styles.subtitle}>Welcome back! Enter your 4-digit security PIN.</Text>

          {/* Secure Pin indicators */}
          <View style={styles.dotsContainer}>
            {Array.from({ length: PIN_LENGTH }).map((_, idx) => {
              const isActive = idx < pin.length;
              return (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    isActive && styles.dotFilled,
                    lockoutSecs > 0 && styles.dotLocked
                  ]}
                />
              );
            })}
          </View>

          {/* Lockout status and countdown */}
          {lockoutSecs > 0 ? (
            <View style={styles.lockoutBox}>
              <Text style={styles.lockoutText}>Temporarily Locked Out</Text>
              <Text style={styles.lockoutTimer}>Try again in {formatTimer(lockoutSecs)}</Text>
            </View>
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : loading ? (
            <Text style={styles.loadingText}>Verifying code...</Text>
          ) : null}
        </View>

        {/* Custom Numeric Keyboard */}
        <View style={styles.keyboardContainer}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['biometric', '0', 'back']
          ].map((row, rowIdx) => (
            <View key={rowIdx} style={styles.keyboardRow}>
              {row.map((key) => {
                const isBio = key === 'biometric';
                const isBack = key === 'back';
                const isHiddenBio = isBio && !isBiometricAvailable;

                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.key,
                      isHiddenBio && styles.keyHidden,
                      (isBio || isBack) && styles.keySpecial
                    ]}
                    disabled={isHiddenBio || lockoutSecs > 0}
                    onPress={() => handleKeyPress(key)}
                    activeOpacity={0.7}
                  >
                    {isBio ? (
                      <Ionicons name="finger-print-outline" size={28} color={colors.amber} />
                    ) : isBack ? (
                      <Ionicons name="backspace-outline" size={26} color={colors.textMutedDark} />
                    ) : (
                      <Text style={styles.keyText}>{key}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Footer options */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'ForgotPasswordScreen', params: { mode: 'mpin' } } as any)}>
            <Text style={styles.forgotMpin}>Forgot MPIN?</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.xl },
  header: { height: 50, justifyContent: 'center' },
  backLink: { ...typography.body, color: colors.textMutedDark },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  avatarEmoji: { fontSize: 36 },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: colors.amber },
  title: { ...typography.h1, color: colors.textOnDark, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.textMutedDark, textAlign: 'center', marginBottom: spacing.xl },
  dotsContainer: { flexDirection: 'row', gap: spacing.xl, marginBottom: spacing.xl },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderDark,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: colors.amber,
    borderColor: colors.amber,
  },
  dotLocked: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  lockoutBox: { alignItems: 'center', marginTop: spacing.md },
  lockoutText: { ...typography.bodyBold, color: colors.pink },
  lockoutTimer: { ...typography.overline, color: colors.textMutedDark, fontSize: 13, marginTop: 4 },
  errorText: { ...typography.body, color: colors.pink, textAlign: 'center' },
  loadingText: { ...typography.body, color: colors.amber },
  keyboardContainer: { paddingBottom: spacing.xl },
  keyboardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  key: {
    flex: 1,
    height: 62,
    marginHorizontal: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keySpecial: { backgroundColor: 'transparent' },
  keyHidden: { opacity: 0 },
  keyText: { ...typography.h2, color: colors.textOnDark, fontSize: 24 },
  footer: { paddingBottom: spacing.lg, alignItems: 'center' },
  forgotMpin: { ...typography.bodyBold, color: colors.amber },
});