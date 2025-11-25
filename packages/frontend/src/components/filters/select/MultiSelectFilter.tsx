"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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
import { cn } from "~/lib/utils";

export interface SelectOption<T = string> {
  value: T;
  label: string;
}

interface MultiSelectFilterProps<T = string> {
  label: string;
  options: readonly SelectOption<T>[];
  value?: T[];
  onChange: (value: T[] | undefined) => void;
  placeholder?: string;
  badgeColor?: string;
}

export function MultiSelectFilter<T extends string = string>({
  label,
  options,
  value = [],
  onChange,
  placeholder = "Sélectionner un type...",
  badgeColor = 'bg-blue-100 text-blue-800',
}: MultiSelectFilterProps<T>): React.ReactElement {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (selectedValue: T): void => {
    const currentValues = value ?? [];
    const updatedValues = currentValues.includes(selectedValue)
      ? currentValues.filter(v => v !== selectedValue)
      : [...currentValues, selectedValue];

    onChange(updatedValues.length > 0 ? updatedValues : undefined);
  };

  const handleSelectAll = (): void => {
    onChange(undefined);
    setOpen(false);
  };

  const handleRemove = (valueToRemove: T): void => {
    const currentValues = value ?? [];
    const updatedValues = currentValues.filter(v => v !== valueToRemove);
    onChange(updatedValues.length > 0 ? updatedValues : undefined);
  };

  const hasSelection = value && value.length > 0;

  return (
    <div>
      <label className="text-sm font-medium mb-2 block font-heading">{label}</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
          >
            <span className={hasSelection ? "" : "text-muted-foreground"}>
              {hasSelection ? `${value.length} sélectionné${value.length > 1 ? 's' : ''}` : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Rechercher..." />
            <CommandList>
              <CommandEmpty>Aucun résultat.</CommandEmpty>
              <CommandGroup>
                <CommandItem onSelect={handleSelectAll}>
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !hasSelection ? "opacity-100" : "opacity-0"
                    )}
                  />
                  Tous
                </CommandItem>
                {options.map((option) => {
                  const isSelected = (value ?? []).includes(option.value);
                  return (
                    <CommandItem
                      key={String(option.value)}
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
      {hasSelection && (
        <div className="mt-2 flex flex-wrap gap-1">
          {value.map((selectedValue) => {
            const option = options.find(o => o.value === selectedValue);
            return (
              <span key={String(selectedValue)} className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${badgeColor}`}>
                {option?.label ?? String(selectedValue)}
                <button
                  onClick={() => handleRemove(selectedValue)}
                  className="ml-1 hover:opacity-75"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
