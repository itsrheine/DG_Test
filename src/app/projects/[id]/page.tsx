"use client";

import { useMemo, useState } from "react";

type IssueType = "repair" | "improve" | "monitor" | "safety";

export default function ProjectDetailPage() {
  const [projectName] = useState("Inspection Project #1");
  const [sectionName] = useState("Service Walks");

  const [materials, setMaterials] = useState<string[]>([]);
  const [condition, setCondition] = useState<string>("");
  const [issueFlags, setIssueFlags] = useState<Record<IssueType, boolean>>({
    repair: false,
    improve: false,
    monitor: false,
    safety: false,
  });
  const [notes, setNotes] = useState("");
  const [photoCount, setPhotoCount] = useState(0);

  const materialOptions = ["Concrete", "Brick", "Pavers", "Stone", "Asphalt"];
  const conditionOptions = ["Good", "Marginal", "Poor"];

  function toggleMaterial(value: string) {
    setMaterials((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  }

  function toggleIssueFlag(key: IssueType) {
    setIssueFlags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  const autoComments = useMemo(() => {
    const comments: string[] = [];

    if (materials.length > 0) {
      comments.push(`The service walks are primarily constructed of ${materials.join(", ")}.`);
    }

    if (condition === "Good") {
      comments.push("The visible walking surfaces appeared serviceable at the time of inspection.");
    }

    if (condition === "Marginal") {
      comments.push("The visible walking surfaces showed signs of wear and may need maintenance or repair.");
    }

    if (condition === "Poor") {
      comments.push("The visible walking surfaces showed significant deterioration and repair is recommended.");
    }

    if (issueFlags.safety) {
      comments.push("Uneven walking surfaces may present a trip hazard.");
    }

    if (issueFlags.repair) {
      comments.push("Repairs are recommended where defects or deterioration are present.");
    }

    if (issueFlags.improve) {
      comments.push("Improvements may help extend service life and overall usability.");
    }

    if (issueFlags.monitor) {
      comments.push("This area should be monitored for future movement, wear, or deterioration.");
    }

    if (photoCount > 0) {
      comments.push(`${photoCount} photo(s) attached for this section.`);
    }

    if (notes.trim()) {
      comments.push(notes.trim());
    }

    return comments;
  }, [materials, condition, issueFlags, notes, photoCount]);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Project</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{projectName}</h1>
          <p className="mt-2 text-slate-600">
            This is the beginning of your real inspection form and report generator.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Grounds</h2>
            <p className="mt-1 text-slate-600">{sectionName}</p>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Material
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {materialOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={materials.includes(option)}
                      onChange={() => toggleMaterial(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Condition
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                {conditionOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm"
                  >
                    <input
                      type="radio"
                      name="condition"
                      checked={condition === option}
                      onChange={() => setCondition(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Issue Type
              </h3>
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={issueFlags.repair}
                    onChange={() => toggleIssueFlag("repair")}
                  />
                  Repair
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={issueFlags.improve}
                    onChange={() => toggleIssueFlag("improve")}
                  />
                  Improve
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={issueFlags.monitor}
                    onChange={() => toggleIssueFlag("monitor")}
                  />
                  Monitor
                </label>

                <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={issueFlags.safety}
                    onChange={() => toggleIssueFlag("safety")}
                  />
                  Safety Issue
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                Inspector Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-slate-300 p-4"
                placeholder="Add section-specific notes here..."
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
                Photos
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  value={photoCount}
                  onChange={(e) => setPhotoCount(Number(e.target.value) || 0)}
                  className="w-28 rounded-xl border border-slate-300 px-3 py-2"
                />
                <span className="text-sm text-slate-600">
                  temporary placeholder for uploaded photo count
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Live Report Preview</h2>
            <p className="mt-1 text-slate-600">
              This is the beginning of the auto-generated report section.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Category
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900">Grounds</h3>

              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Section
              </p>
              <p className="mt-1 text-slate-900">{sectionName}</p>

              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
                Summary
              </p>

              {autoComments.length > 0 ? (
                <ul className="mt-3 space-y-3 text-slate-800">
                  {autoComments.map((comment, index) => (
                    <li key={index} className="rounded-xl bg-white p-3 shadow-sm">
                      {comment}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-slate-500">
                  No report text yet. Start checking boxes and adding notes.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}