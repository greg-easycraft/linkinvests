"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

export interface MultiSelectOption {
  label: string;
  value: string;
  searchValue?: string; // Optional additional search terms
}

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDisplayItems?: number;
  searchPlaceholder?: string;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select items...",
  className,
  disabled = false,
  maxDisplayItems = 3,
  searchPlaceholder = "Search items...",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = React.useCallback((value: string) => {
    onChange(selected.filter((item) => item !== value));
  }, [selected, onChange]);

  const handleSelect = React.useCallback((value: string) => {
    if (selected.includes(value)) {
      handleUnselect(value);
    } else {
      onChange([...selected, value]);
    }
  }, [selected, onChange, handleUnselect]);

  const selectedOptions = React.useMemo(() => {
    return options.filter((option) => selected.includes(option.value));
  }, [options, selected]);

  return (
    <div className={cn("w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal border-2 border-[var(--primary)] bg-[var(--secundary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--secundary)]"
            disabled={disabled}
          >
            <div className="flex gap-1 flex-wrap max-w-full">
              {selected.length === 0 ? (
                <span className="text-[var(--primary)]/70">{placeholder}</span>
              ) : selected.length <= maxDisplayItems ? (
                selectedOptions.map((option) => (
                  <Badge
                    variant="secondary"
                    key={option.value}
                    className="mr-1 mb-1"
                  >
                    {option.label}
                    <span
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleUnselect(option.value);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUnselect(option.value);
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <X className="h-3 w-3 text-[var(--primary)]/70 hover:text-[var(--primary)]" />
                    </span>
                  </Badge>
                ))
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--primary)]">
                    {selected.length} items selected
                  </span>
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange([]);
                    }}
                    className="text-[var(--primary)]/70 hover:text-[var(--primary)] cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.stopPropagation();
                        onChange([]);
                      }
                    }}
                  >
                    <X className="h-4 w-4" />
                  </span>
                </div>
              )}
            </div>
            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder={searchPlaceholder} />
            <CommandList>
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => {
                  const isSelected = selected.includes(option.value);
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}