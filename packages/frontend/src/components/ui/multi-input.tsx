"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export interface MultiInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  type?: "text" | "number";
  validator?: (value: string) => boolean;
  maxValues?: number;
}

export function MultiInput({
  values = [],
  onChange,
  placeholder = "Enter values separated by commas...",
  className,
  disabled = false,
  type = "text",
  validator,
  maxValues,
}: MultiInputProps) {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();

        const trimmedValue = inputValue.trim();
        if (!trimmedValue) return;

        // Split by comma and process each value
        const newValues = trimmedValue
          .split(",")
          .map((v) => v.trim())
          .filter((v) => v.length > 0)
          .filter((v) => !values.includes(v))
          .filter((v) => (validator ? validator(v) : true));

        if (newValues.length > 0) {
          const updatedValues = [...values, ...newValues];

          // Respect maxValues limit
          const finalValues = maxValues
            ? updatedValues.slice(0, maxValues)
            : updatedValues;

          onChange(finalValues);
        }

        setInputValue("");
      } else if (e.key === "Backspace" && inputValue === "" && values.length > 0) {
        // Remove last value if input is empty and backspace is pressed
        onChange(values.slice(0, -1));
      }
    },
    [inputValue, values, onChange, validator, maxValues]
  );

  const handleInputChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    []
  );

  const handleRemoveValue = React.useCallback(
    (valueToRemove: string) => {
      onChange(values.filter((value) => value !== valueToRemove));
    },
    [values, onChange]
  );

  const handlePaste = React.useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text");

      const newValues = pastedText
        .split(/[,\n\r\t]/)
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .filter((v) => !values.includes(v))
        .filter((v) => (validator ? validator(v) : true));

      if (newValues.length > 0) {
        const updatedValues = [...values, ...newValues];

        // Respect maxValues limit
        const finalValues = maxValues
          ? updatedValues.slice(0, maxValues)
          : updatedValues;

        onChange(finalValues);
      }

      setInputValue("");
    },
    [values, onChange, validator, maxValues]
  );

  return (
    <div className={cn("w-full", className)}>
      <div className="min-h-[2.5rem] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {values.map((value) => (
            <Badge
              key={value}
              variant="secondary"
              className="mb-1"
            >
              {value}
              <span
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRemoveValue(value);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemoveValue(value);
                }}
                role="button"
                tabIndex={disabled ? -1 : 0}
                style={{ pointerEvents: disabled ? 'none' : 'auto' }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </span>
            </Badge>
          ))}
          <Input
            className="flex-1 border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 min-w-[120px]"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={values.length === 0 ? placeholder : "Add more..."}
            disabled={disabled || (maxValues ? values.length >= maxValues : false)}
            type={type}
          />
        </div>
      </div>
      {maxValues && (
        <div className="text-xs text-muted-foreground mt-1">
          {values.length} / {maxValues} items
        </div>
      )}
    </div>
  );
}