"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { createClient } from "@/lib/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ToastProvider";

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
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  theme: "light" | "dark";
  placeholder?: string;
  readOnly?: boolean;
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
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full rounded-xl border px-4 py-3 text-[17px] outline-none ${
          theme === "dark"
            ? "border-white/10 bg-zinc-950 text-white placeholder:text-zinc-500"
            : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
        } ${readOnly ? "cursor-default opacity-80" : ""}`}
      />
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const supabase = createClient();
  const { theme } = useTheme();
  const { showToast } = useToast();

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [account, setAccount] = useState({
    full_name: "",
    phone: "",
    license_number: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);
      setEmail(user.email || "");

      const { data, error } = await supabase
        .from("settings")
        .select("full_name, phone, license_number")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setAccount({
          full_name: data.full_name || "",
          phone: data.phone || "",
          license_number: data.license_number || "",
        });
      }
    }

    loadAccount();
  }, [router, supabase]);

  async function handleSave() {
    if (!userId) return;

    setIsSaving(true);

    const { error } = await supabase.from("settings").upsert(
      {
        user_id: userId,
        full_name: account.full_name,
        phone: account.phone,
        license_number: account.license_number,
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.error(error);
      showToast("Failed to save account info");
    } else {
      showToast("Account info saved");
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
              Account
            </h1>
            <p
              className={`mt-1 text-sm ${
                theme === "dark" ? "text-zinc-400" : "text-slate-500"
              }`}
            >
              Inspector information
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
            <SettingsInputRow
              label="Full Name"
              value={account.full_name}
              onChange={(value) =>
                setAccount((prev) => ({ ...prev, full_name: value }))
              }
              theme={theme}
              placeholder="Inspector name"
            />

            <SettingsInputRow
              label="Email"
              value={email}
              theme={theme}
              readOnly
              placeholder="Email address"
            />

            <SettingsInputRow
              label="Phone Number"
              value={account.phone}
              onChange={(value) =>
                setAccount((prev) => ({ ...prev, phone: value }))
              }
              theme={theme}
              placeholder="Phone number"
            />

            <SettingsInputRow
              label="License Number"
              value={account.license_number}
              onChange={(value) =>
                setAccount((prev) => ({ ...prev, license_number: value }))
              }
              theme={theme}
              placeholder="License number"
            />
          </SettingsCard>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}