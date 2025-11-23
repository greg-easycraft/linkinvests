import { EnergyClass } from "~/types/filters";

// Energy classes with labels and colors
export const ENERGY_CLASSES: { value: EnergyClass; label: string; color: string }[] = [
  { value: 'A', label: 'A (Très économe)', color: 'text-green-600' },
  { value: 'B', label: 'B (Économe)', color: 'text-green-500' },
  { value: 'C', label: 'C (Conventionnel)', color: 'text-yellow-500' },
  { value: 'D', label: 'D (Peu économe)', color: 'text-orange-400' },
  { value: 'E', label: 'E (Peu économe)', color: 'text-orange-600' },
  { value: 'F', label: 'F (Énergivore)', color: 'text-red-500' },
  { value: 'G', label: 'G (Très énergivore)', color: 'text-red-700' },
] as const;

// Energy classes for energy sieve (only E, F, G)
export const ENERGY_SIEVE_CLASSES = ENERGY_CLASSES.filter(
  cls => ['E', 'F', 'G'].includes(cls.value)
) as { value: EnergyClass; label: string; color: string }[];