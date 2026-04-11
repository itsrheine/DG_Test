"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";

function SettingsRow({
  href,
  label,
  value,
  theme,
}: {
  href?: string;
  label: string;
  value?: string;
  theme: "light" | "dark";
}) {
  const content = (
    <div
      className={`flex items-center justify-between py-5 last:border-b-0 ${
        theme === "dark" ? "border-b border-white/10" : "border-b border-slate-200"
      }`}
    >
      <span
        className={`text-[17px] ${
          theme === "dark" ? "text-white" : "text-slate-900"
        }`}
      >
        {label}
      </span>

      <div
        className={`flex items-center gap-2 text-[17px] ${
          theme === "dark" ? "text-zinc-400" : "text-slate-500"
        }`}
      >
        {value ? <span>{value}</span> : null}
        <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>
          ›
        </span>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

function SettingsButtonRow({
  label,
  value,
  onClick,
  theme,
}: {
  label: string;
  value?: string;
  onClick: () => void;
  theme: "light" | "dark";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between py-5 text-left last:border-b-0 ${
        theme === "dark" ? "border-b border-white/10" : "border-b border-slate-200"
      }`}
    >
      <span
        className={`text-[17px] ${
          theme === "dark" ? "text-white" : "text-slate-900"
        }`}
      >
        {label}
      </span>

      <div
        className={`flex items-center gap-2 text-[17px] ${
          theme === "dark" ? "text-zinc-400" : "text-slate-500"
        }`}
      >
        {value ? <span>{value}</span> : null}
        <span className={theme === "dark" ? "text-zinc-500" : "text-slate-400"}>
          ›
        </span>
      </div>
    </button>
  );
}

function SettingsCard({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: "light" | "dark";
}) {
  return (
    <div
      className={`rounded-[28px] px-5 shadow-xl backdrop-blur ${
        theme === "dark"
          ? "border border-white/5 bg-zinc-900/90"
          : "border border-slate-200 bg-white"
      }`}
    >
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme, toggleTheme } = useTheme();

  async function handleLogout() {
    if (!confirm("Are you sure you want to log out?")) return;

    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main
      className={`min-h-screen pb-32 ${
        theme === "dark" ? "bg-black text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-md px-4 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl shadow-lg ${
              theme === "dark"
                ? "border border-white/10 bg-zinc-900 text-white"
                : "border border-slate-200 bg-white text-slate-900"
            }`}
          >
            ‹
          </button>

          <h1
            className={`text-3xl font-semibold tracking-tight ${
              theme === "dark" ? "text-white" : "text-slate-900"
            }`}
          >
            Settings
          </h1>

          <div className="w-14" />
        </div>

        <div className="space-y-6">
          <SettingsCard theme={theme}>
            <SettingsRow
              href="/settings/account"
              label="Account"
              value="Inspector Info"
              theme={theme}
            />
            <SettingsRow
              href="/settings/company"
              label="Company"
              value="Branding"
              theme={theme}
            />
            <SettingsRow
              href="/settings/report"
              label="Report"
              value="Header & Footer"
              theme={theme}
            />
          </SettingsCard>

          <SettingsCard theme={theme}>
            <SettingsButtonRow
              label="Appearance"
              value={theme === "dark" ? "Dark" : "Light"}
              onClick={toggleTheme}
              theme={theme}
            />
            <SettingsRow
              href="/settings/notifications"
              label="Notifications"
              value="Off"
              theme={theme}
            />
            <SettingsRow
              href="/settings/billing"
              label="Billing"
              value="Coming Soon"
              theme={theme}
            />
          </SettingsCard>

          <SettingsCard theme={theme}>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full py-5 text-left text-[17px] text-red-400"
            >
              Log Out
            </button>
          </SettingsCard>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}