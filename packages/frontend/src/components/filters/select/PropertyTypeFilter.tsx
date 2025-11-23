"use client";

import { MultiSelectFilter } from './MultiSelectFilter';
import { AUCTION_PROPERTY_TYPE_OPTIONS, LISTING_PROPERTY_TYPE_OPTIONS } from '../constants';

interface PropertyTypeFilterProps {
  value?: string[];
  onChange: (value: string[] | undefined) => void;
  type: 'auction' | 'listing';
}

export function PropertyTypeFilter({
  value,
  onChange,
  type,
}: PropertyTypeFilterProps): React.ReactElement {

  const options = type === 'auction' ? AUCTION_PROPERTY_TYPE_OPTIONS : LISTING_PROPERTY_TYPE_OPTIONS;

  return (
    <MultiSelectFilter
      label="Type de bien"
      options={options}
      value={value}
      onChange={onChange}
      placeholder="Sélectionner un type..."
      badgeColor="bg-green-100 text-green-800"
    />
  );
}