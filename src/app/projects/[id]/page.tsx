"use client";

import {
  loadSectionData,
  saveSectionData,
  loadAllSections,
} from "@/lib/inspection-sections";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { uploadProjectPhoto, deleteProjectPhoto } from "@/lib/photo-storage";

type IssueType = "repair" | "improve" | "monitor" | "safety";

type Project = {
  id: string;
  user_id: string;
  name: string;
  client: string;
  address: string;
  inspection_date: string;
  created_at: string;
  status: "draft" | "completed" | "archived";
  is_shared?: boolean;
  share_token?: string | null;
};

type Photo = {
  url: string;
  caption: string;
  path?: string;
};

type SavedSectionData = {
  materials: string[];
  condition: string;
  issueFlags: Record<IssueType, boolean>;
  notes: string;
  photos: Photo[];
};

export default function ProjectDetailPage() {
  const router = useRouter();
  const supabase = createClient();

  const params = useParams();
  const projectId = params?.id as string;

  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fullReportSections, setFullReportSections] = useState<any[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  const sections = ["Service Walks", "Driveway", "Porch", "Stairs"];

  const [sectionName, setSectionName] = useState(sections[0]);
  const [projectProgress, setProjectProgress] = useState({
    completed: 0,
    total: sections.length,
    percent: 0,
    readyToComplete: false,
  });

  const [materials, setMaterials] = useState<string[]>([]);
  const [condition, setCondition] = useState<string>("");
  const [issueFlags, setIssueFlags] = useState<Record<IssueType, boolean>>({
    repair: false,
    improve: false,
    monitor: false,
    safety: false,
  });
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<Photo[]>([]);

  const [loaded, setLoaded] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [hasInitializedAutosave, setHasInitializedAutosave] = useState(false);
  const [removingPhotoIndex, setRemovingPhotoIndex] = useState<number | null>(
    null
  );
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(
    null
  );

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
    async function fetchSection() {
      if (!projectId) return;

      setHasInitializedAutosave(false);

      try {
        const data = await loadSectionData(projectId, sectionName);

        if (data) {
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
        setHasInitializedAutosave(true);
      } catch (error) {
        console.error(error);
      }
    }

    fetchSection();
  }, [projectId, sectionName]);

  useEffect(() => {
    refreshFullReport();
    refreshProjectProgress();
  }, [projectId, sectionName]);

  useEffect(() => {
    if (!projectId) return;
    if (!loaded) return;
    if (!hasInitializedAutosave) return;

    const timeout = setTimeout(() => {
      saveCurrentSection(false);
    }, 800);

    return () => clearTimeout(timeout);
  }, [
    projectId,
    sectionName,
    materials,
    condition,
    issueFlags,
    notes,
    photos,
    loaded,
    hasInitializedAutosave,
  ]);

  async function saveCurrentSection(showFeedback = true) {
    if (!projectId) return;

    if (showFeedback) {
      setIsSaving(true);
    }

    try {
      await saveSectionData(projectId, "Grounds", sectionName, {
        materials,
        condition,
        issueFlags,
        notes,
        photos,
      });

      await refreshFullReport();
      await refreshProjectProgress();

      if (showFeedback) {
        setSaveMessage("Saved");
      }
    } catch (error: any) {
      console.error("SAVE SECTION ERROR:", error);
      if (showFeedback) {
        setSaveMessage("Error");
      }
    } finally {
      if (showFeedback) {
        setTimeout(() => {
          setIsSaving(false);
          setSaveMessage("");
        }, 1200);
      }
    }
  }

  async function handleToggleCompleted() {
    if (!projectId || !project) return;

    const nextStatus = project.status === "completed" ? "draft" : "completed";

    const { error } = await supabase
      .from("projects")
      .update({ status: nextStatus })
      .eq("id", projectId);

    if (error) {
      console.error(error);
      return;
    }

    setProject((prev) => (prev ? { ...prev, status: nextStatus } : prev));
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

  function materialButtonClass(selected: boolean) {
    return `rounded-2xl border px-4 py-3 text-sm font-medium transition ${
      selected
        ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-black"
        : "border-slate-300 bg-white text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
    }`;
  }

  function conditionButtonClass(selected: boolean) {
    return `rounded-2xl border px-4 py-3 text-sm font-medium transition ${
      selected
        ? "border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-black"
        : "border-slate-300 bg-white text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
    }`;
  }

  function issueButtonClass(selected: boolean) {
    return `rounded-2xl border px-4 py-3 text-sm font-medium transition ${
      selected
        ? "border-amber-500 bg-amber-500 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-black"
        : "border-slate-300 bg-white text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
    }`;
  }

  async function handlePhotoUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = event.target.files;
    if (!files || files.length === 0 || !projectId) return;

    setIsUploadingPhoto(true);

    try {
      let updatedPhotos = [...photos];

      for (const file of Array.from(files)) {
        const uploaded = await uploadProjectPhoto(projectId, file);

        updatedPhotos = [
          ...updatedPhotos,
          {
            url: uploaded.url,
            path: uploaded.path,
            caption: "",
          },
        ];
      }

      setPhotos(updatedPhotos);
    } catch (error) {
      console.error(error);
      alert("Photo upload failed");
    } finally {
      setIsUploadingPhoto(false);
      event.target.value = "";
    }
  }

  function movePhoto(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;

    const updatedPhotos = [...photos];
    const [movedPhoto] = updatedPhotos.splice(fromIndex, 1);
    updatedPhotos.splice(toIndex, 0, movedPhoto);

    setPhotos(updatedPhotos);
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

  function generateShareToken() {
    return crypto.randomUUID().replace(/-/g, "");
  }

  async function handleEnableShare() {
    if (!projectId) return;

    const token = generateShareToken();

    const { error } = await supabase
      .from("projects")
      .update({
        is_shared: true,
        share_token: token,
      })
      .eq("id", projectId);

    if (error) {
      console.error(error);
      alert("Failed to enable sharing");
      return;
    }

    setProject((prev) =>
      prev
        ? {
            ...prev,
            is_shared: true,
            share_token: token,
          }
        : prev
    );
  }

  async function handleDisableShare() {
    if (!projectId) return;

    const { error } = await supabase
      .from("projects")
      .update({
        is_shared: false,
        share_token: null,
      })
      .eq("id", projectId);

    if (error) {
      console.error(error);
      alert("Failed to disable sharing");
      return;
    }

    setProject((prev) =>
      prev
        ? {
            ...prev,
            is_shared: false,
            share_token: null,
          }
        : prev
    );
  }

  async function handleCopyShareLink() {
    if (!project?.share_token) return;

    const shareUrl = `${window.location.origin}/shared/${project.share_token}`;
    await navigator.clipboard.writeText(shareUrl);
    alert("Share link copied");
  }

  async function refreshFullReport() {
    if (!projectId) return;

    try {
      const rows = await loadAllSections(projectId);

      const formatted = (rows || [])
        .map((row: any) => {
          const data = row.data;

          const hasContent =
            data?.materials?.length > 0 ||
            data?.condition ||
            Object.values(data?.issueFlags || {}).some(Boolean) ||
            data?.notes?.trim() ||
            data?.photos?.length > 0;

          if (!hasContent) return null;

          return {
            section: row.section_name,
            comments: buildComments(row.section_name, data),
            photos: data.photos || [],
          };
        })
        .filter(Boolean);

      setFullReportSections(formatted);
    } catch (error) {
      console.error(error);
    }
  }

  function calculateSectionHasContent(data: SavedSectionData) {
    return (
      data?.materials?.length > 0 ||
      !!data?.condition ||
      Object.values(data?.issueFlags || {}).some(Boolean) ||
      !!data?.notes?.trim() ||
      data?.photos?.length > 0
    );
  }

  async function refreshProjectProgress() {
    if (!projectId) return;

    try {
      const rows = await loadAllSections(projectId);

      const completedCount = (rows || []).filter((row: any) =>
        calculateSectionHasContent(row.data)
      ).length;

      const total = sections.length;
      const percent = Math.round((completedCount / total) * 100);
      const readyToComplete = completedCount === total;

      setProjectProgress({
        completed: completedCount,
        total,
        percent,
        readyToComplete,
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function removePhoto(indexToRemove: number) {
    try {
      setRemovingPhotoIndex(indexToRemove);

      const photoToRemove = photos[indexToRemove];
      const updatedPhotos = photos.filter(
        (_, index) => index !== indexToRemove
      );

      setPhotos(updatedPhotos);

      if (photoToRemove?.path) {
        try {
          await deleteProjectPhoto(photoToRemove.path);
        } catch (storageError) {
          console.error("Storage delete failed:", storageError);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Failed to remove photo");
    } finally {
      setRemovingPhotoIndex(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-20 text-slate-900 dark:bg-black dark:text-white">
      <div className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-white/10 dark:bg-zinc-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-full px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            ← Back
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              {project?.name || "Inspection Project"}
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500">
              Project Details
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/projects/${projectId}/report`}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              Export PDF
            </a>

            <div className="text-sm text-slate-500 dark:text-zinc-400">
              {isSaving ? "Saving..." : "All changes saved"}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <div className="flex items-start justify-between">
            <div>
              <div className="space-y-0.5">
                <p className="text-xs text-slate-500 dark:text-zinc-500">
                  Project{" "}
                  <span className="font-mono">#{projectId?.slice(0, 8)}</span>
                </p>

                <h1 className="text-xl font-semibold leading-tight text-slate-900 dark:text-white">
                  {project?.name || "Inspection Project"}
                </h1>
              </div>

              <div className="mt-3 space-y-[2px]">
                <p className="text-sm leading-tight text-slate-600 dark:text-zinc-400">
                  Client: {project?.client || "No client yet"}
                </p>
                <p className="text-sm leading-tight text-slate-600 dark:text-zinc-400">
                  Address: {project?.address || "No address yet"}
                </p>
                <p className="text-sm leading-tight text-slate-600 dark:text-zinc-400">
                  Inspection Date:{" "}
                  {project?.inspection_date || "No inspection date yet"}
                </p>

                <div className="mt-4">
                  <p className="text-xs text-slate-500 dark:text-zinc-500">
                    {projectProgress.completed} / {projectProgress.total} sections
                    complete
                  </p>

                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100 dark:bg-zinc-800">
                    <div
                      className="h-2 rounded-full bg-slate-900 dark:bg-white"
                      style={{ width: `${projectProgress.percent}%` }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
                    {projectProgress.percent}% complete
                    {projectProgress.readyToComplete
                      ? " • Ready to mark completed"
                      : ""}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {project?.is_shared && project?.share_token ? (
                    <>
                      <button
                        type="button"
                        onClick={handleCopyShareLink}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                      >
                        Copy Share Link
                      </button>

                      <button
                        type="button"
                        onClick={handleDisableShare}
                        className="rounded-lg border border-red-300 px-3 py-2 text-xs text-red-600 transition hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-900/20"
                      >
                        Stop Sharing
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={handleEnableShare}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 transition hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Share Report
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  project?.status === "completed"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                    : "bg-slate-100 text-slate-600 dark:bg-zinc-800 dark:text-zinc-300"
                }`}
              >
                {project?.status === "completed" ? "Completed" : "Draft"}
              </span>

              <button
                type="button"
                onClick={handleToggleCompleted}
                className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                {project?.status === "completed"
                  ? "Mark Draft"
                  : "Mark Completed"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2">
          <section className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Grounds
            </h2>
            <p className="mt-1 text-slate-600 dark:text-zinc-400">
              {sectionName}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setSectionName(section)}
                  className={`rounded-xl px-4 py-2 text-sm transition ${
                    sectionName === section
                      ? "bg-slate-900 text-white dark:bg-white dark:text-black"
                      : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
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
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
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
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
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
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                Inspector Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="w-full rounded-2xl border border-slate-300 bg-white p-4 text-base text-slate-900 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
                placeholder="Add section-specific notes here..."
              />
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                Photos
              </label>

              <label
                className={`inline-flex items-center rounded-2xl border px-4 py-3 text-sm font-medium ${
                  isUploadingPhoto
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-500"
                    : "cursor-pointer border-slate-300 bg-white text-slate-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300"
                }`}
              >
                {isUploadingPhoto ? "Uploading..." : "📸 Upload Photos"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
              </label>

              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
                Drag photos to reorder them.
              </p>

              {photos.length > 0 ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {photos.map((photo, index) => (
                    <div
                      key={index}
                      draggable
                      onDragStart={() => setDraggedPhotoIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async () => {
                        if (draggedPhotoIndex === null) return;
                        movePhoto(draggedPhotoIndex, index);
                        setDraggedPhotoIndex(null);
                      }}
                      onDragEnd={() => setDraggedPhotoIndex(null)}
                      className={`rounded-2xl border p-2 ${
                        draggedPhotoIndex === index
                          ? "border-slate-400 bg-slate-50 opacity-60 dark:border-zinc-500 dark:bg-zinc-800"
                          : "border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-zinc-950"
                      }`}
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
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 dark:border-white/10 dark:bg-zinc-950 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePhoto(index);
                        }}
                        disabled={removingPhotoIndex === index}
                        className={`mt-2 w-full rounded-xl border px-3 py-2 text-sm ${
                          removingPhotoIndex === index
                            ? "cursor-not-allowed border-slate-200 text-slate-400 dark:border-white/10 dark:text-zinc-500"
                            : "border-slate-300 text-slate-700 dark:border-white/10 dark:text-zinc-300"
                        }`}
                      >
                        {removingPhotoIndex === index ? "Removing..." : "Remove"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-500 dark:text-zinc-500">
                  No photos uploaded yet.
                </p>
              )}
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => saveCurrentSection(true)}
                className="rounded-xl bg-slate-900 px-5 py-3 text-white transition hover:opacity-90 dark:bg-white dark:text-black"
              >
                Save Section
              </button>

              <span className="text-sm text-slate-500 dark:text-zinc-400">
                {isSaving ? "Saving..." : "Autosave is on"}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
              Live Report Preview
            </h2>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-zinc-950">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Full Report Preview
              </h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-zinc-400">
                Combined saved sections for this project.
              </p>

              {fullReportSections.length > 0 ? (
                <div className="mt-4 space-y-6">
                  {fullReportSections.map((sectionData: any, index: number) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
                    >
                      <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {sectionData.section}
                      </h4>

                      <ul className="mt-3 space-y-2 text-slate-800 dark:text-zinc-200">
                        {sectionData.comments.map(
                          (comment: string, commentIndex: number) => (
                            <li
                              key={commentIndex}
                              className="rounded-xl bg-slate-50 p-3 dark:bg-zinc-950"
                            >
                              {comment}
                            </li>
                          )
                        )}
                      </ul>

                      {sectionData.photos.length > 0 ? (
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {sectionData.photos.map(
                            (photo: any, photoIndex: number) => (
                              <div
                                key={photoIndex}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-white/10 dark:bg-zinc-950"
                              >
                                <img
                                  src={photo.url}
                                  alt={`Report photo ${photoIndex + 1}`}
                                  className="h-28 w-full rounded-lg object-cover"
                                />
                                <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
                                  {photo.caption || `Photo ${photoIndex + 1}`}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-slate-500 dark:text-zinc-500">
                  No saved sections yet. Save at least one section to build the
                  full report.
                </p>
              )}
            </div>

            <p className="mt-1 text-slate-600 dark:text-zinc-400">
              This is the beginning of the auto-generated report section.
            </p>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-zinc-950">
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                Category
              </p>
              <h3 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
                Grounds
              </h3>

              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                Section
              </p>
              <p className="mt-1 text-slate-900 dark:text-white">
                {sectionName}
              </p>

              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                Summary
              </p>

              {autoComments.length > 0 ? (
                <ul className="mt-3 space-y-3 text-slate-800 dark:text-zinc-200">
                  {autoComments.map((comment, index) => (
                    <li
                      key={index}
                      className="rounded-xl bg-white p-3 shadow-sm dark:bg-zinc-900"
                    >
                      {comment}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-slate-500 dark:text-zinc-500">
                  No report text yet. Start checking boxes and adding notes.
                </p>
              )}

              {photos.length > 0 ? (
                <>
                  <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-zinc-500">
                    Photos
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {photos.map((photo, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-slate-200 bg-white p-2 dark:border-white/10 dark:bg-zinc-900"
                      >
                        <img
                          src={photo.url}
                          alt={`Report photo ${index + 1}`}
                          className="h-32 w-full rounded-lg object-cover"
                        />
                        <p className="mt-2 text-xs text-slate-500 dark:text-zinc-500">
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