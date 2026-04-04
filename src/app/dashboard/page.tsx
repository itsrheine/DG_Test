"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Project = {
  id: string;
  user_id: string;
  name: string;
  client: string;
  address: string;
  inspection_date: string;
  created_at: string;
  status: "draft" | "completed" | "archived";
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();
  const supabase = createClient();
  const [view, setView] = useState<"active" | "archived">("active");

useEffect(() => {
  async function loadProjects() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      setProjects(data as Project[]);
    }
  }

  loadProjects();
}, [router, supabase]);

async function handleArchive(projectId: string) {
  const { error } = await supabase
    .from("projects")
    .update({ status: "archived" })
    .eq("id", projectId);

  if (error) {
    console.error(error);
    return;
  }

  setProjects((prev) =>
    prev.map((project) =>
      project.id === projectId
        ? { ...project, status: "archived" as const }
        : project
    )
  );
}

async function handleDelete(projectId: string) {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) {
    console.error(error);
    return;
  }

  setProjects((prev) => prev.filter((project) => project.id !== projectId));
}

    const visibleProjects = projects.filter(
    (project) => project.status === view
    );

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Manage your home inspection projects.
            </p>
          </div>

          <Link
            href="/projects/new"
            className="rounded-xl bg-slate-900 px-5 py-3 text-white"
          >
            New Project
          </Link>
        </div>
<div className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white p-1">
  <button
    type="button"
    onClick={() => setView("active")}
    className={`rounded-lg px-4 py-2 text-sm ${
      view === "active"
        ? "bg-slate-900 text-white"
        : "text-slate-700"
    }`}
  >
    Active
  </button>

  <button
    type="button"
    onClick={() => setView("archived")}
    className={`rounded-lg px-4 py-2 text-sm ${
      view === "archived"
        ? "bg-slate-900 text-white"
        : "text-slate-700"
    }`}
  >
    Archived
  </button>
</div>
        <div className="mt-8 grid gap-4">
          {visibleProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
                {view === "active"
                    ? "No active projects yet. Create your first project."
                    : "No archived projects yet."}
            </div>
          ) : (
            visibleProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <Link href={`/projects/${project.id}`} className="block">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="space-y-0.5">
                        <h2 className="text-xl font-semibold text-slate-900 leading-tight">
                          {project.name}
                        </h2>

                        <p className="text-[11px] text-slate-500 font-mono">
                          #{project.id.slice(0, 8)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-slate-600 leading-tight">
                        Client: {project.client}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 leading-tight">
                        Address: {project.address}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 leading-tight">
                        Inspection Date: {project.inspection_date || "Not set"}
                      </p>
                    </div>

                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          project.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {project.status === "completed" ? "Completed" : "Draft"}
                      </span>
                  </div>
                </Link>

                <div className="mt-4 flex gap-2">
                {view === "active" ? (
                    <button
                    type="button"
                    onClick={() => handleArchive(project.id)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700"
                    >
                    Archive
                    </button>
                ) : (
                    <button
                    type="button"
                    onClick={async () => {
                      const { error } = await supabase
                        .from("projects")
                        .update({ status: "active" })
                        .eq("id", project.id);

                      if (error) {
                        console.error(error);
                        return;
                      }

                      setProjects((prev) =>
                        prev.map((p) =>
                          p.id === project.id ? { ...p, status: "draft" as const } : p
                        )
                      );
                    }}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700"
                    >
                    Restore
                    </button>
                )}

                <button
                    type="button"
                    onClick={() => handleDelete(project.id)}
                    className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-600"
                >
                    Delete
                </button>
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