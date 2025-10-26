import { pgTable, text, timestamp, integer, serial, varchar, doublePrecision } from "drizzle-orm/pg-core";

export const opportunities = pgTable("opportunity", {
    id: serial("id").primaryKey(),
    label: varchar("name").notNull(),
    zipCode: integer("zip_code").notNull(),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull(),
});
