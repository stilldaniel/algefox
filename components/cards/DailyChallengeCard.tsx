import { Target } from "lucide-react";

export default function DailyChallengeCard() {
  return (
    <div
      className="rounded-3xl p-5 text-white shadow-md flex items-center justify-between"
      style={{
        background:
          "linear-gradient(92.06deg, #7B34A3 1.33%, #5B1483 96.97%)",
      }}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
          <Target size={28} />
        </div>

        <div>
          <h2 className="font-bold text-lg">
            Daily Challenge
          </h2>

          <p className="text-sm text-white/80 mt-1">
            Earn up to 100 XP everyday
          </p>
        </div>
      </div>

      <button className="bg-white text-purple-700 font-semibold px-5 py-2 rounded-full shadow-sm">
        Go
      </button>
    </div>
  );
}