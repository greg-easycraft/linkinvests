"use client";

import { GenericRangeFilter, RangeFilterValue } from './GenericRangeFilter';

interface LandAreaRangeFilterProps {
  value?: RangeFilterValue;
  onChange: (value: RangeFilterValue | undefined) => void;
  label?: string;
}

export function LandAreaRangeFilter({
  value,
  onChange,
  label = "Surface terrain",
}: LandAreaRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      value={value}
      onChange={onChange}
      placeholder={{ min: 'Min', max: 'Max' }}
      unit="m²"
    />
  );
}