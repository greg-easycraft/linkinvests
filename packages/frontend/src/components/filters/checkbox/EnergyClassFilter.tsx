"use client";

import { MultiCheckboxFilter } from './MultiCheckboxFilter';
import { ENERGY_CLASSES, ENERGY_SIEVE_CLASSES } from '../constants';
import type { EnergyClass } from "@linkinvests/shared";

interface EnergyClassFilterProps {
  value?: EnergyClass[];
  onChange: (value: EnergyClass[] | undefined) => void;
  type?: 'all' | 'sieve'; // 'all' for all classes, 'sieve' for only E/F/G
  label?: string;
}

export function EnergyClassFilter({
  value,
  onChange,
  type = 'all',
  label = "Diagnostic énergétique (DPE)",
}: EnergyClassFilterProps): React.ReactElement {

  const options = type === 'all' ? ENERGY_CLASSES : ENERGY_SIEVE_CLASSES;

  return (
    <MultiCheckboxFilter
      label={label}
      options={options}
      value={value}
      onChange={onChange}
      idPrefix="energyClass"
    />
  );
}