"use client";

import { MultiSelectFilter } from './MultiSelectFilter';
import { AUCTION_TYPE_OPTIONS } from '../constants';

interface AuctionTypeFilterProps {
  value?: string[];
  onChange: (value: string[] | undefined) => void;
}

export function AuctionTypeFilter({
  value,
  onChange,
}: AuctionTypeFilterProps): React.ReactElement {
  return (
    <MultiSelectFilter
      label="Type d'enchère"
      options={AUCTION_TYPE_OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="Sélectionner un type..."
      badgeColor="bg-blue-100 text-blue-800"
    />
  );
}