"use client";

import AppShell from "@/components/layout/AppShell";
import { Trophy, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchLeaderboard } from "@/lib/leaderboard-utils";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  fullName: string;
  xp: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboard();

    // Refresh leaderboard every 60 seconds for real-time updates
    const interval = setInterval(loadLeaderboard, 60000);

    return () => clearInterval(interval);
  }, []);

  async function loadLeaderboard() {
    try {
      setLoading(true);
      const data = await fetchLeaderboard();
      setLeaderboard(data);
      setError(null);
    } catch (err) {
      console.error("Error loading leaderboard:", err);
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="px-5 py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-[#1D1D1D]">Leaderboard</h1>
            <p className="mt-2 text-sm text-[#6B7280]">See who's leading the Algefox classroom.</p>
          </div>
          <div className="rounded-3xl bg-violet-100 p-3 text-violet-700">
            <Trophy size={28} />
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
          <div className="grid grid-cols-[auto_1fr_auto] gap-4 border-b border-[#E5E7EB] py-3 text-xs uppercase tracking-[0.2em] text-[#9CA3AF]">
            <span>Rank</span>
            <span>Player</span>
            <span className="text-right">XP</span>
          </div>
          <div className="space-y-3 mt-3">
            {loading ? (
              <div className="text-center py-8 text-[#6B7280]">
                <p>Loading leaderboard...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="text-center py-8 text-[#6B7280]">
                <p>No players yet. Be the first to join!</p>
              </div>
            ) : (
              leaderboard.map((item) => (
                <div
                  key={item.userId}
                  className="grid grid-cols-[auto_1fr_auto] gap-4 items-center rounded-3xl bg-[#F8FAFC] px-4 py-4"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-sm font-bold text-[#4338CA]">
                    {item.rank}
                  </div>
                  <div>
                    <p className="font-semibold text-[#111827]">{item.name}</p>
                  </div>
                  <p className="text-right font-semibold text-[#111827]">{item.xp} XP</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-5 text-sm text-[#4B5563]">
          <div className="flex items-center gap-2 font-semibold text-[#374151]">
            <Sparkles size={18} />
            <span>Real-time rankings</span>
          </div>
          <p className="mt-2">The leaderboard updates every 60 seconds. Complete more quizzes to earn XP and climb the rankings!</p>
        </div>
      </div>
    </AppShell>
  );
}
