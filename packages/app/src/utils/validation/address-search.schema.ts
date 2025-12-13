import { z } from 'zod'

import { EnergyClass } from '@linkinvests/shared'

export const addressSearchSchema = z.object({
  energyClass: z.enum(EnergyClass),
  squareFootage: z
    .number()
    .positive('La superficie doit être un nombre positif'),
  zipCode: z
    .string()
    .min(1, 'Le code postal est requis')
    .regex(/^\d{5}$/, 'Le code postal doit contenir exactement 5 chiffres'),
  address: z.string().optional(),
})

export type AddressSearchFormData = z.infer<typeof addressSearchSchema>

export const ENERGY_CLASS_OPTIONS: Array<{
  value: EnergyClass
  label: string
  color: string
}> = [
  { value: EnergyClass.A, label: 'A', color: 'text-green-600' },
  { value: EnergyClass.B, label: 'B', color: 'text-green-500' },
  { value: EnergyClass.C, label: 'C', color: 'text-yellow-500' },
  { value: EnergyClass.D, label: 'D', color: 'text-yellow-600' },
  { value: EnergyClass.E, label: 'E', color: 'text-orange-500' },
  { value: EnergyClass.F, label: 'F', color: 'text-red-500' },
  { value: EnergyClass.G, label: 'G', color: 'text-red-600' },
]
