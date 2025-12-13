import {
  pgTable,
  pgMaterializedView,
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
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { desc } from 'drizzle-orm';
import { users } from './auth.schema';
import {
  AuctionOccupationStatus,
  UNKNOWN_ENERGY_CLASS,
  UNKNOWN_GAZ_CLASS,
  EnergyClass,
  GazClass,
} from '@linkinvests/shared';

export const energyClassesEnum = pgEnum(
  'energy_classes',
  Object.values(EnergyClass) as [string, ...string[]],
);
export const energyClassesOrUnknownEnum = pgEnum('energy_classes', [
  ...(Object.values(EnergyClass) as [string, ...string[]]),
  UNKNOWN_ENERGY_CLASS,
]);

export const gazClassesEnum = pgEnum(
  'gaz_classes',
  Object.values(GazClass) as [string, ...string[]],
);
export const gazClassesOrUnknownEnum = pgEnum('gaz_classes', [
  ...(Object.values(GazClass) as [string, ...string[]]),
  UNKNOWN_GAZ_CLASS,
]);

// Auction Opportunities Table
export const opportunityAuctions = pgTable(
  'auction',
  {
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
    propertyType: varchar('property_type'),
    description: text('description'),
    squareFootage: numeric('square_footage', { mode: 'number' }),
    rooms: integer('rooms'),
    energyClass: energyClassesOrUnknownEnum('energy_class')
      .notNull()
      .default(UNKNOWN_ENERGY_CLASS),
    gazClass: gazClassesOrUnknownEnum('gaz_class')
      .notNull()
      .default(UNKNOWN_GAZ_CLASS),
    auctionVenue: varchar('auction_venue'),
    occupationStatus: varchar('occupation_status')
      .notNull()
      .default(AuctionOccupationStatus.UNKNOWN),
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
  },
  (table) => [
    uniqueIndex('uq_auction_external_id').on(table.externalId),
    index('idx_auction_department').on(table.department),
    index('idx_auction_date').on(desc(table.opportunityDate)),
    index('idx_auction_department_date').on(
      table.department,
      desc(table.opportunityDate),
    ),
    index('idx_auction_zip_code').on(table.zipCode),
    index('idx_auction_address').on(table.address),
    index('idx_auction_latitude').on(table.latitude),
    index('idx_auction_longitude').on(table.longitude),
    index('idx_auction_location').on(table.latitude, table.longitude),
  ],
);

// Succession Opportunities Table
export const opportunitySuccessions = pgTable(
  'succession',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Base opportunity fields
    label: varchar('label').notNull(),
    address: text('address').notNull(),
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
    mairieContact: jsonb('mairie_contact')
      .$type<{
        name?: string;
        address: {
          complement1: string;
          complement2: string;
          numero_voie: string;
          service_distribution: string;
          code_postal: string;
          nom_commune: string;
        };
        phone?: string;
        email?: string;
        website?: string;
        openingHours?: string;
      }>()
      .notNull(),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('uq_succession_external_id').on(table.externalId),
    index('idx_succession_department').on(table.department),
    index('idx_succession_date').on(desc(table.opportunityDate)),
    index('idx_succession_department_date').on(
      table.department,
      desc(table.opportunityDate),
    ),
    index('idx_succession_zip_code').on(table.zipCode),
    index('idx_succession_address').on(table.address),
    index('idx_succession_latitude').on(table.latitude),
    index('idx_succession_longitude').on(table.longitude),
    index('idx_succession_location').on(table.latitude, table.longitude),
  ],
);

// Liquidation Opportunities Table
export const opportunityLiquidations = pgTable(
  'liquidation',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Base opportunity fields
    label: varchar('label').notNull(),
    siret: varchar('siret', { length: 14 }).notNull().unique(),
    address: text('address').notNull(),
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
  },
  (table) => [
    uniqueIndex('uq_liquidation_siret').on(table.siret),
    index('idx_liquidation_siret').on(table.siret),
    index('idx_liquidation_department').on(table.department),
    index('idx_liquidation_date').on(desc(table.opportunityDate)),
    index('idx_liquidation_department_date').on(
      table.department,
      desc(table.opportunityDate),
    ),
    index('idx_liquidation_zip_code').on(table.zipCode),
    index('idx_liquidation_address').on(table.address),
    index('idx_liquidation_latitude').on(table.latitude),
    index('idx_liquidation_longitude').on(table.longitude),
    index('idx_liquidation_location').on(table.latitude, table.longitude),
  ],
);

// Energy Sieve Opportunities Table
export const energyDiagnostics = pgTable(
  'energy_diagnostic',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Base opportunity fields
    label: varchar('label').notNull(),
    address: text('address').notNull(),
    zipCode: varchar('zip_code').notNull(),
    department: varchar('department').notNull(),
    squareFootage: numeric('square_footage', { mode: 'number' }).notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    opportunityDate: date('opportunity_date').notNull(),
    // Energy-specific fields
    energyClass: energyClassesEnum('energy_class').notNull(),
    gazClass: gazClassesEnum('gaz_class').notNull(),
    externalId: varchar('external_id').notNull().unique(),
    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('uq_energy_diagnostic_external_id').on(table.externalId),
    index('idx_energy_diagnostic_energy_class').on(table.energyClass),
    index('idx_energy_diagnostic_department').on(table.department),
    index('idx_energy_diagnostic_date').on(desc(table.opportunityDate)),
    index('idx_energy_diagnostic_department_date').on(
      table.department,
      desc(table.opportunityDate),
    ),
    index('idx_energy_sieve_class').on(table.energyClass),
    index('idx_energy_sieve_zip_code').on(table.zipCode),
    index('idx_energy_sieve_address').on(table.address),
    index('idx_energy_sieve_latitude').on(table.latitude),
    index('idx_energy_sieve_longitude').on(table.longitude),
    index('idx_energy_sieve_location').on(table.latitude, table.longitude),
  ],
);

// Listing Opportunities Table
export const opportunityListings = pgTable(
  'listing',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // Base opportunity fields
    label: varchar('label').notNull(),
    address: text('address'),
    zipCode: varchar('zip_code').notNull(),
    department: varchar('department').notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    opportunityDate: date('opportunity_date').notNull(), // publication date
    lastChangeDate: date('last_change_date'),
    externalId: varchar('external_id').notNull().unique(),
    // Listing-specific fields
    url: text('url').notNull(),
    propertyType: varchar('property_type').notNull(),
    description: text('description'),
    squareFootage: numeric('square_footage', { mode: 'number' }),
    landArea: numeric('land_area', { mode: 'number' }),
    rooms: integer('rooms'),
    bedrooms: integer('bedrooms'),
    energyClass: energyClassesOrUnknownEnum('energy_class')
      .notNull()
      .default(UNKNOWN_ENERGY_CLASS),
    gazClass: gazClassesOrUnknownEnum('gaz_class')
      .notNull()
      .default(UNKNOWN_GAZ_CLASS),
    constructionYear: integer('construction_year'),
    floor: integer('floor'),
    totalFloors: integer('total_floors'),
    options: text('options').array(),
    keywords: text('keywords').array(),
    isSoldRented: boolean('is_sold_rented').default(false).notNull(),
    // Price fields
    price: numeric('price', { mode: 'number' }),
    priceType: varchar('price_type'),
    fees: numeric('fees', { mode: 'number' }),
    charges: numeric('charges', { mode: 'number' }),
    // Picture fields
    mainPicture: text('main_picture'),
    pictures: text('pictures').array(),
    // Notary contact info as JSONB
    sellerType: varchar('seller_type').notNull(),
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
  },
  (table) => [
    uniqueIndex('uq_listing_external_id').on(table.externalId),
    index('idx_listing_department').on(table.department),
    index('idx_listing_date').on(desc(table.opportunityDate)),
    index('idx_listing_department_date').on(
      table.department,
      desc(table.opportunityDate),
    ),
    index('idx_listing_zip_code').on(table.zipCode),
    index('idx_listing_address').on(table.address),
    index('idx_listing_latitude').on(table.latitude),
    index('idx_listing_longitude').on(table.longitude),
    index('idx_listing_location').on(table.latitude, table.longitude),
    index('idx_listing_property_type').on(table.propertyType),
    index('idx_listing_price').on(table.price),
    index('gin_idx_listing_options').using('gin', table.options),
  ],
);

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

// Junction table: Auction <-> Energy Diagnostic links
export const auctionEnergyDiagnosticLinks = pgTable(
  'auction_energy_diagnostic_link',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    auctionId: uuid('auction_id')
      .notNull()
      .references(() => opportunityAuctions.id, { onDelete: 'cascade' }),
    energyDiagnosticId: uuid('energy_diagnostic_id')
      .notNull()
      .references(() => energyDiagnostics.id, { onDelete: 'cascade' }),
    matchScore: integer('match_score').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_auction_energy_diagnostic').on(
      table.auctionId,
      table.energyDiagnosticId,
    ),
    index('idx_auction_energy_diagnostic_auction').on(table.auctionId),
  ],
);

// Junction table: Listing <-> Energy Diagnostic links
export const listingEnergyDiagnosticLinks = pgTable(
  'listing_energy_diagnostic_link',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    listingId: uuid('listing_id')
      .notNull()
      .references(() => opportunityListings.id, { onDelete: 'cascade' }),
    energyDiagnosticId: uuid('energy_diagnostic_id')
      .notNull()
      .references(() => energyDiagnostics.id, { onDelete: 'cascade' }),
    matchScore: integer('match_score').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('uq_listing_energy_diagnostic').on(
      table.listingId,
      table.energyDiagnosticId,
    ),
    index('idx_listing_energy_diagnostic_listing').on(table.listingId),
  ],
);

// Saved Searches Table
export const savedSearches = pgTable(
  'saved_search',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 256 }).notNull(),
    url: text('url').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('idx_saved_search_user_id').on(table.userId),
    index('idx_saved_search_created_at').on(desc(table.createdAt)),
  ],
);

export const favorites = pgTable(
  'favorite',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    opportunityId: uuid('opportunity_id').notNull(),
    opportunityType: text('opportunity_type').notNull(), // 'auction' | 'real_estate_listing' | 'succession' | 'liquidation' | 'energy_sieve'
    status: text('status').notNull().default('added_to_favorites'),
    statusUpdatedAt: timestamp('status_updated_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    // Ensure a user can only favorite an opportunity once
    uniqueIndex('uq_favorite_user_opportunity').on(
      table.userId,
      table.opportunityId,
      table.opportunityType,
    ),
    // Index for fast lookups by user
    index('idx_favorite_user_id').on(table.userId),
    // Index for listing favorites by type for a user
    index('idx_favorite_user_type').on(table.userId, table.opportunityType),
    // Index for ordering by creation date
    index('idx_favorite_created_at').on(desc(table.createdAt)),
  ],
);

// Favorite Events Table (Audit Log)
// This table is insert-only, no updates or deletes allowed
export const favoriteEvents = pgTable(
  'favorite_event',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    favoriteId: uuid('favorite_id')
      .notNull()
      .references(() => favorites.id, { onDelete: 'cascade' }),
    eventType: text('event_type').notNull(), // e.g., 'added_to_favorites', 'email_sent'
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_favorite_event_favorite_id').on(table.favoriteId),
    index('idx_favorite_event_created_at').on(desc(table.createdAt)),
  ],
);

// User Quick Actions Preferences
export const userQuickActions = pgTable(
  'user_quick_actions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' })
      .unique(),
    actions: text('actions')
      .array()
      .notNull()
      .default(sql`ARRAY['new_search', 'auctions', 'address_search']`),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('idx_user_quick_actions_user_id').on(table.userId)],
);

// All Opportunities Materialized View
// Unions all opportunity types with common fields
export const allOpportunities = pgMaterializedView('all_opportunities', {
  opportunityId: uuid('opportunity_id').notNull(),
  type: varchar('type').notNull(),
  label: varchar('label').notNull(),
  address: text('address'),
  zipCode: varchar('zip_code').notNull(),
  department: varchar('department').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  externalId: varchar('external_id').notNull(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  energyClass: varchar('energy_class'),
  squareFootage: numeric('square_footage', { mode: 'number' }),
  price: numeric('price', { mode: 'number' }),
  mainPicture: text('main_picture'),
  pictures: text('pictures').array(),
}).as(sql`
  SELECT
    id AS opportunity_id,
    'auction'::varchar AS type,
    label,
    address,
    zip_code,
    department,
    latitude,
    longitude,
    opportunity_date,
    external_id,
    created_at,
    updated_at,
    energy_class::varchar AS energy_class,
    square_footage,
    COALESCE(current_price, reserve_price) AS price,
    main_picture,
    pictures
  FROM auction

  UNION ALL

  SELECT
    id AS opportunity_id,
    'succession'::varchar AS type,
    label,
    address,
    zip_code,
    department,
    latitude,
    longitude,
    opportunity_date,
    external_id,
    created_at,
    updated_at,
    NULL::varchar AS energy_class,
    NULL::numeric AS square_footage,
    NULL::numeric AS price,
    NULL::text AS main_picture,
    NULL::text[] AS pictures
  FROM succession

  UNION ALL

  SELECT
    id AS opportunity_id,
    'liquidation'::varchar AS type,
    label,
    address,
    zip_code,
    department,
    latitude,
    longitude,
    opportunity_date,
    siret AS external_id,
    created_at,
    updated_at,
    NULL::varchar AS energy_class,
    NULL::numeric AS square_footage,
    NULL::numeric AS price,
    NULL::text AS main_picture,
    NULL::text[] AS pictures
  FROM liquidation

  UNION ALL

  SELECT
    id AS opportunity_id,
    'energy_sieve'::varchar AS type,
    label,
    address,
    zip_code,
    department,
    latitude,
    longitude,
    opportunity_date,
    external_id,
    created_at,
    updated_at,
    energy_class::varchar AS energy_class,
    square_footage,
    NULL::numeric AS price,
    NULL::text AS main_picture,
    NULL::text[] AS pictures
  FROM energy_diagnostic
  WHERE energy_class IN ('E', 'F', 'G')

  UNION ALL

  SELECT
    id AS opportunity_id,
    'real_estate_listing'::varchar AS type,
    label,
    address,
    zip_code,
    department,
    latitude,
    longitude,
    opportunity_date,
    external_id,
    created_at,
    updated_at,
    energy_class::varchar AS energy_class,
    square_footage,
    price,
    main_picture,
    pictures
  FROM listing
`);
