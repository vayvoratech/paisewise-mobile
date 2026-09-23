export type Badge = {
  emoji: string;
  title: string;
  category: string;
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
  dayStreak: 0,
  xpTotal: 0,
  lessonsCompleted: 0,
  language: 'English',
  dailyReminders: true,
  kycVerified: true,
};

export const BADGES: Badge[] = [
  { emoji: '🔥', title: '7-Day Streak', category: 'CONSISTENCY' },
  { emoji: '🎓', title: 'First Lesson', category: 'LEARNER' },
  { emoji: '🎮', title: 'Paper Trader', category: 'PRACTITIONER' },
];
