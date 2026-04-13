"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { loadAllSections } from "@/lib/inspection-sections";
import { useToast } from "@/components/ToastProvider";

type Project = {
  id: string;
  user_id: string;
  name: string;
  client: string;
  address: string;
  inspection_date: string;
  due_date: string | null;
  created_at: string;
  status: "draft" | "completed" | "archived";
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();
  const supabase = createClient();
  const { showToast } = useToast();

  const [projectProgress, setProjectProgress] = useState<
    Record<string, { completed: number; total: number; percent: number }>
  >({});
  const [view, setView] = useState<"current" | "archived">("current");

  const totalSections = 4;
  const freePlanLimit = 3;

  const activeProjectCount = projects.filter(
    (project) => project.status !== "archived"
  ).length;

  const hasReachedFreeLimit = activeProjectCount >= freePlanLimit;

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
        const projectData = data as Project[];
        setProjects(projectData);

        const now = new Date();

        projectData.forEach((project) => {
          if (!project.due_date) return;

          const due = new Date(project.due_date);
          const diff = due.getTime() - now.getTime();
          const hoursLeft = diff / (1000 * 60 * 60);

          if (hoursLeft > 0 && hoursLeft <= 24) {
            showToast(`"${project.name}" is due within 24 hours`, "info");
          }

          if (hoursLeft <= 0) {
            showToast(`"${project.name}" is overdue`, "error");
          }
        });

        const progressMap: Record<
          string,
          { completed: number; total: number; percent: number }
        > = {};

        for (const project of projectData) {
          const rows = await loadAllSections(project.id);

          const completedSections = rows.filter((row: any) => {
            const sectionData = row.data;

            return (
              sectionData?.materials?.length > 0 ||
              sectionData?.condition ||
              Object.values(sectionData?.issueFlags || {}).some(Boolean) ||
              sectionData?.notes?.trim() ||
              sectionData?.photos?.length > 0
            );
          }).length;

          progressMap[project.id] = {
            completed: completedSections,
            total: totalSections,
            percent: Math.round((completedSections / totalSections) * 100),
          };
        }

        setProjectProgress(progressMap);
      }
    }

    loadProjects();
  }, [router, supabase, showToast]);

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

  const visibleProjects = projects.filter((project) =>
    view === "archived"
      ? project.status === "archived"
      : project.status === "draft" || project.status === "completed"
  );

  const isNearFreeLimit =
  !hasReachedFreeLimit && activeProjectCount === freePlanLimit - 1;

  return (
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-900 dark:bg-black dark:text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Dashboard
            </h1>
            <p className="mt-2 text-slate-600 dark:text-zinc-400">
              Manage your home inspection projects.
            </p>
          </div>

          {hasReachedFreeLimit ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-zinc-400">
                    Free Plan
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                    You’ve reached your project limit
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
                    {activeProjectCount} of {freePlanLimit} active projects used. Upgrade
                    to create more projects and unlock future premium features.
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
                  >
                    Upgrade Plan
                  </Link>

                  <Link
                    href="/pricing"
                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    View Pricing
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <>

            <div className="flex gap-3">
              <Link
                href="/projects/new"
                className="flex-1 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:opacity-90 dark:bg-white dark:text-black"
              >
                New Project
              </Link>

              <Link
                href="/pricing"
                className={`flex-1 inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition ${
                  isNearFreeLimit
                    ? "border border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-500/20"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {isNearFreeLimit ? "Upgrade Soon" : "Pricing"}
              </Link>
            </div>

            <div>
              <p className="text-sm text-slate-600 dark:text-zinc-400">
                Free Plan: {activeProjectCount} of {freePlanLimit} active projects used
              </p>

              <div className="mt-2 h-2 w-full rounded-full bg-slate-200 dark:bg-zinc-800">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isNearFreeLimit
                      ? "bg-amber-500"
                      : "bg-slate-900 dark:bg-white"
                  }`}
                  style={{
                    width: `${Math.min((activeProjectCount / freePlanLimit) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
            </>
          )}
        </div>

        {isNearFreeLimit ? (
          <div className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm dark:border-amber-500/20 dark:bg-amber-500/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                  Free Plan
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
                  You’re almost at your project limit
                </h2>
                <p className="mt-2 text-sm text-slate-600 dark:text-zinc-400">
                  {activeProjectCount} of {freePlanLimit} active projects used. Upgrade
                  now so you can keep creating projects without interruption.
                </p>
              </div>

              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-white px-5 py-3 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-400/30 dark:bg-zinc-900 dark:text-amber-300 dark:hover:bg-zinc-800"
              >
                View Plans
              </Link>
            </div>
          </div>
        ) : null}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800/80">
          <button
            type="button"
            onClick={() => setView("current")}
            className={`rounded-lg px-4 py-2 text-sm ${
              view === "current"
                ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                : "text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            Active
          </button>

          <button
            type="button"
            onClick={() => setView("archived")}
            className={`rounded-lg px-4 py-2 text-sm ${
              view === "archived"
                ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                : "text-slate-700 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            Archived
          </button>
        </div>

        <div className="mt-8 grid gap-4">
          {visibleProjects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-500 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-400">
              {view === "current"
                ? "No active projects yet. Create your first project."
                : "No archived projects yet."}
            </div>
          ) : (
            visibleProjects.map((project) => (
              <div
                key={project.id}
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-zinc-900 dark:hover:bg-zinc-800/80"
              >
                <Link href={`/projects/${project.id}`} className="block">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="space-y-0.5">
                        <h2 className="text-xl font-semibold leading-tight text-slate-900 dark:text-white">
                          {project.name}
                        </h2>

                        <p className="font-mono text-[11px] text-slate-500 dark:text-zinc-500">
                          #{project.id.slice(0, 8)}
                        </p>
                      </div>

                      <p className="mt-1 text-sm leading-tight text-slate-600 dark:text-zinc-400">
                        Client: {project.client}
                      </p>

                      <p className="mt-1 text-sm leading-tight text-slate-600 dark:text-zinc-400">
                        Address: {project.address}
                      </p>

                      <p className="mt-1 text-sm leading-tight text-slate-600 dark:text-zinc-400">
                        Inspection Date: {project.inspection_date || "Not set"}
                      </p>

                      <p className="mt-1 text-sm leading-tight text-slate-600 dark:text-zinc-400">
                        Due Date: {project.due_date || "Not set"}
                      </p>

                      <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
                        {projectProgress[project.id]
                          ? `${projectProgress[project.id].completed} / ${projectProgress[project.id].total} sections complete`
                          : "0 / 4 sections complete"}
                      </p>

                      <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800">
                        <div
                          className="h-2 rounded-full bg-slate-900 dark:bg-white"
                          style={{
                            width: `${
                              projectProgress[project.id]
                                ? projectProgress[project.id].percent
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        project.status === "completed"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
                      }`}
                    >
                      {project.status === "completed" ? "Completed" : "Draft"}
                    </span>
                  </div>
                </Link>

                <div className="mt-4 flex gap-2">
                  {view === "current" ? (
                    <button
                      type="button"
                      onClick={() => handleArchive(project.id)}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={async () => {
                        const { error } = await supabase
                          .from("projects")
                          .update({ status: "draft" })
                          .eq("id", project.id);

                        if (error) {
                          console.error(error);
                          return;
                        }

                        setProjects((prev) =>
                          prev.map((p) =>
                            p.id === project.id
                              ? { ...p, status: "draft" as const }
                              : p
                          )
                        );
                      }}
                      className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Restore
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(project.id)}
                    className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-900/20"
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