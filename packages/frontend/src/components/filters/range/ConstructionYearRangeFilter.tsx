"use client";

import { GenericRangeFilter, RangeFilterValue } from './GenericRangeFilter';

interface ConstructionYearRangeFilterProps {
  value?: RangeFilterValue;
  onChange: (value: RangeFilterValue | undefined) => void;
  label?: string;
}

export function ConstructionYearRangeFilter({
  value,
  onChange,
  label = "Année de construction",
}: ConstructionYearRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      value={value}
      onChange={onChange}
      placeholder={{ min: 'Min', max: 'Max' }}
    />
  );
}