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
export const opportunityAuctions = pgTable('opportunity_auction', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Base opportunity fields
  label: varchar('label').notNull(),
  address: text('address'),
  zipCode: varchar('zip_code').notNull(),
  department: varchar('department').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  externalId: varchar('external_id'),
  // Auction-specific fields
  url: text('url').notNull(),
  auctionType: varchar('auction_type'),
  propertyType: varchar('property_type'),
  description: text('description'),
  squareFootage: numeric('square_footage'),
  rooms: integer('rooms'),
  dpe: varchar('dpe'),
  auctionVenue: varchar('auction_venue'),
  // Price fields
  currentPrice: numeric('current_price'),
  reservePrice: numeric('reserve_price'),
  lowerEstimate: numeric('lower_estimate'),
  upperEstimate: numeric('upper_estimate'),
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
export const opportunitySuccessions = pgTable('opportunity_succession', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Base opportunity fields
  label: varchar('label').notNull(),
  address: text('address'),
  zipCode: varchar('zip_code').notNull(),
  department: varchar('department').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  externalId: varchar('external_id'),
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
export const opportunityLiquidations = pgTable('opportunity_liquidation', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Base opportunity fields
  label: varchar('label').notNull(),
  siret: varchar('siret', { length: 14 }).notNull(),
  address: text('address'),
  zipCode: varchar('zip_code').notNull(),
  department: varchar('department').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  externalId: varchar('external_id'),
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
  uniqueIndex('uq_liquidation_external_id').on(table.externalId),
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
export const opportunityEnergySieves = pgTable('opportunity_energy_sieve', {
  id: uuid('id').primaryKey().defaultRandom(),
  // Base opportunity fields
  label: varchar('label').notNull(),
  address: text('address'),
  zipCode: varchar('zip_code').notNull(),
  department: varchar('department').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  externalId: varchar('external_id'),
  // Energy-specific fields
  energyClass: varchar('energy_class'),
  dpeNumber: varchar('dpe_number'),
  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => [
  uniqueIndex('uq_energy_sieve_external_id').on(table.externalId),
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