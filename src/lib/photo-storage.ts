import { createClient } from "@/lib/supabase/client";

export async function uploadProjectPhoto(projectId: string, file: File) {
  const supabase = createClient();

  const ext = file.name.split(".").pop() || "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const path = `${projectId}/${fileName}`;

  const { error } = await supabase.storage
    .from("inspection-photos")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("inspection-photos")
    .getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
  };
}

export async function deleteProjectPhoto(path:string) {
    const supabase = createClient();

    const { error } = await supabase.storage
        .from("inspection-photos")
        .remove([path]);

    if (error) throw error;
}