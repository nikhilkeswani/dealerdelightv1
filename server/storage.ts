import { users, leads, dealerships, vehicles, inquiries, type User, type InsertUser, type Lead, type InsertLead, type Dealership, type InsertDealership, type Vehicle, type InsertVehicle, type Inquiry, type InsertInquiry } from "@shared/schema";
import { db } from "./db";
import { eq, desc, count } from "drizzle-orm";

// Referenced integration: blueprint:javascript_database
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Partial<User>): Promise<User>;
  createDealership(dealership: Partial<Dealership>): Promise<Dealership>;
  getDealership(id: string): Promise<Dealership | undefined>;
  getDealershipByUserId(userId: string): Promise<Dealership | undefined>;
  updateDealership(id: string, data: Partial<Dealership>): Promise<Dealership>;
  createLead(lead: InsertLead): Promise<Lead>;
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createVehicle(dealershipId: string, vehicle: InsertVehicle): Promise<Vehicle>;
  getVehiclesByDealership(dealershipId: string): Promise<Vehicle[]>;
  getVehicleCount(dealershipId: string): Promise<number>;
  getVehicleById(id: string): Promise<Vehicle | undefined>;
  updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle>;
  deleteVehicle(id: string): Promise<void>;
  getDealershipBySlug(slug: string): Promise<Dealership | undefined>;
  createInquiry(dealershipId: string, inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiriesByDealership(dealershipId: string): Promise<Inquiry[]>;
  getInquiryById(id: string): Promise<Inquiry | undefined>;
  updateInquiryStatus(id: string, status: string): Promise<Inquiry>;
  deleteInquiry(id: string): Promise<void>;
  getUserByDealershipId(dealershipId: string): Promise<User | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .returning();
    return user;
  }

  async createDealership(dealershipData: Partial<Dealership>): Promise<Dealership> {
    const [dealership] = await db
      .insert(dealerships)
      .values(dealershipData)
      .returning();
    return dealership;
  }

  async getDealership(id: string): Promise<Dealership | undefined> {
    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, id));
    return dealership || undefined;
  }

  async getDealershipByUserId(userId: string): Promise<Dealership | undefined> {
    const user = await this.getUser(userId);
    if (!user?.dealershipId) return undefined;
    return this.getDealership(user.dealershipId);
  }

  async updateDealership(id: string, data: Partial<Dealership>): Promise<Dealership> {
    const [dealership] = await db
      .update(dealerships)
      .set(data)
      .where(eq(dealerships.id, id))
      .returning();
    return dealership;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values(insertLead)
      .returning();
    return lead;
  }

  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || undefined;
  }

  async createVehicle(dealershipId: string, vehicleData: InsertVehicle): Promise<Vehicle> {
    const [vehicle] = await db
      .insert(vehicles)
      .values({ ...vehicleData, dealershipId })
      .returning();
    return vehicle;
  }

  async getVehiclesByDealership(dealershipId: string): Promise<Vehicle[]> {
    return await db.select().from(vehicles).where(eq(vehicles.dealershipId, dealershipId)).orderBy(desc(vehicles.createdAt));
  }

  async getVehicleCount(dealershipId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(vehicles)
      .where(eq(vehicles.dealershipId, dealershipId));
    return result[0]?.count || 0;
  }

  async getVehicleById(id: string): Promise<Vehicle | undefined> {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || undefined;
  }

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    const [vehicle] = await db
      .update(vehicles)
      .set(data)
      .where(eq(vehicles.id, id))
      .returning();
    return vehicle;
  }

  async deleteVehicle(id: string): Promise<void> {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }

  async getDealershipBySlug(slug: string): Promise<Dealership | undefined> {
    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.slug, slug));
    return dealership || undefined;
  }

  async createInquiry(dealershipId: string, inquiryData: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db
      .insert(inquiries)
      .values({ ...inquiryData, dealershipId })
      .returning();
    return inquiry;
  }

  async getInquiriesByDealership(dealershipId: string): Promise<Inquiry[]> {
    return await db.select().from(inquiries).where(eq(inquiries.dealershipId, dealershipId)).orderBy(desc(inquiries.createdAt));
  }

  async getInquiryById(id: string): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry || undefined;
  }

  async updateInquiryStatus(id: string, status: string): Promise<Inquiry> {
    const [inquiry] = await db
      .update(inquiries)
      .set({ status })
      .where(eq(inquiries.id, id))
      .returning();
    return inquiry;
  }

  async deleteInquiry(id: string): Promise<void> {
    await db.delete(inquiries).where(eq(inquiries.id, id));
  }

  async getUserByDealershipId(dealershipId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.dealershipId, dealershipId));
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();
