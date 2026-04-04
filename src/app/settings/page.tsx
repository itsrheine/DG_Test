"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import BottomNav from "@/components/BottomNav";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>

        <div className="mt-6 space-y-4">
          <button
            onClick={handleLogout}
            className="w-full rounded-2xl border border-red-300 px-4 py-3 text-red-600"
          >
            Log Out
          </button>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}