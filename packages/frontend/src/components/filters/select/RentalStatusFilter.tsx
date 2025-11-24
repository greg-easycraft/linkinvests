"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { RENTAL_STATUS_OPTIONS } from '../constants';
import { useAuthSafeDropdown } from "~/hooks/useAuthSafeDropdown";

interface RentalStatusFilterProps {
  value?: boolean;
  onChange: (value: boolean | undefined) => void;
}

export function RentalStatusFilter({
  value,
  onChange,
}: RentalStatusFilterProps): React.ReactElement {
  const { isOpen, setIsOpen } = useAuthSafeDropdown();

  const handleRentalStatusChange = (selectedValue: string): void => {
    const booleanValue = selectedValue === 'true' ? true : selectedValue === 'false' ? false : undefined;
    onChange(booleanValue);
    setIsOpen(false); // Close dropdown after selection
  };

  // Get current value string including undefined for "Tous"
  const getCurrentValueString = (): string => {
    if (value === undefined) return 'undefined';
    return String(value);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block font-heading">Statut locatif</label>
      <Select
        value={getCurrentValueString()}
        onValueChange={handleRentalStatusChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {RENTAL_STATUS_OPTIONS.map((option) => (
            <SelectItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}