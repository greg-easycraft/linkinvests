import { EnergyClass } from '@/types'

/**
 * Energy class options with labels and colors
 */
export interface EnergyClassOption {
  value: EnergyClass
  label: string
  color: string
  bgColor: string
}

export const ENERGY_CLASS_OPTIONS: Array<EnergyClassOption> = [
  { value: EnergyClass.A, label: 'A', color: '#1d8a3e', bgColor: '#dcfce7' },
  { value: EnergyClass.B, label: 'B', color: '#3b9e47', bgColor: '#dcfce7' },
  { value: EnergyClass.C, label: 'C', color: '#8cc63f', bgColor: '#ecfccb' },
  { value: EnergyClass.D, label: 'D', color: '#f9e814', bgColor: '#fef9c3' },
  { value: EnergyClass.E, label: 'E', color: '#f5a623', bgColor: '#fed7aa' },
  { value: EnergyClass.F, label: 'F', color: '#e85c0f', bgColor: '#fed7aa' },
  { value: EnergyClass.G, label: 'G', color: '#d1232a', bgColor: '#fee2e2' },
]

/**
 * Energy sieve classes (F and G only)
 */
export const ENERGY_SIEVE_CLASSES = [
  EnergyClass.E,
  EnergyClass.F,
  EnergyClass.G,
]

/**
 * Get energy class option by value
 */
export function getEnergyClassOption(
  value: EnergyClass,
): EnergyClassOption | undefined {
  return ENERGY_CLASS_OPTIONS.find((option) => option.value === value)
}

/**
 * Get color for energy class
 */
export function getEnergyClassColor(value: string): string {
  const option = ENERGY_CLASS_OPTIONS.find((opt) => opt.value === value)
  return option?.color ?? '#9ca3af' // gray-400 as fallback
}

/**
 * Get background color for energy class
 */
export function getEnergyClassBgColor(value: string): string {
  const option = ENERGY_CLASS_OPTIONS.find((opt) => opt.value === value)
  return option?.bgColor ?? '#f3f4f6' // gray-100 as fallback
}
