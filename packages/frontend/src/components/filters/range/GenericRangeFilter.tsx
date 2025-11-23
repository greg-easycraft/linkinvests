"use client";

import { Input } from "~/components/ui/input";

export interface RangeFilterValue {
  min?: number;
  max?: number;
}

interface GenericRangeFilterProps {
  label: string;
  value?: RangeFilterValue;
  onChange: (value: RangeFilterValue | undefined) => void;
  placeholder?: {
    min?: string;
    max?: string;
  };
  unit?: string;
}

export function GenericRangeFilter({
  label,
  value,
  onChange,
  placeholder = { min: 'Min', max: 'Max' },
  unit,
}: GenericRangeFilterProps): React.ReactElement {

  const handleRangeChange = (field: 'min' | 'max', inputValue: string): void => {
    const numValue = inputValue === '' ? undefined : parseFloat(inputValue);
    const currentRange = value ?? {};
    const newRange = { ...currentRange, [field]: numValue };

    // Remove range if both min and max are undefined
    const rangeToSet = (newRange.min === undefined && newRange.max === undefined) ? undefined : newRange;

    onChange(rangeToSet);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block font-heading">
        {label}
        {unit && <span className="text-xs opacity-70 ml-1">({unit})</span>}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          placeholder={placeholder.min}
          value={value?.min ?? ''}
          onChange={(e) => handleRangeChange('min', e.target.value)}
        />
        <Input
          type="number"
          placeholder={placeholder.max}
          value={value?.max ?? ''}
          onChange={(e) => handleRangeChange('max', e.target.value)}
        />
      </div>
    </div>
  );
}