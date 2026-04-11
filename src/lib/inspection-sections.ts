import { createClient } from "@/lib/supabase/client";

export type SectionData = {
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
  }>;
};

export async function loadSectionData(projectId: string, sectionName: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("inspection_sections")
    .select("data")
    .eq("project_id", projectId)
    .eq("section_name", sectionName)
    .maybeSingle();

  if (error) throw error;

  return (data?.data as SectionData) || null;
}

export async function saveSectionData(
  projectId: string,
  category: string,
  sectionName: string,
  sectionData: SectionData
) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("inspection_sections")
    .upsert(
      [
        {
          project_id: projectId,
          user_id: user.id,
          category,
          section_name: sectionName,
          data: sectionData,
          updated_at: new Date().toISOString(),
        },
      ],
      {
        onConflict: "project_id,section_name",
      }
    )
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function loadAllSections(projectId: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("inspection_sections")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  return data;
}