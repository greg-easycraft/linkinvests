import { PropertyType } from '@linkinvests/shared'

/**
 * Property type options with French labels
 */
export interface PropertyTypeOption {
  value: PropertyType
  label: string
}

export const PROPERTY_TYPE_OPTIONS: Array<PropertyTypeOption> = [
  { value: PropertyType.FLAT, label: 'Appartement' },
  { value: PropertyType.HOUSE, label: 'Maison' },
  { value: PropertyType.COMMERCIAL, label: 'Local commercial' },
  { value: PropertyType.LAND, label: 'Terrain' },
  { value: PropertyType.OTHER, label: 'Autre' },
]

/**
 * Get property type label
 */
export function getPropertyTypeLabel(value: PropertyType): string {
  const option = PROPERTY_TYPE_OPTIONS.find((opt) => opt.value === value)
  return option?.label ?? value
}
