"use client";

import AppShell from "@/components/layout/AppShell";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuizStore } from "@/store/quizStore";
import { Flame, Heart, Zap, BookOpen, Trophy, Medal, Lock } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { xp, streak, hearts, topicProgress, topicLevel, reconcileHearts, increaseStreak } = useQuizStore();

  useEffect(() => {
    increaseStreak();
    reconcileHearts();
    const id = window.setInterval(() => reconcileHearts(), 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const user = { name: "Daniel" };

  // XP earned = 10 per correct answer. Show how many questions answered out of 20.
  const questionsCorrect = Math.min(Math.floor(xp / 10), 20);

  const algebraProgress = topicProgress.algebra;
  const fractionProgress = topicProgress.fraction;
  const algebraLevel = topicLevel.algebra;
  const fractionLevel = topicLevel.fraction;

  // Fraction Home unlocks when Algebra reaches level 10
  const fractionUnlocked = algebraLevel >= 10;

  const achievements = [
    {
      title: "First Step",
      description: "Complete your first lesson",
      unlocked: algebraLevel >= 2 || algebraProgress > 0,
      icon: <Medal size={28} className="text-purple-600" />,
      bg: "bg-purple-100",
    },
    {
      title: "Streak Master",
      description: "Maintain a 3-day streak",
      unlocked: streak >= 3,
      icon: <Flame size={28} className="text-orange-500" />,
      bg: "bg-orange-100",
    },
    {
      title: "Quiz Winner",
      description: "Answer 10 questions correctly",
      unlocked: xp >= 100,
      icon: <Trophy size={28} className="text-yellow-500" />,
      bg: "bg-yellow-100",
    },
  ];

  return (
    <AppShell>
      <div
        className="max-w-sm mx-auto min-h-screen bg-white px-4 pt-6 pb-7"
        style={{ fontFamily: "'Nunito', sans-serif" }}
      >

        {/* ── Top Stats ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <BookOpen size={20} className="text-[#8A2BE2]" />
            <span className="font-bold text-[#1D1D1D] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>2</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame size={20} color="#F97316" fill="#F97316" />
            <span className="font-bold text-[#1D1D1D] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>{streak}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap size={20} color="#EAB308" fill="#EAB308" />
            <span className="font-bold text-[#1D1D1D] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>{xp}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart size={20} color="#EF4444" fill="#EF4444" />
            <span className="font-bold text-[#1D1D1D] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>{hearts}</span>
          </div>
        </div>

        {/* ── Greeting ── */}
        <div className="mt-7">
          <h1 className="text-[28px] font-bold text-[#1D1D1D]" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Hello, {user.name}
          </h1>
          <p className="text-[#8F8F8F] text-sm mt-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Ready for today&apos;s lesson?
          </p>
        </div>

        {/* ── Daily Challenge ── */}
        <div className="mt-6">
          <div
            className="w-full rounded-xl flex items-center justify-between px-3 py-4"
            style={{ background: "linear-gradient(92.06deg, #7B34A3 1.33%, #5B1483 96.97%)" }}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/15 flex items-center justify-center relative overflow-hidden">
                <Image src="/target-svgrepo-com 1.png" alt="Target" fill className="object-contain" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold" style={{ fontFamily: "'Nunito', sans-serif" }}>Daily Challenge</p>
                <p className="text-white/80 text-xs mt-1" style={{ fontFamily: "'Nunito', sans-serif" }}>Complete 3 lessons today</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/lesson?topic=algebra")}
              className="h-8 px-5 rounded-full bg-white text-[#7B34A3] text-sm font-semibold transition-all duration-300 hover:bg-[#F3E8FF] cursor-pointer shadow-sm"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              Go
            </button>
          </div>
        </div>

        {/* ── Continue Learning ── */}
        <div className="mt-5 border border-[#E7E7E7] rounded-3xl p-4">
          <p className="text-[#8F8F8F] text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>Continue Learning</p>
          <h2 className="font-bold text-[20px] mt-1 text-[#1D1D1D]" style={{ fontFamily: "'Nunito', sans-serif" }}>
            Algebraic Expressions
          </h2>

          <div className="flex items-center justify-between mt-4 text-sm text-[#8F8F8F]" style={{ fontFamily: "'Nunito', sans-serif" }}>
            {/* Only show level number — no "of 5" since levels are infinite */}
            <span>Level {algebraLevel}</span>
            <span>{algebraProgress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#ECECEC] rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-orange-400 rounded-full transition-all duration-700"
              style={{ width: `${algebraProgress}%` }}
            />
          </div>

          <button
            onClick={() => router.push("/lesson?topic=algebra")}
            className="w-full h-10 text-white rounded-full px-4 mt-5 font-bold shadow-md transition-all duration-300 cursor-pointer hover:brightness-90"
            style={{ background: "#8A2BE2", fontFamily: "'Nunito', sans-serif" }}
          >
            {algebraProgress === 0 ? "Start Lesson" : algebraProgress >= 100 ? "Continue" : "Continue Lesson"}
          </button>
        </div>

        {/* ── Your Progress ── */}
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[20px] text-[#1D1D1D]" style={{ fontFamily: "'Nunito', sans-serif" }}>Your Progress</h2>
            <button className="text-sm text-[#8F8F8F] cursor-pointer hover:text-[#1D1D1D] transition-colors" style={{ fontFamily: "'Nunito', sans-serif" }}>View all</button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">

            {/* Card 1 — Algebra Academy (always first, always unlocked) */}
            <div className="border border-[#E7E7E7] rounded-[20px] p-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <BookOpen size={16} className="text-purple-500" />
              </div>
              <h3 className="font-semibold text-sm mt-4 text-[#1D1D1D]" style={{ fontFamily: "'Nunito', sans-serif" }}>Algebra Academy</h3>
              <p className="text-xs text-[#8F8F8F] mt-1" style={{ fontFamily: "'Nunito', sans-serif" }}>Level {algebraLevel}</p>
              <div className="flex items-center justify-between mt-4 text-xs text-[#8F8F8F]">
                <span style={{ fontFamily: "'Nunito', sans-serif" }}>{algebraProgress}%</span>
              </div>
              <div className="w-full h-2 bg-[#ECECEC] rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${algebraProgress}%` }}
                />
              </div>
            </div>

            {/* Card 2 — Fraction Home (unlocks at Algebra level 10) */}
            <div className="border border-[#E7E7E7] rounded-[20px] p-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${fractionUnlocked ? "bg-orange-100" : "bg-gray-100"}`}>
                <BookOpen size={16} className={fractionUnlocked ? "text-orange-500" : "text-gray-400"} />
              </div>
              <h3 className="font-semibold text-sm mt-4 text-[#1D1D1D]" style={{ fontFamily: "'Nunito', sans-serif" }}>Fraction Home</h3>
              <p className="text-xs text-[#8F8F8F] mt-1" style={{ fontFamily: "'Nunito', sans-serif" }}>Level {fractionLevel}</p>

              {fractionUnlocked ? (
                <>
                  <div className="flex items-center justify-between mt-4 text-xs text-[#8F8F8F]">
                    <span style={{ fontFamily: "'Nunito', sans-serif" }}>{fractionProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#ECECEC] rounded-full overflow-hidden mt-2">
                    <div
                      className="h-full bg-orange-400 rounded-full transition-all duration-700"
                      style={{ width: `${fractionProgress}%` }}
                    />
                  </div>
                  <button
                    onClick={() => router.push("/lesson?topic=fraction")}
                    className="w-full mt-3 h-7 rounded-full text-white text-xs font-bold cursor-pointer hover:brightness-90 transition-all"
                    style={{ background: "#F97316", fontFamily: "'Nunito', sans-serif" }}
                  >
                    {fractionProgress === 0 ? "Start" : "Continue"}
                  </button>
                </>
              ) : (
                <div className="mt-4 flex items-center gap-1.5">
                  <Lock size={12} className="text-[#ABABAB]" />
                  <span className="text-xs text-[#ABABAB]" style={{ fontFamily: "'Nunito', sans-serif" }}>Unlocks at Algebra level 10</span>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Recent Achievements ── */}
        <div className="mt-7">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-[20px] text-[#1D1D1D]" style={{ fontFamily: "'Nunito', sans-serif" }}>Recent Achievements</h2>
            <button className="text-sm text-[#8F8F8F] cursor-pointer hover:text-[#1D1D1D] transition-colors" style={{ fontFamily: "'Nunito', sans-serif" }}>View all</button>
          </div>

          <div
            className="flex gap-3 overflow-x-auto mt-4 pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {achievements.map((a) => (
              <div
                key={a.title}
                className={`min-w-36 border rounded-[20px] p-4 text-center transition-all ${
                  a.unlocked ? "border-[#E7E7E7] bg-white" : "border-[#ECECEC] bg-[#FAFAFA] opacity-70"
                }`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto ${a.unlocked ? a.bg : "bg-gray-200"}`}>
                  {a.unlocked ? a.icon : <Lock size={24} className="text-gray-500" />}
                </div>
                <h3 className="font-semibold text-sm mt-3 text-[#1D1D1D]" style={{ fontFamily: "'Nunito', sans-serif" }}>{a.title}</h3>
                <p className="text-xs text-[#8F8F8F] mt-1 leading-5" style={{ fontFamily: "'Nunito', sans-serif" }}>{a.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppShell>
  );
}