"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Project = {
  id: string;
  name: string;
  client: string;
  address: string;
  inspectionDate: string;
  createdAt: string;
};

export default function NewProjectPage() {
  const router = useRouter();

  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [inspectionDate, setInspectionDate] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const newProject: Project = {
      id: crypto.randomUUID(),
      name: projectName || "Untitled Project",
      client: clientName || "No Client",
      address: propertyAddress || "No Address",
      inspectionDate: inspectionDate || "",
      createdAt: new Date().toISOString(),
    };

    const existingProjects = localStorage.getItem("projects");
    const projects: Project[] = existingProjects ? JSON.parse(existingProjects) : [];

    projects.unshift(newProject);

    localStorage.setItem("projects", JSON.stringify(projects));

    router.push(`/projects/${newProject.id}`);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900">New Project</h1>
        <p className="mt-2 text-slate-600">
          Enter the property details to start a new inspection.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="1000 Quaint Rd"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Client Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client Name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Property Address
            </label>
            <input
              type="text"
              value={propertyAddress}
              onChange={(e) => setPropertyAddress(e.target.value)}
              placeholder="1000 Quaint Rd, Oakland, CA 94610"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Inspection Date
            </label>
            <input
              type="date"
              value={inspectionDate}
              onChange={(e) => setInspectionDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none"
            />
          </div>

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-5 py-3 text-white"
          >
            Create Project
          </button>
        </form>
      </div>
    </main>
  );
}