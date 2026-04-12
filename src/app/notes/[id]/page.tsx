"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Check, Ellipsis, Share } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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

export default function NoteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();
  const { theme } = useTheme();

  const noteId = params?.id as string;
  const isDark = theme === "dark";

  const [note, setNote] = useState<Note | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [showProjectPicker, setShowProjectPicker] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const hasLoadedRef = useRef(false);

  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    async function loadNote() {
      if (!noteId) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const [{ data: noteData, error: noteError }, { data: projectsData, error: projectsError }] =
        await Promise.all([
          supabase.from("notes").select("*").eq("id", noteId).single(),
          supabase
            .from("projects")
            .select("id, name")
            .order("created_at", { ascending: false }),
        ]);

      if (noteError) {
        console.error(noteError);
        router.push("/notes");
        return;
      }

      if (projectsError) {
        console.error(projectsError);
      }

      setNote(noteData as Note);
      setTitle(noteData.title || "");
      setContent(noteData.content || "");
      setSelectedProjectId(noteData.project_id || "");
      setProjects((projectsData || []) as Project[]);
      setLoading(false);
      hasLoadedRef.current = true;
    }

    loadNote();
  }, [noteId, router, supabase]);

  useEffect(() => {
    if (!loading) {
      bodyRef.current?.focus();
    }
  }, [loading]);

  useEffect(() => {
    if (!note || !hasLoadedRef.current) return;

    const timeout = setTimeout(async () => {
      const { error } = await supabase
        .from("notes")
        .update({
          title: title.trim(),
          content: content.trim(),
          project_id: selectedProjectId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", noteId);

      if (error) {
        console.error(error);
        setSaveMessage("Error saving");
        return;
      }

      setSaveMessage("Saved");
      setTimeout(() => setSaveMessage(""), 1200);
    }, 800);

    return () => clearTimeout(timeout);
  }, [title, content, selectedProjectId, note, noteId, supabase]);

  async function handleSave() {
    if (!noteId) return;

    setSaving(true);

    const { error } = await supabase
      .from("notes")
      .update({
        title: title.trim(),
        content: content.trim(),
        project_id: selectedProjectId || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", noteId);

    setSaving(false);

    if (error) {
      console.error(error);
      alert("Failed to save note");
      return;
    }

    router.push("/notes");
  }

  async function handleDelete() {
    if (!noteId) return;

    const confirmed = confirm("Delete this note?");
    if (!confirmed) return;

    setDeleting(true);

    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    setDeleting(false);

    if (error) {
      console.error(error);
      alert("Failed to delete note");
      return;
    }

    router.push("/notes");
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied");
    } catch (error) {
      console.error(error);
      alert("Could not copy link");
    }
  }

  function handleScan() {
    setShowMoreMenu(false);
    alert("Scan coming soon");
  }

  function handlePinNote() {
    setShowMoreMenu(false);
    alert("Pin note coming soon");
  }

  function handleLockNote() {
    setShowMoreMenu(false);
    alert("Lock note coming soon");
  }

  function handleFindInNote() {
    setShowMoreMenu(false);
    alert("Find in note coming soon");
  }

  if (loading) {
    return (
      <main
        className={`min-h-screen ${
          isDark ? "bg-black text-white" : "bg-slate-50 text-slate-900"
        }`}
      >
        <div className="mx-auto max-w-4xl px-4 pt-6">
          <p className={isDark ? "text-zinc-400" : "text-slate-500"}>Loading note...</p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`min-h-screen pb-10 ${
        isDark ? "bg-black text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-4xl px-4 pt-6">
        <div className="mb-8 flex items-center justify-between">
          <button
            type="button"
            onClick={() => router.push("/notes")}
            className={`flex h-14 w-14 items-center justify-center rounded-full shadow-sm ${
              isDark
                ? "border border-white/10 bg-zinc-900 text-white"
                : "border border-slate-200 bg-white text-slate-900"
            }`}
          >
            <ArrowLeft size={24} />
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center rounded-full px-4 py-2 shadow-sm ${
                isDark
                  ? "border border-white/10 bg-zinc-900"
                  : "border border-slate-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={handleShare}
                className={isDark ? "text-zinc-400" : "text-slate-500"}
                title="Share"
              >
                <Share size={22} />
              </button>

              <div
                className={`mx-4 h-6 w-px ${
                  isDark ? "bg-white/10" : "bg-slate-200"
                }`}
              />

              <button
                type="button"
                onClick={() => setShowMoreMenu(true)}
                className={isDark ? "text-zinc-400" : "text-slate-500"}
                title="More"
              >
                <Ellipsis size={22} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-400 text-black shadow-sm"
              title="Save"
            >
              <Check size={24} />
            </button>
          </div>
        </div>

        {saveMessage ? (
          <p
            className={`mb-4 text-sm ${
              isDark ? "text-zinc-500" : "text-slate-400"
            }`}
          >
            {saveMessage}
          </p>
        ) : null}

        <div className="pt-4">
          <div className="mb-6">
            <p className={`mb-2 text-sm ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
              Project
            </p>

            <button
              type="button"
              onClick={() => setShowProjectPicker(true)}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left ${
                isDark
                  ? "border border-white/10 bg-zinc-900 text-white"
                  : "border border-slate-200 bg-white text-slate-900"
              }`}
            >
              <span>
                {selectedProjectId
                  ? `${projects.find((p) => p.id === selectedProjectId)?.name || "Unknown Project"} / #${selectedProjectId.slice(0, 8)}`
                  : "No project selected"}
              </span>

              <span className={isDark ? "text-zinc-500" : "text-slate-400"}>›</span>
            </button>
          </div>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className={`w-full bg-transparent text-3xl font-semibold outline-none ${
              isDark
                ? "text-white placeholder:text-zinc-600"
                : "text-slate-900 placeholder:text-slate-400"
            }`}
          />

          <textarea
            ref={bodyRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start typing..."
            rows={18}
            className={`mt-6 w-full resize-none bg-transparent text-base leading-7 outline-none ${
              isDark
                ? "text-white placeholder:text-zinc-600"
                : "text-slate-900 placeholder:text-slate-400"
            }`}
          />
        </div>
      </div>

      {showProjectPicker && (
        <>
          <button
            type="button"
            onClick={() => setShowProjectPicker(false)}
            className="fixed inset-0 z-40 bg-black/40"
          />

          <div
            className={`fixed inset-x-0 bottom-0 z-50 rounded-t-[28px] p-4 shadow-2xl ${
              isDark ? "bg-zinc-950 text-white" : "bg-white text-slate-900"
            }`}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-slate-300 dark:bg-zinc-700" />

            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Select Project</h2>
              <button
                type="button"
                onClick={() => setShowProjectPicker(false)}
                className={isDark ? "text-zinc-400" : "text-slate-500"}
              >
                Done
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId("");
                  setShowProjectPicker(false);
                }}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left ${
                  isDark
                    ? "border border-white/10 bg-zinc-900"
                    : "border border-slate-200 bg-slate-50"
                }`}
              >
                <span>No project</span>
                {!selectedProjectId ? <span>✓</span> : null}
              </button>

              <div className="mt-3 space-y-3">
                {projects.map((project) => {
                  const selected = selectedProjectId === project.id;

                  return (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => {
                        setSelectedProjectId(project.id);
                        setShowProjectPicker(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left ${
                        isDark
                          ? "border border-white/10 bg-zinc-900"
                          : "border border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className={isDark ? "text-sm text-zinc-400" : "text-sm text-slate-500"}>
                          #{project.id.slice(0, 8)}
                        </p>
                      </div>

                      {selected ? <span>✓</span> : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
      {showProjectPicker && (
  <>
    ...project picker...
  </>
    )}
            {showMoreMenu && (   // ✅ NOW CORRECT POSITION
            <>
                <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="fixed inset-0 z-50 bg-black/40"
                />

                <div
                className={`fixed left-1/2 top-24 z-[60] w-[min(92vw,520px)] -translate-x-1/2 rounded-[28px] shadow-2xl ${
                    isDark ? "bg-zinc-950 text-white" : "bg-white text-slate-900"
                }`}
                >
                <div className="grid grid-cols-3 gap-4 px-6 pt-6 pb-5">
                    <button onClick={handleScan} className="flex flex-col items-center gap-2">
                    <span>📷</span>
                    <span className="text-sm">Scan</span>
                    </button>

                    <button onClick={handlePinNote} className="flex flex-col items-center gap-2">
                    <span>📌</span>
                    <span className="text-sm">Pin Note</span>
                    </button>

                    <button onClick={handleLockNote} className="flex flex-col items-center gap-2">
                    <span>🔒</span>
                    <span className="text-sm">Lock</span>
                    </button>
                </div>

                <div className={isDark ? "border-t border-white/10" : "border-t border-slate-200"} />

                <div className="px-6 py-3">
                    <button onClick={handleFindInNote} className="flex w-full gap-4 px-3 py-4">
                    🔎 Find in Note
                    </button>

                    <button
                    onClick={async () => {
                        setShowMoreMenu(false);
                        await handleDelete();
                    }}
                    className="flex w-full gap-4 px-3 py-4 text-red-500"
                    >
                    🗑️ Delete
                    </button>
                </div>
                </div>
            </>
            )}
    </main>
  );
}