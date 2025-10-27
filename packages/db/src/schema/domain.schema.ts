import { pgTable, text, timestamp, integer, serial, varchar, doublePrecision, pgEnum, date } from "drizzle-orm/pg-core";
import { OpportunityType } from "@linkinvest/shared";

const opportunityType = pgEnum("opportunity_type", Object.values(OpportunityType) as [string, ...string[]]);

export const opportunities = pgTable("opportunity", {
    id: serial("id").primaryKey(),
    label: varchar("name").notNull(),
    siret: varchar("siret", { length: 14 }),
    address: text("address"),
    zipCode: integer("zip_code").notNull(),
    department: integer("department").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    type: opportunityType("type").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});




// Sourcing Tables
export const sourcingRuns = pgTable("sourcing_run", {
    id: serial("id").primaryKey(),
    status: text("status").notNull(),
    opportunityType: opportunityType("opportunity_type").notNull(),
    department: integer("department").notNull(),
    syncDate: date("sync_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
