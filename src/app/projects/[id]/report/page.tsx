"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { loadAllSections } from "@/lib/inspection-sections";
import { Printer, Download } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

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

export default function ProjectReportPage() {
  const params = useParams();
  const projectId = params?.id as string;
  const supabase = createClient();

  const [project, setProject] = useState<Project | null>(null);
  const [sections, setSections] = useState<SectionRow[]>([]);

  const { theme } = useTheme();

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

      const rows = await loadAllSections(projectId);
      setSections((rows || []) as SectionRow[]);
    }

    loadReport();
  }, [projectId, supabase]);

  return (
    <main className="min-h-screen bg-white px-8 py-10 text-slate-900 print:px-12 print:py-12">
      {/* Print Header */}
      <div className="hidden print:flex fixed top-0 left-0 right-0 px-8 pt-2 pb-3 text-[10pt] border-b border-slate-300 justify-between bg-white">
        <span>{project?.address || "Inspection Address"}</span>
        <span className="page-number"></span>
      </div>

      <div className="mx-auto max-w-4xl print:pt-16 print:pb-14">
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

            <div className="flex flex-col items-end gap-2">
              {/* Icons */}
              <div className="no-print flex gap-2">
                <button
                  title="Print report"
                  onClick={() => window.print()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  <Printer size={16} />
                </button>

                <button
                  title="Download PDF"
                  onClick={() => window.print()}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  <Download size={16} />
                </button>
                <div className="hidden print:block text-[10pt] text-slate-600 text-right">
                  <p>Date Generated</p>
                  <p>{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-1 text-sm text-slate-700">
            <p>
              <span className="font-semibold">Project:</span> {project?.name}
            </p>
            <p>
              <span className="font-semibold">Client:</span> {project?.client}
            </p>
            <p>
              <span className="font-semibold">Address:</span> {project?.address}
            </p>
            <p>
              <span className="font-semibold">Inspection Date:</span>{" "}
              {project?.inspection_date}
            </p>

            <p className="text-[11px] text-slate-400 mt-1 print:hidden">
              Generated on {new Date().toLocaleDateString()}
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
              <section key={section.id} className="mb-6 break-inside-avoid pb-4">
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