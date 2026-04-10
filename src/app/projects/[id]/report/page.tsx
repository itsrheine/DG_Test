"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loadAllSections } from "@/lib/inspection-sections";

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

type SectionRow = {
  id: string;
  section_name: string;
  data: {
    materials: string[];
    condition: string;
    issueFlags: {
      repair: boolean;
      improve: boolean;
      monitor: boolean;
      safety: boolean;
    };
    notes: string;
    photos: Array<{
      url: string;
      caption: string;
      path?: string;
    }>;
  };
};

function buildComments(section: string, data: SectionRow["data"]) {
  const comments: string[] = [];

  if (data.materials?.length > 0) {
    comments.push(
      `The ${section.toLowerCase()} are primarily constructed of ${data.materials.join(", ")}.`
    );
  }

  if (data.condition === "Good") {
    comments.push("The visible surfaces appeared serviceable at the time of inspection.");
  }

  if (data.condition === "Marginal") {
    comments.push("The visible surfaces showed signs of wear and may need maintenance or repair.");
  }

  if (data.condition === "Poor") {
    comments.push("The visible surfaces showed significant deterioration and repair is recommended.");
  }

  if (data.issueFlags?.safety) {
    comments.push("A safety concern was noted in this section.");
  }

  if (data.issueFlags?.repair) {
    comments.push("Repairs are recommended where defects or deterioration are present.");
  }

  if (data.issueFlags?.improve) {
    comments.push("Improvements may help extend service life and overall usability.");
  }

  if (data.issueFlags?.monitor) {
    comments.push("This area should be monitored for future movement, wear, or deterioration.");
  }

  if (data.notes?.trim()) {
    comments.push(data.notes.trim());
  }

  return comments;
}

export default function ProjectReportPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<SectionRow[]>([]);

  useEffect(() => {
    async function loadReport() {
      if (!projectId) return;

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();

      if (projectError) {
        console.error(projectError);
        return;
      }

      setProject(projectData as Project);

      const rows = await loadAllSections(projectId);
      setSections((rows || []) as SectionRow[]);
    }

    loadReport();
  }, [projectId, supabase]);

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-slate-900 print:px-8 print:py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between print:hidden">
          <h1 className="text-2xl font-bold">Inspection Report</h1>
          <button
            onClick={() => window.print()}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white"
          >
            Export / Print PDF
          </button>
        </div>

        <div className="mb-8 border-b border-slate-200 pb-6">
          <h1 className="text-3xl font-bold">{project?.name || "Inspection Report"}</h1>
          <p className="mt-3 text-sm text-slate-600">
            Project #{project?.id.slice(0, 8)}
          </p>
          <div className="mt-4 space-y-1 text-sm text-slate-700">
            <p>Client: {project?.client || "No client yet"}</p>
            <p>Address: {project?.address || "No address yet"}</p>
            <p>Inspection Date: {project?.inspection_date || "No inspection date yet"}</p>
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section) => {
            const comments = buildComments(section.section_name, section.data);

            return (
              <section key={section.id} className="border-b border-slate-200 pb-8">
                <h2 className="text-2xl font-semibold">{section.section_name}</h2>

                {comments.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {comments.map((comment, index) => (
                      <li key={index} className="text-sm leading-6 text-slate-800">
                        • {comment}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">No saved content for this section.</p>
                )}

                {section.data.photos?.length > 0 ? (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {section.data.photos.map((photo, index) => (
                      <div key={index} className="break-inside-avoid">
                        <img
                          src={photo.url}
                          alt={`Section photo ${index + 1}`}
                          className="h-48 w-full rounded-lg border border-slate-200 object-cover"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                          {photo.caption || `Photo ${index + 1}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      </div>
    </main>
  );
}