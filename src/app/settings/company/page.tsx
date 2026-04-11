"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { uploadCompanyLogo } from "@/lib/logo-storage";

function SettingsCard({
  children,
  theme,
}: {
  children: React.ReactNode;
  theme: "light" | "dark";
}) {
  return (
    <div
      className={`rounded-[28px] px-5 shadow-xl backdrop-blur ${
        theme === "dark"
          ? "border border-white/5 bg-zinc-900/90"
          : "border border-slate-200 bg-white"
      }`}
    >
      {children}
    </div>
  );
}

function SettingsInputRow({
  label,
  value,
  onChange,
  theme,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  theme: "light" | "dark";
  placeholder?: string;
}) {
  return (
    <div
      className={`py-5 ${
        theme === "dark" ? "border-b border-white/10" : "border-b border-slate-200"
      } last:border-b-0`}
    >
      <label
        className={`mb-2 block text-sm ${
          theme === "dark" ? "text-zinc-400" : "text-slate-500"
        }`}
      >
        {label}
      </label>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border px-4 py-3 text-[17px] outline-none ${
          theme === "dark"
            ? "border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500"
            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
        }`}
      />
    </div>
  );
}

export default function CompanyPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();

  const [userId, setUserId] = useState<string | null>(null);
  const [company, setCompany] = useState({
    company_name: "",
    company_email: "",
    company_phone: "",
    company_address: "",
    company_website: "",
    logo_url: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
      const file = event.target.files?.[0];
      if (!file || !userId) return;

      try {
        const uploaded = await uploadCompanyLogo(userId, file);

        setCompany((prev) => ({
          ...prev,
          logo_url: uploaded.url,
        }));
      } catch (error) {
        console.error("Logo upload error:", error);
        alert(`Failed to upload logo: ${error instanceof Error ? error.message : "Unknown error"}`);  
      } finally {
        event.target.value = "";
      }
    }

  useEffect(() => {
    async function loadCompany() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("settings")
        .select(
          "company_name, company_email, company_phone, company_address, company_website, logo_url"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setCompany({
          company_name: data.company_name || "",
          company_email: data.company_email || "",
          company_phone: data.company_phone || "",
          company_address: data.company_address || "",
          company_website: data.company_website || "",
          logo_url: data.logo_url || "",
        });
      }
    }

    loadCompany();
  }, [router, supabase]);

  async function handleSave() {
    if (!userId) return;

    setIsSaving(true);

    const { error } = await supabase.from("settings").upsert(
      {
        user_id: userId,
        company_name: company.company_name,
        company_email: company.company_email,
        company_phone: company.company_phone,
        company_address: company.company_address,
        company_website: company.company_website,
        logo_url: company.logo_url,
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error(error);
      alert("Failed to save company info");
    } else {
      alert("Company info saved");
    }

    setIsSaving(false);
  }

  return (
    <main
      className={`min-h-screen pb-32 ${
        theme === "dark" ? "bg-black text-white" : "bg-slate-50 text-slate-900"
      }`}
    >
      <div className="mx-auto max-w-md px-4 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/settings")}
            className={`flex h-14 w-14 items-center justify-center rounded-full text-3xl shadow-lg ${
              theme === "dark"
                ? "border border-white/10 bg-zinc-900 text-white"
                : "border border-slate-200 bg-white text-slate-900"
            }`}
          >
            ‹
          </button>

          <div className="text-center">
            <h1
              className={`text-3xl font-semibold tracking-tight ${
                theme === "dark" ? "text-white" : "text-slate-900"
              }`}
            >
              Company
            </h1>
            <p
              className={`mt-1 text-sm ${
                theme === "dark" ? "text-zinc-400" : "text-slate-500"
              }`}
            >
              Branding and business information
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              theme === "dark"
                ? "bg-white text-black"
                : "bg-slate-900 text-white"
            }`}
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>

        <div className="space-y-6">
          <SettingsCard theme={theme}>
            <div
              className={`py-5 ${
                theme === "dark" ? "border-b border-white/10" : "border-b border-slate-200"
              }`}
            >
              <label
                className={`mb-3 block text-sm ${
                  theme === "dark" ? "text-zinc-400" : "text-slate-500"
                }`}
              >
                Company Logo
              </label>

              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt="Company logo"
                  className="mb-3 h-20 w-20 rounded-2xl border border-slate-200 object-cover dark:border-white/10"
                />
              ) : (
                <div
                  className={`mb-3 flex h-20 w-20 items-center justify-center rounded-2xl border text-xs ${
                    theme === "dark"
                      ? "border-white/10 bg-zinc-950 text-zinc-500"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  No Logo
                </div>
              )}

              <label
                className={`inline-flex cursor-pointer items-center rounded-xl border px-4 py-2 text-sm ${
                  theme === "dark"
                    ? "border-white/10 bg-zinc-950 text-white"
                    : "border-slate-200 bg-white text-slate-900"
                }`}
              >
                Upload Logo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <SettingsInputRow
              label="Company Name"
              value={company.company_name}
              onChange={(value) =>
                setCompany((prev) => ({ ...prev, company_name: value }))
              }
              theme={theme}
              placeholder="Company name"
            />

            <SettingsInputRow
              label="Company Email"
              value={company.company_email}
              onChange={(value) =>
                setCompany((prev) => ({ ...prev, company_email: value }))
              }
              theme={theme}
              placeholder="Company email"
            />

            <SettingsInputRow
              label="Company Phone"
              value={company.company_phone}
              onChange={(value) =>
                setCompany((prev) => ({ ...prev, company_phone: value }))
              }
              theme={theme}
              placeholder="Company phone"
            />

            <SettingsInputRow
              label="Company Address"
              value={company.company_address}
              onChange={(value) =>
                setCompany((prev) => ({ ...prev, company_address: value }))
              }
              theme={theme}
              placeholder="Company address"
            />

            <SettingsInputRow
              label="Website"
              value={company.company_website}
              onChange={(value) =>
                setCompany((prev) => ({ ...prev, company_website: value }))
              }
              theme={theme}
              placeholder="Company website"
            />
          </SettingsCard>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}