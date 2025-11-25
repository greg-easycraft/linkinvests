"use client";

import { MultiSelectFilter } from './MultiSelectFilter';
import { OCCUPATION_STATUS_OPTIONS } from '../constants';
import { AuctionOccupationStatus } from '@linkinvests/shared';

interface OccupationStatusFilterProps {
  value?: AuctionOccupationStatus[];
  onChange: (value: AuctionOccupationStatus[] | undefined) => void;
}

export function OccupationStatusFilter({
  value,
  onChange,
}: OccupationStatusFilterProps): React.ReactElement {
  return (
    <MultiSelectFilter
      label="Statut d'occupation"
      options={OCCUPATION_STATUS_OPTIONS}
      value={value}
      onChange={onChange}
      placeholder="Sélectionner un statut..."
      badgeColor="bg-purple-100 text-purple-800"
    />
  );
}
