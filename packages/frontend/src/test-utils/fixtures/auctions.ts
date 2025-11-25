import { Auction, AuctionOccupationStatus, AuctionSource } from "@linkinvests/shared";

export const AUCTION_1: Auction = {
    id: '1',
    label: 'Auction 1',
    address: '123 Main St, Anytown, USA',
    zipCode: '12345',
    department: 'CA',
    latitude: 37.7749,
    longitude: -122.4194,
    opportunityDate: new Date('2021-01-01').toISOString().split('T')[0] as string,
    externalId: '1234567890',
    source: AuctionSource.ENCHERES_PUBLIQUES,
    url: 'https://www.encheres-publiques.fr/lot/1234567890',
    createdAt: new Date('2021-01-01'),
    updatedAt: new Date('2021-01-01'),
    occupationStatus: AuctionOccupationStatus.UNKNOWN,
}

export const AUCTION_2: Auction = {
    id: '2',
    label: 'Auction 2',
    address: '456 Elm St, Othertown, USA',
    zipCode: '23456',
    department: 'NY',
    latitude: 40.7128,
    longitude: -74.0060,
    opportunityDate: new Date('2021-02-15').toISOString().split('T')[0] as string,
    externalId: '9876543210',
    source: AuctionSource.ENCHERES_PUBLIQUES,
    url: 'https://www.interencheres.com/lot/9876543210',
    createdAt: new Date('2021-02-10'),
    updatedAt: new Date('2021-02-13'),
    occupationStatus: AuctionOccupationStatus.FREE,
}

export const AUCTION_3: Auction = {
    id: '3',
    label: 'Auction 3',
    address: '789 Oak St, Sample City, USA',
    zipCode: '34567',
    department: 'TX',
    latitude: 29.7604,
    longitude: -95.3698,
    opportunityDate: new Date('2021-03-01').toISOString().split('T')[0] as string,
    externalId: '2468135790',
    source: AuctionSource.ENCHERES_PUBLIQUES,
    url: 'https://www.encheres-publiques.fr/lot/2468135790',
    createdAt: new Date('2021-02-25'),
    updatedAt: new Date('2021-02-28'),
    occupationStatus: AuctionOccupationStatus.RENTED,
}

export const AUCTION_4: Auction = {
    id: '4',
    label: 'Auction 4',
    address: '159 Maple Ave, Demo Town, USA',
    zipCode: '45678',
    department: 'FL',
    latitude: 25.7617,
    longitude: -80.1918,
    opportunityDate: new Date('2021-04-10').toISOString().split('T')[0] as string,
    externalId: '1357924680',
    source: AuctionSource.ENCHERES_PUBLIQUES,
    url: 'https://www.encheres-publiques.fr/lot/1357924680',
    createdAt: new Date('2021-04-05'),
    updatedAt: new Date('2021-04-08'),
    occupationStatus: AuctionOccupationStatus.OCCUPIED_BY_OWNER,
}

export const AUCTION_5: Auction = {
    id: '5',
    label: 'Auction 5',
    address: '321 Pine Rd, Exampleville, USA',
    zipCode: '56789',
    department: 'IL',
    latitude: 41.8781,
    longitude: -87.6298,
    opportunityDate: new Date('2021-05-21').toISOString().split('T')[0] as string,
    externalId: '1122334455',
    source: AuctionSource.ENCHERES_PUBLIQUES,
    url: 'https://www.encheres-publiques.fr/lot/1122334455',
    createdAt: new Date('2021-05-18'),
    updatedAt: new Date('2021-05-20'),
    occupationStatus: AuctionOccupationStatus.UNKNOWN,
}

export const ALL_AUCTIONS: Auction[] = [AUCTION_1, AUCTION_2, AUCTION_3, AUCTION_4, AUCTION_5];