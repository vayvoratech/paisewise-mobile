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
import { learnApi } from '../learnApi';

type Props = CompositeScreenProps<
  BottomTabScreenProps<MainTabsParamList, 'Learn'>,
  NativeStackScreenProps<RootStackParamList>
>;

const DEFAULT_LESSONS = [
  // Chapter 1: Financial Basics
  { id: 'mf-1', title: 'Introduction to Money & Savings', chapter: 'Financial Basics', chapterNo: 1, index: 1, total: 6, quizXp: 50 },
  { id: 'mf-2', title: 'What is the Stock Market?', chapter: 'Financial Basics', chapterNo: 1, index: 2, total: 6, quizXp: 50 },
  { id: 'mf-3', title: 'Understanding Inflation & Purchasing Power', chapter: 'Financial Basics', chapterNo: 1, index: 3, total: 6, quizXp: 50 },
  { id: 'mf-4', title: 'The Magic of Compound Interest', chapter: 'Financial Basics', chapterNo: 1, index: 4, total: 6, quizXp: 50 },
  { id: 'mf-5', title: 'Needs vs Wants: The 50/30/20 Rule', chapter: 'Financial Basics', chapterNo: 1, index: 5, total: 6, quizXp: 50 },
  { id: 'mf-6', title: 'Emergency Funds & Financial Safety', chapter: 'Financial Basics', chapterNo: 1, index: 6, total: 6, quizXp: 50 },

  // Chapter 2: Mutual Funds & NAV
  { id: 'mf-7', title: 'What is a Mutual Fund?', chapter: 'Mutual Funds & NAV', chapterNo: 2, index: 1, total: 6, quizXp: 50 },
  { id: 'mf-8', title: 'Understanding NAV (Net Asset Value)', chapter: 'Mutual Funds & NAV', chapterNo: 2, index: 2, total: 6, quizXp: 50 },
  { id: 'mf-9', title: 'Active vs Passive Mutual Funds', chapter: 'Mutual Funds & NAV', chapterNo: 2, index: 3, total: 6, quizXp: 50 },
  { id: 'mf-10', title: 'Index Funds & Nifty 50 Investing', chapter: 'Mutual Funds & NAV', chapterNo: 2, index: 4, total: 6, quizXp: 50 },
  { id: 'mf-11', title: 'Large Cap, Mid Cap & Small Cap Funds', chapter: 'Mutual Funds & NAV', chapterNo: 2, index: 5, total: 6, quizXp: 50 },
  { id: 'mf-12', title: 'Sectoral & Thematic Mutual Funds', chapter: 'Mutual Funds & NAV', chapterNo: 2, index: 6, total: 6, quizXp: 50 },

  // Chapter 3: Investing Strategies & SIPs
  { id: 'mf-13', title: 'SIP vs Lumpsum Investment', chapter: 'Investing Strategies & SIPs', chapterNo: 3, index: 1, total: 6, quizXp: 50 },
  { id: 'mf-14', title: 'Step-Up SIP: Scaling Your Wealth', chapter: 'Investing Strategies & SIPs', chapterNo: 3, index: 2, total: 6, quizXp: 50 },
  { id: 'mf-15', title: 'Rupee Cost Averaging Explained', chapter: 'Investing Strategies & SIPs', chapterNo: 3, index: 3, total: 6, quizXp: 50 },
  { id: 'mf-16', title: 'Goal-Based Investing', chapter: 'Investing Strategies & SIPs', chapterNo: 3, index: 4, total: 6, quizXp: 50 },
  { id: 'mf-17', title: 'Market Timing vs Time in Market', chapter: 'Investing Strategies & SIPs', chapterNo: 3, index: 5, total: 6, quizXp: 50 },
  { id: 'mf-18', title: 'Systematic Withdrawal Plans (SWP)', chapter: 'Investing Strategies & SIPs', chapterNo: 3, index: 6, total: 6, quizXp: 50 },

  // Chapter 4: Asset Allocation & Risk Management
  { id: 'mf-19', title: 'Equity vs Debt Funds', chapter: 'Asset Allocation & Risk Management', chapterNo: 4, index: 1, total: 6, quizXp: 50 },
  { id: 'mf-20', title: 'Risk & Return Trade-off', chapter: 'Asset Allocation & Risk Management', chapterNo: 4, index: 2, total: 6, quizXp: 50 },
  { id: 'mf-21', title: 'Expense Ratio & Exit Load', chapter: 'Asset Allocation & Risk Management', chapterNo: 4, index: 3, total: 6, quizXp: 50 },
  { id: 'mf-22', title: 'Understanding CAGR & XIRR', chapter: 'Asset Allocation & Risk Management', chapterNo: 4, index: 4, total: 6, quizXp: 50 },
  { id: 'mf-23', title: 'Managing Volatility & Market Crashes', chapter: 'Asset Allocation & Risk Management', chapterNo: 4, index: 5, total: 6, quizXp: 50 },
  { id: 'mf-24', title: 'Diversification: Don\'t Put All Eggs in One Basket', chapter: 'Asset Allocation & Risk Management', chapterNo: 4, index: 6, total: 6, quizXp: 50 },

  // Chapter 5: Taxation & Portfolio Construction
  { id: 'mf-25', title: 'Tax Implications of Equity & Debt Funds', chapter: 'Taxation & Portfolio Construction', chapterNo: 5, index: 1, total: 6, quizXp: 50 },
  { id: 'mf-26', title: 'ELSS: Saving Income Tax Under 80C', chapter: 'Taxation & Portfolio Construction', chapterNo: 5, index: 2, total: 6, quizXp: 50 },
  { id: 'mf-27', title: 'Short-Term vs Long-Term Capital Gains', chapter: 'Taxation & Portfolio Construction', chapterNo: 5, index: 3, total: 6, quizXp: 50 },
  { id: 'mf-28', title: 'Rebalancing Your Investment Portfolio', chapter: 'Taxation & Portfolio Construction', chapterNo: 5, index: 4, total: 6, quizXp: 50 },
  { id: 'mf-29', title: 'Common Behavioral Pitfalls of Investors', chapter: 'Taxation & Portfolio Construction', chapterNo: 5, index: 5, total: 6, quizXp: 50 },
  { id: 'mf-30', title: 'Building Your First Wealth Portfolio', chapter: 'Taxation & Portfolio Construction', chapterNo: 5, index: 6, total: 6, quizXp: 50 },
];

export default function LearnScreen({ navigation }: Props) {
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [dbLessons, setDbLessons] = useState<any[]>(DEFAULT_LESSONS);
  const [expandedChapters, setExpandedChapters] = useState<{ [key: number]: boolean }>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
  });

  const toggleChapterExpand = (chapterNo: number) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterNo]: !prev[chapterNo],
    }));
  };

  const fetchLearningData = useCallback(() => {
    // 1. Fetch lessons from PostgreSQL DB via learnApi
    learnApi.getLessons()
      .then(lessons => {
        if (Array.isArray(lessons) && lessons.length > 0) {
          setDbLessons(lessons);
        }
      })
      .catch(err => console.log('Lessons fetch note:', err.message));

    // 2. Fetch user lesson completion progress from PostgreSQL DB via learnApi
    learnApi.getUserProgress()
      .then(progress => {
        if (progress) {
          if (typeof progress.progressPercent === 'number') {
            setProgressPercent(progress.progressPercent);
          }
          if (Array.isArray(progress.completedLessonIds)) {
            setCompletedLessonIds(progress.completedLessonIds);
          }
        }
      })
      .catch(() => {});
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLearningData();
    }, [fetchLearningData])
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

  // Group lessons dynamically strictly by chapterNo to avoid duplicate chapter cards
  const chapterEmojis: { [key: number]: string } = {
    1: '💵',
    2: '📊',
    3: '📈',
    4: '⚖️',
    5: '🏛️'
  };

  const validLessons = dbLessons.filter(l => l.id && !l.id.startsWith('les_'));

  const chapterMap: { [key: number]: { no: number; title: string; emoji: string; lessons: any[] } } = {};
  validLessons.forEach((l) => {
    const chapNo = l.chapterNo || 1;
    const chapTitle = (l.chapter && !l.chapter.startsWith('Chapter ')) ? l.chapter : null;

    if (!chapterMap[chapNo]) {
      chapterMap[chapNo] = {
        no: chapNo,
        title: chapTitle || (chapNo === 1 ? 'Financial Basics' : chapNo === 2 ? 'Mutual Funds & NAV' : chapNo === 3 ? 'Investing Strategies & SIPs' : chapNo === 4 ? 'Asset Allocation & Risk Management' : 'Taxation & Portfolio Construction'),
        emoji: chapterEmojis[chapNo] || '📚',
        lessons: []
      };
    } else if (chapTitle && chapterMap[chapNo].title.startsWith('Chapter')) {
      chapterMap[chapNo].title = chapTitle;
    }
    chapterMap[chapNo].lessons.push(l);
  });

  const chapters = Object.values(chapterMap).sort((a, b) => a.no - b.no);

  // Flatten all lessons in order to calculate unlock statuses
  const allOrderedLessons: any[] = [];
  chapters.forEach(c => {
    c.lessons.sort((a, b) => (a.index || 0) - (b.index || 0));
    allOrderedLessons.push(...c.lessons);
  });

  const firstLessonId = allOrderedLessons.length > 0 ? allOrderedLessons[0].id : 'mf-1';
  const continueLesson = allOrderedLessons.find(l => !completedLessonIds.includes(l.id)) || allOrderedLessons[0];

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
            onPress={() => handleLessonPress(continueLesson?.id || firstLessonId, continueLesson?.title || 'Basics of Money', continueLesson?.chapterNo || 1, false)}
          >
            <View style={styles.continueRow}>
              <View style={styles.continueIcon}><Text style={{ fontSize: 24 }}>{chapterEmojis[continueLesson?.chapterNo || 1] || '💵'}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.continueChapter}>CHAPTER {continueLesson?.chapterNo || 1} · {(continueLesson?.chapter || 'MONEY BASICS').toUpperCase()}</Text>
                <Text style={styles.continueTitle}>{continueLesson?.title || 'Basics of Money & Wealth'}</Text>
              </View>
              <Pill label={completedLessonIds.includes(continueLesson?.id) ? "✓ COMPLETED" : "IN PROGRESS"} color={colors.purple} bg={colors.indigoChip} />
            </View>
            <View style={{ marginTop: spacing.md }}>
              <ProgressBar progress={progressPercent / 100} color={colors.amber} trackColor={colors.border} />
            </View>
          </Card>

          <Text style={[styles.sectionTitle, { marginTop: spacing.xl }]}>All Chapters & Lessons</Text>

          {chapters.map((chap) => {
            const completedInChap = chap.lessons.filter(l => completedLessonIds.includes(l.id)).length;
            const isExpanded = expandedChapters[chap.no] !== false;

            return (
              <View key={chap.no} style={styles.chapterGroup}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  style={styles.chapterHeaderRow} 
                  onPress={() => toggleChapterExpand(chap.no)}
                >
                  <Text style={{ fontSize: 22 }}>{chap.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.chapterTitle}>Chapter {chap.no}: {chap.title}</Text>
                    <Text style={styles.chapterMeta}>{completedInChap}/{chap.lessons.length} lessons complete</Text>
                  </View>
                  <Text style={styles.chevronIcon}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>
                <View style={{ marginTop: spacing.xs, marginBottom: spacing.md }}>
                  <ProgressBar progress={chap.lessons.length > 0 ? completedInChap / chap.lessons.length : 0} color={completedInChap === chap.lessons.length ? colors.green : colors.amber} trackColor={colors.border} />
                </View>

                {/* Sub-lessons collapsible accordion */}
                {isExpanded && (
                  <View style={styles.lessonList}>
                    {chap.lessons.map((les, lIdx) => {
                      const globalIdx = allOrderedLessons.findIndex(x => x.id === les.id);
                      const isDone = completedLessonIds.includes(les.id);
                      // Unlocked if first lesson, or completed, or previous lesson in global order is completed
                      const isUnlocked = globalIdx === 0 || isDone || (globalIdx > 0 && completedLessonIds.includes(allOrderedLessons[globalIdx - 1]?.id));
                      const isLocked = !isUnlocked;

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
                )}
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
  chevronIcon: { fontSize: 14, color: colors.textMuted, paddingHorizontal: spacing.xs },
  lessonList: { gap: spacing.sm, marginTop: spacing.sm },
  lessonItemCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  lessonItemLocked: { opacity: 0.6, backgroundColor: colors.surfaceMuted },
  lessonItemLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, flex: 1 },
  lessonItemNum: { ...typography.mono, color: colors.textMuted, fontSize: 13 },
  lessonItemTitle: { ...typography.bodyBold, color: colors.text, fontSize: 15, flex: 1 },
  textMuted: { color: colors.textMuted },
});