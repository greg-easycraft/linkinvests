import {
  generateId,
  randomAddress,
  randomDate,
  randomElement,
  randomInt,
} from './common'
import type { EnergyDiagnostic, IEnergyDiagnosticFilters } from '@/types'
import { EnergyClass } from '@/types'

// Energy sieves are only E, F, or G class properties
const ENERGY_SIEVE_CLASSES = [EnergyClass.E, EnergyClass.F, EnergyClass.G]

function generateEnergySieve(index: number): EnergyDiagnostic {
  const addr = randomAddress()
  const squareFootage = randomInt(30, 200)
  const energyClass = randomElement(ENERGY_SIEVE_CLASSES)

  return {
    id: generateId('energy-sieve', index),
    label: `Passoire énergétique ${energyClass} - ${addr.city}`,
    address: `${addr.address}, ${addr.zipCode} ${addr.city}`,
    zipCode: addr.zipCode,
    department: addr.department,
    latitude: addr.lat + (Math.random() - 0.5) * 0.02,
    longitude: addr.lng + (Math.random() - 0.5) * 0.02,
    opportunityDate: randomDate(365).toISOString(),
    externalId: `DPE-${randomInt(100000, 999999)}`,
    createdAt: randomDate(400),
    updatedAt: randomDate(30),
    energyClass,
    squareFootage,
  }
}

// Generate and cache dummy energy sieves
let cachedEnergySieves: Array<EnergyDiagnostic> | null = null

export function generateDummyEnergySieves(count = 50): Array<EnergyDiagnostic> {
  if (cachedEnergySieves && cachedEnergySieves.length === count) {
    return cachedEnergySieves
  }
  cachedEnergySieves = Array.from({ length: count }, (_, i) =>
    generateEnergySieve(i),
  )
  return cachedEnergySieves
}

// Filter function for energy sieves
export function filterEnergySieves(
  energySieves: Array<EnergyDiagnostic>,
  filters: IEnergyDiagnosticFilters,
): Array<EnergyDiagnostic> {
  return energySieves.filter((energySieve) => {
    // Department filter
    if (
      filters.departments?.length &&
      !filters.departments.includes(energySieve.department)
    ) {
      return false
    }

    // Zip code filter
    if (
      filters.zipCodes?.length &&
      !filters.zipCodes.includes(energySieve.zipCode)
    ) {
      return false
    }

    // Energy class filter (E, F, G only for energy sieves)
    if (
      filters.energyClasses?.length &&
      !filters.energyClasses.includes(energySieve.energyClass as EnergyClass)
    ) {
      return false
    }

    return true
  })
}

// Get energy sieve by ID
export function getEnergySieveById(id: string): EnergyDiagnostic | undefined {
  const energySieves = generateDummyEnergySieves()
  return energySieves.find((e) => e.id === id)
}
