import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const dealerships = pgTable("dealerships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  templateStyle: text("template_style").notNull().default(''),
  
  // Contact Information
  address: text("address"),
  phone: text("phone"),
  hours: text("hours"),
  about: text("about"),
  tagline: text("tagline"),
  
  // Media
  logoUrl: text("logo_url"),
  heroImageUrl: text("hero_image_url"),
  
  // Homepage Stats (customizable)
  statsYearsInBusiness: integer("stats_years_in_business"),
  statsTotalClients: integer("stats_total_clients"),
  statsRating: text("stats_rating"),
  statsShowVehicleCount: text("stats_show_vehicle_count").default('true'),
  
  // Services Section (customizable - stored as JSON)
  servicesEnabled: text("services_enabled").default('true'),
  servicesData: jsonb("services_data").$type<{
    services: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
  }>(),
  
  // Homepage Sections Visibility
  showStatsSection: text("show_stats_section").default('true'),
  showServicesSection: text("show_services_section").default('true'),
  showAboutSection: text("show_about_section").default('true'),
  
  // Subscription & Trial
  trialStartsAt: timestamp("trial_starts_at").notNull().defaultNow(),
  trialEndsAt: timestamp("trial_ends_at").notNull(),
  subscriptionStatus: text("subscription_status").notNull().default('trial'),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  password: text("password"),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  dealershipId: varchar("dealership_id").references(() => dealerships.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  countryCode: text("country_code").notNull().default('+1'),
  phone: text("phone").notNull(),
  dealershipName: text("dealership_name").notNull(),
  dealerWebsite: text("dealer_website"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealershipId: varchar("dealership_id").references(() => dealerships.id).notNull(),
  title: text("title").notNull(),
  year: text("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  price: text("price").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealershipId: varchar("dealership_id").references(() => dealerships.id).notNull(),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default('new'),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Session table for connect-pg-simple
export const sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull(),
});

export const insertDealershipSchema = createInsertSchema(dealerships).omit({
  id: true,
  createdAt: true,
  trialStartsAt: true,
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  username: true,
  password: true,
  dealershipId: true,
  passwordHash: true,
}).extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dealershipName: z.string().min(2, "Dealership name must be at least 2 characters"),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  dealershipId: true,
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
  dealershipId: true,
  status: true,
}).extend({
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(6, "Please enter a valid phone number"),
  message: z.string().min(10, "Please provide at least 10 characters"),
});

export const insertBusinessDetailsSchema = z.object({
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(10, "Phone number is required"),
  hours: z.string().min(5, "Business hours are required"),
  about: z.string().min(20, "Please provide at least 20 characters about your dealership"),
});

export type InsertDealership = z.infer<typeof insertDealershipSchema>;
export type Dealership = typeof dealerships.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertBusinessDetails = z.infer<typeof insertBusinessDetailsSchema>;
export type Session = typeof sessions.$inferSelect;
