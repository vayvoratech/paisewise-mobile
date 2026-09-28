export type BadgeCategory = 'ALL' | 'CONSISTENCY' | 'LEARNER' | 'PRACTITIONER' | 'MILESTONES';

export type Badge = {
  id: string;
  emoji: string;
  title: string;
  category: BadgeCategory;
  description: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  xpBonus: number;
  unlockedAt?: string;
};

export type UserProfile = {
  name: string;
  handle: string;
  city: string;
  level: number;
  dayStreak: number;
  xpTotal: number;
  lessonsCompleted: number;
  language: string;
  dailyReminders: boolean;
  kycVerified: boolean;
};

export const PROFILE: UserProfile = {
  name: 'Learner',
  handle: '@learner',
  city: 'India',
  level: 1,
  dayStreak: 3,
  xpTotal: 250,
  lessonsCompleted: 5,
  language: 'English',
  dailyReminders: true,
  kycVerified: true,
};

export const BADGES: Badge[] = [
  {
    id: 'b1',
    emoji: '🔥',
    title: '7-Day Streak',
    category: 'CONSISTENCY',
    description: 'Maintain a 7-day continuous daily learning streak.',
    isUnlocked: false,
    progress: 3,
    maxProgress: 7,
    xpBonus: 100,
  },
  {
    id: 'b2',
    emoji: '🎓',
    title: 'First Lesson',
    category: 'LEARNER',
    description: 'Successfully complete your very first financial lesson.',
    isUnlocked: true,
    progress: 1,
    maxProgress: 1,
    xpBonus: 50,
    unlockedAt: '2026-09-10',
  },
  {
    id: 'b3',
    emoji: '🎮',
    title: 'Paper Trader',
    category: 'PRACTITIONER',
    description: 'Execute your first virtual paper trade order.',
    isUnlocked: true,
    progress: 1,
    maxProgress: 1,
    xpBonus: 75,
    unlockedAt: '2026-09-11',
  },
  {
    id: 'b4',
    emoji: '⚡',
    title: 'Quiz Master',
    category: 'LEARNER',
    description: 'Pass 3 interactive quizzes with a score of 100%.',
    isUnlocked: false,
    progress: 1,
    maxProgress: 3,
    xpBonus: 150,
  },
  {
    id: 'b5',
    emoji: '🏆',
    title: 'Level 5 Achiever',
    category: 'MILESTONES',
    description: 'Reach Learner Level 5 by accumulating 1000 total XP.',
    isUnlocked: false,
    progress: 250,
    maxProgress: 1000,
    xpBonus: 300,
  },
  {
    id: 'b6',
    emoji: '💎',
    title: 'Market Analyst',
    category: 'PRACTITIONER',
    description: 'Add 5 stocks to your personal watchlists and track quotes.',
    isUnlocked: true,
    progress: 5,
    maxProgress: 5,
    xpBonus: 100,
    unlockedAt: '2026-09-12',
  },
];
