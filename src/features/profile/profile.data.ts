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
  name: 'Rahul Sharma',
  handle: '@rahul_invests',
  city: 'Jaipur',
  level: 3,
  dayStreak: 7,
  xpTotal: 1240,
  lessonsCompleted: 12,
  language: 'Hindi',
  dailyReminders: true,
  kycVerified: true,
};

export const BADGES: Badge[] = [
  { emoji: '🔥', title: '7-Day Streak', category: 'CONSISTENCY' },
  { emoji: '🎓', title: 'First Lesson', category: 'LEARNER' },
  { emoji: '🎮', title: 'Paper Trader', category: 'PRACTITIONER' },
];
