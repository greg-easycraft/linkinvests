import {
  FRENCH_FIRST_NAMES,
  FRENCH_LAST_NAMES,
  generateId,
  randomAddress,
  randomBoolean,
  randomDate,
  randomElement,
  randomInt,
} from './common'
import type { ISuccessionFilters, Succession } from '@/types'

function generateSuccession(index: number): Succession {
  const addr = randomAddress()
  const firstName = randomElement(FRENCH_FIRST_NAMES)
  const lastName = randomElement(FRENCH_LAST_NAMES)

  return {
    id: generateId('succession', index),
    label: `Succession ${lastName} - ${addr.city}`,
    address: `${addr.address}, ${addr.zipCode} ${addr.city}`,
    zipCode: addr.zipCode,
    department: addr.department,
    latitude: addr.lat + (Math.random() - 0.5) * 0.02,
    longitude: addr.lng + (Math.random() - 0.5) * 0.02,
    opportunityDate: randomDate(365).toISOString(),
    externalId: `SUC-${randomInt(100000, 999999)}`,
    createdAt: randomDate(400),
    updatedAt: randomDate(30),
    firstName,
    lastName,
    mairieContact: {
      name: `Mairie de ${addr.city}`,
      address: {
        complement1: '',
        complement2: '',
        numero_voie: `${randomInt(1, 150)} Place de la Mairie`,
        service_distribution: '',
        code_postal: addr.zipCode,
        nom_commune: addr.city,
      },
      phone: `0${randomInt(1, 5)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
      email: randomBoolean(0.7)
        ? `mairie@${addr.city.toLowerCase().replace(/\s/g, '-')}.fr`
        : undefined,
      website: randomBoolean(0.5)
        ? `https://www.${addr.city.toLowerCase().replace(/\s/g, '-')}.fr`
        : undefined,
      openingHours: randomBoolean(0.6)
        ? 'Lundi-Vendredi: 9h-12h, 14h-17h'
        : undefined,
    },
  }
}

// Generate and cache dummy successions
let cachedSuccessions: Array<Succession> | null = null

export function generateDummySuccessions(count = 50): Array<Succession> {
  if (cachedSuccessions && cachedSuccessions.length === count) {
    return cachedSuccessions
  }
  cachedSuccessions = Array.from({ length: count }, (_, i) =>
    generateSuccession(i),
  )
  return cachedSuccessions
}

// Filter function for successions
export function filterSuccessions(
  successions: Array<Succession>,
  filters: ISuccessionFilters,
): Array<Succession> {
  return successions.filter((succession) => {
    // Department filter
    if (
      filters.departments?.length &&
      !filters.departments.includes(succession.department)
    ) {
      return false
    }

    // Zip code filter
    if (
      filters.zipCodes?.length &&
      !filters.zipCodes.includes(succession.zipCode)
    ) {
      return false
    }

    return true
  })
}

// Get succession by ID
export function getSuccessionById(id: string): Succession | undefined {
  const successions = generateDummySuccessions()
  return successions.find((s) => s.id === id)
}
