import type { LessonTopic } from "@/store/quizStore";

export interface RawQuestion {
  question: string;
  answer: string;
  wrongs: string[];
  hint: string;
  difficulty: number;
}

export const QUESTIONS_PER_LEVEL = 10;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function maxDifficultyForTopic(
  topic: LessonTopic,
  banks: Record<LessonTopic, RawQuestion[]>
): number {
  return Math.max(...banks[topic].map((q) => q.difficulty));
}

/** Higher levels draw from harder bands; levels past the cap widen the pool. */
export function getDifficultyRange(
  level: number,
  topic: LessonTopic,
  banks: Record<LessonTopic, RawQuestion[]>
): { min: number; max: number } {
  const maxDiff = maxDifficultyForTopic(topic, banks);
  const target = Math.min(level, maxDiff);

  if (level <= maxDiff) {
    return { min: 1, max: target };
  }

  const widen = Math.min(level - maxDiff, maxDiff - 1);
  return { min: Math.max(1, maxDiff - 1 - widen), max: maxDiff };
}

export function levelToDifficulty(
  level: number,
  topic: LessonTopic,
  banks: Record<LessonTopic, RawQuestion[]>
): number {
  return getDifficultyRange(level, topic, banks).max;
}

/** Pick up to `count` unique questions, hardest bands first. */
export function pickUniqueRawQuestions(
  level: number,
  topic: LessonTopic,
  banks: Record<LessonTopic, RawQuestion[]>,
  count: number = QUESTIONS_PER_LEVEL,
  excludeQuestionIds: string[] = []
): RawQuestion[] {
  const { min, max } = getDifficultyRange(level, topic, banks);
  const exclude = new Set(excludeQuestionIds);
  const used = new Set<string>();
  const selected: RawQuestion[] = [];
  const all = banks[topic];

  for (let d = max; d >= min && selected.length < count; d--) {
    const band = shuffle(
      all.filter(
        (q) =>
          q.difficulty === d &&
          !used.has(q.question) &&
          !exclude.has(q.question)
      )
    );
    for (const q of band) {
      if (selected.length >= count) break;
      selected.push(q);
      used.add(q.question);
    }
  }

  if (selected.length < count) {
    const fallback = shuffle(
      all.filter((q) => !used.has(q.question) && !exclude.has(q.question))
    );
    for (const q of fallback) {
      if (selected.length >= count) break;
      selected.push(q);
      used.add(q.question);
    }
  }

  return shuffle(selected);
}
