import {
  pgTable,
  text,
  timestamp,
  integer,
  serial,
  varchar,
  doublePrecision,
  pgEnum,
  date,
  jsonb,
  uniqueIndex,
  index,
  uuid,
} from 'drizzle-orm/pg-core';
import { desc } from 'drizzle-orm';
import { OpportunityType } from '@linkinvests/shared';

export const opportunityType = pgEnum(
  'opportunity_type',
  Object.values(OpportunityType) as [string, ...string[]],
);

export const opportunities = pgTable('opportunity', {
  id: serial('id').primaryKey(),
  label: varchar('name').notNull(),
  siret: varchar('siret', { length: 14 }),
  address: text('address'),
  zipCode: integer('zip_code').notNull(),
  department: integer('department').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  type: opportunityType('type').notNull(),
  status: text('status').notNull(),
  opportunityDate: date('opportunity_date').notNull(),
  // External unique identifier for each opportunity type
  externalId: varchar('external_id'),
  // Contact information specific to each opportunity type (jsonb)
  contactData: jsonb('contact_data'),
  // Additional opportunity data (auction-specific fields, etc.)
  extraData: jsonb('extra_data'),
  images: text('images').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
}, (table) => ({
  // Unique constraint on (externalId, type) to prevent duplicates
  // Only applies when externalId is not null
  uniqueExternalIdType: uniqueIndex('uq_opportunity_external_id_type')
    .on(table.externalId, table.type),
  // Performance indexes
  typeIndex: index('idx_opportunity_type').on(table.type),
  departmentIndex: index('idx_opportunity_department').on(table.department),
  opportunityDateIndex: index('idx_opportunity_date').on(desc(table.opportunityDate)),
  // Composite index for common query patterns
  typeDepDateIndex: index('idx_opportunity_type_department_date')
    .on(table.type, table.department, desc(table.opportunityDate)),
}));

// Sourcing Tables
export const sourcingRuns = pgTable('sourcing_run', {
  id: serial('id').primaryKey(),
  status: text('status').notNull(),
  opportunityType: opportunityType('opportunity_type').notNull(),
  department: integer('department').notNull(),
  syncDate: date('sync_date').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const scrapedDeceasesFiles = pgTable('scraped_deceases_file', {
  id: uuid('id').primaryKey(),
  fileName: text('file_name').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});