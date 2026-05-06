"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/ThemeProvider";

const navItems = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/projects", label: "Projects", icon: "▣" },
  { href: "/notes", label: "Notes", icon: "✎" },
  { href: "/settings", label: "Settings", icon: "⚙" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        className={`flex w-full max-w-md items-center justify-between rounded-full px-3 py-2 shadow-2xl backdrop-blur ${
          theme === "dark"
            ? "border border-white/10 bg-neutral-900/90 text-white"
            : "border border-slate-200 bg-white text-slate-900"
        }`}
      >
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[72px] flex-col items-center rounded-full px-4 py-2 text-xs transition ${
                isActive
                  ? theme === "dark"
                    ? "bg-neutral-700 text-sky-400"
                    : "bg-slate-200 text-slate-900"
                  : theme === "dark"
                  ? "text-white"
                  : "text-slate-600"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}