"use client";

import React, { useState, KeyboardEvent, ChangeEvent } from "react";
import { X } from "lucide-react";
import { Badge } from "./badge";
import { cn } from "~/lib/utils";

interface ZipCodeInputProps {
  value: string[];
  onChange: (zipCodes: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function ZipCodeInput({
  value = [],
  onChange,
  placeholder = "Entrez un code postal",
  disabled = false,
  className,
}: ZipCodeInputProps): React.ReactElement {
  const [currentInput, setCurrentInput] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Only allow numeric characters and limit to 5 digits
    const numericValue = newValue.replace(/\D/g, "").slice(0, 5);
    setCurrentInput(numericValue);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // Submit when length is 5 and space or enter is pressed
    if (currentInput.length === 5 && (e.key === " " || e.key === "Enter")) {
      e.preventDefault();
      addZipCode();
      return;
    }
    // Also allow enter to submit even if not 5 digits (for flexibility)
    if (e.key === "Enter" && currentInput.length > 0) {
      e.preventDefault();
      addZipCode();
      return;
    }
    // Handle backspace when input is empty to remove last badge
    if (e.key === "Backspace" && currentInput === "" && value.length > 0) {
      const lastZipCode = value[value.length - 1];
      if (lastZipCode) {
        removeZipCode(lastZipCode);
      }
    }
  };

  const addZipCode = () => {
    if (currentInput.length === 5 && !value.includes(currentInput)) {
      onChange([...value, currentInput]);
      setCurrentInput("");
    }
  };

  const removeZipCode = (zipCodeToRemove: string) => {
    onChange(value.filter(zipCode => zipCode !== zipCodeToRemove));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Selected zip codes as badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {value.map((zipCode) => (
            <Badge
              key={zipCode}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span>{zipCode}</span>
              <button
                type="button"
                onClick={() => removeZipCode(zipCode)}
                disabled={disabled}
                className="ml-1 hover:bg-gray-200 rounded-sm p-0.5 transition-colors"
                aria-label={`Supprimer le code postal ${zipCode}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input field */}
      <div className="relative">
        <input
          type="text"
          value={currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full px-3 py-2 text-sm rounded-md",
            "border-2 border-[var(--primary)] focus:border-[var(--primary)]",
            "bg-[var(--secundary)] text-foreground",
            "focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20",
            "placeholder:text-muted-foreground",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            currentInput.length === 5 && "ring-2 ring-[var(--primary)]/20"
          )}
          maxLength={5}
        />

        {/* Length indicator */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {currentInput.length}/5
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-muted-foreground">
        {currentInput.length === 5
          ? "Appuyez sur Entrée ou Espace pour ajouter ce code postal"
          : "Entrez 5 chiffres pour un code postal valide"
        }
      </p>
    </div>
  );
}