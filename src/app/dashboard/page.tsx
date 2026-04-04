"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Project = {
  id: string;
  name: string;
  client: string;
  address: string;
  inspectionDate: string;
  createdAt: string;
  status: "active" | "archived";
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [view, setView] = useState<"active" | "archived">("active");

  useEffect(() => {
    const savedProjects = localStorage.getItem("projects");

    if (savedProjects) {
      const parsedProjects: Project[] = JSON.parse(savedProjects).map((p: any) => ({
        ...p,
        status: p.status || "active",
      }));

      setProjects(parsedProjects);
    }
  }, []);

function handleArchive(projectId: string) {
  const savedProjects = localStorage.getItem("projects");
  if (!savedProjects) return;

  const parsedProjects: Project[] = JSON.parse(savedProjects);

  const updatedProjects: Project[] = parsedProjects.map((project) =>
    project.id === projectId
      ? { ...project, status: "archived" as const }
      : project
  );

  localStorage.setItem("projects", JSON.stringify(updatedProjects));
  setProjects(updatedProjects);
}

function handleDelete(projectId: string) {
  const savedProjects = localStorage.getItem("projects");
  if (!savedProjects) return;

  const parsedProjects: Project[] = JSON.parse(savedProjects);

  const updatedProjects: Project[] = parsedProjects.filter(
    (project) => project.id !== projectId
  );

  localStorage.setItem("projects", JSON.stringify(updatedProjects));
  setProjects(updatedProjects);
}

    const visibleProjects = projects.filter(
    (project) => project.status === view
    );

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-2 text-slate-600">
              Manage your home inspection projects.
            </p>
          </div>

          <div className="mt-6 inline-flex ..."></div>
          <div className="mt-6 inline-flex ..."></div>

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
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <Link href={`/projects/${project.id}`} className="block">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">
                        {project.name}
                      </h2>
                      <p className="mt-1 text-sm text-slate-600">
                        Client: {project.client}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Address: {project.address}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Inspection Date: {project.inspectionDate || "Not set"}
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                      Draft
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
                    onClick={() => {
                        const updatedProjects: Project[] = projects.map((p) =>
                        p.id === project.id ? { ...p, status: "active" as const } : p
                        );

                        localStorage.setItem("projects", JSON.stringify(updatedProjects));
                        setProjects(updatedProjects);
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
    </main>
  );
}