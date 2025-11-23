"use client";

import { GenericRangeFilter, RangeFilterValue } from './GenericRangeFilter';

interface ReservePriceRangeFilterProps {
  value?: RangeFilterValue;
  onChange: (value: RangeFilterValue | undefined) => void;
  label?: string;
}

export function ReservePriceRangeFilter({
  value,
  onChange,
  label = "Prix de réserve",
}: ReservePriceRangeFilterProps): React.ReactElement {
  return (
    <GenericRangeFilter
      label={label}
      value={value}
      onChange={onChange}
      placeholder={{ min: 'Min', max: 'Max' }}
      unit="€"
    />
  );
}