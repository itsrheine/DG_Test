"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTheme } from "@/components/ThemeProvider";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useTheme();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextIdRef = useRef(1);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = nextIdRef.current++;
      setToasts((prev) => [...prev, { id, message, type }]);

      window.setTimeout(() => {
        removeToast(id);
      }, 2200);
    },
    [removeToast]
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const isDark = theme === "dark";

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[100] flex flex-col items-center gap-3 px-4">
        {toasts.map((toast) => {
          const toneClass =
            toast.type === "success"
              ? isDark
                ? "border-green-500/30 bg-zinc-900 text-white"
                : "border-green-200 bg-white text-slate-900"
              : toast.type === "error"
              ? isDark
                ? "border-red-500/30 bg-zinc-900 text-white"
                : "border-red-200 bg-white text-slate-900"
              : isDark
              ? "border-white/10 bg-zinc-900 text-white"
              : "border-slate-200 bg-white text-slate-900";

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full max-w-sm rounded-2xl border px-4 py-3 text-sm shadow-xl backdrop-blur ${toneClass}`}
            >
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}