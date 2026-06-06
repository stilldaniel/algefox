"use client";

import { ReactNode } from "react";
import BottomNav from "./BottomNav";

type Props = {
  children: ReactNode;
};

export default function AppShell({ children }: Props) {
  return (
    <main className="min-h-screen bg-[#f5f5f5] flex justify-center">
      <div className="w-full max-w-107.5 bg-white min-h-screen relative pb-24">
        {children}

        <BottomNav />
      </div>
    </main>
  );
}