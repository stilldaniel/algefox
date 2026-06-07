"use client";

import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { Moon, Bell, Lock, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);

  return (
    <AppShell>
      <div className="px-5 py-6">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
              <Lock size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-[#111827]">Settings</h1>
              <p className="mt-1 text-sm text-[#6B7280]">Customize your Algefox experience.</p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-[#E5E7EB] p-4 flex items-center justify-between gap-3 bg-[#F8FAFC]">
              <div>
                <p className="font-semibold text-[#111827]">Dark mode</p>
                <p className="text-sm text-[#6B7280]">Switch to a darker learning theme.</p>
              </div>
              <button
                onClick={() => setDarkMode((prev) => !prev)}
                className={`h-11 w-20 rounded-full transition ${darkMode ? "bg-[#4338CA] text-white" : "bg-white text-[#6B7280] shadow-sm"}`}
              >
                {darkMode ? "On" : "Off"}
              </button>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] p-4 flex items-center justify-between gap-3 bg-[#FEF3C7]">
              <div>
                <p className="font-semibold text-[#92400E]">Notifications</p>
                <p className="text-sm text-[#7C2D12]">Get alerts about progress and rewards.</p>
              </div>
              <button
                onClick={() => setNotifications((prev) => !prev)}
                className={`h-11 w-20 rounded-full transition ${notifications ? "bg-[#B45309] text-white" : "bg-white text-[#6B7280] shadow-sm"}`}
              >
                {notifications ? "On" : "Off"}
              </button>
            </div>

            <div className="rounded-3xl border border-[#E5E7EB] p-4 flex items-center justify-between gap-3 bg-[#ECFDF5]">
              <div>
                <p className="font-semibold text-[#047857]">Auto-save progress</p>
                <p className="text-sm text-[#065F46]">Keep your lesson progress saved automatically.</p>
              </div>
              <button
                onClick={() => setAutoSave((prev) => !prev)}
                className={`h-11 w-20 rounded-full transition ${autoSave ? "bg-[#059669] text-white" : "bg-white text-[#6B7280] shadow-sm"}`}
              >
                {autoSave ? "On" : "Off"}
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-3xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4 flex items-center gap-3 text-sm text-[#334155]">
            <RefreshCw size={18} />
            <span>Need more settings? You can add notifications, sound, and account preferences here.</span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
