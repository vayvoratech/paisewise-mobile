/** Screens 04 + 05 — Lesson Screen with tappable jargon words and quiz CTA. */
import React, { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { RootStackParamList } from '../../../app/navigation/types';
import { TODAYS_LESSON } from '../learn.data';
import { JargonText } from '../components/JargonText';
import { Analytics } from '../../../core/analyticsService'; // Import your Analytics service

type Props = NativeStackScreenProps<RootStackParamList, 'Lesson'>;

export default function LessonScreen({ navigation }: Props) {
  const lesson = TODAYS_LESSON;
  
  // Track scroll depth milestones (25%, 50%, 75%, 100%)
  const milestonesFired = useRef({ 25: false, 50: false, 75: false, 100: false });

  // Track lesson_started using your Analytics service
  useEffect(() => {
    Analytics.lessonStarted({
      sessionId: 'sess_abc123', // Replace with your active session ID variable/state
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      chapterId: `chap_${lesson.chapterNo}`,
      chapterName: lesson.chapter,
      lessonOrder: lesson.index,
      language: 'en',
      totalBlocks: lesson.segments.length,
      isResume: false,
      resumeBlockIndex: 0,
      estimatedMinutes: 3,
    });
  }, [lesson]);

  const openJargon = (term: string) => {
    // Track jargon_term_tapped event using your Analytics service
    Analytics.jargonTermTapped({
      sessionId: 'sess_abc123',
      lessonId: lesson.id,
      term: term,
      termDisplay: term,
      language: 'en',
      blockIndex: 0,
      tapCountInLesson: 1,
    });
    navigation.navigate('JargonBuster', { term });
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const scrollProgress = (contentOffset.y + layoutMeasurement.height) / (contentSize.height - paddingToBottom);
    const percentage = Math.min(Math.max(scrollProgress * 100, 0), 100);

    ([25, 50, 75, 100] as const).forEach((milestone) => {
      if (percentage >= milestone && !milestonesFired.current[milestone]) {
        milestonesFired.current[milestone] = true;
        // Track lesson content scrolled using your Analytics service
        Analytics.lessonContentScrolled({
          sessionId: 'sess_abc123',
          lessonId: lesson.id,
          scrollDepthPct: milestone,
          currentBlockIndex: 0,
          timeElapsedSeconds: Math.round(Date.now() / 1000),
        });
      }
    });
  };

  const handleQuizPress = () => {
    // Track quiz started using your Analytics service
    Analytics.quizStarted({
      sessionId: 'sess_abc123',
      lessonId: lesson.id,
      attemptNumber: 1,
      totalQuestions: 5,
      language: 'en',
    });
    navigation.navigate('Quiz');
  };

  return (
    <View style={styles.root}>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        {/* Purple lesson header */}
        <LinearGradient colors={[colors.purple, colors.purpleDeep]} style={styles.header}>
          <SafeAreaView edges={['top']}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.chapterRow}>
              <Text style={styles.chapter}>←  CHAPTER {lesson.chapterNo}  ·  {lesson.chapter.toUpperCase()}</Text>
            </TouchableOpacity>
            <View style={{ marginTop: spacing.lg }}>
              <ProgressBar progress={lesson.index / lesson.total} color={colors.amber} trackColor="rgba(255,255,255,0.25)" />
            </View>
            <Text style={styles.lessonNo}>LESSON {lesson.index} OF {lesson.total}</Text>
            <Text style={styles.title}>{lesson.title}</Text>
          </SafeAreaView>
        </LinearGradient>

        {/* Body */}
        <View style={styles.body}>
          {lesson.segments.map((seg, i) => {
            if (seg.type === 'emoji') {
              return (
                <Card key={i} style={styles.emojiCard}>
                  <Text style={styles.emoji}>{seg.content}</Text>
                </Card>
              );
            }
            if (seg.type === 'callout') {
              return (
                <View key={i} style={styles.callout}>
                  <Text style={styles.calloutIcon}>💡</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.calloutTitle}>{seg.title}</Text>
                    <Text style={styles.calloutText}>{seg.content}</Text>
                  </View>
                </View>
              );
            }
            return (
              <Card key={i} style={styles.textCard}>
                <JargonText text={seg.content} jargonWords={lesson.jargonWords} baseStyle={styles.paragraph} onPressTerm={openJargon} />
              </Card>
            );
          })}

          <View style={styles.hint}>
            <Text style={styles.hintIcon}>💬</Text>
            <Text style={styles.hintText}>Tap any <Text style={styles.hintUnderline}>underlined word</Text> to understand it simply →</Text>
          </View>

          <Button label="🎯 Ready? Take the quiz — Earn 50 XP!" variant="gradientPurple" style={{ marginTop: spacing.lg }} onPress={handleQuizPress} />
          <Button label="Take Quiz & Earn 50 XP ⭐" variant="primary" style={{ marginTop: spacing.md }} onPress={handleQuizPress} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  content: { paddingBottom: spacing.xxl },
  header: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.lg },
  chapterRow: { marginTop: spacing.sm },
  chapter: { ...typography.overline, color: 'rgba(255,255,255,0.8)' },
  lessonNo: { ...typography.overline, color: 'rgba(255,255,255,0.7)', marginTop: spacing.lg },
  title: { ...typography.h1, color: colors.textOnDark, marginTop: spacing.sm },
  body: { padding: spacing.xl, gap: spacing.lg },
  emojiCard: { backgroundColor: colors.surfaceMuted, alignItems: 'center', paddingVertical: spacing.lg },
  emoji: { fontSize: 44 },
  textCard: { backgroundColor: colors.surfaceMuted },
  paragraph: { ...typography.body, color: colors.text, fontSize: 18, lineHeight: 28 },
  callout: { flexDirection: 'row', gap: spacing.md, backgroundColor: colors.yellowCard, borderColor: colors.yellowBorder, borderWidth: 1, borderRadius: radius.md, padding: spacing.lg },
  calloutIcon: { fontSize: 24 },
  calloutTitle: { ...typography.overline, color: colors.amber, marginBottom: spacing.xs },
  calloutText: { ...typography.body, color: '#92722A', fontSize: 17, lineHeight: 25 },
  hint: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', backgroundColor: colors.indigoChip, borderRadius: radius.md, padding: spacing.lg, marginTop: spacing.xs },
  hintIcon: { fontSize: 20 },
  hintText: { ...typography.body, color: colors.purple, flex: 1, fontWeight: '600' },
  hintUnderline: { textDecorationLine: 'underline' },
});