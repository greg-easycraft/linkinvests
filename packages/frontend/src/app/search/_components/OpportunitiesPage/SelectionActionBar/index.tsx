"use client";

import { Button } from "~/components/ui/button";
import { X } from "lucide-react";

interface SelectionActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
}

export function SelectionActionBar({
  selectedCount,
  onClearSelection,
}: SelectionActionBarProps): React.ReactElement | null {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-[var(--primary)] text-[var(--secundary)] rounded-lg shadow-lg px-4 py-3 flex items-center gap-4">
        <span className="text-sm font-medium">
          {selectedCount} sélectionné{selectedCount > 1 ? "s" : ""}
        </span>
        <div className="h-4 w-px bg-current opacity-30" />
        {/* <Button
          variant="ghost"
          size="sm"
          onClick={onEmailMairie}
          className="text-[var(--secundary)] hover:bg-[var(--secundary)] hover:text-[var(--primary)]"
        >
          <Mail className="h-4 w-4 mr-2" />
          Email Mairie
        </Button> */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-[var(--secundary)] hover:bg-[var(--secundary)] hover:text-[var(--primary)]"
        >
          <X className="h-4 w-4 mr-2" />
          Annuler
        </Button>
      </div>
    </div>
  );
}
