/** Learn tab — chapter/lesson hub. Opens the Lesson screen. */
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../../../shared/ui/Card';
import { Pill } from '../../../shared/ui/Pill';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { MainTabsParamList, RootStackParamList } from '../../../app/navigation/types';
import { TODAYS_LESSON } from '../learn.data';
import mixpanel from '@core/mixpanel';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Learn'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CHAPTERS = [
  { no: 1, title: 'Money Basics', emoji: '💵', lessons: 5, done: 5 },
  { no: 2, title: 'Stocks 101', emoji: '📈', lessons: 5, done: 5 },
  { no: 3, title: 'Mutual Funds', emoji: '📊', lessons: 5, done: 2 },
  { no: 4, title: 'Risk & Returns', emoji: '⚖️', lessons: 5, done: 0 },
];

export default function LearnScreen({ navigation }: Props) {
  useEffect(() => {
    mixpanel.track('lesson_list_viewed', {
      screen_name: 'LearnScreen',
      device_type: Platform.OS,
    });
  }, []);

  const handleLessonPress = (lessonId: string, lessonTitle: string, chapterNo: number) => {
    mixpanel.track('lesson_tapped', {
      lesson_id: lessonId,
      lesson_title: lessonTitle,
      chapter_number: chapterNo,
    });

    navigation.navigate('Lesson', { lessonId });
  };

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheet}>
          <Text style={styles.sectionTitle}>Continue Learning</Text>
          <Card 
            style={styles.continueCard} 
            onPress={() => handleLessonPress(TODAYS_LESSON.id, TODAYS_LESSON.title, 3)}
          >
            <View style={styles.continueRow}>
              <View style={styles.continueIcon}><Text style={{ fontSize: 24 }}>📊</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.continueChapter}>CHAPTER 3 · MUTUAL FUNDS</Text>
                <Text style={styles.continueTitle}>{TODAYS_LESSON.title}</Text>
              </View>
              <Pill label="NEW" color={colors.purple} bg={colors.indigoChip} />
            </View>
            <View style={{ marginTop: spacing.md }}>
              <ProgressBar progress={TODAYS_LESSON.index / TODAYS_LESSON.total} color={colors.amber} trackColor={colors.border} />
            </View>
          </Card>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>All Chapters</Text>
          {CHAPTERS.map((c) => (
            <Card 
              key={c.no} 
              style={styles.chapter} 
              onPress={() => handleLessonPress(TODAYS_LESSON.id, c.title, c.no)}
            >
              <View style={styles.chapterIcon}><Text style={{ fontSize: 22 }}>{c.emoji}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.chapterTitle}>Chapter {c.no}: {c.title}</Text>
                <Text style={styles.chapterMeta}>{c.done}/{c.lessons} lessons complete</Text>
                <View style={{ marginTop: spacing.sm }}>
                  <ProgressBar progress={c.done / c.lessons} color={c.done === c.lessons ? colors.green : colors.amber} trackColor={colors.border} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surfaceAlt },
  scrollContent: { flexGrow: 1 },
  sheet: { flex: 1, backgroundColor: colors.surfaceAlt, padding: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.md },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.xs },
  continueCard: {},
  continueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  continueIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: '#E5EDFF', alignItems: 'center', justifyContent: 'center' },
  continueChapter: { ...typography.overline, color: colors.textMuted },
  continueTitle: { ...typography.bodyBold, color: colors.text, marginTop: 2 },
  chapter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  chapterIcon: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
  chapterTitle: { ...typography.bodyBold, color: colors.text },
  chapterMeta: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});