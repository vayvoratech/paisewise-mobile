import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { credentialsStore } from '../../../core/security/secureStore';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetMpin'>;

export default function ResetMpinScreen({ route, navigation }: Props) {
  const { email, mode = 'forgot' } = route.params;
  const [currentMpin, setCurrentMpin] = useState('');
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCurrentMpinFocused, setIsCurrentMpinFocused] = useState(false);
  const [isMpinFocused, setIsMpinFocused] = useState(false);
  const [isConfirmMpinFocused, setIsConfirmMpinFocused] = useState(false);

  const handleResetMpin = async () => {
    setError(null);
    
    if (mode === 'change') {
      if (!/^\d{4}$/.test(currentMpin)) {
        return setError('Current MPIN must be exactly 4 digits.');
      }
    }
    
    if (!/^\d{4}$/.test(mpin)) {
      return setError('New MPIN must be exactly 4 digits.');
    }
    if (mpin !== confirmMpin) {
      return setError('MPINs do not match.');
    }

    setLoading(true);
    try {
      if (mode === 'change') {
        const phone = await credentialsStore.getPhone() || '';
        if (!phone) {
          throw new Error('User session phone not found. Please log in again.');
        }
        // Verify current MPIN by attempting login/validation against backend
        await axios.post('http://192.168.1.36:8080/auth/login/mpin', { phone, mpin: currentMpin });
      }

      // Update MPIN on the backend database
      const payload = { email, mpin };
      await axios.post('http://192.168.1.36:8080/auth/set-mpin', payload);
      
      // Update local storage keychain
      const savedPhone = await credentialsStore.getPhone() || '';
      await credentialsStore.saveCredentials(savedPhone, email, mpin);

      setLoading(false);
      
      if (mode === 'change') {
        Alert.alert('Success', 'MPIN updated successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Success', 'MPIN reset successfully! Please log in with your new PIN.');
        navigation.navigate('MpinLogin', { phone: '' });
      }
    } catch (err: any) {
      setLoading(false);
      const errMsg = err.response?.data?.message || err.message || 'Failed to update MPIN.';
      setError(errMsg === 'Invalid credentials' ? 'Incorrect current MPIN.' : errMsg);
    }
  };

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.back}>← Back</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{mode === 'change' ? 'Change MPIN 🔒' : 'Reset MPIN 🔒'}</Text>
            <Text style={styles.subtitle}>
              {mode === 'change' 
                ? 'Enter your current PIN to configure a new login code.' 
                : 'Create a new 4-digit security PIN for your account.'}
            </Text>

            {mode === 'change' && (
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Enter Current 4-Digit MPIN</Text>
                <View style={[styles.inputWrapper, isCurrentMpinFocused && styles.inputWrapperFocused]}>
                  <TextInput
                    style={styles.input}
                    placeholder="xxxx"
                    placeholderTextColor={colors.textFaint}
                    keyboardType="numeric"
                    maxLength={4}
                    secureTextEntry
                    value={currentMpin}
                    onChangeText={setCurrentMpin}
                    onFocus={() => setIsCurrentMpinFocused(true)}
                    onBlur={() => setIsCurrentMpinFocused(false)}
                  />
                </View>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Enter New 4-Digit MPIN</Text>
              <View style={[styles.inputWrapper, isMpinFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="xxxx"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={mpin}
                  onChangeText={setMpin}
                  onFocus={() => setIsMpinFocused(true)}
                  onBlur={() => setIsMpinFocused(false)}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Confirm New 4-Digit MPIN</Text>
              <View style={[styles.inputWrapper, isConfirmMpinFocused && styles.inputWrapperFocused]}>
                <TextInput
                  style={styles.input}
                  placeholder="xxxx"
                  placeholderTextColor={colors.textFaint}
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                  value={confirmMpin}
                  onChangeText={setConfirmMpin}
                  onFocus={() => setIsConfirmMpinFocused(true)}
                  onBlur={() => setIsConfirmMpinFocused(false)}
                />
              </View>
            </View>

            {error && <Text style={styles.error}>{error}</Text>}

            <Button
              label={loading ? "Processing..." : (mode === 'change' ? "Change MPIN" : "Reset MPIN")}
              variant="gradientAmber"
              loading={loading}
              onPress={handleResetMpin}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  scroll: { flexGrow: 1, paddingTop: spacing.md },
  back: { ...typography.body, color: colors.textMutedDark, marginBottom: spacing.xl },
  title: { ...typography.h1, color: colors.textOnDark, textAlign: 'center', marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textMutedDark, textAlign: 'center', marginBottom: spacing.xxl },
  field: { marginBottom: spacing.lg },
  fieldLabel: { ...typography.caption, color: colors.textMutedDark, marginBottom: spacing.sm },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 20,
    letterSpacing: 8,
    textAlign: 'center',
    // @ts-ignore - web-only property
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  error: { color: colors.pink, marginBottom: spacing.md, textAlign: 'center' },
});