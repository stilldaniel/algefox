"use client";

import {
  Home,
  BookOpen,
  Trophy,
  Medal,
  User,
} from "lucide-react";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    icon: Home,
    href: "/dashboard",
  },
  {
    icon: BookOpen,
    href: "/learn",
  },
  {
    icon: Trophy,
    href: "/leaderboard",
  },
  {
    icon: Medal,
    href: "/rewards",
  },
  {
    icon: User,
    href: "/profile",
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 w-full max-w-107.5 bg-white border-t h-20 flex items-center justify-around px-4">
      {navItems.map((item) => {
        const Icon = item.icon;

        const active = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center ${
              active
                ? "text-purple-600"
                : "text-gray-400"
            }`}
          >
            <Icon size={24} />
          </Link>
        );
      })}
    </div>
  );
}