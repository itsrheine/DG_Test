"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const items = [
    { href: "/dashboard", label: "Home", icon: "🏠" },
    { href: "/projects", label: "Projects", icon: "📁" },
    { href: "/notes", label: "Notes", icon: "📝" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-md justify-around py-3">
        {items.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center ${
                isActive ? "text-slate-900" : "text-slate-500"
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}