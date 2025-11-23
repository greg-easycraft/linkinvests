"use client";

import { GenericRangeFilter, RangeFilterValue } from './GenericRangeFilter';

interface BedroomsRangeFilterProps {
  value?: RangeFilterValue;
  onChange: (value: RangeFilterValue | undefined) => void;
  label?: string;
}

export function BedroomsRangeFilter({
  value,
  onChange,
  label = "Nombre de chambres",
}: BedroomsRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      value={value}
      onChange={onChange}
      placeholder={{ min: 'Min', max: 'Max' }}
    />
  );
}