import React from 'react';
import { TextInput, TextInputProps, View, Text, StyleSheet } from 'react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const AppInput: React.FC<AppInputProps> = ({ label, error, style, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16, width: '100%' },
  label: { fontSize: 14, fontWeight: '500', marginBottom: 6, color: '#333' },
  input: { height: 48, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#fff', color: '#000' },
  inputError: { borderColor: '#FF3B30' },
  errorText: { fontSize: 12, color: '#FF3B30', marginTop: 4 },
});