"use client";

import AppShell from "@/components/layout/AppShell";
import { Trophy, Medal, Sparkles } from "lucide-react";

const leaderboard = [
  { rank: 1, name: "Ava", score: 1480, badge: "Champion" },
  { rank: 2, name: "Milo", score: 1320, badge: "Rising Star" },
  { rank: 3, name: "Noah", score: 1240, badge: "Math Whiz" },
  { rank: 4, name: "Luna", score: 1175, badge: "Sharp Solver" },
  { rank: 5, name: "Zoe", score: 1080, badge: "Quiz Hero" },
];

export default function LeaderboardPage() {
  return (
    <AppShell>
      <div className="px-5 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#1D1D1D]">Leaderboard</h1>
            <p className="mt-2 text-sm text-[#6B7280]">See who’s leading the Algefox classroom.</p>
          </div>
          <div className="rounded-3xl bg-violet-100 p-3 text-violet-700">
            <Trophy size={28} />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 border-b border-[#E5E7EB] py-3 text-xs uppercase tracking-[0.2em] text-[#9CA3AF]">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">Points</span>
          </div>
          <div className="space-y-3 mt-3">
            {leaderboard.map((item) => (
              <div key={item.rank} className="grid grid-cols-[auto_1fr_auto] gap-4 items-center rounded-3xl bg-[#F8FAFC] px-4 py-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-sm font-bold text-[#4338CA]">
                  {item.rank}
                </div>
                <div>
                  <p className="font-semibold text-[#111827]">{item.name}</p>
                  <p className="text-sm text-[#6B7280]">{item.badge}</p>
                </div>
                <p className="text-right font-semibold text-[#111827]">{item.score}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-5 text-sm text-[#4B5563]">
          <div className="flex items-center gap-2 font-semibold text-[#374151]">
            <Sparkles size={18} />
            <span>Weekly challenge</span>
          </div>
          <p className="mt-2">Earn bonus points by completing 3 lessons this week and climb the leaderboard.</p>
        </div>
      </div>
    </AppShell>
  );
}
