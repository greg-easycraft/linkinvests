"use client";

import { Loader2 } from "lucide-react";

interface FullPageSpinnerProps {
  message?: string;
}

export function FullPageSpinner({ message = "Chargement..." }: FullPageSpinnerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-lg bg-[var(--secundary)] p-8 shadow-xl">
        <Loader2 className="h-12 w-12 animate-spin text-[var(--primary)]" />
        <p className="text-lg font-medium text-[var(--primary)]">{message}</p>
      </div>
    </div>
  );
}
