/** Screen 10 — Jargon Buster (bottom-sheet modal). Plain-English AI term explainer. */
import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Button } from '../../../shared/ui/Button';
import { Pill } from '../../../shared/ui/Pill';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { learnApi } from '../learnApi';
import { JARGON } from '../learn.data';
import { Analytics } from '../../../core/analyticsService';

type Props = NativeStackScreenProps<RootStackParamList, 'JargonBuster'>;

const LANG_CODE_MAP: Record<string, string> = {
  english: 'en',
  telugu: 'te',
  hindi: 'hi',
  bengali: 'bn',
  gujarati: 'gu',
  en: 'en',
  te: 'te',
  hi: 'hi',
  bn: 'bn',
  gu: 'gu',
};

function parseAiExplanation(explanation: string, fallbackTerm: string) {
  if (!explanation) return null;

  const sections = explanation.split(/###\s+/);
  let definition = '';
  let analogy = '';
  let example = '';

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    const titleClean = trimmed.replace(/\*\*/g, '');

    if (/^(Plain|Simple|Expl)/i.test(titleClean) || /सरल व्याख्या/i.test(titleClean)) {
      definition = trimmed.replace(/^[^\n]*\n?/, '').trim();
    } else if (/^(Everyday|Desi|Analogy)/i.test(titleClean) || /देसी मिसाल/i.test(titleClean) || /Analogy/i.test(titleClean)) {
      analogy = trimmed.replace(/^[^\n]*\n?/, '').trim();
    } else if (/^(INR|Real Number|Example)/i.test(titleClean) || /उदाहरण/i.test(titleClean) || /Example/i.test(titleClean)) {
      example = trimmed.replace(/^[^\n]*\n?/, '').trim();
    } else if (!definition) {
      definition = trimmed;
    }
  }

  // Clean markdown bold markers for plain text display
  const clean = (txt: string) => txt.replace(/\*\*/g, '').replace(/---/g, '').trim();

  return {
    term: fallbackTerm,
    definition: clean(definition || explanation),
    analogy: clean(analogy),
    example: clean(example),
  };
}

export default function JargonBusterScreen({ navigation, route }: Props) {
  const termKey = route.params.term;
  
  // Active user language from redux store or profile fallback
  const userLangState = useSelector((state: any) => 
    state.auth?.language || 
    state.auth?.user?.language || 
    state.auth?.user?.preferredLanguage || 
    'English'
  );
  const userLangCode = LANG_CODE_MAP[userLangState.toString().trim().toLowerCase()] || 'en';

  const [termData, setTermData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Track open time to calculate how long the sheet was open
  const openTimeRef = useRef(Date.now());
  const jargonCacheRef = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const cacheKey = `jargon_${termKey.toLowerCase()}_${userLangCode}`;
    if (jargonCacheRef.current[cacheKey]) {
      setTermData(jargonCacheRef.current[cacheKey]);
      setLoading(false);
      return;
    }

    // Try AI endpoint via learnApi backend proxy first
    learnApi.getAiJargon(termKey, userLangCode)
      .then(res => {
        if (!isMounted) return;
        if (res && res.explanation) {
          const parsed = parseAiExplanation(res.explanation, termKey);
          if (parsed) {
            jargonCacheRef.current[cacheKey] = parsed;
            setTermData(parsed);
            return;
          }
        }
        throw new Error('AI empty response');
      })
      .catch(() => {
        // Fallback 1: Database lookup
        return learnApi.getJargon(termKey, userLangCode)
          .then(data => {
            if (isMounted && data) {
              jargonCacheRef.current[cacheKey] = data;
              setTermData(data);
            }
          })
          .catch(() => {
            // Fallback 2: Static local dictionary
            const local = JARGON[termKey] || Object.values(JARGON).find((j: any) => j.term.toLowerCase() === termKey.toLowerCase());
            if (isMounted && local) {
              jargonCacheRef.current[cacheKey] = local;
              setTermData(local);
            }
          });
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
  }, [termKey, userLangCode]);

  const term = termData;

  useEffect(() => {
    if (term) {
      Analytics.jargonTermTapped({
        sessionId: 'sess_abc123',
        lessonId: 'lesson_current',
        term: termKey,
        termDisplay: term.term || termKey,
        language: userLangCode,
        blockIndex: 0,
        tapCountInLesson: 1,
      });
    }
  }, [termKey, term, userLangCode]);

  const handleClose = (closeMethod: string) => {
    const timeOpenSeconds = Math.round((Date.now() - openTimeRef.current) / 1000);

    if (term) {
      Analytics.jargonSheetClosed({
        sessionId: 'sess_abc123',
        lessonId: 'lesson_current',
        term: termKey,
        timeOpenSeconds: timeOpenSeconds,
        closeMethod: closeMethod,
      });
    }

    navigation.goBack();
  };

  if (loading && !term) {
    return (
      <View style={styles.root}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <Pill label="🤖 AI JARGON BUSTER" color={colors.purple} bg={colors.indigoChip} mono />
          <Text style={styles.title}>{termKey}</Text>
          <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.purple} />
            <Text style={{ marginTop: spacing.md, color: colors.textMuted, fontSize: 14 }}>
              Fetching AI explanation in {userLangState}...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (!term) {
    return (
      <View style={styles.root}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Term "{termKey}"</Text>
          <Text style={styles.definition}>A financial concept in trading and investing.</Text>
          <Button label="Got it! ✓ Back to lesson" variant="dark" onPress={() => navigation.goBack()} style={{ marginTop: spacing.lg }} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.sheet}>
        <View style={styles.grabber} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <Pill label={`🤖 AI JARGON BUSTER (${userLangCode.toUpperCase()})`} color={colors.purple} bg={colors.indigoChip} mono />
          <Text style={styles.title}>{term.term}</Text>
          <Text style={styles.definition}>{term.definition}</Text>

          {Boolean(term.analogy) && (
            <View style={styles.analogy}>
              <Text style={styles.analogyLabel}>🍲 DESI ANALOGY</Text>
              <Text style={styles.analogyText}>{term.analogy}</Text>
            </View>
          )}

          {Boolean(term.example) && (
            <View style={styles.example}>
              <Text style={styles.exampleText}>📌 Example: {term.example}</Text>
            </View>
          )}
        </ScrollView>

        <SafeAreaView edges={['bottom']}>
          <Button label="Got it! ✓ Back to lesson" variant="dark" onPress={() => handleClose('button_tap')} />
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