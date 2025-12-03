import {
  PROPERTY_LABELS,
  generateId,
  randomAddress,
  randomBoolean,
  randomDate,
  randomElement,
  randomInt,
} from './common'
import type { EnergyClassType, IListingFilters, Listing } from '@/types'
import { EnergyClass, PropertyType } from '@/types'

const ENERGY_CLASSES: Array<EnergyClassType> = [
  EnergyClass.A,
  EnergyClass.B,
  EnergyClass.C,
  EnergyClass.D,
  EnergyClass.E,
  EnergyClass.F,
  EnergyClass.G,
  'UNKNOWN',
]

const LISTING_SOURCES = [
  'leboncoin.fr',
  'seloger.com',
  'pap.fr',
  'logic-immo.com',
  'bien-ici.com',
  'ouestfrance-immo.com',
]

const LISTING_OPTIONS = [
  'balcon',
  'terrasse',
  'jardin',
  'garage',
  'parking',
  'cave',
  'ascenseur',
  'gardien',
  'digicode',
  'interphone',
  'piscine',
  'climatisation',
]

function generateListing(index: number): Listing {
  const propertyType = randomElement(Object.values(PropertyType))
  const addr = randomAddress()
  const price = randomInt(80000, 1200000)

  const labels =
    PROPERTY_LABELS[propertyType as keyof typeof PROPERTY_LABELS] ||
    PROPERTY_LABELS.other

  const rooms = randomInt(1, 7)
  const bedrooms = Math.max(0, rooms - randomInt(1, 2))
  const squareFootage = randomInt(20, 250)

  const opportunityDate = randomDate(90)
  const lastChangeDate = randomBoolean(0.4)
    ? new Date(
        opportunityDate.getTime() + randomInt(1, 30) * 24 * 60 * 60 * 1000,
      )
    : opportunityDate

  return {
    id: generateId('listing', index),
    label: `${randomElement(labels)} ${rooms} pièces - ${addr.city}`,
    address: `${addr.address}, ${addr.zipCode} ${addr.city}`,
    zipCode: addr.zipCode,
    department: addr.department,
    latitude: addr.lat + (Math.random() - 0.5) * 0.02,
    longitude: addr.lng + (Math.random() - 0.5) * 0.02,
    opportunityDate: opportunityDate.toISOString(),
    externalId: `LST-${randomInt(100000, 999999)}`,
    createdAt: randomDate(120),
    updatedAt: randomDate(14),
    url: `https://www.example.com/annonce/${randomInt(10000, 99999)}`,
    source: randomElement(LISTING_SOURCES),
    propertyType,
    lastChangeDate: lastChangeDate.toISOString(),
    description: `${randomElement(labels)} de ${squareFootage}m² avec ${rooms} pièces dont ${bedrooms} chambres. Situé à ${addr.city}.`,
    squareFootage,
    landArea:
      propertyType === PropertyType.HOUSE || propertyType === PropertyType.LAND
        ? randomInt(200, 2000)
        : undefined,
    rooms,
    bedrooms,
    energyClass: randomElement(ENERGY_CLASSES),
    constructionYear: randomBoolean(0.6) ? randomInt(1900, 2024) : undefined,
    floor: propertyType === PropertyType.FLAT ? randomInt(0, 8) : undefined,
    totalFloors:
      propertyType === PropertyType.FLAT ? randomInt(3, 12) : undefined,
    options: randomBoolean(0.7)
      ? Array.from({ length: randomInt(1, 5) }, () =>
          randomElement(LISTING_OPTIONS),
        ).filter((v, i, a) => a.indexOf(v) === i)
      : undefined,
    keywords: randomBoolean(0.3)
      ? ['lumineux', 'calme', 'proche transports']
      : undefined,
    isSoldRented: randomBoolean(0.15),
    price,
    priceType: randomElement(['FAI', 'CC', 'Net vendeur']),
    fees: randomBoolean(0.5) ? randomInt(1000, 15000) : undefined,
    charges: randomBoolean(0.4) ? randomInt(50, 400) : undefined,
    mainPicture: randomBoolean(0.8)
      ? `https://picsum.photos/seed/listing-${index}/400/300`
      : undefined,
    pictures: randomBoolean(0.6)
      ? Array.from(
          { length: randomInt(3, 8) },
          (_, i) => `https://picsum.photos/seed/listing-${index}-${i}/800/600`,
        )
      : undefined,
    sellerType: randomElement(['individual', 'professional']),
    sellerContact: {
      name: randomBoolean(0.7)
        ? randomElement([
            'Agence Immobilière du Centre',
            'Century 21',
            'Orpi',
            'Particulier',
            'ERA Immobilier',
          ])
        : undefined,
      phone: `06 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
      email: randomBoolean(0.5) ? 'contact@agence.fr' : undefined,
    },
  }
}

// Generate and cache dummy listings
let cachedListings: Array<Listing> | null = null

export function generateDummyListings(count = 50): Array<Listing> {
  if (cachedListings && cachedListings.length === count) {
    return cachedListings
  }
  cachedListings = Array.from({ length: count }, (_, i) => generateListing(i))
  return cachedListings
}

// Filter function for listings
export function filterListings(
  listings: Array<Listing>,
  filters: IListingFilters,
): Array<Listing> {
  return listings.filter((listing) => {
    // Department filter
    if (
      filters.departments?.length &&
      !filters.departments.includes(listing.department)
    ) {
      return false
    }

    // Property type filter
    if (
      filters.propertyTypes?.length &&
      !filters.propertyTypes.includes(listing.propertyType)
    ) {
      return false
    }

    // Price range filter
    if (filters.minPrice && (listing.price ?? 0) < filters.minPrice) {
      return false
    }
    if (filters.maxPrice && (listing.price ?? Infinity) > filters.maxPrice) {
      return false
    }

    // Square footage filter
    if (
      filters.minSquareFootage &&
      (listing.squareFootage ?? 0) < filters.minSquareFootage
    ) {
      return false
    }
    if (
      filters.maxSquareFootage &&
      (listing.squareFootage ?? Infinity) > filters.maxSquareFootage
    ) {
      return false
    }

    // Land area filter
    if (filters.minLandArea && (listing.landArea ?? 0) < filters.minLandArea) {
      return false
    }
    if (
      filters.maxLandArea &&
      (listing.landArea ?? Infinity) > filters.maxLandArea
    ) {
      return false
    }

    // Rooms filter
    if (filters.minRooms && (listing.rooms ?? 0) < filters.minRooms) {
      return false
    }
    if (filters.maxRooms && (listing.rooms ?? Infinity) > filters.maxRooms) {
      return false
    }

    // Bedrooms filter
    if (filters.minBedrooms && (listing.bedrooms ?? 0) < filters.minBedrooms) {
      return false
    }
    if (
      filters.maxBedrooms &&
      (listing.bedrooms ?? Infinity) > filters.maxBedrooms
    ) {
      return false
    }

    // Construction year filter
    if (
      filters.minConstructionYear &&
      (listing.constructionYear ?? 0) < filters.minConstructionYear
    ) {
      return false
    }
    if (
      filters.maxConstructionYear &&
      (listing.constructionYear ?? Infinity) > filters.maxConstructionYear
    ) {
      return false
    }

    // Energy class filter
    if (
      filters.energyClasses?.length &&
      !filters.energyClasses.includes(listing.energyClass)
    ) {
      return false
    }

    // Rental status filter
    if (
      filters.isSoldRented !== undefined &&
      listing.isSoldRented !== filters.isSoldRented
    ) {
      return false
    }

    // Seller type filter
    if (filters.sellerType && listing.sellerType !== filters.sellerType) {
      return false
    }

    // Sources filter
    if (filters.sources?.length && !filters.sources.includes(listing.source)) {
      return false
    }

    return true
  })
}

// Get listing by ID
export function getListingById(id: string): Listing | undefined {
  const listings = generateDummyListings()
  return listings.find((l) => l.id === id)
}
