import { apiClient } from '../../core/api/apiClient';

export interface Lesson {
  id: string;
  title: string;
  chapterNo: number;
  chapter?: string;
  estimatedMinutes: number;
  xpReward: number;
  contentBlocksJson?: string;
  index?: number;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  questionPrompt: string;
  optionsJson: string;
  explanation: string;
  correctOptionId?: string;
}

export interface JargonTerm {
  term: string;
  definition: string;
  analogy: string;
  example: string;
}

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  lastActiveAt?: string;
}

export interface UserProgressData {
  progressPercent: number;
  completedLessonIds: string[];
}

const localCompletedIds = new Set<string>();

export const learnApi = {
  // GET /learn/lessons - Fetch all database lessons
  getLessons: async (): Promise<Lesson[]> => {
    const response = await apiClient.get('/learn/lessons');
    return response.data;
  },

  // GET /learn/lessons/:id - Fetch single lesson detail
  getLesson: async (lessonId: string): Promise<Lesson> => {
    const response = await apiClient.get(`/learn/lessons/${lessonId}`);
    return response.data;
  },

  // POST /learn/lessons/:id/complete - Complete lesson & award XP/streak
  completeLesson: async (lessonId: string): Promise<any> => {
    localCompletedIds.add(lessonId);
    try {
      const response = await apiClient.post(`/learn/lessons/${lessonId}/complete`);
      return response.data;
    } catch (e) {
      return { success: true, lessonId };
    }
  },

  // GET /learn/quizzes/:lessonId - Fetch secure sanitized quiz
  getQuiz: async (lessonId: string): Promise<QuizQuestion[]> => {
    const response = await apiClient.get(`/learn/quizzes/${lessonId}`);
    return response.data;
  },

  // POST /learn/quizzes/:lessonId/submit - Submit quiz answers
  submitQuiz: async (lessonId: string, answers: string[], timeSpentSeconds: number): Promise<any> => {
    const response = await apiClient.post(`/learn/quizzes/${lessonId}/submit`, {
      answers,
      timeSpentSeconds
    });
    return response.data;
  },

  // GET /learn/jargon/:term - Fetch jargon definition from DB
  getJargon: async (term: string, language: string = 'en'): Promise<JargonTerm> => {
    const encodedTerm = encodeURIComponent(term);
    const response = await apiClient.get(`/learn/jargon/${encodedTerm}?language=${language}`);
    return response.data;
  },

  // POST /learn/jargon/ai - Fetch dynamic AI jargon explanation
  getAiJargon: async (term: string, language: string = 'en'): Promise<{ term: string; language: string; explanation: string }> => {
    const response = await apiClient.post('/learn/jargon/ai', { term, language });
    return response.data;
  },

  // GET /learn/streak - Fetch active user streak
  getStreak: async (): Promise<StreakData> => {
    const response = await apiClient.get('/learn/streak');
    return response.data;
  },

  // Synchronous helper for instant optimistic UI updates
  getLocalCompletedLessonIds: (): string[] => {
    return Array.from(localCompletedIds);
  },

  // GET /learn/user-progress - Fetch user lesson completion progress
  getUserProgress: async (): Promise<UserProgressData> => {
    try {
      const response = await apiClient.get('/learn/user-progress');
      const data = response.data || {};
      const serverIds = Array.isArray(data.completedLessonIds) ? data.completedLessonIds : [];
      const mergedIds = Array.from(new Set([...serverIds, ...Array.from(localCompletedIds)]));
      return {
        progressPercent: typeof data.progressPercent === 'number' ? data.progressPercent : 0,
        completedLessonIds: mergedIds
      };
    } catch (e) {
      return {
        progressPercent: 0,
        completedLessonIds: Array.from(localCompletedIds)
      };
    }
  }
};
