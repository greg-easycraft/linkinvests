"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { SELLER_TYPE_OPTIONS } from "../constants";

interface SellerTypeFilterProps {
  value?: 'individual' | 'professional';
  onChange: (sellerType?: 'individual' | 'professional') => void;
}

export function SellerTypeFilter({ value, onChange }: SellerTypeFilterProps) {
  const handleSellerTypeChange = (selectedValue: string): void => {
    if (selectedValue === 'undefined') {
      onChange(undefined);
    } else {
      onChange(selectedValue as 'individual' | 'professional');
    }
  };

  // Get current value string including undefined
  const getCurrentValueString = (): string => {
    if (value === undefined) return 'undefined';
    return value;
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block font-heading">Type de vendeur</label>
      <Select
        value={getCurrentValueString()}
        onValueChange={handleSellerTypeChange}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SELLER_TYPE_OPTIONS.map((option) => (
            <SelectItem
              key={option.value === undefined ? 'undefined' : option.value}
              value={option.value === undefined ? 'undefined' : option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}