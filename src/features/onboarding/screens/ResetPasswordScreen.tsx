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
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

// --- Centralized Imports ---
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';
import { colors, radius, spacing, typography } from '../../../core/theme';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { RootStackParamList } from '../../../app/navigation/types';

type ResetPasswordScreenProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ route, navigation }: { route: any, navigation: ResetPasswordScreenProp }) {
  const { email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] = useState(false);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    const payload = { email, newPassword: password };

    try {
        // Using the centralized endpoint constant
        await axios.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, payload);
        Alert.alert("Success", "Password updated successfully.");
        navigation.navigate('Login');
    } catch (err: any) {
        console.error("Server Error:", err.response?.data); 
        Alert.alert("Error", "Failed to reset password.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <HeroBackground tone="navy">
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <Text style={styles.title}>Reset Password</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>New Password</Text>
              <View style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperFocused]}>
                <TextInput
                    style={styles.input}
                    placeholder="New Password"
                    placeholderTextColor={colors.textFaint}
                    secureTextEntry={isPasswordVisible}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setIsPasswordVisible(!isPasswordVisible)} activeOpacity={0.7}>
                    <Ionicons name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textMutedDark} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Confirm Password</Text>
              <View style={[styles.inputWrapper, isConfirmPasswordFocused && styles.inputWrapperFocused]}>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    placeholderTextColor={colors.textFaint}
                    secureTextEntry={isConfirmPasswordVisible}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    onFocus={() => setIsConfirmPasswordFocused(true)}
                    onBlur={() => setIsConfirmPasswordFocused(false)}
                />
                <TouchableOpacity style={styles.eyeButton} onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)} activeOpacity={0.7}>
                    <Ionicons name={isConfirmPasswordVisible ? "eye-off-outline" : "eye-outline"} size={22} color={colors.textMutedDark} />
                </TouchableOpacity>
              </View>
            </View>

            <Button
              label={loading ? "Updating..." : "Reset Password"}
              variant="gradientAmber"
              loading={loading}
              onPress={handleResetPassword}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </HeroBackground>
  );
}

// Styles updated to use your central theme spacing/radius constants
const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  title: { ...typography.h1, color: colors.textOnDark, textAlign: 'center', marginBottom: spacing.xxl },
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
    fontSize: 16,
    // @ts-ignore - web-only property, RN Web draws a native focus ring otherwise
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  eyeButton: {
    paddingHorizontal: spacing.md,
    width: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
