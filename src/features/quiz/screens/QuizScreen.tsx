/** Screen 07 — Daily Quiz. XP at stake, timer, option states, explanation. */
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { Pill } from '../../../shared/ui/Pill';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { DAILY_QUIZ } from '../quiz.data';
import mixpanel from '@core/mixpanel'; // Import mixpanel

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export default function QuizScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const q = DAILY_QUIZ[index];
  const [secondsLeft, setSecondsLeft] = useState(q.seconds);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Track quiz_started when screen loads
  useEffect(() => {
    mixpanel.track('quiz_started', {
      quiz_id: 'daily_quiz_01', // Or dynamic quiz ID if available
      total_questions: DAILY_QUIZ.length,
      device_type: Platform.OS,
    });
  }, []);

  useEffect(() => {
    setSecondsLeft(q.seconds);
    setPicked(null);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, q.seconds]);

  const answered = picked !== null;
  const onPick = (key: string) => {
    if (answered) return;
    setPicked(key);
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = q.options.find((opt) => opt.key === key)?.correct ?? false;

    // Track quiz_question_answered event per spec
    mixpanel.track('quiz_question_answered', {
      question_index: index + 1,
      selected_option: key,
      is_correct: isCorrect,
      time_taken_seconds: q.seconds - secondsLeft,
    });
  };

  const next = () => {
    if (index < DAILY_QUIZ.length - 1) {
      setIndex((i) => i + 1);
    } else {
      // Track quiz_completed when finishing the last question
      mixpanel.track('quiz_completed', {
        quiz_id: 'daily_quiz_01',
        total_questions: DAILY_QUIZ.length,
      });
      navigation.goBack();
    }
  };

  return (
    <HeroBackground tone="dark">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status row */}
          <View style={styles.statusRow}>
            <Pill label={`⭐ ${q.xp} XP at stake`} color={colors.amber} bg="rgba(245,158,11,0.12)" borderColor="rgba(245,158,11,0.4)" mono />
            <Pill label={`⏱ ${secondsLeft} sec`} color={colors.pink} bg="rgba(244,63,94,0.12)" borderColor="rgba(244,63,94,0.4)" mono />
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <ProgressBar progress={(index + (answered ? 1 : 0)) / DAILY_QUIZ.length} color={colors.amber} />
          </View>

          <Text style={styles.qCount}>QUESTION {index + 1} OF {DAILY_QUIZ.length}</Text>
          <Text style={styles.prompt}>{q.prompt}</Text>

          <View style={styles.options}>
            {q.options.map((opt) => {
              const isPicked = picked === opt.key;
              const showCorrect = answered && opt.correct;
              const showWrong = answered && isPicked && !opt.correct;
              return (
                <TouchableOpacity
                  key={opt.key}
                  activeOpacity={0.85}
                  onPress={() => onPick(opt.key)}
                  style={[styles.option, showCorrect && styles.optionCorrect, showWrong && styles.optionWrong]}
                >
                  <View style={[styles.optBadge, showCorrect && styles.badgeCorrect, showWrong && styles.badgeWrong]}>
                    <Text style={styles.optBadgeText}>{opt.key}</Text>
                  </View>
                  <Text style={styles.optText}>{opt.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {answered && (
            <View style={styles.explain}>
              <Text style={styles.explainIcon}>✅</Text>
              <Text style={styles.explainText}>{q.explanation}</Text>
            </View>
          )}
        </ScrollView>

        {answered && (
          <View style={styles.footer}>
            <Button label="Next Question  →" variant="gradientAmber" onPress={next} />
          </View>
        )}
      </SafeAreaView>
    </HeroBackground>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  content: { paddingTop: spacing.lg, paddingBottom: spacing.xl },
  statusRow: { flexDirection: 'row', justifyContent: 'space-between' },
  qCount: { ...typography.overline, color: colors.textMutedDark, marginTop: spacing.xl },
  prompt: { ...typography.h1, color: colors.textOnDark, marginTop: spacing.md, lineHeight: 38 },
  options: { marginTop: spacing.xl, gap: spacing.md },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: colors.borderDark, borderRadius: radius.md, padding: spacing.lg },
  optionCorrect: { borderColor: colors.greenBright, backgroundColor: 'rgba(45,227,164,0.08)' },
  optionWrong: { borderColor: colors.pink, backgroundColor: 'rgba(244,63,94,0.08)' },
  optBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  badgeCorrect: { backgroundColor: colors.greenBright },
  badgeWrong: { backgroundColor: colors.pink },
  optBadgeText: { ...typography.bodyBold, color: colors.textOnDark },
  optText: { ...typography.bodyBold, color: colors.textOnDark, flex: 1, fontSize: 17 },
  explain: { flexDirection: 'row', gap: spacing.md, backgroundColor: 'rgba(45,227,164,0.08)', borderColor: colors.greenBright, borderWidth: 1, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.lg },
  explainIcon: { fontSize: 22 },
  explainText: { ...typography.body, color: colors.textMutedDark, flex: 1, lineHeight: 24, fontSize: 16 },
  footer: { paddingVertical: spacing.md },
});