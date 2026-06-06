"use client";

import AppShell from "@/components/layout/AppShell";

import AchievementCard from "@/components/cards/AchievementCard";

import { achievements } from "@/data/achievements";

import { useQuizStore } from "@/store/quizStore";

export default function RewardsPage() {
  const { xp } = useQuizStore();

  return (
    <AppShell>
      <div className="p-4">
        <h1 className="text-2xl font-bold">
          Achievements
        </h1>

        <div className="mt-6 flex flex-col gap-4">
          {achievements.map(
            (achievement) => (
              <AchievementCard
                key={achievement.id}
                title={
                  achievement.title
                }
                description={
                  achievement.description
                }
                unlocked={
                  xp >=
                  achievement.xpRequired
                }
              />
            )
          )}
        </div>
      </div>
    </AppShell>
  );
}