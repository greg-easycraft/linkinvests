"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { SELLER_TYPE_OPTIONS } from "../constants";

interface SellerTypeFilterProps {
  value?: 'individual' | 'professional';
  onChange: (sellerType?: 'individual' | 'professional') => void;
}

export function SellerTypeFilter({ value, onChange }: SellerTypeFilterProps) {
  const handleSellerTypeChange = (selectedValue: string) => {
    if (selectedValue === 'undefined') {
      onChange(undefined);
    } else {
      onChange(selectedValue as 'individual' | 'professional');
    }
  };

  return (
    <div className="space-y-2">
      <Select
        value={value !== undefined ? value : 'undefined'}
        onValueChange={handleSellerTypeChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Type de vendeur..." />
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

      {value !== undefined && (
        <div className="flex flex-wrap gap-1">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-indigo-100 text-indigo-800">
            {SELLER_TYPE_OPTIONS.find(o => o.value === value)?.label}
            <button
              onClick={() => onChange(undefined)}
              className="ml-1 text-indigo-600 hover:text-indigo-800"
            >
              ×
            </button>
          </span>
        </div>
      )}
    </div>
  );
}