"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: "var(--bg-secondary)",
          border: "1px solid var(--border)",
          color: "var(--text-primary)",
        },
        classNames: {
          success: "!border-emerald-500/30",
          error: "!border-rose-500/30",
          warning: "!border-amber-500/30",
        },
      }}
      richColors
    />
  );
}

// Re-export toast for convenience
export { toast } from "sonner";
