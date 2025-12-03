import {
  PROPERTY_LABELS,
  generateId,
  randomAddress,
  randomBoolean,
  randomDate,
  randomElement,
  randomInt,
} from './common'
import type { Auction, EnergyClassType, IAuctionFilters } from '@/types'
import {
  AuctionOccupationStatus,
  AuctionSource,
  EnergyClass,
  PropertyType,
} from '@/types'

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

const OCCUPATION_STATUSES: Array<AuctionOccupationStatus> = [
  AuctionOccupationStatus.FREE,
  AuctionOccupationStatus.OCCUPIED_BY_OWNER,
  AuctionOccupationStatus.RENTED,
  AuctionOccupationStatus.UNKNOWN,
]

const AUCTION_VENUES = [
  'TJ Paris',
  'TJ Lyon',
  'TJ Marseille',
  'TJ Bordeaux',
  'TJ Toulouse',
  'TJ Nantes',
  'TJ Nice',
  'TJ Strasbourg',
  'TJ Lille',
  'TJ Rennes',
]

function generateAuction(index: number): Auction {
  const propertyType = randomElement(Object.values(PropertyType))
  const addr = randomAddress()
  const reservePrice = randomInt(50000, 800000)
  const currentPrice = randomBoolean(0.7)
    ? reservePrice + randomInt(0, reservePrice * 0.3)
    : undefined

  const labels =
    PROPERTY_LABELS[propertyType as keyof typeof PROPERTY_LABELS] ||
    PROPERTY_LABELS.other

  return {
    id: generateId('auction', index),
    label: `${randomElement(labels)} - ${addr.city}`,
    address: `${addr.address}, ${addr.zipCode} ${addr.city}`,
    zipCode: addr.zipCode,
    department: addr.department,
    latitude: addr.lat + (Math.random() - 0.5) * 0.02,
    longitude: addr.lng + (Math.random() - 0.5) * 0.02,
    opportunityDate: randomDate(180).toISOString(),
    externalId: `EP-${randomInt(100000, 999999)}`,
    createdAt: randomDate(200),
    updatedAt: randomDate(30),
    url: `https://www.encheres-publiques.com/vente/${randomInt(10000, 99999)}`,
    propertyType,
    description: `Belle opportunité d'acquisition aux enchères. ${randomElement(labels)} situé à ${addr.city}.`,
    squareFootage: randomInt(20, 200),
    rooms: randomInt(1, 6),
    energyClass: randomElement(ENERGY_CLASSES),
    auctionVenue: randomElement(AUCTION_VENUES),
    currentPrice,
    reservePrice,
    lowerEstimate: reservePrice * 0.8,
    upperEstimate: reservePrice * 1.2,
    mainPicture: randomBoolean(0.6)
      ? `https://picsum.photos/seed/${index}/400/300`
      : undefined,
    pictures: randomBoolean(0.4)
      ? Array.from(
          { length: randomInt(2, 5) },
          (_, i) => `https://picsum.photos/seed/${index}-${i}/800/600`,
        )
      : undefined,
    auctionHouseContact: {
      name: randomElement(AUCTION_VENUES),
      address: `${addr.address}, ${addr.zipCode} ${addr.city}`,
      phone: `01 ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)} ${randomInt(10, 99)}`,
      email: 'contact@encheres-publiques.com',
      auctioneer: `Maître ${randomElement(['Dupont', 'Martin', 'Bernard', 'Thomas'])}`,
      registrationRequired: randomBoolean(0.8),
      depositAmount: randomBoolean(0.6) ? randomInt(1000, 10000) : undefined,
    },
    source: AuctionSource.ENCHERES_PUBLIQUES,
    occupationStatus: randomElement(OCCUPATION_STATUSES),
  }
}

// Generate and cache dummy auctions
let cachedAuctions: Array<Auction> | null = null

export function generateDummyAuctions(count = 50): Array<Auction> {
  if (cachedAuctions && cachedAuctions.length === count) {
    return cachedAuctions
  }
  cachedAuctions = Array.from({ length: count }, (_, i) => generateAuction(i))
  return cachedAuctions
}

// Filter function for auctions
export function filterAuctions(
  auctions: Array<Auction>,
  filters: IAuctionFilters,
): Array<Auction> {
  return auctions.filter((auction) => {
    // Department filter
    if (
      filters.departments?.length &&
      !filters.departments.includes(auction.department)
    ) {
      return false
    }

    // Property type filter
    if (
      filters.propertyTypes?.length &&
      auction.propertyType &&
      !filters.propertyTypes.includes(auction.propertyType)
    ) {
      return false
    }

    // Price range filter
    if (filters.minPrice && (auction.currentPrice ?? 0) < filters.minPrice) {
      return false
    }
    if (
      filters.maxPrice &&
      (auction.currentPrice ?? Infinity) > filters.maxPrice
    ) {
      return false
    }

    // Reserve price filter
    if (
      filters.minReservePrice &&
      (auction.reservePrice ?? 0) < filters.minReservePrice
    ) {
      return false
    }
    if (
      filters.maxReservePrice &&
      (auction.reservePrice ?? Infinity) > filters.maxReservePrice
    ) {
      return false
    }

    // Square footage filter
    if (
      filters.minSquareFootage &&
      (auction.squareFootage ?? 0) < filters.minSquareFootage
    ) {
      return false
    }
    if (
      filters.maxSquareFootage &&
      (auction.squareFootage ?? Infinity) > filters.maxSquareFootage
    ) {
      return false
    }

    // Rooms filter
    if (filters.minRooms && (auction.rooms ?? 0) < filters.minRooms) {
      return false
    }
    if (filters.maxRooms && (auction.rooms ?? Infinity) > filters.maxRooms) {
      return false
    }

    // Energy class filter
    if (
      filters.energyClasses?.length &&
      !filters.energyClasses.includes(auction.energyClass)
    ) {
      return false
    }

    // Occupation status filter
    if (
      filters.occupationStatuses?.length &&
      !filters.occupationStatuses.includes(auction.occupationStatus)
    ) {
      return false
    }

    return true
  })
}

// Get auction by ID
export function getAuctionById(id: string): Auction | undefined {
  const auctions = generateDummyAuctions()
  return auctions.find((a) => a.id === id)
}
