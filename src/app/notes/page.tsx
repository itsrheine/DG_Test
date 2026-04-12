"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Plus, Search } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

type Note = {
  id: string;
  user_id: string;
  project_id: string | null;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

type Project = {
  id: string;
  name: string;
};

function formatRelativeTime(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 1000 / 60);

  if (minutes < 60) return `${Math.max(minutes, 1)}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 365) return `${days}d`;
  const years = Math.floor(days / 365);
  return `${years}y`;
}

export default function NotesPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  const [notes, setNotes] = useState<Note[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isDark = theme === "dark";

  const projectMap = useMemo(() => {
    return Object.fromEntries(
      projects.map((project) => [project.id, project.name])
    );
  }, [projects]);

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    if (!q) return notes;

    return notes.filter((note) => {
      const projectName = note.project_id ? projectMap[note.project_id] : "";

      return (
        (note.title || "").toLowerCase().includes(q) ||
        (note.content || "").toLowerCase().includes(q) ||
        (projectName || "").toLowerCase().includes(q) ||
        (note.project_id || "").slice(0, 8).toLowerCase().includes(q)
      );
    });
  }, [notes, projectMap, searchQuery]);

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const [
        { data: notesData, error: notesError },
        { data: projectsData, error: projectsError },
      ] = await Promise.all([
        supabase.from("notes").select("*").order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id, name")
          .order("created_at", { ascending: false }),
      ]);

      if (notesError) console.error(notesError);
      if (projectsError) console.error(projectsError);

      setNotes((notesData || []) as Note[]);
      setProjects((projectsData || []) as Project[]);
      setLoading(false);
    }

    loadData();
  }, [router, supabase]);

  async function handleNewNote() {
    setCreating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: user.id,
          project_id: null,
          title: "",
          content: "",
        },
      ])
      .select()
      .single();

    setCreating(false);

    if (error) {
      console.error(error);
      return;
    }

    router.push(`/notes/${data.id}`);
  }

  return (
    <main
      className={`min-h-screen pb-24 ${
        isDark ? "bg-black text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div
        className={`sticky top-0 z-20 ${
          isDark
            ? "bg-black/95 backdrop-blur"
            : "border-b border-slate-200 bg-white/95 backdrop-blur"
        }`}
      >
        <div className="mx-auto max-w-4xl px-4 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${
                isDark
                  ? "border border-white/10 bg-zinc-900 text-white"
                  : "border border-slate-200 bg-white text-slate-900"
              }`}
            >
              <ArrowLeft size={24} />
            </button>

            <div className="flex-1 px-4">
              <h1
                className={`text-3xl font-semibold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Notes
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleNewNote}
                disabled={creating}
                className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${
                  isDark
                    ? "border border-white/10 bg-zinc-900 text-white"
                    : "border border-slate-200 bg-white text-slate-900"
                } ${creating ? "opacity-60" : ""}`}
              >
                <Plus size={24} />
              </button>

              <button
                type="button"
                onClick={() => setShowSearch((prev) => !prev)}
                className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${
                  isDark
                    ? "border border-white/10 bg-zinc-900 text-white"
                    : "border border-slate-200 bg-white text-slate-900"
                }`}
              >
                <Search size={24} />
              </button>
            </div>
          </div>

          {showSearch && (
            <div className="mt-4">
              <div
                className={`flex items-center rounded-2xl px-4 py-3 ${
                  isDark
                    ? "border border-white/10 bg-zinc-900"
                    : "border border-slate-200 bg-white"
                }`}
              >
                <Search
                  size={18}
                  className={isDark ? "text-zinc-500" : "text-slate-400"}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes"
                  className={`ml-3 w-full bg-transparent outline-none ${
                    isDark
                      ? "text-white placeholder:text-zinc-500"
                      : "text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        {loading ? (
          <div
            className={`rounded-[28px] p-6 ${
              isDark
                ? "border border-white/10 bg-zinc-900 text-zinc-400"
                : "border border-slate-200 bg-white text-slate-500"
            }`}
          >
            Loading notes...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div
            className={`rounded-[28px] p-6 ${
              isDark
                ? "border border-white/10 bg-zinc-900 text-zinc-400"
                : "border border-slate-200 bg-white text-slate-500"
            }`}
          >
            No notes yet.
          </div>
        ) : (
          <div
            className={`overflow-hidden rounded-[28px] shadow-xl ${
              isDark
                ? "border border-white/10 bg-zinc-950"
                : "border border-slate-200 bg-white"
            }`}
          >
            {filteredNotes.map((note) => {
              const projectName = note.project_id ? projectMap[note.project_id] : null;

              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => router.push(`/notes/${note.id}`)}
                  className={`block w-full px-4 py-5 text-left transition ${
                    isDark
                      ? "border-b border-white/10 hover:bg-zinc-900"
                      : "border-b border-slate-200 hover:bg-slate-50"
                  } last:border-b-0`}
                >
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-500">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p
                            className={`text-sm ${
                              isDark ? "text-zinc-400" : "text-slate-500"
                            }`}
                          >
                            {projectName || "Unknown Project"} / #
                            {note.project_id ? note.project_id.slice(0, 8) : "-"}
                          </p>

                          <h2
                            className={`mt-2 text-2xl font-medium leading-tight ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {note.title || "Untitled Note"}
                          </h2>

                          {note.content ? (
                            <p
                              className={`mt-3 line-clamp-3 whitespace-pre-wrap text-sm ${
                                isDark ? "text-zinc-300" : "text-slate-600"
                              }`}
                            >
                              {note.content}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-col items-end">
                          <p
                            className={`text-xs ${
                              isDark ? "text-zinc-500" : "text-slate-400"
                            }`}
                          >
                            {formatRelativeTime(note.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}