import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  MAX_HEARTS,
  reconcileHeartRegen,
  scheduleHeartLoss,
} from "@/lib/hearts";

export type LessonTopic = "algebra" | "fraction";

export interface TopicCheckpoint {
  level: number;
  queueIndex: number;
  questionIds: string[];
  hintsUsed: number;
}

interface QuizState {
  xp: number;
  streak: number;
  hearts: number;
  heartRegenAt: number[];
  lessonProgress: number;
  currentLevel: number;
  topicProgress: {
    algebra: number;
    fraction: number;
  };
  topicLevel: {
    algebra: number;
    fraction: number;
  };
  topicCheckpoint: {
    algebra: TopicCheckpoint | null;
    fraction: TopicCheckpoint | null;
  };
  questionsAnswered: number;
  lastStreakDate: string | null;
  addXP: (amount: number) => void;
  setXP: (amount: number) => void;
  loseHeart: () => void;
  reconcileHearts: () => void;
  resetHearts: () => void;
  setLessonProgress: (progress: number) => void;
  setCurrentLevel: (level: number) => void;
  setTopicProgress: (topic: LessonTopic, progress: number) => void;
  setTopicLevel: (topic: LessonTopic, level: number) => void;
  setTopicCheckpoint: (topic: LessonTopic, checkpoint: TopicCheckpoint) => void;
  clearTopicCheckpoint: (topic: LessonTopic) => void;
  incrementQuestionsAnswered: () => void;
  resetProgress: () => void;
  increaseStreak: () => void;
  resetStreak: () => void;
}

const getToday = () =>
  new Date().toISOString().split("T")[0];

const getYesterday = () =>
  new Date(Date.now() - 86400000).toISOString().split("T")[0];

const emptyCheckpoints = (): QuizState["topicCheckpoint"] => ({
  algebra: null,
  fraction: null,
});

export const useQuizStore = create<QuizState>()(
  persist(
    (set) => ({
      xp: 0,
      streak: 0,
      hearts: MAX_HEARTS,
      heartRegenAt: [],
      lessonProgress: 0,
      currentLevel: 1,
      topicProgress: {
        algebra: 0,
        fraction: 0,
      },
      topicLevel: {
        algebra: 1,
        fraction: 1,
      },
      topicCheckpoint: emptyCheckpoints(),
      questionsAnswered: 0,
      lastStreakDate: null,

      addXP: (amount) =>
        set((s) => ({ xp: s.xp + amount })),

      setXP: (amount) =>
        set({ xp: Math.max(0, amount) }),

      loseHeart: () =>
        set((s) => reconcileHeartRegen(scheduleHeartLoss(s.heartRegenAt))),

      reconcileHearts: () =>
        set((s) => {
          const next = reconcileHeartRegen(s.heartRegenAt);
          const regenUnchanged =
            next.heartRegenAt.length === s.heartRegenAt.length &&
            next.heartRegenAt.every((t, i) => t === s.heartRegenAt[i]);
          if (next.hearts === s.hearts && regenUnchanged) {
            return {};
          }
          return next;
        }),

      resetHearts: () =>
        set({ hearts: MAX_HEARTS, heartRegenAt: [] }),

      setLessonProgress: (progress) =>
        set((s) => ({
          lessonProgress: Math.min(100, Math.max(0, progress)),
          topicProgress: {
            ...s.topicProgress,
            algebra: Math.min(100, Math.max(0, progress)),
          },
        })),

      setCurrentLevel: (level) =>
        set((s) => ({
          currentLevel: level,
          topicLevel: {
            ...s.topicLevel,
            algebra: Math.max(1, level),
          },
        })),

      setTopicProgress: (topic, progress) =>
        set((s) => {
          const safeProgress = Math.min(100, Math.max(0, progress));
          const nextTopicProgress = {
            ...s.topicProgress,
            [topic]: safeProgress,
          };
          return {
            topicProgress: nextTopicProgress,
            ...(topic === "algebra" ? { lessonProgress: safeProgress } : {}),
          };
        }),

      setTopicLevel: (topic, level) =>
        set((s) => {
          const safeLevel = Math.max(1, level);
          const nextTopicLevel = {
            ...s.topicLevel,
            [topic]: safeLevel,
          };
          return {
            topicLevel: nextTopicLevel,
            ...(topic === "algebra" ? { currentLevel: safeLevel } : {}),
          };
        }),

      setTopicCheckpoint: (topic, checkpoint) =>
        set((s) => ({
          topicCheckpoint: {
            ...s.topicCheckpoint,
            [topic]: checkpoint,
          },
        })),

      clearTopicCheckpoint: (topic) =>
        set((s) => ({
          topicCheckpoint: {
            ...s.topicCheckpoint,
            [topic]: null,
          },
        })),

      incrementQuestionsAnswered: () =>
        set((s) => ({ questionsAnswered: s.questionsAnswered + 1 })),

      increaseStreak: () =>
        set((s) => {
          const today = getToday();
          const yesterday = getYesterday();

          if (s.lastStreakDate === today) {
            return {};
          }

          const streak =
            s.lastStreakDate === yesterday
              ? s.streak + 1
              : 1;

          return {
            streak,
            lastStreakDate: today,
          };
        }),

      resetStreak: () =>
        set({ streak: 0, lastStreakDate: null }),

      resetProgress: () =>
        set({
          xp: 0,
          hearts: MAX_HEARTS,
          heartRegenAt: [],
          lessonProgress: 0,
          currentLevel: 1,
          topicProgress: { algebra: 0, fraction: 0 },
          topicLevel: { algebra: 1, fraction: 1 },
          topicCheckpoint: emptyCheckpoints(),
          questionsAnswered: 0,
          streak: 0,
          lastStreakDate: null,
        }),
    }),
    {
      name: "algefox-quiz-store",
      version: 3,
      migrate: (persistedState, version) => {
        if (!persistedState) return persistedState;

        const state = persistedState as Partial<QuizState>;
        const legacyLessonProgress = state.lessonProgress ?? 0;
        const legacyCurrentLevel = state.currentLevel ?? 1;

        let next = { ...state } as Partial<QuizState>;

        if (version < 2) {
          next = {
            ...next,
            streak: 0,
            lastStreakDate: null,
            topicProgress: {
              algebra: next.topicProgress?.algebra ?? legacyLessonProgress,
              fraction: next.topicProgress?.fraction ?? 0,
            },
            topicLevel: {
              algebra: next.topicLevel?.algebra ?? legacyCurrentLevel,
              fraction: next.topicLevel?.fraction ?? 1,
            },
          };
        }

        if (version < 3) {
          next = {
            ...next,
            heartRegenAt: next.heartRegenAt ?? [],
            topicCheckpoint: next.topicCheckpoint ?? emptyCheckpoints(),
          };
        }

        return {
          ...next,
          ...reconcileHeartRegen(next.heartRegenAt ?? []),
        };
      },
    }
  )
);
