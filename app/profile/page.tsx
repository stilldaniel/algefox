"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { getBrowserSupabaseClient } from "@/lib/supabase-client";
import { User, Mail, Sparkles, Heart } from "lucide-react";
import { useQuizStore } from "@/store/quizStore";

export default function ProfilePage() {
  const router = useRouter();
  const { xp, streak, hearts } = useQuizStore();
  const [name, setName] = useState("Learner");
  const [email, setEmail] = useState("hello@algefox.com");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = getBrowserSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          router.push("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        setName(profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Learner");
        setEmail(user.email || "");
        setLoading(false);
      } catch (error) {
        console.error("Unable to load profile", error);
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  async function signOut() {
    const supabase = getBrowserSupabaseClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <AppShell>
      <div className="px-5 py-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-100 text-violet-700">
              <User size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#111827]">Your profile</h1>
              <p className="mt-1 text-sm text-[#6B7280]">Manage your account and learning progress.</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-3xl bg-[#F8FAFC] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Name</p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">{loading ? "Loading..." : name}</p>
            </div>
            <div className="rounded-3xl bg-[#F8FAFC] p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Email</p>
              <p className="mt-2 text-lg font-semibold text-[#111827]">{loading ? "Loading..." : email}</p>
            </div>
            <div className="rounded-3xl bg-[#F8FAFC] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#6B7280]">Stats</p>
                  <p className="mt-2 text-lg font-semibold text-[#111827]">XP {xp}</p>
                </div>
                <div className="flex items-center gap-2 text-[#F97316]">
                  <Sparkles size={20} />
                  <span>{streak}-day streak</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-[#EF4444]">
                <Heart size={18} />
                <span>{hearts} hearts remaining</span>
              </div>
            </div>
          </div>

          <button
            onClick={signOut}
            className="mt-6 w-full rounded-full bg-[#111827] px-5 py-4 text-white text-base font-bold hover:bg-[#373A40] transition-all"
          >
            Sign out
          </button>
        </div>
      </div>
    </AppShell>
  );
}
