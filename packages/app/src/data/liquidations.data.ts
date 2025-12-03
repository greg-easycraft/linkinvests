import {
  COMPANY_NAMES,
  COMPANY_PREFIXES,
  generateId,
  randomAddress,
  randomBoolean,
  randomDate,
  randomElement,
  randomInt,
} from './common'
import type { ILiquidationFilters, Liquidation } from '@/types'

function generateSiret(): string {
  // Generate a realistic-looking SIRET (14 digits)
  const siren = `${randomInt(100, 999)}${randomInt(100, 999)}${randomInt(100, 999)}`
  const nic = `${randomInt(10000, 99999)}`
  return `${siren}${nic}`
}

function generateLiquidation(index: number): Liquidation {
  const addr = randomAddress()
  const companyName = `${randomElement(COMPANY_PREFIXES)} ${randomElement(COMPANY_NAMES)}`

  return {
    id: generateId('liquidation', index),
    label: `${companyName} - ${addr.city}`,
    address: `${addr.address}, ${addr.zipCode} ${addr.city}`,
    zipCode: addr.zipCode,
    department: addr.department,
    latitude: addr.lat + (Math.random() - 0.5) * 0.02,
    longitude: addr.lng + (Math.random() - 0.5) * 0.02,
    opportunityDate: randomDate(180).toISOString(),
    externalId: `LIQ-${randomInt(100000, 999999)}`,
    createdAt: randomDate(200),
    updatedAt: randomDate(30),
    siret: generateSiret(),
    companyContact: {
      name: companyName,
      phone: randomBoolean(0.6)
        ? `0${randomInt(1, 5)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`
        : undefined,
      email: randomBoolean(0.5)
        ? `contact@${companyName
            .toLowerCase()
            .replace(/\s/g, '-')
            .replace(/[^a-z0-9-]/g, '')}.fr`
        : undefined,
      legalRepresentative: randomBoolean(0.7)
        ? `${randomElement(['M.', 'Mme'])} ${randomElement(['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit'])}`
        : undefined,
      administrateur: randomBoolean(0.5)
        ? `Maître ${randomElement(['Lefevre', 'Moreau', 'Simon', 'Laurent', 'Michel'])}`
        : undefined,
    },
  }
}

// Generate and cache dummy liquidations
let cachedLiquidations: Array<Liquidation> | null = null

export function generateDummyLiquidations(count = 50): Array<Liquidation> {
  if (cachedLiquidations && cachedLiquidations.length === count) {
    return cachedLiquidations
  }
  cachedLiquidations = Array.from({ length: count }, (_, i) =>
    generateLiquidation(i),
  )
  return cachedLiquidations
}

// Filter function for liquidations
export function filterLiquidations(
  liquidations: Array<Liquidation>,
  filters: ILiquidationFilters,
): Array<Liquidation> {
  return liquidations.filter((liquidation) => {
    // Department filter
    if (
      filters.departments?.length &&
      !filters.departments.includes(liquidation.department)
    ) {
      return false
    }

    // Zip code filter
    if (
      filters.zipCodes?.length &&
      !filters.zipCodes.includes(liquidation.zipCode)
    ) {
      return false
    }

    return true
  })
}

// Get liquidation by ID
export function getLiquidationById(id: string): Liquidation | undefined {
  const liquidations = generateDummyLiquidations()
  return liquidations.find((l) => l.id === id)
}
