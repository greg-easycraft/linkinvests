"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

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
  badgeColor?: string; // CSS class for badge color (e.g., 'bg-blue-100 text-blue-800')
}

export function MultiSelectFilter<T extends string = string>({
  label,
  options,
  value = [],
  onChange,
  placeholder = "Sélectionner un type...",
  badgeColor = 'bg-blue-100 text-blue-800',
}: MultiSelectFilterProps<T>): React.ReactElement {

  const handleSelectionChange = (selectedValue: string): void => {
    const typedValue = selectedValue as T;
    const currentValues = value ?? [];
    const updatedValues = currentValues.includes(typedValue)
      ? currentValues.filter(v => v !== typedValue)
      : [...currentValues, typedValue];

    onChange(updatedValues.length > 0 ? updatedValues : undefined);
  };

  const handleRemove = (valueToRemove: T): void => {
    const currentValues = value ?? [];
    const updatedValues = currentValues.filter(v => v !== valueToRemove);
    onChange(updatedValues.length > 0 ? updatedValues : undefined);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block font-heading">{label}</label>
      <Select onValueChange={handleSelectionChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && value.length > 0 && (
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