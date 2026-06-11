/** Screen 10 — Jargon Buster (bottom-sheet modal). Plain-English term explainer. */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../../shared/ui/Button';
import { Pill } from '../../../shared/ui/Pill';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { JARGON } from '../learn.data';

type Props = NativeStackScreenProps<RootStackParamList, 'JargonBuster'>;

export default function JargonBusterScreen({ navigation, route }: Props) {
  const term = JARGON[route.params.term];

  if (!term) {
    return (
      <View style={styles.root}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Term not found</Text>
          <Button label="Got it! ✓ Back to lesson" variant="dark" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Pill label="📖  JARGON BUSTER" color={colors.purple} bg={colors.indigoChip} mono />
          <Text style={styles.title}>{term.term}</Text>
          <Text style={styles.definition}>{term.definition}</Text>

          <View style={styles.analogy}>
            <Text style={styles.analogyLabel}>🍲  DESI ANALOGY</Text>
            <Text style={styles.analogyText}>{term.analogy}</Text>
          </View>

          <View style={styles.example}>
            <Text style={styles.exampleText}>📌 Example: {term.example}</Text>
          </View>
        </ScrollView>

        <SafeAreaView edges={['bottom']}>
          <Button label="Got it! ✓ Back to lesson" variant="dark" onPress={() => navigation.goBack()} />
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.xl, maxHeight: '88%' },
  grabber: { width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.lg },
  scroll: { paddingBottom: spacing.lg },
  title: { ...typography.h1, color: colors.text, marginTop: spacing.lg },
  definition: { ...typography.body, fontSize: 18, lineHeight: 28, color: colors.textFaint, marginTop: spacing.md },
  analogy: { backgroundColor: colors.yellowCard, borderLeftWidth: 4, borderLeftColor: colors.amber, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.lg },
  analogyLabel: { ...typography.overline, color: colors.amber, marginBottom: spacing.sm },
  analogyText: { ...typography.body, fontSize: 17, lineHeight: 26, color: '#92722A' },
  example: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.md },
  exampleText: { ...typography.body, fontSize: 16, lineHeight: 24, color: colors.textFaint },
});
