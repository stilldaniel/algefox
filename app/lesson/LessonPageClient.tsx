"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { createPortal } from "react-dom";
import { Heart, X, Lightbulb, Trophy, Star, HeartCrack } from "lucide-react";
import {
  formatHeartCountdown,
  getMsUntilNextHeart,
  MAX_HEARTS,
} from "@/lib/hearts";
import {
  levelToDifficulty,
  pickUniqueRawQuestions,
  QUESTIONS_PER_LEVEL,
} from "@/lib/lessonQuestions";
import {
  useQuizStore,
  type LessonTopic,
  type TopicCheckpoint,
} from "@/store/quizStore";

interface Question {
  question: string;
  choices: string[];
  correctIndex: number;
  hint: string;
  level: number;
}

import type { RawQuestion } from "@/lib/lessonQuestions";

// ─── 50 algebra-only questions, 10 per difficulty band ────────────────────────
const RAW_QUESTIONS: RawQuestion[] = [

  // ── DIFFICULTY 1: Collecting like terms (addition) ──────────────────────────
  { difficulty:1, question:"Simplify: 2x + 3x",       answer:"5x",    wrongs:["6x","5x²","2x³"],        hint:"Add the numbers in front of x: 2 + 3 = 5." },
  { difficulty:1, question:"Simplify: 4a + 3a",        answer:"7a",    wrongs:["12a","7a²","a⁷"],        hint:"4 + 3 = 7. The letter stays the same." },
  { difficulty:1, question:"Simplify: 5b + b",         answer:"6b",    wrongs:["5b²","b⁶","5b"],         hint:"b on its own = 1b. So 5 + 1 = 6." },
  { difficulty:1, question:"Simplify: 3m + 4m + 2m",  answer:"9m",    wrongs:["24m","9m³","7m"],         hint:"3 + 4 + 2 = 9. Keep the m." },
  { difficulty:1, question:"Simplify: 6y + 2y",        answer:"8y",    wrongs:["12y","8y²","4y"],         hint:"6 + 2 = 8. The letter y stays." },
  { difficulty:1, question:"Simplify: x + 4x",         answer:"5x",    wrongs:["4x²","x⁴","4x"],         hint:"x alone = 1x. So 1 + 4 = 5." },
  { difficulty:1, question:"Simplify: 7n + 3n",        answer:"10n",   wrongs:["21n","10n²","4n"],        hint:"7 + 3 = 10. Keep the n." },
  { difficulty:1, question:"Simplify: 2p + 2p + 2p",  answer:"6p",    wrongs:["8p","6p³","2p³"],         hint:"Three lots of 2p: 2 + 2 + 2 = 6." },
  { difficulty:1, question:"Simplify: 9t + t",         answer:"10t",   wrongs:["9t²","t⁹","8t"],         hint:"t alone = 1t. So 9 + 1 = 10." },
  { difficulty:1, question:"Simplify: 5k + 3k + k",   answer:"9k",    wrongs:["15k","9k³","8k"],         hint:"5 + 3 + 1 = 9. Keep the k." },

  // ── DIFFICULTY 2: Collecting like terms (subtraction) ───────────────────────
  { difficulty:2, question:"Simplify: 8x − 3x",       answer:"5x",    wrongs:["11x","5x²","24x"],       hint:"8 − 3 = 5. Keep the x." },
  { difficulty:2, question:"Simplify: 9a − 4a",        answer:"5a",    wrongs:["13a","5a²","36a"],       hint:"9 − 4 = 5. Keep the a." },
  { difficulty:2, question:"Simplify: 7b − b",         answer:"6b",    wrongs:["8b","7b²","6b²"],        hint:"b alone = 1b. So 7 − 1 = 6." },
  { difficulty:2, question:"Simplify: 10m − 4m",       answer:"6m",    wrongs:["14m","40m","6m²"],       hint:"10 − 4 = 6. Keep the m." },
  { difficulty:2, question:"Simplify: 12y − 7y",       answer:"5y",    wrongs:["19y","5y²","84y"],       hint:"12 − 7 = 5. Keep the y." },
  { difficulty:2, question:"Simplify: 6n − 2n − n",   answer:"3n",    wrongs:["9n","4n","3n³"],          hint:"6 − 2 = 4, then 4 − 1 = 3." },
  { difficulty:2, question:"Simplify: 15t − 8t",       answer:"7t",    wrongs:["23t","120t","8t"],        hint:"15 − 8 = 7. Keep the t." },
  { difficulty:2, question:"Simplify: 11p − 5p",       answer:"6p",    wrongs:["16p","55p","5p"],        hint:"11 − 5 = 6. Keep the p." },
  { difficulty:2, question:"Simplify: 20k − 13k",      answer:"7k",    wrongs:["33k","260k","6k"],       hint:"20 − 13 = 7. Keep the k." },
  { difficulty:2, question:"Simplify: 8c − 3c − 2c",  answer:"3c",    wrongs:["13c","48c","3c³"],        hint:"8 − 3 = 5, then 5 − 2 = 3." },

  // ── DIFFICULTY 3: Mixed operations + two different letter terms ─────────────
  { difficulty:3, question:"Simplify: 4x + 3x − 2x",   answer:"5x",    wrongs:["9x","24x²","3x"],       hint:"4 + 3 = 7, then 7 − 2 = 5." },
  { difficulty:3, question:"Simplify: 3a + 2b + 4a",   answer:"7a + 2b",wrongs:["9ab","3a + 6b","6a + 2b"],hint:"Only add the a's together: 3 + 4 = 7. The 2b stays." },
  { difficulty:3, question:"Simplify: 5x + 2y − 3x",   answer:"2x + 2y",wrongs:["4xy","5y","2x − 2y"],  hint:"Collect x's: 5 − 3 = 2. The 2y stays unchanged." },
  { difficulty:3, question:"Simplify: 6m − 2m + 3n",   answer:"4m + 3n",wrongs:["4mn","7mn","7m + 3n"], hint:"6 − 2 = 4 for the m's. The 3n stays." },
  { difficulty:3, question:"Simplify: 2x + 3x − x",    answer:"4x",    wrongs:["6x","5x","2x²"],        hint:"2 + 3 = 5, then 5 − 1 = 4." },
  { difficulty:3, question:"Simplify: 7p + 2q − 3p",   answer:"4p + 2q",wrongs:["6pq","9p + 2q","4p − 2q"],hint:"7 − 3 = 4 for the p's. The 2q stays." },
  { difficulty:3, question:"Simplify: 5a − 2a + 3b",   answer:"3a + 3b",wrongs:["6ab","8a − 2b","3a − 3b"],hint:"5 − 2 = 3 for the a's. The 3b stays." },
  { difficulty:3, question:"Simplify: 4x + 4x − 4x",   answer:"4x",    wrongs:["12x","0x","8x"],        hint:"4 + 4 = 8, then 8 − 4 = 4." },
  { difficulty:3, question:"Simplify: 8y − 3y + 2z",   answer:"5y + 2z",wrongs:["7yz","5y − 2z","7y + 2z"],hint:"8 − 3 = 5 for the y's. The 2z stays." },
  { difficulty:3, question:"Simplify: 9t + t − 5t",    answer:"5t",    wrongs:["15t","4t","5t²"],        hint:"9 + 1 = 10, then 10 − 5 = 5." },

  // ── DIFFICULTY 4: Three or more unlike terms, harder simplification ──────────
  { difficulty:4, question:"Simplify: 4x + 3y + 2x + y",    answer:"6x + 4y",  wrongs:["7x + 3y","6x + 3y","5x + 4y"],   hint:"Collect x's: 4 + 2 = 6. Collect y's: 3 + 1 = 4." },
  { difficulty:4, question:"Simplify: 5a + 2b − 3a + b",     answer:"2a + 3b",  wrongs:["2a + b","3a + 3b","2a − 3b"],    hint:"5a − 3a = 2a. 2b + 1b = 3b." },
  { difficulty:4, question:"Simplify: 3x + 2y − x − y",      answer:"2x + y",   wrongs:["2x − y","3x + y","x + 2y"],      hint:"3x − x = 2x. 2y − y = y." },
  { difficulty:4, question:"Simplify: 6m + 4n − 2m − 3n",    answer:"4m + n",   wrongs:["4m + 7n","4m − n","8m + n"],     hint:"6m − 2m = 4m. 4n − 3n = n." },
  { difficulty:4, question:"Simplify: 2p + 3q + p − 2q",     answer:"3p + q",   wrongs:["3p + 5q","p + q","3p − q"],      hint:"2p + p = 3p. 3q − 2q = q." },
  { difficulty:4, question:"Simplify: 7x − 3y + x + 2y",     answer:"8x − y",   wrongs:["8x + y","6x − y","8x − 2y"],    hint:"7x + x = 8x. −3y + 2y = −y." },
  { difficulty:4, question:"Simplify: 5a − 2b − a + 4b",     answer:"4a + 2b",  wrongs:["4a − 2b","6a + 2b","4a + 4b"],  hint:"5a − a = 4a. −2b + 4b = 2b." },
  { difficulty:4, question:"Simplify: 3x + 5x − 2y + y",     answer:"8x − y",   wrongs:["8x + y","6x − y","8x − 2y"],    hint:"3x + 5x = 8x. −2y + y = −y." },
  { difficulty:4, question:"Simplify: 9c + 2d − 4c − d",     answer:"5c + d",   wrongs:["5c − d","5c + 2d","4c + d"],    hint:"9c − 4c = 5c. 2d − d = d." },
  { difficulty:4, question:"Simplify: 2x + 3y + 4z − x − y", answer:"x + 2y + 4z",wrongs:["x + 3y + 4z","2x + 2y + 4z","x + 2y − 4z"],hint:"2x − x = x. 3y − y = 2y. 4z stays." },

  // ── DIFFICULTY 5: Substitution into expressions ───────────────────────────
  { difficulty:5, question:"If x = 2, find: 3x + 1",         answer:"7",  wrongs:["5","9","8"],     hint:"Replace x with 2: 3×2 + 1 = 6 + 1 = 7." },
  { difficulty:5, question:"If a = 3, find: 4a − 2",         answer:"10", wrongs:["9","12","14"],   hint:"Replace a with 3: 4×3 − 2 = 12 − 2 = 10." },
  { difficulty:5, question:"If x = 5, find: 2x + 3",         answer:"13", wrongs:["10","15","11"],  hint:"Replace x with 5: 2×5 + 3 = 10 + 3 = 13." },
  { difficulty:5, question:"If y = 4, find: 3y − 5",         answer:"7",  wrongs:["12","9","5"],    hint:"Replace y with 4: 3×4 − 5 = 12 − 5 = 7." },
  { difficulty:5, question:"If m = 6, find: m + 2m",         answer:"18", wrongs:["12","9","24"],   hint:"m + 2m = 3m. Then 3×6 = 18." },
  { difficulty:5, question:"If x = 3, y = 2, find: x + y",  answer:"5",  wrongs:["6","1","7"],     hint:"Simply add: 3 + 2 = 5." },
  { difficulty:5, question:"If a = 4, find: a² (a squared)", answer:"16", wrongs:["8","12","4"],    hint:"a² means a×a. So 4×4 = 16." },
  { difficulty:5, question:"If x = 2, find: 5x − x",        answer:"8",  wrongs:["10","4","6"],    hint:"Simplify first: 5x − x = 4x. Then 4×2 = 8." },
  { difficulty:5, question:"If p = 3, q = 1, find: 2p + 3q",answer:"9",  wrongs:["7","10","12"],   hint:"2×3 = 6 and 3×1 = 3. So 6 + 3 = 9." },
  { difficulty:5, question:"If x = 10, find: x/2 + 3",      answer:"8",  wrongs:["13","5","10"],   hint:"x/2 = 10/2 = 5. Then 5 + 3 = 8." },
];

const FRACTION_RAW_QUESTIONS: RawQuestion[] = [
  { difficulty:1, question:"What is 1/2 + 1/4?", answer:"3/4", wrongs:["2/6","1/6","4/6"], hint:"Use a common denominator of 4." },
  { difficulty:1, question:"What is 2/5 + 1/5?", answer:"3/5", wrongs:["3/10","1/5","2/5"], hint:"Same denominator, add numerators only." },
  { difficulty:1, question:"What is 3/8 + 1/8?", answer:"4/8", wrongs:["4/16","3/16","1/8"], hint:"Denominator stays 8." },
  { difficulty:1, question:"What is 5/9 - 2/9?", answer:"3/9", wrongs:["3/18","7/9","2/9"], hint:"Same denominator, subtract numerators." },
  { difficulty:1, question:"What is 7/10 - 3/10?", answer:"4/10", wrongs:["4/20","10/10","3/10"], hint:"Keep denominator 10." },
  { difficulty:1, question:"What is 1/4 + 1/4?", answer:"1/2", wrongs:["2/8","1/8","2/4"], hint:"Same denominator: 1 + 1 = 2." },
  { difficulty:1, question:"What is 4/7 + 2/7?", answer:"6/7", wrongs:["6/14","8/7","2/7"], hint:"Add numerators: 4 + 2 = 6." },
  { difficulty:1, question:"What is 5/6 - 1/6?", answer:"4/6", wrongs:["4/12","6/6","1/6"], hint:"5 − 1 = 4. Keep denominator 6." },
  { difficulty:1, question:"What is 3/5 - 1/5?", answer:"2/5", wrongs:["2/10","4/5","1/5"], hint:"Subtract numerators only." },
  { difficulty:2, question:"What is 1/3 + 1/6?", answer:"1/2", wrongs:["2/9","2/6","1/9"], hint:"Convert 1/3 to 2/6 first." },
  { difficulty:2, question:"What is 3/4 - 1/2?", answer:"1/4", wrongs:["2/4","1/2","3/2"], hint:"Turn 1/2 into 2/4 first." },
  { difficulty:2, question:"What is 2/3 + 1/9?", answer:"7/9", wrongs:["3/12","1/3","2/9"], hint:"Convert 2/3 to 6/9." },
  { difficulty:2, question:"What is 5/6 - 1/3?", answer:"1/2", wrongs:["4/3","2/6","3/6"], hint:"Convert 1/3 to 2/6." },
  { difficulty:2, question:"What is 1/2 + 1/3?", answer:"5/6", wrongs:["2/5","2/6","1/5"], hint:"Use denominator 6." },
  { difficulty:2, question:"What is 4/5 - 1/10?", answer:"7/10", wrongs:["3/10","5/10","4/10"], hint:"Convert 4/5 to 8/10, then subtract." },
  { difficulty:2, question:"What is 2/3 - 1/6?", answer:"1/2", wrongs:["1/3","3/6","1/6"], hint:"2/3 = 4/6, then 4/6 − 1/6 = 3/6." },
  { difficulty:2, question:"What is 1/4 + 5/8?", answer:"7/8", wrongs:["6/12","5/8","1/2"], hint:"1/4 = 2/8, so 2/8 + 5/8 = 7/8." },
  { difficulty:2, question:"What is 3/4 - 2/3?", answer:"1/12", wrongs:["2/12","1/7","5/12"], hint:"Common denominator 12: 9/12 − 8/12." },
  { difficulty:3, question:"What is 2/3 x 3/4?", answer:"1/2", wrongs:["6/12","5/7","2/12"], hint:"Multiply top and bottom, then simplify." },
  { difficulty:3, question:"What is 3/5 x 10/9?", answer:"2/3", wrongs:["30/45","3/2","13/14"], hint:"Cancel common factors before multiplying." },
  { difficulty:3, question:"What is 4/7 x 14/15?", answer:"8/15", wrongs:["56/105","4/15","10/15"], hint:"4/7 x 14/15 simplifies by cancelling 7 and 14." },
  { difficulty:3, question:"What is 5/8 x 4/5?", answer:"1/2", wrongs:["20/40","9/13","5/2"], hint:"Cancel 5 first." },
  { difficulty:3, question:"What is 7/9 x 3/14?", answer:"1/6", wrongs:["21/126","4/9","7/42"], hint:"Cancel 7 with 14 and 3 with 9." },
  { difficulty:3, question:"What is 1/2 x 2/5?", answer:"1/5", wrongs:["2/10","3/7","2/5"], hint:"1×2 = 2 and 2×5 = 10 → 2/10 = 1/5." },
  { difficulty:3, question:"What is 6/7 x 7/12?", answer:"1/2", wrongs:["42/84","6/12","7/19"], hint:"Cancel 7, then simplify 6/12." },
  { difficulty:3, question:"What is 5/6 x 3/10?", answer:"1/4", wrongs:["15/60","8/16","1/2"], hint:"Multiply, then simplify 15/60." },
  { difficulty:3, question:"What is 9/10 x 5/6?", answer:"3/4", wrongs:["45/60","9/16","1/4"], hint:"45/60 simplifies to 3/4." },
  { difficulty:4, question:"What is 3/4 ÷ 1/2?", answer:"3/2", wrongs:["3/8","2/3","1/2"], hint:"Multiply by the reciprocal of 1/2." },
  { difficulty:4, question:"What is 2/5 ÷ 4/5?", answer:"1/2", wrongs:["8/25","6/5","2"], hint:"Flip 4/5 to 5/4 and multiply." },
  { difficulty:4, question:"What is 5/6 ÷ 10/3?", answer:"1/4", wrongs:["15/60","3/4","1/2"], hint:"5/6 x 3/10 then simplify." },
  { difficulty:4, question:"What is 7/8 ÷ 7/16?", answer:"2", wrongs:["1/2","14/128","16/8"], hint:"7/8 x 16/7 simplifies quickly." },
  { difficulty:4, question:"What is 9/10 ÷ 3/5?", answer:"3/2", wrongs:["27/50","6/5","1/2"], hint:"9/10 x 5/3 then simplify." },
  { difficulty:4, question:"What is 1/2 ÷ 1/4?", answer:"2", wrongs:["1/8","4/2","1/2"], hint:"1/2 x 4/1 = 4/2 = 2." },
  { difficulty:4, question:"What is 3/5 ÷ 2/3?", answer:"9/10", wrongs:["6/15","5/6","3/10"], hint:"3/5 x 3/2 = 9/10." },
  { difficulty:4, question:"What is 4/9 ÷ 8/3?", answer:"1/6", wrongs:["32/27","12/9","2/3"], hint:"4/9 x 3/8, then simplify." },
  { difficulty:4, question:"What is 5/8 ÷ 5/4?", answer:"1/2", wrongs:["25/32","4/8","5/2"], hint:"Divide by 5/4 = multiply by 4/5." },
  { difficulty:5, question:"Convert 0.25 to a fraction", answer:"1/4", wrongs:["25/10","1/25","2/5"], hint:"25 out of 100 simplifies to 1/4." },
  { difficulty:5, question:"Convert 0.6 to a fraction", answer:"3/5", wrongs:["6/100","6/5","2/3"], hint:"0.6 = 6/10, then simplify." },
  { difficulty:5, question:"Which is larger?", answer:"3/4", wrongs:["2/3","They are equal","Cannot tell"], hint:"Compare as decimals: 0.75 vs about 0.67." },
  { difficulty:5, question:"Simplify 18/24", answer:"3/4", wrongs:["6/8","9/12","2/3"], hint:"Divide top and bottom by 6." },
  { difficulty:5, question:"Simplify 21/49", answer:"3/7", wrongs:["7/3","1/2","2/7"], hint:"Divide top and bottom by 7." },
  { difficulty:5, question:"Convert 0.75 to a fraction", answer:"3/4", wrongs:["75/10","7/5","1/3"], hint:"75/100 simplifies to 3/4." },
  { difficulty:5, question:"Convert 0.2 to a fraction", answer:"1/5", wrongs:["2/10","1/2","2/5"], hint:"0.2 = 2/10 = 1/5." },
  { difficulty:5, question:"Simplify 15/20", answer:"3/4", wrongs:["5/4","1/4","15/10"], hint:"Divide numerator and denominator by 5." },
  { difficulty:5, question:"Simplify 12/18", answer:"2/3", wrongs:["6/9","4/6","3/2"], hint:"Divide top and bottom by 6." },
];

const MAX_HINTS_PER_LEVEL = 3;
const XP_PER_CORRECT = 10;

const COMPLIMENTS = ["Nice Work!","Brilliant!","You're on Fire!","Awesome!","Nailed It!","Keep it Up!","Superstar!","Fantastic!"];
function randomCompliment() { return COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)]; }

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const RAW_QUESTIONS_BY_TOPIC: Record<LessonTopic, RawQuestion[]> = {
  algebra: RAW_QUESTIONS,
  fraction: FRACTION_RAW_QUESTIONS,
};

function rawToQuestion(raw: RawQuestion, level: number): Question {
  const all = shuffle([raw.answer, ...raw.wrongs]);
  return {
    question: raw.question,
    choices: all,
    correctIndex: all.indexOf(raw.answer),
    hint: raw.hint,
    level,
  };
}

function buildQueue(
  level: number,
  topic: LessonTopic,
  excludeQuestionIds: string[] = []
): Question[] {
  const raws = pickUniqueRawQuestions(
    level,
    topic,
    RAW_QUESTIONS_BY_TOPIC,
    QUESTIONS_PER_LEVEL,
    excludeQuestionIds
  );
  return raws.map((raw) => rawToQuestion(raw, level));
}

function restoreQueueFromCheckpoint(
  topic: LessonTopic,
  checkpoint: TopicCheckpoint
): Question[] {
  const pool = RAW_QUESTIONS_BY_TOPIC[topic];
  const uniqueIds = [...new Set(checkpoint.questionIds)];
  if (uniqueIds.length !== checkpoint.questionIds.length) {
    return buildQueue(checkpoint.level, topic);
  }

  const restored = uniqueIds
    .map((id) => pool.find((q) => q.question === id))
    .filter((q): q is RawQuestion => !!q)
    .map((raw) => rawToQuestion(raw, checkpoint.level));

  if (restored.length === QUESTIONS_PER_LEVEL) return restored;
  return buildQueue(checkpoint.level, topic);
}

function getInitialLessonState(topic: LessonTopic, overrideLevel?: number) {
  const { topicLevel, topicCheckpoint } = useQuizStore.getState();
  const checkpoint = topicCheckpoint[topic];
  const currentStoredLevel = topicLevel[topic] ?? 1;
  const resolvedLevel = overrideLevel && overrideLevel >= 1 ? overrideLevel : currentStoredLevel;

  if (checkpoint && checkpoint.level === resolvedLevel) {
    return {
      level: checkpoint.level,
      queue: restoreQueueFromCheckpoint(topic, checkpoint),
      queueIndex: Math.min(
        checkpoint.queueIndex,
        QUESTIONS_PER_LEVEL - 1
      ),
      hintsUsed: Math.min(
        MAX_HINTS_PER_LEVEL,
        checkpoint.hintsUsed ?? 0
      ),
    };
  }

  return {
    level: resolvedLevel,
    queue: buildQueue(resolvedLevel, topic),
    queueIndex: 0,
    hintsUsed: 0,
  };
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
function ConfettiCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    c.width = window.innerWidth; c.height = window.innerHeight;
    const COLORS = ["#9333EA","#F59E0B","#10B981","#EF4444","#3B82F6","#F97316","#EC4899"];
    const pieces = Array.from({ length: 130 }, () => ({
      x: Math.random() * c.width, y: Math.random() * -c.height,
      w: 8 + Math.random() * 8, h: 4 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      angle: Math.random() * Math.PI * 2, spin: (Math.random() - 0.5) * 0.2,
      vy: 2 + Math.random() * 4, vx: (Math.random() - 0.5) * 3,
    }));
    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      pieces.forEach((p) => {
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h); ctx.restore();
        p.x += p.vx; p.y += p.vy; p.angle += p.spin;
        if (p.y > c.height) { p.y = -20; p.x = Math.random() * c.width; }
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ position:"fixed", inset:0, zIndex:9998, pointerEvents:"none" }} />;
}

// ─── Portal ───────────────────────────────────────────────────────────────────
function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

function AnswerSheet({ children, bg = "rgba(50,50,50,0.70)" }: { children: React.ReactNode; bg?: string }) {
  return (
    <Portal>
      <div style={{ position:"fixed", inset:0, zIndex:9999, display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center", background:bg, fontFamily:"'Nunito',sans-serif" }}>
        <div style={{ width:"100%", maxWidth:430, background:"#fff", borderRadius:"28px 28px 0 0", padding:"32px 24px 40px", display:"flex", flexDirection:"column", alignItems:"center", boxShadow:"0 -8px 40px rgba(0,0,0,0.15)" }}>
          {children}
        </div>
      </div>
    </Portal>
  );
}

function WrongModal({ answer, hint, onClose }: { answer: string; hint: string; onClose: () => void }) {
  return (
    <AnswerSheet>
      <div style={{ width:140,height:140,borderRadius:"50%",background:"#F5EFE6",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,flexShrink:0 }}>
        <div style={{ position:"relative",width:110,height:110 }}>
          <Image src="/fox-mascot-1.png" alt="Fox" fill sizes="110px" style={{ objectFit:"contain" }} priority unoptimized />
        </div>
      </div>
      <h2 style={{ fontSize:26,fontWeight:800,color:"#1A1A1A",textAlign:"center",marginBottom:6,fontFamily:"'Nunito',sans-serif" }}>Almost There</h2>
      <p style={{ fontSize:14,color:"#888",textAlign:"center",marginBottom:20,fontFamily:"'Nunito',sans-serif" }}>That's fine, here is the trick:</p>
      <div style={{ width:"100%",border:"1.5px solid #E2E2E2",borderRadius:14,padding:"10px 16px 14px",marginBottom:16 }}>
        <p style={{ fontSize:12,color:"#ABABAB",fontWeight:500,marginBottom:4,fontFamily:"'Nunito',sans-serif" }}>Correct Answer:</p>
        <p style={{ fontSize:26,fontWeight:800,color:"#1A1A1A",fontFamily:"'Nunito',sans-serif" }}>{answer}</p>
      </div>
      <p style={{ fontSize:14,color:"#666",textAlign:"center",lineHeight:1.7,marginBottom:28,paddingLeft:8,paddingRight:8,fontFamily:"'Nunito',sans-serif" }}>{hint}</p>
      <button onClick={onClose} style={{ width:"100%",height:56,borderRadius:999,background:"linear-gradient(90deg,#F9536A 0%,#E8294A 100%)",boxShadow:"0 5px 0 #B01E36",color:"#fff",fontSize:18,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif" }}>Got It</button>
    </AnswerSheet>
  );
}

function CorrectModal({ answer, hint, compliment, onClose }: { answer: string; hint: string; compliment: string; onClose: () => void }) {
  return (
    <AnswerSheet>
      <div style={{ position:"relative",width:130,height:130,marginBottom:16,flexShrink:0 }}>
        <Image src="/fox-mascot-2.png" alt="Fox" fill sizes="130px" style={{ objectFit:"contain" }} priority unoptimized />
      </div>
      <h2 style={{ fontSize:26,fontWeight:800,color:"#1A1A1A",textAlign:"center",marginBottom:6,fontFamily:"'Nunito',sans-serif" }}>{compliment}</h2>
      <p style={{ fontSize:14,color:"#888",textAlign:"center",marginBottom:20,fontFamily:"'Nunito',sans-serif" }}>You got the answer correctly.</p>
      <div style={{ width:"100%",border:"1.5px solid #E2E2E2",borderRadius:14,padding:"10px 16px 14px",marginBottom:16 }}>
        <p style={{ fontSize:12,color:"#ABABAB",fontWeight:500,marginBottom:4,fontFamily:"'Nunito',sans-serif" }}>Correct Answer:</p>
        <p style={{ fontSize:26,fontWeight:800,color:"#1A1A1A",fontFamily:"'Nunito',sans-serif" }}>{answer}</p>
      </div>
      <p style={{ fontSize:14,color:"#666",textAlign:"center",lineHeight:1.7,marginBottom:28,paddingLeft:8,paddingRight:8,fontFamily:"'Nunito',sans-serif" }}>{hint}</p>
      <button onClick={onClose} style={{ width:"100%",height:56,borderRadius:999,background:"linear-gradient(90deg,#9333EA 0%,#7E22CE 100%)",boxShadow:"0 5px 0 #6B21A8",color:"#fff",fontSize:18,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif" }}>Continue</button>
    </AnswerSheet>
  );
}

function LevelCompleteModal({ level, onNext }: { level: number; onNext: () => void }) {
  return (
    <Portal>
      <ConfettiCanvas />
      <div style={{ position:"fixed",inset:0,zIndex:9999,display:"flex",flexDirection:"column",justifyContent:"flex-end",alignItems:"center",background:"rgba(30,10,60,0.78)",fontFamily:"'Nunito',sans-serif" }}>
        <div style={{ width:"100%",maxWidth:430,background:"#fff",borderRadius:"28px 28px 0 0",padding:"36px 24px 44px",display:"flex",flexDirection:"column",alignItems:"center",boxShadow:"0 -8px 40px rgba(0,0,0,0.2)" }}>
          <div style={{ width:96,height:96,borderRadius:"50%",background:"linear-gradient(135deg,#F59E0B,#F97316)",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:20,boxShadow:"0 6px 24px rgba(245,158,11,0.45)" }}>
            <Trophy size={46} color="#fff" fill="#fff" />
          </div>
          <h2 style={{ fontSize:28,fontWeight:900,color:"#1A1A1A",textAlign:"center",marginBottom:8,fontFamily:"'Nunito',sans-serif" }}>Level {level} Complete!</h2>
          <p style={{ fontSize:15,color:"#777",textAlign:"center",marginBottom:24,fontFamily:"'Nunito',sans-serif" }}>
            Great job! Get ready for Level {level + 1}.
          </p>
          <div style={{ display:"flex",gap:10,marginBottom:28 }}>
            {[0,1,2].map((i) => <Star key={i} size={36} color="#F59E0B" fill="#F59E0B" />)}
          </div>
          <button onClick={onNext} style={{ width:"100%",height:56,borderRadius:999,background:"linear-gradient(90deg,#9333EA 0%,#7E22CE 100%)",boxShadow:"0 5px 0 #6B21A8",color:"#fff",fontSize:18,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif" }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </Portal>
  );
}

function GameOverModal({
  countdown,
  canContinue,
  onContinue,
  onLeave,
}: {
  countdown: string | null;
  canContinue: boolean;
  onContinue: () => void;
  onLeave: () => void;
}) {
  return (
    <AnswerSheet bg="rgba(50,10,10,0.82)">
      <div style={{ width:88,height:88,borderRadius:"50%",background:"#FEE2E2",display:"flex",alignItems:"center",justifyContent:"center",marginBottom:16 }}>
        <HeartCrack size={44} color="#EF4444" />
      </div>
      <h2 style={{ fontSize:26,fontWeight:800,color:"#1A1A1A",textAlign:"center",marginBottom:8,fontFamily:"'Nunito',sans-serif" }}>Out of Hearts!</h2>
      <p style={{ fontSize:14,color:"#888",textAlign:"center",marginBottom:12,lineHeight:1.7,fontFamily:"'Nunito',sans-serif" }}>
        {canContinue
          ? "A heart is back. You can continue right where you left off."
          : "Hearts refill one at a time — 20 minutes per heart."}
      </p>
      {!canContinue && countdown && (
        <p style={{ fontSize:22,fontWeight:800,color:"#EF4444",textAlign:"center",marginBottom:24,fontFamily:"'Nunito',sans-serif" }}>
          Next heart in {countdown}
        </p>
      )}
      {canContinue ? (
        <button onClick={onContinue} style={{ width:"100%",height:56,borderRadius:999,background:"linear-gradient(90deg,#9333EA 0%,#7E22CE 100%)",boxShadow:"0 5px 0 #6B21A8",color:"#fff",fontSize:18,fontWeight:700,border:"none",cursor:"pointer",fontFamily:"'Nunito',sans-serif",marginBottom:12 }}>
          Continue Lesson
        </button>
      ) : (
        <div style={{ height:12,marginBottom:12 }} />
      )}
      <button onClick={onLeave} style={{ width:"100%",height:48,borderRadius:999,background:"#fff",border:"1.5px solid #E5E5E5",color:"#555",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:"'Nunito',sans-serif" }}>
        Back to Dashboard
      </button>
    </AnswerSheet>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LessonPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const topic: LessonTopic = searchParams.get("topic") === "fraction" ? "fraction" : "algebra";
  const levelParam = searchParams.get("level");
  const explicitLevel = levelParam ? parseInt(levelParam, 10) : undefined;
  const {
    addXP,
    loseHeart,
    reconcileHearts,
    hearts,
    setTopicProgress,
    setTopicLevel,
    setTopicCheckpoint,
    clearTopicCheckpoint,
    topicLevel,
    topicCheckpoint,
  } = useQuizStore();

  const initial = getInitialLessonState(topic, explicitLevel);

  const [level,      setLevel]      = useState<number>(initial.level);
  const [queue,      setQueue]      = useState<Question[]>(initial.queue);
  const [queueIndex, setQueueIndex] = useState(initial.queueIndex);
  const [hintsUsed,  setHintsUsed]  = useState(initial.hintsUsed);
  const [showHint,   setShowHint]   = useState(false);
  const [selected,   setSelected]   = useState<string | null>(null);
  const [modal, setModal] = useState<"wrong"|"correct"|"levelComplete"|"gameOver"|null>(() =>
    useQuizStore.getState().hearts <= 0 ? "gameOver" : null
  );
  const [compliment, setCompliment] = useState("");
  const [heartCountdown, setHeartCountdown] = useState<string | null>(null);

  const q = queue[queueIndex];
  const progressPct = Math.round((queueIndex / QUESTIONS_PER_LEVEL) * 100);
  const outOfHearts = hearts <= 0;
  const hintsRemaining = MAX_HINTS_PER_LEVEL - hintsUsed;
  const canUseHint = hintsRemaining > 0;

  function persistCheckpoint(
    lvl: number,
    idx: number,
    currentQueue: Question[],
    usedHints: number = hintsUsed
  ) {
    setTopicCheckpoint(topic, {
      level: lvl,
      queueIndex: idx,
      questionIds: currentQueue.map((item) => item.question),
      hintsUsed: usedHints,
    });
  }

  function handleHintToggle() {
    if (showHint) {
      setShowHint(false);
      return;
    }
    if (!canUseHint) return;
    const nextHintsUsed = hintsUsed + 1;
    setHintsUsed(nextHintsUsed);
    setShowHint(true);
    persistCheckpoint(level, queueIndex, queue, nextHintsUsed);
  }

  useEffect(() => {
    const tick = () => {
      reconcileHearts();
      const { heartRegenAt } = useQuizStore.getState();
      const ms = getMsUntilNextHeart(heartRegenAt);
      setHeartCountdown(ms === null ? null : formatHeartCountdown(ms));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [reconcileHearts]);

  useEffect(() => {
    if (hearts > 0 && modal === "gameOver") {
      setModal(null);
      setSelected(null);
      setShowHint(false);
    }
  }, [hearts, modal]);

  useEffect(() => {
    const next = getInitialLessonState(topic, explicitLevel);
    setLevel(next.level);
    setQueue(next.queue);
    setQueueIndex(next.queueIndex);
    setHintsUsed(next.hintsUsed);
    setSelected(null);
    setShowHint(false);
    setModal(useQuizStore.getState().hearts <= 0 ? "gameOver" : null);
  }, [topic, explicitLevel]);

  function syncProgress(
    lvl: number,
    idx: number,
    currentQueue: Question[] = queue,
    usedHints: number = hintsUsed
  ) {
    const levelProgress = Math.min(100, Math.round((idx / QUESTIONS_PER_LEVEL) * 100));
    const currentStoredLevel = topicLevel[topic] ?? 1;
    const isPlayingActiveLevel = lvl === currentStoredLevel;

    if (isPlayingActiveLevel) {
      setTopicProgress(topic, levelProgress);
    }

    persistCheckpoint(lvl, idx, currentQueue, usedHints);
  }

  function handleCheck() {
    if (!selected || !q || outOfHearts) return;
    if (selected === q.choices[q.correctIndex]) {
      addXP(XP_PER_CORRECT);
      setCompliment(randomCompliment());
      setModal("correct");
    } else {
      loseHeart();
      const h = useQuizStore.getState().hearts;
      persistCheckpoint(level, queueIndex, queue);
      setModal(h <= 0 ? "gameOver" : "wrong");
    }
  }

  function handleContinueAfterHearts() {
    reconcileHearts();
    if (useQuizStore.getState().hearts > 0) {
      setModal(null);
      setSelected(null);
      setShowHint(false);
    }
  }

  function handleCorrectClose() {
    const next = queueIndex + 1;
    if (next >= QUESTIONS_PER_LEVEL) {
      syncProgress(level, QUESTIONS_PER_LEVEL);
      clearTopicCheckpoint(topic);
      setHintsUsed(0);
      setShowHint(false);
      setModal("levelComplete");
    } else {
      setQueueIndex(next);
      syncProgress(level, next);
      setSelected(null);
      setShowHint(false);
      setModal(null);
    }
  }

  function handleLevelNext() {
    const nl = level + 1;
    const nextQueue = buildQueue(
      nl,
      topic,
      queue.map((item) => item.question)
    );
    setHintsUsed(0);
    const currentStoredLevel = topicLevel[topic] ?? 1;
    const isPlayingActiveLevel = level === currentStoredLevel;

    if (isPlayingActiveLevel) {
      setTopicLevel(topic, nl);
    }

    setLevel(nl);
    setQueue(nextQueue);
    setQueueIndex(0);
    syncProgress(nl, 0, nextQueue, 0);
    setSelected(null);
    setShowHint(false);
    setModal(null);
    router.push("/dashboard");
  }

  if (!q) return null;

  const diffLabels: Record<number,string> = {
    1: "Like Terms: Addition",
    2: "Like Terms: Subtraction",
    3: "Mixed Like Terms",
    4: "Unlike Terms",
    5: "Substitution",
  };
  const diffLabel =
    topic === "fraction"
      ? `Fractions • Difficulty ${levelToDifficulty(level, topic, RAW_QUESTIONS_BY_TOPIC)}`
      : diffLabels[levelToDifficulty(level, topic, RAW_QUESTIONS_BY_TOPIC)] ?? "Algebra";

  return (
    <>
      <main className="min-h-screen overflow-hidden bg-[#f5f5f5] flex justify-center" style={{ fontFamily:"'Nunito',sans-serif" }}>
        <div className="w-full max-w-107.5 bg-white min-h-screen relative border-x border-[#ECECEC] shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
          <div className="px-4 pt-5 pb-8 mx-3 flex flex-col min-h-screen">

            {/* TOP BAR */}
            <div className="flex items-center gap-4">
              <button onClick={() => router.push("/dashboard")} className="text-[#555] cursor-pointer shrink-0">
                <X size={24} />
              </button>
              <div className="flex-1 h-4 bg-[#ECECEC] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width:`${Math.max(2,progressPct)}%`, background:"linear-gradient(90deg,#F59E0B,#FB923C)" }} />
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {Array.from({ length: MAX_HEARTS }).map((_, i) => (
                  <Heart key={i} size={16} color={i < hearts ? "#EF4444" : "#E5E5E5"} fill={i < hearts ? "#EF4444" : "#E5E5E5"} />
                ))}
              </div>
            </div>

            {/* badges */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#9333EA] bg-[#F5EEFF] px-3 py-1 rounded-full">Level {level}</span>
              <span className="text-xs font-bold text-[#888] bg-[#F5F5F5] px-3 py-1 rounded-full">{topic === "fraction" ? "Fraction Home" : "Algebra Academy"}</span>
              <span className="text-xs font-bold text-[#888] bg-[#F5F5F5] px-3 py-1 rounded-full">{diffLabel}</span>
            </div>

            {/* Mascot + question */}
            <div className="mt-6 flex items-start gap-3">
              <div className="relative w-24 h-28 shrink-0">
                <img src="/fox-mascot.png" alt="Fox Mascot" className="w-full h-full object-contain" />
              </div>
              <div className="relative bg-white border border-[#E5E5E5] rounded-2xl px-4 py-3 shadow-sm mt-2 flex-1">
                <div className="absolute -left-2.5 top-4 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-10 border-r-white" />
                <p className="text-[#1D1D1D] text-lg leading-6 font-bold">{q.question}</p>
              </div>
            </div>

            {/* Choices */}
            <div className="mt-6">
              <p className="text-[#777] text-sm font-semibold mb-3">Select the correct answer</p>
              <div className="flex flex-col gap-3">
                {q.choices.map((choice, idx) => (
                  <button
                    key={`${q.question}-${idx}`}
                    onClick={() => setSelected(choice)}
                    className="w-full h-14 rounded-2xl text-xl font-bold shadow-sm transition-all duration-150 cursor-pointer"
                    style={{
                      border: selected === choice ? "2px solid #9333EA" : "1.5px solid #E5E5E5",
                      background: selected === choice ? "#FAF5FF" : "#fff",
                      color: selected === choice ? "#9333EA" : "#1D1D1D",
                    }}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>

            {/* Hint */}
            {showHint && (
              <div className="mt-4 rounded-2xl px-4 py-3" style={{ background:"#FFFCF0", border:"1px solid #FFAC21" }}>
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={16} style={{ color:"#D97706" }} fill="#D97706" />
                  <span className="font-bold text-sm" style={{ color:"#D97706" }}>Hint</span>
                </div>
                <p className="text-sm leading-5" style={{ color:"#EC9707" }}>{q.hint}</p>
              </div>
            )}

            <div className="flex-1" />

            {/* Bottom */}
            <div className="mt-6 flex items-center gap-4 pb-4">
              <button
                type="button"
                onClick={handleHintToggle}
                disabled={!showHint && !canUseHint}
                title={canUseHint ? "Show a hint" : "No hints left this level"}
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all duration-200"
                style={{
                  background: showHint ? "#FFFCF0" : "#fff",
                  border: showHint ? "1.5px solid #FFAC21" : "1.5px solid #D9D9D9",
                  opacity: !showHint && !canUseHint ? 0.4 : 1,
                  cursor: !showHint && !canUseHint ? "not-allowed" : "pointer",
                }}
              >
                <Lightbulb size={22} style={{ color:showHint ? "#D97706" : canUseHint ? "#555" : "#ABABAB" }} fill={showHint ? "#D97706" : "none"} />
              </button>
              <button
                onClick={handleCheck}
                disabled={!selected || outOfHearts}
                className="flex-1 h-14 rounded-full text-white text-xl font-bold transition-all duration-200"
                style={{
                  background:"linear-gradient(90deg,#9333EA,#7E22CE)",
                  boxShadow: selected && !outOfHearts ? "0 5px 0 #6B21A8" : "none",
                  opacity: selected && !outOfHearts ? 1 : 0.4,
                  cursor: selected && !outOfHearts ? "pointer" : "not-allowed",
                }}
              >
                Check
              </button>
            </div>

          </div>
        </div>
      </main>

      {modal === "wrong"         && <WrongModal   answer={q.choices[q.correctIndex]} hint={q.hint} onClose={() => { setModal(null); setSelected(null); setShowHint(false); }} />}
      {modal === "correct"       && <CorrectModal answer={q.choices[q.correctIndex]} hint={q.hint} compliment={compliment} onClose={handleCorrectClose} />}
      {modal === "levelComplete" && <LevelCompleteModal level={level} onNext={handleLevelNext} />}
      {modal === "gameOver"      && (
        <GameOverModal
          countdown={heartCountdown}
          canContinue={hearts > 0}
          onContinue={handleContinueAfterHearts}
          onLeave={() => router.push("/dashboard")}
        />
      )}
    </>
  );
}