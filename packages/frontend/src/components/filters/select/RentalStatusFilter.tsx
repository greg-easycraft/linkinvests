"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { RENTAL_STATUS_OPTIONS } from '../constants';

interface RentalStatusFilterProps {
  value?: boolean;
  onChange: (value: boolean | undefined) => void;
}

export function RentalStatusFilter({
  value,
  onChange,
}: RentalStatusFilterProps): React.ReactElement {

  const handleRentalStatusChange = (selectedValue: string): void => {
    const booleanValue = selectedValue === 'true' ? true : selectedValue === 'false' ? false : undefined;
    onChange(booleanValue);
  };

  const handleClearStatus = (): void => {
    onChange(undefined);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block font-heading">Statut locatif</label>
      <Select
        value={value !== undefined ? String(value) : undefined}
        onValueChange={handleRentalStatusChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Tous les statuts..." />
        </SelectTrigger>
        <SelectContent>
          {RENTAL_STATUS_OPTIONS.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value !== undefined && (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
            {RENTAL_STATUS_OPTIONS.find(o => o.value === value)?.label}
            <button
              onClick={handleClearStatus}
              className="ml-1 text-orange-600 hover:text-orange-800"
            >
              ×
            </button>
          </span>
        </div>
      )}
    </div>
  );
}