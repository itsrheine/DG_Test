"use client";

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";

export default function ProjectsPage() {
  const supabase = createClient();
  const [dueDate, setDueDate] = useState("");

  async function handleUpdateDueDate(projectId: string) {
    const { error } = await supabase
      .from("projects")
      .update({ due_date: dueDate || null })
      .eq("id", projectId);

    if (error) {
      console.error(error);
      return;
    }

    console.log("Due date updated");
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
        <p className="mt-2 text-slate-600">Projects page coming soon.</p>

        <div className="mt-6 max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Due Date
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none"
          />

          <button
            type="button"
            onClick={() => handleUpdateDueDate("REPLACE_WITH_PROJECT_ID")}
            className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-white"
          >
            Save Due Date
          </button>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}