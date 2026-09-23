/** Screen 07 — Daily Quiz & Lesson Quiz. XP at stake, auto-timer, randomized choices, score + XP awards. */
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HeroBackground } from '../../../shared/ui/HeroBackground';
import { Button } from '../../../shared/ui/Button';
import { Pill } from '../../../shared/ui/Pill';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { DAILY_QUIZ } from '../quiz.data';
import { Analytics } from '../../../core/analyticsService';
import { learnApi } from '../../learn/learnApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Quiz'>;

export default function QuizScreen({ navigation, route }: Props) {
  const lessonId = route.params?.lessonId || 'mf-1';
  const [questions, setQuestions] = useState<any[]>(DAILY_QUIZ);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);

  // Load and shuffle questions for this lesson via learnApi
  useEffect(() => {
    learnApi.getQuiz(lessonId)
      .then(data => {
        if (data && data.length > 0) {
          const raw = data;
          // Shuffle questions
          const shuffled = [...raw].sort(() => Math.random() - 0.5).map((q: any) => {
            let opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.optionsJson ? (typeof q.optionsJson === 'string' ? JSON.parse(q.optionsJson) : q.optionsJson) : q.options);
            // Shuffle choices per question
            opts = [...opts].sort(() => Math.random() - 0.5);
            return { ...q, options: opts, prompt: q.questionPrompt || q.prompt };
          });
          setQuestions(shuffled);
        }
      })
      .catch(() => {
        // Shuffle DAILY_QUIZ fallback
        const shuffled = [...DAILY_QUIZ].sort(() => Math.random() - 0.5).map((q: any) => {
          const opts = [...q.options].sort(() => Math.random() - 0.5);
          return { ...q, options: opts };
        });
        setQuestions(shuffled);
      });
  }, [lessonId]);

  const q = questions[index] || questions[0] || {};
  const [secondsLeft, setSecondsLeft] = useState(q.seconds || 30);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 30s Countdown timer per question
  useEffect(() => {
    setSecondsLeft(30);
    setPicked(null);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s: number) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            handleTimeoutNext();
          }, 800);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index]);

  const handleTimeoutNext = () => {
    if (picked === null) {
      setUserAnswers(prev => [...prev, 'TIMEOUT']);
    }
    if (index < questions.length - 1) {
      setIndex(i => i + 1);
    } else {
      finishQuiz(score);
    }
  };

  const answered = picked !== null;

  const onPick = (key: string) => {
    if (answered) return;
    setPicked(key);
    if (timerRef.current) clearInterval(timerRef.current);

    const isCorrect = q.options?.find((opt: any) => opt.key === key)?.correct ?? false;
    let newScore = score;
    if (isCorrect) {
      newScore = score + 1;
      setScore(newScore);
    }
    setUserAnswers(prev => [...prev, key]);
  };

  const next = () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
    } else {
      finishQuiz(score);
    }
  };

  const finishQuiz = async (finalScore: number) => {
    setIsFinished(true);
    const scorePct = (finalScore / (questions.length || 1)) * 100;
    const isPassed = scorePct >= 70;
    const earned = isPassed ? 50 : 0;
    setXpEarned(earned);

    if (isPassed) {
      try {
        await learnApi.submitQuiz(lessonId, userAnswers, 30);
      } catch (e) {
        // Fallback local update
      }
    }
  };

  const restartQuiz = () => {
    setIndex(0);
    setScore(0);
    setPicked(null);
    setUserAnswers([]);
    setIsFinished(false);
  };

  if (isFinished) {
    const scorePct = Math.round((score / (questions.length || 1)) * 100);
    const isPassed = scorePct >= 70;

    return (
      <HeroBackground tone="dark">
        <SafeAreaView style={styles.safe}>
          <View style={styles.resultContainer}>
            <Text style={{ fontSize: 60, textAlign: 'center' }}>{isPassed ? '🎉' : '❌'}</Text>
            <Text style={styles.resultTitle}>{isPassed ? 'Quiz Passed!' : 'Quiz Failed'}</Text>
            <Text style={styles.resultScore}>Score: {score} / {questions.length} ({scorePct}%)</Text>

            {isPassed ? (
              <>
                <Pill label={`⭐ +${xpEarned || 50} XP Earned!`} color={colors.amber} bg="rgba(245,158,11,0.2)" mono />
                <Button 
                  label="Continue Learning  →" 
                  variant="gradientPurple" 
                  style={{ marginTop: spacing.xl, width: '100%' }} 
                  onPress={() => navigation.goBack()} 
                />
              </>
            ) : (
              <>
                <Pill label="Need >= 70% score to pass" color={colors.pink} bg="rgba(244,63,94,0.2)" mono />
                <Button 
                  label="Retry Quiz  🔄" 
                  variant="gradientAmber" 
                  style={{ marginTop: spacing.xl, width: '100%' }} 
                  onPress={restartQuiz} 
                />
                <Button 
                  label="Back to Lessons" 
                  variant="outline" 
                  style={{ marginTop: spacing.md, width: '100%' }} 
                  onPress={() => navigation.goBack()} 
                />
              </>
            )}
          </View>
        </SafeAreaView>
      </HeroBackground>
    );
  }

  return (
    <HeroBackground tone="dark">
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Status row */}
          <View style={styles.statusRow}>
            <Pill label={`⭐ ${q.xp || 50} XP at stake`} color={colors.amber} bg="rgba(245,158,11,0.12)" borderColor="rgba(245,158,11,0.4)" mono />
            <Pill label={`⏱ ${secondsLeft} sec`} color={secondsLeft < 5 ? colors.pink : colors.amber} bg="rgba(244,63,94,0.12)" borderColor="rgba(244,63,94,0.4)" mono />
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <ProgressBar progress={(index + (answered ? 1 : 0)) / questions.length} color={colors.amber} />
          </View>

          <Text style={styles.qCount}>QUESTION {index + 1} OF {questions.length}</Text>
          <Text style={styles.prompt}>{q.prompt || q.questionPrompt || 'Quiz Question'}</Text>

          <View style={styles.options}>
            {(q.options || []).map((opt: any) => {
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
              <Text style={styles.explainIcon}>💡</Text>
              <Text style={styles.explainText}>{q.explanation || 'Great effort answering this question!'}</Text>
            </View>
          )}
        </ScrollView>

        {answered && (
          <View style={styles.footer}>
            <Button 
              label={index === questions.length - 1 ? "Submit Quiz  ✓" : "Next Question  →"} 
              variant={index === questions.length - 1 ? "gradientPurple" : "gradientAmber"} 
              onPress={next} 
            />
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
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg, paddingHorizontal: spacing.xl },
  resultTitle: { ...typography.h1, color: colors.textOnDark, fontSize: 32 },
  resultScore: { ...typography.bodyBold, color: colors.textMutedDark, fontSize: 22 },
});