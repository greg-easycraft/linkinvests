"use client";

import { GenericRangeFilter, RangeFilterValue } from './GenericRangeFilter';

interface PriceRangeFilterProps {
  value?: RangeFilterValue;
  onChange: (value: RangeFilterValue | undefined) => void;
  label?: string;
}

export function PriceRangeFilter({
  value,
  onChange,
  label = "Prix",
}: PriceRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      value={value}
      onChange={onChange}
      placeholder={{ min: 'Prix min', max: 'Prix max' }}
      unit="€"
    />
  );
}