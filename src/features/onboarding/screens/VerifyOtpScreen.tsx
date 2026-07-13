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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import axios from 'axios';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';

type VerifyOtpScreenProp = NativeStackNavigationProp<RootStackParamList, 'VerifyOtp'>;

export default function VerifyOtpScreen({ route, navigation }: { route: any, navigation: VerifyOtpScreenProp }) {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerifyOtp = async () => {
    const payload = {
        email: email, 
        otp: otp.toString() 
    };

    console.log("Sending Payload:", JSON.stringify(payload)); 

    try {
        await axios.post('http://192.168.29.14:8080/auth/verify-otp', payload);
        navigation.navigate('ResetPassword', { email });
    } catch (err: any) {
        if (err.response) {
            console.error("Server responded with:", err.response.data); 
        }
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

            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>Enter the code sent to {email}</Text>

            <View style={styles.field}>
              <TextInput
                style={styles.input}
                placeholder="6-digit code"
                placeholderTextColor={colors.textFaint}
                keyboardType="numeric"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
              />
            </View>

            <Button
              label={loading ? "Verifying..." : "Verify OTP"}
              variant="gradientAmber" 
              onPress={handleVerifyOtp}
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
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.borderDark,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    color: colors.textOnDark,
    fontSize: 16,
    textAlign: 'center',
  },
});