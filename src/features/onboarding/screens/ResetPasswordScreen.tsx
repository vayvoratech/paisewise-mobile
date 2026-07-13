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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import axios from 'axios';

import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';

type ResetPasswordScreenProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ route, navigation }: { route: any, navigation: ResetPasswordScreenProp }) {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    const payload = {
        email: email, 
        newPassword: password 
    };

    console.log("Sending Payload:", JSON.stringify(payload)); 

    try {
        await axios.post('http://192.168.29.14:8080/auth/reset-password', payload);
        Alert.alert("Success", "Password updated successfully.");
        navigation.navigate('Login');
    } catch (err: any) {
        // This will now show you the specific error from the backend
        console.error("Server Error Response:", err.response?.data); 
        Alert.alert("Error", "Failed to reset password.");
    }
};

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Reset Password</Text>
            
            <TextInput
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor={colors.textFaint}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textFaint}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            <Button
              label={loading ? "Updating..." : "Reset Password"}
              variant="gradientAmber"
              onPress={handleResetPassword}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  title: { ...typography.h1, color: colors.textOnDark, textAlign: 'center', marginBottom: spacing.xxl },
  input: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.borderDark,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.lg,
    color: colors.textOnDark,
    fontSize: 16,
    marginBottom: spacing.md,
  },
});