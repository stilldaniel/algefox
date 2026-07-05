"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/layout/BottomNav";
import { useQuizStore } from "@/store/quizStore";
import { BookOpen, Flame, Zap, Heart, ChevronLeft, ChevronRight } from "lucide-react";

type Topic = "algebra" | "fraction";

const LEVELS_PER_PAGE = 20;

const DIFF_LABELS = ["Beginner", "Elementary", "Intermediate", "Advanced", "Expert"];
function diffLabel(level: number) {
  return DIFF_LABELS[(level - 1) % 5];
}

const TOPIC_CARD: Record<Topic, { gradient: string; module: string; title: string }> = {
  algebra: {
    gradient: "linear-gradient(92deg, #9333EA 1%, #7E22CE 97%)",
    module: "Module 1 • Algebraic Expressions",
    title: "Like Terms & Simplification",
  },
  fraction: {
    gradient: "linear-gradient(92deg, #F6A500 1%, #E38B00 97%)",
    module: "Module 2 • Introduction To Fractions",
    title: "What is a Fraction?",
  },
};

// 20 zigzag offsets cycling left/right
const ZIGZAG_20 = [
  "translate-x-8",  "-translate-x-2", "translate-x-14", "translate-x-2",
  "-translate-x-6", "translate-x-4",  "translate-x-10", "-translate-x-4",
  "translate-x-6",  "-translate-x-8", "translate-x-12", "translate-x-0",
  "-translate-x-4", "translate-x-8",  "translate-x-2",  "-translate-x-6",
  "translate-x-10", "-translate-x-2", "translate-x-6",  "translate-x-0",
];

type NodeStatus = "completed" | "active" | "locked";

function nodeStatus(level: number, currentLevel: number): NodeStatus {
  if (level < currentLevel)  return "completed";
  if (level === currentLevel) return "active";
  return "locked";
}

function nodeSize(indexOnPage: number) {
  if (indexOnPage < 4)  return { outer: "w-20 h-20", inner: "w-14 h-14", icon: "w-8 h-8" };
  if (indexOnPage < 10) return { outer: "w-16 h-16", inner: "w-11 h-11", icon: "w-7 h-7" };
  if (indexOnPage < 16) return { outer: "w-14 h-14", inner: "w-10 h-10", icon: "w-6 h-6" };
  return                       { outer: "w-12 h-12", inner: "w-8  h-8",  icon: "w-5 h-5" };
}

// ─── Lesson Node ──────────────────────────────────────────────────────────────
function LessonNode({
  level, topic, currentLevel, indexOnPage, onPress,
}: {
  level: number; topic: Topic; currentLevel: number;
  indexOnPage: number; onPress: () => void;
}) {
  const status = nodeStatus(level, currentLevel);
  const s = nodeSize(indexOnPage);
  const offset = ZIGZAG_20[indexOnPage % ZIGZAG_20.length] ?? "";

  const isActive    = status === "active";
  const isCompleted = status === "completed";
  const isLocked    = status === "locked";

  const outerBg = isActive
    ? "bg-[#F6A500]"
    : isCompleted
    ? (topic === "algebra" ? "bg-[#9333EA]" : "bg-[#F97316]")
    : "bg-[#D9D9D9]";

  const innerBg = isActive
    ? "bg-[#E08C00]"
    : isCompleted
    ? (topic === "algebra" ? "bg-[#7E22CE]" : "bg-[#EA580C]")
    : "bg-[#C4C4C4]";

  const glow = isActive
    ? "shadow-[0_6px_20px_rgba(246,165,0,0.55)]"
    : isCompleted
    ? topic === "algebra"
      ? "shadow-[0_4px_14px_rgba(147,51,234,0.4)]"
      : "shadow-[0_4px_14px_rgba(249,115,22,0.4)]"
    : "shadow-md";

  const iconColor = isLocked ? "text-[#A0A0A0]" : "text-white";

  return (
    <div className={`relative flex flex-col items-center ${offset}`}>
      <button
        onClick={onPress}
        disabled={isLocked}
        className={`${s.outer} rounded-full flex items-center justify-center ${outerBg} ${glow} transition-transform duration-200 active:scale-95 ${isLocked ? "cursor-default" : "cursor-pointer"}`}
        aria-label={`Level ${level}`}
      >
        <div className={`${s.inner} rounded-full flex items-center justify-center ${innerBg}`}>
          <BookOpen className={`${s.icon} ${iconColor}`} strokeWidth={2.5} />
        </div>
      </button>

      <span className="mt-1.5 text-xs font-bold text-[#888]" style={{ fontFamily: "'Nunito',sans-serif" }}>
        {level}
      </span>
    </div>
  );
}

// ─── Topic Tab ────────────────────────────────────────────────────────────────
function TopicTab({ label, active, locked, onClick }: {
  label: string; active: boolean; locked: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={locked ? undefined : onClick}
      disabled={locked}
      className={`flex-1 py-2.5 rounded-full text-sm font-bold transition-all duration-200
        ${active ? "bg-[#9333EA] text-white shadow-md"
          : locked ? "bg-[#F0F0F0] text-[#ABABAB] cursor-not-allowed"
          : "bg-[#F5F5F5] text-[#555] hover:bg-[#E9D5FF] hover:text-[#9333EA]"
        }`}
      style={{ fontFamily: "'Nunito',sans-serif" }}
    >
      {label}{locked ? " 🔒" : ""}
    </button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LearnPage() {
  const router = useRouter();
  const {
    xp, streak, hearts,
    topicLevel, topicProgress,
    reconcileHearts, increaseStreak,
  } = useQuizStore();

  const [activeTopic, setActiveTopic] = useState<Topic>("algebra");

  useEffect(() => {
    increaseStreak();
    reconcileHearts();
    const id = window.setInterval(() => reconcileHearts(), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const algebraLevel    = topicLevel?.algebra   ?? 1;
  const fractionLevel   = topicLevel?.fraction  ?? 1;
  const algebraProgress = topicProgress?.algebra  ?? 0;
  const fractionProgress= topicProgress?.fraction ?? 0;
  const fractionUnlocked = algebraLevel >= 10;

  const currentLevel    = activeTopic === "algebra" ? algebraLevel : fractionLevel;
  const card = TOPIC_CARD[activeTopic];

  // Page = 0-indexed group of 20 levels.
  // The user can only go forward to the page that contains their current level.
  // They can always go back to any previous page.
  const maxUnlockedPage = Math.floor((currentLevel - 1) / LEVELS_PER_PAGE);
  const [page, setPage] = useState(() => maxUnlockedPage);

  // When topic changes, jump to the page containing the active level
  useEffect(() => {
    setPage(Math.floor((currentLevel - 1) / LEVELS_PER_PAGE));
  }, [activeTopic, currentLevel]);

  // Page 0 → levels 1–20, page 1 → levels 21–40, etc.
  const pageStart = page * LEVELS_PER_PAGE + 1;
  const pageEnd   = pageStart + LEVELS_PER_PAGE - 1;
  const levels    = Array.from({ length: LEVELS_PER_PAGE }, (_, i) => pageStart + i);

  const canGoBack    = page > 0;
  const canGoForward = page < maxUnlockedPage;

  // Prev page range label (only shown if page > 0)
  const prevStart = (page - 1) * LEVELS_PER_PAGE + 1;
  const prevEnd   = prevStart + LEVELS_PER_PAGE - 1;

  // Next page range label (only shown if forward is available)
  const nextStart = pageEnd + 1;
  const nextEnd   = nextStart + LEVELS_PER_PAGE - 1;

  function handleNodePress(level: number) {
    const status = nodeStatus(level, currentLevel);
    // Allow completed nodes to be retaken, and active node to start
    if (status === "locked") return;
    router.push(`/lesson?topic=${activeTopic}&level=${level}`);
  }

  return (
    <main className="min-h-screen bg-[#f5f5f5] flex justify-center" style={{ fontFamily: "'Nunito',sans-serif" }}>
      <div className="w-full max-w-107.5 bg-white min-h-screen relative pb-24 border-x border-[#ECECEC]">
        <div className="max-w-sm mx-auto relative flex flex-col h-screen overflow-hidden">

          {/* ── Fixed header area (does NOT scroll) ── */}
          <div className="shrink-0">

            {/* Status Bar */}
            <div className="flex items-center justify-between px-5 pt-6 pb-2">
              <div className="flex items-center gap-1.5">
                <BookOpen size={20} className="text-[#8A2BE2]" />
                <span className="font-bold text-[#1D1D1D] text-sm">2</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Flame size={20} color="#F97316" fill="#F97316" />
                <span className="font-bold text-[#1D1D1D] text-sm">{streak}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap size={20} color="#EAB308" fill="#EAB308" />
                <span className="font-bold text-[#1D1D1D] text-sm">{xp}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart size={20} color="#EF4444" fill="#EF4444" />
                <span className="font-bold text-[#1D1D1D] text-sm">{hearts}</span>
              </div>
            </div>

            {/* Topic Tabs */}
            <div className="px-4 mt-2 flex gap-2">
              <TopicTab label="Algebra"   active={activeTopic==="algebra"}  locked={false}             onClick={() => setActiveTopic("algebra")} />
              <TopicTab label="Fractions" active={activeTopic==="fraction"} locked={!fractionUnlocked} onClick={() => { if (fractionUnlocked) setActiveTopic("fraction"); }} />
            </div>

            {/* Module Card */}
            <div className="px-4 mt-3">
              <div className="rounded-2xl px-4 py-3 flex items-center gap-3 shadow-md" style={{ background: card.gradient }}>
                <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center shrink-0">
                  {activeTopic === "algebra" ? (
                    <svg viewBox="0 0 36 36" className="w-9 h-9">
                      <rect x="4" y="4" width="28" height="28" rx="6" fill="rgba(255,255,255,0.25)" />
                      <text x="18" y="24" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white" fontFamily="serif">x²</text>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 36 36" className="w-9 h-9">
                      <circle cx="18" cy="18" r="16" fill="#FFC94D" />
                      <path d="M18 18 L18 2 A16 16 0 0 1 32.9 25.5 Z" fill="#5BC4F5" />
                      <path d="M18 18 L32.9 25.5 A16 16 0 0 1 18 34 Z" fill="#FF7A6B" />
                      <path d="M18 18 L18 34 A16 16 0 0 1 18 2 Z" fill="#FFD166" />
                    </svg>
                  )}
                </div>
                <div>
                  <p className="text-white/90 text-xs font-medium">{card.module}</p>
                  <p className="text-white font-bold text-base mt-0.5">{card.title}</p>
                </div>
              </div>
            </div>

            {/* Page navigation — only show when there are pages to navigate */}
            <div className="px-4 mt-3 flex items-center justify-between">
              {/* Back button — only when page > 0 */}
              {canGoBack ? (
                <button
                  onClick={() => setPage(p => p - 1)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#F5EEFF] text-[#9333EA] cursor-pointer hover:bg-[#E9D5FF] transition-all"
                >
                  <ChevronLeft size={14} />
                  {prevStart}–{prevEnd}
                </button>
              ) : (
                <div /> /* spacer */
              )}

              <div />

              {/* Forward button — only when user has reached next page */}
              {canGoForward ? (
                <button
                  onClick={() => setPage(p => p + 1)}
                  className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-[#F5EEFF] text-[#9333EA] cursor-pointer hover:bg-[#E9D5FF] transition-all"
                >
                  {nextStart}–{nextEnd}
                  <ChevronRight size={14} />
                </button>
              ) : (
                <div /> /* spacer */
              )}
            </div>

          </div>{/* end fixed header */}

          {/* ── Scrollable path area ── */}
          <div className="flex-1 relative overflow-hidden mt-2">

            {/* Fox mascot — absolutely positioned within the scroll container but NOT scrolling */}
            <div className="absolute left-0 top-8 z-10 w-40 h-52 pointer-events-none">
              <Image
                src="/Fox Mascor.png"
                alt="Fox Mascot"
                fill
                className="object-contain object-bottom"
                priority
              />
            </div>

            {/* Nodes — scrollable, scrollbar hidden */}
            <div
              className="h-full overflow-y-scroll"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" } as React.CSSProperties}
            >
              <style>{`div::-webkit-scrollbar { display: none; }`}</style>
              <div className="flex flex-col items-center gap-7 pt-1 pb-1">
                {levels.map((level, indexOnPage) => (
                  <LessonNode
                    key={`${activeTopic}-${level}`}
                    level={level}
                    topic={activeTopic}
                    currentLevel={currentLevel}
                    indexOnPage={indexOnPage}
                    onPress={() => handleNodePress(level)}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>

        <BottomNav />
      </div>
    </main>
  );
}