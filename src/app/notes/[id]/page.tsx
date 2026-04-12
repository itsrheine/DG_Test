"use client";

import { useEffect, useState } from "react";
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
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectID, setSelectedProjectId] = useState<string>("");

  const [saveMessage, setSaveMessage] = useState("");
  const [showProjectPicker, setShowProjectPicker] = useState(false);

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

      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();

      if (error) {
        console.error(error);
        router.push("/notes");
        return;
      }

      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: false });

      if (projectsError) {
        console.error(projectsError);
      } else {
        setProjects(projectsData || []);
      }

      setNote(data as Note);
      setTitle(data.title || "");
      setContent(data.content || "");
      setSelectedProjectId(data.project_id || "");
      setLoading(false);
    }

    loadNote();
  }, [noteId, router, supabase]);

    useEffect(() => {
    if (!note) return;

    const timeout = setTimeout(async () => {
        const { error } = await supabase
        .from("notes")
        .update({
            title: title.trim(),
            content: content.trim(),
            project_id: selectedProjectID || null,
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
    }, [title, content, selectedProjectID, note, noteId, supabase]);  

  async function handleSave() {
    if (!noteId) return;

    setSaving(true);

    const { error } = await supabase
      .from("notes")
      .update({
        title: title.trim(),
        content: content.trim(),
        project_id: selectedProjectID || null,
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
                onClick={handleDelete}
                disabled={deleting}
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

        <div className="pt-8">
            <div className="mb-6">
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
                            {selectedProjectID
                                ? `${projects.find((p) => p.id === selectedProjectID)?.name || "Unknown Project"} / #${selectedProjectID.slice(0, 8)}`
                                : "No project selected"}
                        </span>

                        <span className={isDark ? "text-zinc-500" : "text-slate-400"}>›</span>
                    </button>
                </div>
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
            {!selectedProjectID ? <span>✓</span> : null}
            </button>

            <div className="mt-3 space-y-3">
            {projects.map((project) => {
                const selected = selectedProjectID === project.id;

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
    </main>
  );
}