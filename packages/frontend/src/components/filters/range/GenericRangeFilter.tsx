"use client";

import { Input } from "~/components/ui/input";

interface GenericRangeFilterProps {
  label: string;
  minValue?: number;
  maxValue?: number;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  placeholder?: {
    min?: string;
    max?: string;
  };
  unit?: string;
}

export function GenericRangeFilter({
  label,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  placeholder = { min: 'Min', max: 'Max' },
  unit,
}: GenericRangeFilterProps): React.ReactElement {

  const handleRangeChange = (field: 'min' | 'max', inputValue: string): void => {
    const numValue = inputValue === '' ? undefined : parseFloat(inputValue);

    if (field === 'min') {
      onMinChange(numValue);
    } else {
      onMaxChange(numValue);
    }
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
          value={minValue ?? ''}
          onChange={(e) => handleRangeChange('min', e.target.value)}
        />
        <Input
          type="number"
          placeholder={placeholder.max}
          value={maxValue ?? ''}
          onChange={(e) => handleRangeChange('max', e.target.value)}
        />
      </div>
    </div>
  );
}