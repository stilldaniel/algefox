"use client";

import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { Sparkles, BookOpen, ShieldCheck, Zap } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <AppShell>
      <div className="px-5 py-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-[#E5E7EB]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[#111827]">Welcome to Algefox</h1>
              <p className="mt-2 text-sm text-[#6B7280]">Start your algebra journey with guided lessons, rewards, and friendly progress tracking.</p>
            </div>
            <div className="rounded-3xl bg-violet-100 p-3 text-violet-700">
              <Sparkles size={28} />
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#F8FAFC] p-4">
              <div className="flex items-center gap-3 text-[#4338CA]">
                <BookOpen size={20} />
                <h2 className="font-semibold">Learn step by step</h2>
              </div>
              <p className="mt-2 text-sm text-[#6B7280]">Each lesson builds on the last so you can master algebra with confidence.</p>
            </div>
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#FEF3C7] p-4">
              <div className="flex items-center gap-3 text-[#B45309]">
                <ShieldCheck size={20} />
                <h2 className="font-semibold">Safe for learners</h2>
              </div>
              <p className="mt-2 text-sm text-[#92400E]">No rush, no pressure. Track your progress and come back anytime.</p>
            </div>
            <div className="rounded-3xl border border-[#E5E7EB] bg-[#ECFDF5] p-4">
              <div className="flex items-center gap-3 text-[#047857]">
                <Zap size={20} />
                <h2 className="font-semibold">Fast feedback</h2>
              </div>
              <p className="mt-2 text-sm text-[#065F46]">Answer questions, get tips, and stay motivated with immediate results.</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="mt-8 w-full rounded-full bg-[#8A2BE2] px-5 py-4 text-white text-base font-bold shadow-md hover:brightness-95 transition-all"
          >
            Continue to dashboard
          </button>
        </div>
      </div>
    </AppShell>
  );
}
