"use client";

import { GenericRangeFilter, RangeFilterValue } from './GenericRangeFilter';

interface RoomsRangeFilterProps {
  value?: RangeFilterValue;
  onChange: (value: RangeFilterValue | undefined) => void;
  label?: string;
}

export function RoomsRangeFilter({
  value,
  onChange,
  label = "Nombre de pièces",
}: RoomsRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      value={value}
      onChange={onChange}
      placeholder={{ min: 'Min', max: 'Max' }}
    />
  );
}