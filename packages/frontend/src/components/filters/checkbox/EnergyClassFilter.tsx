"use client";

import { MultiCheckboxFilter } from './MultiCheckboxFilter';
import { ENERGY_CLASSES, ENERGY_SIEVE_CLASSES } from '../constants';
import { EnergyClass, type EnergyClassType } from "@linkinvests/shared";

interface EnergyClassFilterProps<T extends EnergyClass | EnergyClassType> {
  value?: T[];
  onChange: (value: T[] | undefined) => void;
  type?: 'all' | 'sieve'; // 'all' for all classes, 'sieve' for only E/F/G
  label?: string;
}

export function EnergyClassFilter<T extends EnergyClass | EnergyClassType>({
  value,
  onChange,
  type = 'all',
  label = "Diagnostic énergétique (DPE)",
}: EnergyClassFilterProps<T>): React.ReactElement {
  const options = type === 'all' ? ENERGY_CLASSES : ENERGY_SIEVE_CLASSES;

  return (
    <MultiCheckboxFilter
      label={label}
      // @ts-expect-error - typing issue with options
      options={options}
      value={value}
      onChange={onChange}
      idPrefix="energyClass"
    />
  );
}