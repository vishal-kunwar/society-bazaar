import { pgTable, serial, text, timestamp, integer, pgEnum, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { societiesTable } from "./societies";

export const businessStatusEnum = pgEnum("business_status", ["pending", "approved", "rejected", "paused"]);

export const subscriptionPlanEnum = pgEnum("subscription_plan", ["free_trial", "pro"]);

export const businessCategoryEnum = pgEnum("business_category", [
  "Food & Tiffin",
  "Bakery & Sweets",
  "Tuition & Classes",
  "Fitness & Yoga",
  "Tailoring",
  "Beauty & Wellness",
  "Home Services",
  "Others",
]);

export const businessesTable = pgTable("businesses", {
  id: serial("id").primaryKey(),
  clerkUserId: text("clerk_user_id").notNull(),
  ownerName: text("owner_name").notNull(),
  businessName: text("business_name").notNull(),
  societyId: integer("society_id").notNull().references(() => societiesTable.id),
  category: businessCategoryEnum("category").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(),
  description: varchar("description", { length: 1000 }).notNull(),
  imageUrl: text("image_url").notNull().default(""),
  status: businessStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  subscriptionPlan: subscriptionPlanEnum("subscription_plan").notNull().default("free_trial"),
  proValidUntil: timestamp("pro_valid_until", { withTimezone: true }),

  // Extended onboarding fields (all optional for backwards compat)
  email: text("email"),
  yearsInBusiness: integer("years_in_business"),
  tower: text("tower"),
  flatNumber: text("flat_number"),
  city: text("city"),
  alternatePhone: text("alternate_phone"),
  instagram: text("instagram"),
  website: text("website"),
  priceRange: text("price_range"),
  servicesOffered: varchar("services_offered", { length: 500 }),
  coverImageUrl: text("cover_image_url"),
});

export const insertBusinessSchema = createInsertSchema(businessesTable).omit({
  id: true, clerkUserId: true, status: true, createdAt: true, updatedAt: true,
});
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type Business = typeof businessesTable.$inferSelect;
