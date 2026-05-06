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
  is_shared?: boolean;
  share_token?: string | null;
};

type Photo = {
  url: string;
  caption: string;
  path?: string;
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
    photos: Photo[];
  };
};

type ReportSettings = {
  company_name: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  report_header: string;
  footer_note: string;
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

function renderCheckboxItem(label: string, checked: boolean) {
  return (
    <span className="mr-4 inline-block">
      {checked ? "☑" : "☐"} {label}
    </span>
  );
}

export default function SharedReportPage() {
  const params = useParams();
  const token = params?.token as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<SectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportSettings, setReportSettings] = useState({
    company_name: "",
    company_address: "",
    company_phone: "",
    company_email: "",
    report_header: "",
    footer_note: "",
    logo_url: "",
  });

  useEffect(() => {
    async function loadSharedReport() {
      if (!token) return;

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("share_token", token)
        .eq("is_shared", true)
        .single();

      if (projectError || !projectData) {
        console.error(projectError);
        setLoading(false);
        return;
      }

      setProject(projectData as Project);

      const { data: settingsData, error: settingsError } = await supabase
        .from("settings")
        .select(
          "company_name, company_address, company_phone, company_email, report_header, footer_note, logo_url"
        )
        .eq("user_id", projectData.user_id)
        .maybeSingle();

      if (settingsError) {
        console.error(settingsError);
      } else if (settingsData) {
        setReportSettings({
          company_name: settingsData.company_name || "",
          company_address: settingsData.company_address || "",
          company_phone: settingsData.company_phone || "",
          company_email: settingsData.company_email || "",
          report_header: settingsData.report_header || "",
          footer_note: settingsData.footer_note || "",
          logo_url: settingsData.logo_url || "",
        });
      }

      const rows = await loadAllSections(projectData.id);
      setSections((rows || []) as SectionRow[]);
      setLoading(false);
    }

    loadSharedReport();
  }, [token, supabase]);

  if (loading) {
    return (
      <main
        className="min-h-screen bg-white px-6 py-10 text-slate-900"
        style={{ fontFamily: "Times New Roman, serif", fontSize: "10pt" }}
      >
        <div className="mx-auto max-w-4xl text-slate-500">Loading report...</div>
      </main>
    );
  }

  if (!project) {
    return (
      <main
        className="min-h-screen bg-white px-6 py-10 text-slate-900"
        style={{ fontFamily: "Times New Roman, serif", fontSize: "10pt" }}
      >
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold">Report not available</h1>
          <p className="mt-2 text-slate-600">
            This report link is invalid or sharing has been turned off.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-white px-6 py-10 text-slate-900"
      style={{
        fontFamily: "Times New Roman, serif",
        fontSize: "10pt",
      }}
    >
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 border-b border-slate-300 pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {reportSettings.logo_url ? (
                <img
                  src={reportSettings.logo_url}
                  alt="Company logo"
                  className="h-14 w-14 object-contain"
                />
              ) : null}

              <div>
                <h1 className="text-2xl font-bold">
                  {reportSettings.company_name || "Inspection Report"}
                </h1>
                <p className="text-sm text-slate-600">
                  {reportSettings.report_header || "Residential Exterior Inspection"}
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-500">
              <p>Date Generated</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="mt-6 space-y-1 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Project:</span> {project.name}
            </p>
            <p>
              <span className="font-semibold">Client:</span> {project.client}
            </p>
            <p>
              <span className="font-semibold">Address:</span> {project.address}
            </p>
            <p>
              <span className="font-semibold">Inspection Date:</span>{" "}
              {project.inspection_date}
            </p>

            {(reportSettings.company_address ||
              reportSettings.company_phone ||
              reportSettings.company_email) && (
              <div className="mt-3">
                <p className="font-semibold">Company Information</p>
                {reportSettings.company_address ? (
                  <p>{reportSettings.company_address}</p>
                ) : null}
                {reportSettings.company_phone ? (
                  <p>{reportSettings.company_phone}</p>
                ) : null}
                {reportSettings.company_email ? (
                  <p>{reportSettings.company_email}</p>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {sections.map((section) => {
            const comments = buildComments(section.section_name, section.data);

            return (
              <section
                key={section.id}
                className="mb-6 break-inside-avoid pb-4"
              >
                <h2 className="text-base font-bold uppercase tracking-wide">
                  {section.section_name}
                </h2>

                <div className="mt-2 space-y-1 text-[10pt] leading-5">
                  <p>
                    <span className="font-bold">Material:</span>{" "}
                    {renderCheckboxItem(
                      "Concrete",
                      section.data.materials?.includes("Concrete") ?? false
                    )}
                    {renderCheckboxItem(
                      "Brick",
                      section.data.materials?.includes("Brick") ?? false
                    )}
                    {renderCheckboxItem(
                      "Pavers",
                      section.data.materials?.includes("Pavers") ?? false
                    )}
                    {renderCheckboxItem(
                      "Stone",
                      section.data.materials?.includes("Stone") ?? false
                    )}
                    {renderCheckboxItem(
                      "Asphalt",
                      section.data.materials?.includes("Asphalt") ?? false
                    )}
                  </p>

                  <p>
                    <span className="font-bold">Condition:</span>{" "}
                    {renderCheckboxItem("Good", section.data.condition === "Good")}
                    {renderCheckboxItem(
                      "Marginal",
                      section.data.condition === "Marginal"
                    )}
                    {renderCheckboxItem("Poor", section.data.condition === "Poor")}
                  </p>

                  <p>
                    <span className="font-bold">Issue Type:</span>{" "}
                    {renderCheckboxItem(
                      "Repair",
                      section.data.issueFlags?.repair ?? false
                    )}
                    {renderCheckboxItem(
                      "Improve",
                      section.data.issueFlags?.improve ?? false
                    )}
                    {renderCheckboxItem(
                      "Monitor",
                      section.data.issueFlags?.monitor ?? false
                    )}
                    {renderCheckboxItem(
                      "Safety",
                      section.data.issueFlags?.safety ?? false
                    )}
                  </p>
                </div>

                {comments.length > 0 ? (
                  <ul className="mt-4 space-y-2">
                    {comments.map((comment, index) => (
                      <li key={index} className="leading-6">
                        • {comment}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    No saved content for this section.
                  </p>
                )}

                {section.data.notes?.trim() && (
                  <p className="mt-3 italic leading-6">
                    {section.data.notes.trim()}
                  </p>
                )}

                {section.data.photos?.length > 0 ? (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    {section.data.photos.map((photo, index) => (
                      <div key={index}>
                        <img
                          src={photo.url}
                          className="h-44 w-full rounded-lg border border-slate-300 object-cover"
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

        <div className="mt-12 border-t border-slate-200 pt-6 text-center text-xs text-slate-500">
          <p>
            {reportSettings.footer_note ||
              "This report is based on a visual inspection at the time of service."}
          </p>
          <p>
            © {new Date().getFullYear()}{" "}
            {reportSettings.company_name || "Inspection Report"}
          </p>
        </div>
      </div>
    </main>
  );
}