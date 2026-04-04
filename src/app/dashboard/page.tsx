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
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const savedProjects = localStorage.getItem("projects");
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
  }, []);

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

          <Link
            href="/projects/new"
            className="rounded-xl bg-slate-900 px-5 py-3 text-white"
          >
            New Project
          </Link>
        </div>

        <div className="mt-8 grid gap-4">
          {projects.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-slate-500">
              No projects yet. Create your first project.
            </div>
          ) : (
            projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
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
            ))
          )}
        </div>
      </div>
    </main>
  );
}