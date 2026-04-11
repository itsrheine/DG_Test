import { createClient } from "@/lib/supabase/client";

export async function uploadCompanyLogo(userId: string, file: File) {
  const supabase = createClient();

  const ext = file.name.split(".").pop() || "png";
  const fileName = `${userId}-${Date.now()}.${ext}`;
  const path = `logos/${fileName}`;

  const { error } = await supabase.storage
    .from("company-logos")
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("company-logos")
    .getPublicUrl(path);

  return {
    url: data.publicUrl,
    path,
  };
}