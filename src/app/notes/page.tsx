"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";

type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function NotesPage() {
  const router = useRouter();
  const supabase = createClient();

  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  useEffect(() => {
    async function loadNotes() {
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setNotes((data || []) as Note[]);
      setLoading(false);
    }

    loadNotes();
  }, [router, supabase]);

async function handleAddNote(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (!title.trim() && !content.trim()) return;

  setSaving(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.push("/login");
    return;
  }

  if (editingNoteId) {
    const { data, error } = await supabase
      .from("notes")
      .update({
        title: title.trim() || "Untitled Note",
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingNoteId)
      .select()
      .single();

    if (error) {
      console.error(error);
      setSaving(false);
      return;
    }

    setNotes((prev) =>
      prev.map((note) => (note.id === editingNoteId ? (data as Note) : note))
    );
  } else {
    const { data, error } = await supabase
      .from("notes")
      .insert([
        {
          user_id: user.id,
          title: title.trim() || "Untitled Note",
          content: content.trim(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(error);
      setSaving(false);
      return;
    }

    setNotes((prev) => [data as Note, ...prev]);
  }

  setTitle("");
  setContent("");
  setEditingNoteId(null);
  setSaving(false);
}

function handleEditNote(note: Note) {
  setEditingNoteId(note.id);
  setTitle(note.title);
  setContent(note.content);
}

function handleCancelEdit() {
  setEditingNoteId(null);
  setTitle("");
  setContent("");
}

  async function handleDeleteNote(noteId: string) {
    const confirmDelete = confirm("Delete this note?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("notes").delete().eq("id", noteId);

    if (error) {
      console.error(error);
      return;
    }

    setNotes((prev) => prev.filter((note) => note.id !== noteId));
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <h1 className="text-2xl font-bold text-slate-900">Notes</h1>
          <p className="text-sm text-slate-500">
            General notes and reminders
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-6">
        <form
          onSubmit={handleAddNote}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Example: Follow up with client"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Note
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="Write your note here..."
              className="w-full rounded-xl border border-slate-300 p-4 outline-none"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-slate-900 px-4 py-3 text-white disabled:opacity-60"
            >
              {saving
                ? "Saving..."
                : editingNoteId
                ? "Update Note"
                : "Add Note"}
            </button>

            {editingNoteId ? (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="rounded-xl border border-slate-300 px-4 py-3 text-slate-700"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500 shadow-sm">
              Loading notes...
            </div>
          ) : notes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-500">
              No notes yet.
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {note.title}
                    </h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
                      {note.content}
                    </p>
                    <p className="mt-3 text-xs text-slate-400">
                      {new Date(note.created_at).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditNote(note)}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteNote(note.id)}
                      className="rounded-lg border border-red-300 px-3 py-2 text-xs text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </main>
  );
}