"use client";

import { MultiSelectFilter } from './MultiSelectFilter';
import { PROPERTY_TYPE_OPTIONS } from '../constants';
import { PropertyType } from '@linkinvests/shared';

interface PropertyTypeFilterProps {
  value?: PropertyType[];
  onChange: (value: PropertyType[] | undefined) => void;
}

export function PropertyTypeFilter({
  value,
  onChange,
}: PropertyTypeFilterProps): React.ReactElement {
  return (
    <MultiSelectFilter
      label="Type de bien"
      options={PROPERTY_TYPE_OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="Sélectionner un type..."
      badgeColor="bg-green-100 text-green-800"
    />
  );
}