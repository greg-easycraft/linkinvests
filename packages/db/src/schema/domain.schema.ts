import {
  pgTable,
  text,
  timestamp,
  integer,
  varchar,
  doublePrecision,
  date,
  uniqueIndex,
  index,
  uuid,
  numeric,
  jsonb,
} from 'drizzle-orm/pg-core';
import { desc } from 'drizzle-orm';

// Auction Opportunities Table
export const opportunityAuctions = pgTable('auction', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Base opportunity fields
  label: varchar('label').notNull(),
  address: text('address'),
  zipCode: varchar('zip_code').notNull(),
  department: varchar('department').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  externalId: varchar('external_id').notNull().unique(),
  source: varchar('source').notNull(),
  // Auction-specific fields
  url: text('url').notNull(),
  auctionType: varchar('auction_type'),
  propertyType: varchar('property_type'),
  description: text('description'),
  squareFootage: numeric('square_footage', { mode: 'number' }),
  rooms: integer('rooms'),
  dpe: varchar('dpe'),
  auctionVenue: varchar('auction_venue'),
  // Price fields
  currentPrice: numeric('current_price', { mode: 'number' }),
  reservePrice: numeric('reserve_price', { mode: 'number' }),
  lowerEstimate: numeric('lower_estimate', { mode: 'number' }),
  upperEstimate: numeric('upper_estimate', { mode: 'number' }),
  // Picture fields
  mainPicture: text('main_picture'),
  pictures: text('pictures').array(),
  // Auction house contact info as JSONB
  auctionHouseContact: jsonb('auction_house_contact').$type<{
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    auctioneer?: string;
    registrationRequired?: boolean;
    depositAmount?: number;
  }>(),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  uniqueIndex('uq_auction_external_id').on(table.externalId),
  index('idx_auction_department').on(table.department),
  index('idx_auction_date').on(desc(table.opportunityDate)),
  index('idx_auction_department_date')
    .on(table.department, desc(table.opportunityDate)),
  index('idx_auction_zip_code').on(table.zipCode),
  index('idx_auction_address').on(table.address),
  index('idx_auction_latitude').on(table.latitude),
  index('idx_auction_longitude').on(table.longitude),
  index('idx_auction_location').on(table.latitude, table.longitude),
]);

// Succession Opportunities Table
export const opportunitySuccessions = pgTable('succession', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Base opportunity fields
  label: varchar('label').notNull(),
  address: text('address'),
  zipCode: varchar('zip_code').notNull(),
  department: varchar('department').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  externalId: varchar('external_id').notNull().unique(),
  // Succession-specific fields
  firstName: varchar('first_name').notNull(),
  lastName: varchar('last_name').notNull(),
  // Mairie contact info as JSONB
  mairieContact: jsonb('mairie_contact').$type<{
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    openingHours?: string;
  }>(),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  uniqueIndex('uq_succession_external_id').on(table.externalId),
  index('idx_succession_department').on(table.department),
  index('idx_succession_date').on(desc(table.opportunityDate)),
  index('idx_succession_department_date')
    .on(table.department, desc(table.opportunityDate)),
  index('idx_succession_zip_code').on(table.zipCode),
  index('idx_succession_address').on(table.address),
  index('idx_succession_latitude').on(table.latitude),
  index('idx_succession_longitude').on(table.longitude),
  index('idx_succession_location').on(table.latitude, table.longitude),
]);

// Liquidation Opportunities Table
export const opportunityLiquidations = pgTable('liquidation', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Base opportunity fields
  label: varchar('label').notNull(),
  siret: varchar('siret', { length: 14 }).notNull().unique(),
  address: text('address'),
  zipCode: varchar('zip_code').notNull(),
  department: varchar('department').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  // Company contact info as JSONB
  companyContact: jsonb('company_contact').$type<{
    name?: string;
    phone?: string;
    email?: string;
    legalRepresentative?: string;
    administrateur?: string;
  }>(),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  uniqueIndex('uq_liquidation_siret').on(table.siret),
  index('idx_liquidation_siret').on(table.siret),
  index('idx_liquidation_department').on(table.department),
  index('idx_liquidation_date').on(desc(table.opportunityDate)),
  index('idx_liquidation_department_date')
    .on(table.department, desc(table.opportunityDate)),
  index('idx_liquidation_zip_code').on(table.zipCode),
  index('idx_liquidation_address').on(table.address),
  index('idx_liquidation_latitude').on(table.latitude),
  index('idx_liquidation_longitude').on(table.longitude),
  index('idx_liquidation_location').on(table.latitude, table.longitude),
]);

// Energy Sieve Opportunities Table
export const energyDiagnostics = pgTable('energy_diagnostic', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Base opportunity fields
  label: varchar('label').notNull(),
  address: text('address'),
  zipCode: varchar('zip_code').notNull(),
  department: varchar('department').notNull(),
  squareFootage: numeric('square_footage', { mode: 'number' }).notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  // Energy-specific fields
  energyClass: varchar('energy_class'),
  dpeNumber: varchar('dpe_number').notNull().unique(),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  uniqueIndex('uq_energy_sieve_dpe_number').on(table.dpeNumber),
  index('idx_energy_sieve_energy_class').on(table.energyClass),
  index('idx_energy_sieve_department').on(table.department),
  index('idx_energy_sieve_date').on(desc(table.opportunityDate)),
  index('idx_energy_sieve_department_date')
    .on(table.department, desc(table.opportunityDate)),
  index('idx_energy_sieve_class').on(table.energyClass),
  index('idx_energy_sieve_zip_code').on(table.zipCode),
  index('idx_energy_sieve_address').on(table.address),
  index('idx_energy_sieve_latitude').on(table.latitude),
  index('idx_energy_sieve_longitude').on(table.longitude),
  index('idx_energy_sieve_location').on(table.latitude, table.longitude),
]);

// Listing Opportunities Table
export const opportunityListings = pgTable('listing', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Base opportunity fields
  label: varchar('label').notNull(),
  address: text('address'),
  zipCode: varchar('zip_code').notNull(),
  department: varchar('department').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  externalId: varchar('external_id').notNull().unique(),
  // Listing-specific fields
  url: text('url').notNull(),
  transactionType: varchar('transaction_type').notNull(),
  propertyType: varchar('property_type').notNull(),
  description: text('description'),
  squareFootage: numeric('square_footage', { mode: 'number' }),
  landArea: numeric('land_area', { mode: 'number' }),
  rooms: integer('rooms'),
  bedrooms: integer('bedrooms'),
  dpe: varchar('dpe'),
  constructionYear: integer('construction_year'),
  floor: integer('floor'),
  totalFloors: integer('total_floors'),
  balcony: jsonb('balcony').$type<boolean>(),
  terrace: jsonb('terrace').$type<boolean>(),
  garden: jsonb('garden').$type<boolean>(),
  garage: jsonb('garage').$type<boolean>(),
  parking: jsonb('parking').$type<boolean>(),
  elevator: jsonb('elevator').$type<boolean>(),
  // Price fields
  price: numeric('price', { mode: 'number' }),
  priceType: varchar('price_type'),
  fees: numeric('fees', { mode: 'number' }),
  charges: numeric('charges', { mode: 'number' }),
  // Picture fields
  mainPicture: text('main_picture'),
  pictures: text('pictures').array(),
  // Notary contact info as JSONB
  sellerContact: jsonb('seller_contact').$type<{
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
    contact?: string;
    siret?: string;
  }>(),
  source: varchar('source').notNull(),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  uniqueIndex('uq_listing_external_id').on(table.externalId),
  index('idx_listing_department').on(table.department),
  index('idx_listing_date').on(desc(table.opportunityDate)),
  index('idx_listing_department_date')
    .on(table.department, desc(table.opportunityDate)),
  index('idx_listing_zip_code').on(table.zipCode),
  index('idx_listing_address').on(table.address),
  index('idx_listing_latitude').on(table.latitude),
  index('idx_listing_longitude').on(table.longitude),
  index('idx_listing_location').on(table.latitude, table.longitude),
  index('idx_listing_transaction_type').on(table.transactionType),
  index('idx_listing_property_type').on(table.propertyType),
  index('idx_listing_price').on(table.price),
]);

// Sourcing Tables
export const sourcingRuns = pgTable('sourcing_run', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: text('status').notNull(),
  opportunityType: text('opportunity_type').notNull(), // Now a text field instead of enum
  department: varchar('department').notNull(),
  syncDate: date('sync_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scrapedDeceasesFiles = pgTable('scraped_deceases_file', {
  id: uuid('id').primaryKey(),
  fileName: text('file_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});