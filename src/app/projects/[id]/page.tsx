"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";

type IssueType = "repair" | "improve" | "monitor" | "safety";

type Project = {
  id: string;
  user_id: string;
  name: string;
  client: string;
  address: string;
  inspection_date: string;
  created_at: string;
  status: "active" | "archived";
};

type SavedSectionData = {
  materials: string[];
  condition: string;
  issueFlags: Record<IssueType, boolean>;
  notes: string;
  photos: any[];
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const supabase = createClient();

  const params = useParams();
  const projectId = params?.id as string;

  const [copied, setCopied] = useState(false);

  const [project, setProject] = useState<Project | null>(null);
    const sections = [
    "Service Walks",
    "Driveway",
    "Porch",
    "Stairs",
    ];

  const [sectionName, setSectionName] = useState(sections[0]);
  const storageKey = projectId
    ? `project-${projectId}-${sectionName}`
    : `project-temp-${sectionName}`;

    const [materials, setMaterials] = useState<string[]>([]);
  const [condition, setCondition] = useState<string>("");
  const [issueFlags, setIssueFlags] = useState<Record<IssueType, boolean>>({
    repair: false,
    improve: false,
    monitor: false,
    safety: false,
  });
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<any[]>([]);

  const [loaded, setLoaded] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const [isSaving, setIsSaving] = useState(false);

  const materialOptions = ["Concrete", "Brick", "Pavers", "Stone", "Asphalt"];
  const conditionOptions = ["Good", "Marginal", "Poor"];

useEffect(() => {
  async function loadProject() {
    if (!projectId) return;

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setProject(data);
  }

  loadProject();
}, [projectId, supabase]);

useEffect(() => {
  if (!projectId) return;

  const saved = localStorage.getItem(storageKey);

  if (saved) {
    const data = JSON.parse(saved);

    setMaterials(data.materials || []);
    setCondition(data.condition || "");
    setIssueFlags(
      data.issueFlags || {
        repair: false,
        improve: false,
        monitor: false,
        safety: false,
      }
    );
    setNotes(data.notes || "");
    setPhotos(data.photos || []);
  } else {
    setMaterials([]);
    setCondition("");
    setIssueFlags({
      repair: false,
      improve: false,
      monitor: false,
      safety: false,
    });
    setNotes("");
    setPhotos([]);
  }

  setLoaded(true);
}, [projectId, storageKey]);

function handleSave() {
  if (!projectId) return;

  const data = {
    materials,
    condition,
    issueFlags,
    notes,
    photos,
  };

  localStorage.setItem(storageKey, JSON.stringify(data));

  setSaveMessage("Saved");

  setTimeout(() => {
    setIsSaving(false);
    setSaveMessage("");
  }, 1500);
}

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
      comments.push(
        `The service walks are primarily constructed of ${materials.join(", ")}.`
      );
    }

    if (condition === "Good") {
      comments.push(
        "The visible walking surfaces appeared serviceable at the time of inspection."
      );
    }

    if (condition === "Marginal") {
      comments.push(
        "The visible walking surfaces showed signs of wear and may need maintenance or repair."
      );
    }

    if (condition === "Poor") {
      comments.push(
        "The visible walking surfaces showed significant deterioration and repair is recommended."
      );
    }

    if (issueFlags.safety) {
      comments.push("Uneven walking surfaces may present a trip hazard.");
    }

    if (issueFlags.repair) {
      comments.push(
        "Repairs are recommended where defects or deterioration are present."
      );
    }

    if (issueFlags.improve) {
      comments.push(
        "Improvements may help extend service life and overall usability."
      );
    }

    if (issueFlags.monitor) {
      comments.push(
        "This area should be monitored for future movement, wear, or deterioration."
      );
    }

    if (photos.length > 0) {
      comments.push(`${photos.length} photo(s) attached for this section.`);
    }

    if (notes.trim()) {
      comments.push(notes.trim());
    }

    return comments;
  }, [materials, condition, issueFlags, notes, photos]);
const fullReportSections = sections
  .map((section) => {
    const key = projectId
      ? `project-${projectId}-${section}`
      : `project-temp-${section}`;

    const saved = localStorage.getItem(key);
    if (!saved) return null;

    const data: SavedSectionData = JSON.parse(saved);

    const comments = buildComments(section, data);

    const hasContent =
      data.materials.length > 0 ||
      data.condition ||
      Object.values(data.issueFlags).some(Boolean) ||
      data.notes.trim() ||
      data.photos.length > 0;

    if (!hasContent) return null;

    return {
      section,
      comments,
      photos: data.photos,
    };
  })
  .filter(Boolean);
function materialButtonClass(selected: boolean) {
  return `rounded-2xl border px-4 py-3 text-sm font-medium transition ${
    selected
      ? "border-slate-900 bg-slate-900 text-white"
      : "border-slate-300 bg-white text-slate-800"
  }`;
}

function conditionButtonClass(selected: boolean) {
  return `rounded-2xl border px-4 py-3 text-sm font-medium transition ${
    selected
      ? "border-blue-600 bg-blue-600 text-white"
      : "border-slate-300 bg-white text-slate-800"
  }`;
}

function issueButtonClass(selected: boolean) {
  return `rounded-2xl border px-4 py-3 text-sm font-medium transition ${
    selected
      ? "border-amber-500 bg-amber-500 text-white"
      : "border-slate-300 bg-white text-slate-800"
  }`;
}
function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  Array.from(files).forEach((file) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setPhotos((prev) => [
  ...prev,
  { url: result, caption: "" }
]);
      }
    };

    reader.readAsDataURL(file);
  });

  event.target.value = "";
}

function removePhoto(indexToRemove: number) {
  setPhotos((prev) => prev.filter((_, index) => index !== indexToRemove));
}  

function buildComments(section: string, data: SavedSectionData) {
  const comments: string[] = [];

  if (data.materials.length > 0) {
    comments.push(
      `The ${section.toLowerCase()} are primarily constructed of ${data.materials.join(", ")}.`
    );
  }

  if (data.condition === "Good") {
    comments.push(
      "The visible surfaces appeared serviceable at the time of inspection."
    );
  }

  if (data.condition === "Marginal") {
    comments.push(
      "The visible surfaces showed signs of wear and may need maintenance or repair."
    );
  }

  if (data.condition === "Poor") {
    comments.push(
      "The visible surfaces showed significant deterioration and repair is recommended."
    );
  }

  if (data.issueFlags.safety) {
    comments.push("A safety concern was noted in this section.");
  }

  if (data.issueFlags.repair) {
    comments.push(
      "Repairs are recommended where defects or deterioration are present."
    );
  }

  if (data.issueFlags.improve) {
    comments.push(
      "Improvements may help extend service life and overall usability."
    );
  }

  if (data.issueFlags.monitor) {
    comments.push(
      "This area should be monitored for future movement, wear, or deterioration."
    );
  }

  if (data.photos.length > 0) {
    comments.push(`${data.photos.length} photo(s) attached for this section.`);
  }

  if (data.notes.trim()) {
    comments.push(data.notes.trim());
  }

  return comments;
}

async function handleCopyProjectId() {
  if (!projectId) return;

  await navigator.clipboard.writeText(projectId.slice(0, 8));
  setCopied(true);

  setTimeout(() => {
    setCopied(false);
  }, 1200);
}

  return (
    <main className="min-h-screen bg-slate-50 pb-20">
          <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

      <button
        onClick={() => router.push("/dashboard")}
        className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
      >
        ← Back
      </button>

      <div className="text-center">
        <p className="text-sm font-semibold text-slate-900">
          {project?.name || "Inspection Project"}
        </p>
        <p className="text-xs text-slate-500">Project Details</p>
      </div>

<button
  onClick={handleSave}
  className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white"
>
  {isSaving ? "Saving..." : saveMessage ? "Saved ✓" : "Save"}
</button>
    </div>
  </div>
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500">
                  Project <span className="font-mono">#{projectId?.slice(0, 8)}</span>
                </p>

                <h1 className="text-xl font-semibold leading-tight text-slate-900">
                  {project?.name || "Inspection Project"}
                </h1>
              </div>

              <div className="mt-3 space-y-[2px]">
                <p className="text-sm leading-tight text-slate-600">
                  Client: {project?.client || "No client yet"}
                </p>
                <p className="text-sm leading-tight text-slate-600">
                  Address: {project?.address || "No address yet"}
                </p>
                <p className="text-sm leading-tight text-slate-600">
                  Inspection Date: {project?.inspection_date || "No inspection date yet"}
                </p>
              </div>
            </div>

            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              Draft
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2">
          <section className="rounded-2xl border bg-white p-6 shadow-sm w-full">
            <h2 className="text-2xl font-semibold text-slate-900">Grounds</h2>
            <p className="mt-1 text-slate-600">{sectionName}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                {sections.map((section) => (
                    <button
                    key={section}
                    onClick={() => setSectionName(section)}
                    className={`rounded-xl px-4 py-2 text-sm ${
                        sectionName === section
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-300 text-slate-700"
                    }`}
                    >
                    {section}
                    </button>
                ))}
                </div>
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Material
              </h3>
            <div className="mt-3 flex flex-wrap gap-3">
                {materialOptions.map((option) => {
                    const selected = materials.includes(option);

                    return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => toggleMaterial(option)}
                        className={materialButtonClass(selected)}
                    >
                        {option}
                    </button>
                    );
                })}
                </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Condition
              </h3>
                <div className="mt-3 flex flex-wrap gap-3">
                {conditionOptions.map((option) => {
                    const selected = condition === option;

                    return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => setCondition(option)}
                        className={conditionButtonClass(selected)}
                    >
                        {option}
                    </button>
                    );
                })}
                </div>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Issue Type
              </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
                type="button"
                onClick={() => toggleIssueFlag("repair")}
                className={issueButtonClass(issueFlags.repair)}
            >
                🔧 Repair
            </button>

            <button
                type="button"
                onClick={() => toggleIssueFlag("improve")}
                className={issueButtonClass(issueFlags.improve)}
            >
                📈 Improve
            </button>

            <button
                type="button"
                onClick={() => toggleIssueFlag("monitor")}
                className={issueButtonClass(issueFlags.monitor)}
            >
                👁 Monitor
            </button>

            <button
                type="button"
                onClick={() => toggleIssueFlag("safety")}
                className={issueButtonClass(issueFlags.safety)}
            >
                ⚠️ Safety
            </button>
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
                className="w-full rounded-2xl border border-slate-300 p-4 text-base"
                placeholder="Add section-specific notes here..."
              />
            </div>

<div className="mt-6">
  <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500">
    Photos
  </label>

  <label className="inline-flex cursor-pointer items-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800">
    📸 Upload Photos
    <input
      type="file"
      accept="image/*"
      multiple
      onChange={handlePhotoUpload}
      className="hidden"
    />
  </label>

  {photos.length > 0 ? (
    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((photo, index) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-2"
        >
          <img
            src={photo.url}
            alt={`Uploaded photo ${index + 1}`}
            className="h-32 w-full rounded-xl object-cover"
          />
          <input
  type="text"
  value={photo.caption}
  onChange={(e) => {
    const newPhotos = [...photos];
    newPhotos[index].caption = e.target.value;
    setPhotos(newPhotos);
  }}
  placeholder="Add caption..."
  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
/>
          <button
            type="button"
            onClick={() => removePhoto(index)}
            className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  ) : (
    <p className="mt-3 text-sm text-slate-500">
      No photos uploaded yet.
    </p>
  )}
</div>
            <div className="mt-6 flex items-center gap-3">
            <button
                type="button"
                onClick={handleSave}
                className="rounded-xl bg-slate-900 px-5 py-3 text-white"
            >
                Save Section
            </button>

            {saveMessage ? (
                <span className="text-sm text-green-600">{saveMessage}</span>
            ) : null}
            </div>

          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              Live Report Preview
            </h2>
            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
  <h3 className="text-xl font-bold text-slate-900">Full Report Preview</h3>
  <p className="mt-1 text-sm text-slate-600">
    Combined saved sections for this project.
  </p>

  {fullReportSections.length > 0 ? (
    <div className="mt-4 space-y-6">
      {fullReportSections.map((sectionData: any, index: number) => (
        <div
          key={index}
          className="rounded-2xl border border-slate-200 bg-white p-4"
        >
          <h4 className="text-lg font-semibold text-slate-900">
            {sectionData.section}
          </h4>

          <ul className="mt-3 space-y-2 text-slate-800">
            {sectionData.comments.map((comment: string, commentIndex: number) => (
              <li
                key={commentIndex}
                className="rounded-xl bg-slate-50 p-3"
              >
                {comment}
              </li>
            ))}
          </ul>

          {sectionData.photos.length > 0 ? (
            <div className="mt-4 grid grid-cols-2 gap-3">
              {sectionData.photos.map((photo: any, photoIndex: number) => (
                <div
                  key={photoIndex}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-2"
                >
                  <img
                    src={photo.url}
                    alt={`Report photo ${photoIndex + 1}`}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    {photo.caption || `Photo ${photoIndex + 1}`}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  ) : (
    <p className="mt-4 text-slate-500">
      No saved sections yet. Save at least one section to build the full report.
    </p>
  )}
</div>
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
              {photos.length > 0 ? (
  <>
    <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
      Photos
    </p>

    <div className="mt-3 grid grid-cols-2 gap-3">
      {photos.map((photo, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200 bg-white p-2"
        >
          <img
            src={photo.url}
            alt={`Report photo ${index + 1}`}
            className="h-32 w-full rounded-lg object-cover"
          />
          <p className="mt-2 text-xs text-slate-500">
            {photo.caption || `Photo ${index + 1}`}
          </p>
        </div>
      ))}
    </div>
  </>
) : null}
            </div>
          </section>
        </div>
      </div>
      <BottomNav />
    </main>
  );
}