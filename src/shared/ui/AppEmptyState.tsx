import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AppButton } from './AppButton';

interface AppEmptyStateProps {
  title: string;
  description?: string;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({ title, description, buttonTitle, onButtonPress }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {buttonTitle && onButtonPress && (
        <AppButton title={buttonTitle} onPress={onButtonPress} style={styles.button} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111', textAlign: 'center', marginBottom: 8 },
  description: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
  button: { minWidth: 140 },
});