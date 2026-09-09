import React, { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CompositeScreenProps, useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Card } from '../../../shared/ui/Card';
import { Pill } from '../../../shared/ui/Pill';
import { ProgressBar } from '../../../shared/ui/ProgressBar';
import { colors, radius, spacing, typography } from '../../../core/theme/theme';
import { MainTabsParamList, RootStackParamList } from '../../../app/navigation/types';
import { Analytics } from '../../../core/analyticsService';
import { apiClient } from '../../../core/api/apiClient';
import { API_ENDPOINTS } from '../../../core/api/apiEndpoints';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Learn'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CHAPTER_LESSONS = [
  { no: 1, title: 'Money Basics', emoji: '💵', lessons: [
    { id: 'mf-1', title: 'Basics of Money & Wealth', order: 1 },
    { id: 'mf-2', title: 'Understanding Inflation & Savings', order: 2 },
    { id: 'mf-3', title: 'Introduction to Financial Planning', order: 3 },
    { id: 'mf-4', title: 'Setting Smart Financial Goals', order: 4 },
    { id: 'mf-5', title: 'Emergency Funds 101', order: 5 }
  ]},
  { no: 2, title: 'Stocks 101', emoji: '📈', lessons: [
    { id: 'st-1', title: 'What is a Stock?', order: 1 },
    { id: 'st-2', title: 'How Stock Exchanges Work', order: 2 },
    { id: 'st-3', title: 'Understanding Bull vs Bear Markets', order: 3 },
    { id: 'st-4', title: 'Dividends & Stock Returns', order: 4 },
    { id: 'st-5', title: 'Analyzing Company Basics', order: 5 }
  ]},
  { no: 3, title: 'Mutual Funds', emoji: '📊', lessons: [
    { id: 'mf-3', title: 'What exactly is a Mutual Fund?', order: 1 },
    { id: 'mf-6', title: 'SIP vs Lumpsum Investments', order: 2 },
    { id: 'mf-7', title: 'Equity vs Debt Funds', order: 3 },
    { id: 'mf-8', title: 'Expense Ratio Explained', order: 4 },
    { id: 'mf-9', title: 'Choosing the Right Mutual Fund', order: 5 }
  ]},
  { no: 4, title: 'Risk & Returns', emoji: '⚖️', lessons: [
    { id: 'rk-1', title: 'Understanding Risk Profiles', order: 1 },
    { id: 'rk-2', title: 'Diversification Strategy', order: 2 },
    { id: 'rk-3', title: 'Asset Allocation Principles', order: 3 },
    { id: 'rk-4', title: 'Managing Market Volatility', order: 4 },
    { id: 'rk-5', title: 'Long-term Wealth Creation', order: 5 }
  ]}
];

export default function LearnScreen({ navigation }: Props) {
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);

  const fetchUserProgress = useCallback(() => {
    apiClient.get(`${API_ENDPOINTS.AUTH.REGISTER.replace('/auth/register', '')}/learn/progress`)
      .then(res => {
        if (res.data && typeof res.data.progressPercent === 'number') {
          setProgressPercent(res.data.progressPercent);
        }
      })
      .catch(err => console.log('Progress fetch note:', err.message));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserProgress();
    }, [fetchUserProgress])
  );

  const handleLessonPress = (lessonId: string, lessonTitle: string, chapterNo: number, isLocked: boolean) => {
    if (isLocked) {
      Alert.alert(
        "🔒 Lesson Locked",
        "Please complete the previous lesson first to unlock this topic!"
      );
      return;
    }

    Analytics.lessonTapped({
      sessionId: 'sess_abc123',
      lessonId: lessonId,
      lessonTitle: lessonTitle,
      lessonOrder: chapterNo,
      lessonStatus: 'available',
      sourcePosition: 1,
    });

    navigation.navigate('Lesson', { lessonId });
  };

  const totalLessonsCount = 20;
  const completedCount = Math.floor((progressPercent / 100) * totalLessonsCount);

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
            onPress={() => handleLessonPress('mf-1', 'Basics of Money & Wealth', 1, false)}
          >
            <View style={styles.continueRow}>
              <View style={styles.continueIcon}><Text style={{ fontSize: 24 }}>💵</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.continueChapter}>CHAPTER 1 · MONEY BASICS</Text>
                <Text style={styles.continueTitle}>Basics of Money & Wealth</Text>
              </View>
              <Pill label="NEW" color={colors.purple} bg={colors.indigoChip} />
            </View>
            <View style={{ marginTop: spacing.md }}>
              <ProgressBar progress={progressPercent / 100} color={colors.amber} trackColor={colors.border} />
            </View>
          </Card>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>All Chapters & Lessons</Text>

          {CHAPTER_LESSONS.map((chap, cIdx) => {
            const chapterStart = cIdx * 5;
            const doneInChapter = Math.max(0, Math.min(5, completedCount - chapterStart));

            return (
              <View key={chap.no} style={styles.chapterGroup}>
                <View style={styles.chapterHeaderRow}>
                  <Text style={{ fontSize: 22 }}>{chap.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chapterTitle}>Chapter {chap.no}: {chap.title}</Text>
                    <Text style={styles.chapterMeta}>{doneInChapter}/5 lessons complete</Text>
                  </View>
                </View>
                <View style={{ marginTop: spacing.xs, marginBottom: spacing.md }}>
                  <ProgressBar progress={doneInChapter / 5} color={doneInChapter === 5 ? colors.green : colors.amber} trackColor={colors.border} />
                </View>

                {/* Sub-lessons */}
                <View style={styles.lessonList}>
                  {chap.lessons.map((les, lIdx) => {
                    const globalLessonIndex = chapterStart + lIdx;
                    // First lesson is always unlocked; subsequent lessons require previous lesson completed
                    const isLocked = globalLessonIndex > completedCount;
                    const isDone = globalLessonIndex < completedCount;

                    return (
                      <TouchableOpacity
                        key={les.id}
                        activeOpacity={0.8}
                        style={[styles.lessonItemCard, isLocked && styles.lessonItemLocked]}
                        onPress={() => handleLessonPress(les.id, les.title, chap.no, isLocked)}
                      >
                        <View style={styles.lessonItemLeft}>
                          <Text style={styles.lessonItemNum}>{chap.no}.{lIdx + 1}</Text>
                          <Text style={[styles.lessonItemTitle, isLocked && styles.textMuted]}>{les.title}</Text>
                        </View>
                        <Pill 
                          label={isDone ? "✓ Done" : isLocked ? "🔒 Locked" : "Start →"} 
                          color={isDone ? colors.green : isLocked ? colors.textMuted : colors.purple} 
                          bg={isDone ? "rgba(34,197,94,0.1)" : isLocked ? colors.surfaceMuted : colors.indigoChip} 
                        />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: spacing.xxl },
  sheet: { padding: spacing.xl },
  sectionTitle: { ...typography.h2, color: colors.text, marginBottom: spacing.md },
  continueCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  continueRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  continueIcon: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.indigoChip, alignItems: 'center', justifyContent: 'center' },
  continueChapter: { ...typography.overline, color: colors.purple },
  continueTitle: { ...typography.bodyBold, color: colors.text, marginTop: 2, fontSize: 16 },
  chapterGroup: { marginTop: spacing.lg, backgroundColor: colors.surfaceMuted, padding: spacing.lg, borderRadius: radius.lg },
  chapterHeaderRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  chapterTitle: { ...typography.h3, color: colors.text },
  chapterMeta: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  lessonList: { gap: spacing.sm, marginTop: spacing.sm },
  lessonItemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  lessonItemLocked: { opacity: 0.6, backgroundColor: colors.surfaceMuted },
  lessonItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  lessonItemNum: { ...typography.mono, color: colors.textMuted, fontSize: 13 },
  lessonItemTitle: { ...typography.bodyBold, color: colors.text, fontSize: 15, flex: 1 },
  textMuted: { color: colors.textMuted },
});