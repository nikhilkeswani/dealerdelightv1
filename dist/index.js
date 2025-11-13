var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  dealerships: () => dealerships,
  inquiries: () => inquiries,
  insertBusinessDetailsSchema: () => insertBusinessDetailsSchema,
  insertDealershipSchema: () => insertDealershipSchema,
  insertInquirySchema: () => insertInquirySchema,
  insertLeadSchema: () => insertLeadSchema,
  insertUserSchema: () => insertUserSchema,
  insertVehicleSchema: () => insertVehicleSchema,
  leads: () => leads,
  sessions: () => sessions,
  users: () => users,
  vehicles: () => vehicles
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var dealerships = pgTable("dealerships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  templateStyle: text("template_style").notNull().default(""),
  address: text("address"),
  phone: text("phone"),
  hours: text("hours"),
  about: text("about"),
  tagline: text("tagline"),
  logoUrl: text("logo_url"),
  heroImageUrl: text("hero_image_url"),
  trialStartsAt: timestamp("trial_starts_at").notNull().defaultNow(),
  trialEndsAt: timestamp("trial_ends_at").notNull(),
  subscriptionStatus: text("subscription_status").notNull().default("trial"),
  stripeCustomerId: text("stripe_customer_id"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  password: text("password"),
  email: text("email").unique(),
  passwordHash: text("password_hash"),
  dealershipId: varchar("dealership_id").references(() => dealerships.id),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  countryCode: text("country_code").notNull().default("+1"),
  phone: text("phone").notNull(),
  dealershipName: text("dealership_name").notNull(),
  dealerWebsite: text("dealer_website"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var vehicles = pgTable("vehicles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealershipId: varchar("dealership_id").references(() => dealerships.id).notNull(),
  title: text("title").notNull(),
  year: text("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  price: text("price").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var inquiries = pgTable("inquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dealershipId: varchar("dealership_id").references(() => dealerships.id).notNull(),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at").notNull().defaultNow()
});
var sessions = pgTable("session", {
  sid: varchar("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull()
});
var insertDealershipSchema = createInsertSchema(dealerships).omit({
  id: true,
  createdAt: true,
  trialStartsAt: true
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  username: true,
  password: true,
  dealershipId: true,
  passwordHash: true
}).extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  dealershipName: z.string().min(2, "Dealership name must be at least 2 characters")
});
var insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true
});
var insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  dealershipId: true
});
var insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
  dealershipId: true,
  status: true
}).extend({
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: z.string().min(6, "Please enter a valid phone number"),
  message: z.string().min(10, "Please provide at least 10 characters")
});
var insertBusinessDetailsSchema = z.object({
  address: z.string().min(5, "Address is required"),
  phone: z.string().min(10, "Phone number is required"),
  hours: z.string().min(5, "Business hours are required"),
  about: z.string().min(20, "Please provide at least 20 characters about your dealership")
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle({ client: pool, schema: schema_exports });

// server/storage.ts
import { eq, desc, count } from "drizzle-orm";
var DatabaseStorage = class {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || void 0;
  }
  async getUserByUsername(username) {
    if (!username) return void 0;
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || void 0;
  }
  async getUserByEmail(email) {
    if (!email) return void 0;
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || void 0;
  }
  async createUser(userData) {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }
  async createDealership(dealershipData) {
    const [dealership] = await db.insert(dealerships).values(dealershipData).returning();
    return dealership;
  }
  async getDealership(id) {
    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, id));
    return dealership || void 0;
  }
  async getDealershipByUserId(userId) {
    const user = await this.getUser(userId);
    if (!user?.dealershipId) return void 0;
    return this.getDealership(user.dealershipId);
  }
  async updateDealership(id, data) {
    const [dealership] = await db.update(dealerships).set(data).where(eq(dealerships.id, id)).returning();
    return dealership;
  }
  async createLead(insertLead) {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }
  async getLeads() {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }
  async getLead(id) {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead || void 0;
  }
  async createVehicle(dealershipId, vehicleData) {
    const [vehicle] = await db.insert(vehicles).values({ ...vehicleData, dealershipId }).returning();
    return vehicle;
  }
  async getVehiclesByDealership(dealershipId) {
    return await db.select().from(vehicles).where(eq(vehicles.dealershipId, dealershipId)).orderBy(desc(vehicles.createdAt));
  }
  async getVehicleCount(dealershipId) {
    const result = await db.select({ count: count() }).from(vehicles).where(eq(vehicles.dealershipId, dealershipId));
    return result[0]?.count || 0;
  }
  async getVehicleById(id) {
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, id));
    return vehicle || void 0;
  }
  async updateVehicle(id, data) {
    const [vehicle] = await db.update(vehicles).set(data).where(eq(vehicles.id, id)).returning();
    return vehicle;
  }
  async deleteVehicle(id) {
    await db.delete(vehicles).where(eq(vehicles.id, id));
  }
  async getDealershipBySlug(slug) {
    const [dealership] = await db.select().from(dealerships).where(eq(dealerships.slug, slug));
    return dealership || void 0;
  }
  async createInquiry(dealershipId, inquiryData) {
    const [inquiry] = await db.insert(inquiries).values({ ...inquiryData, dealershipId }).returning();
    return inquiry;
  }
  async getInquiriesByDealership(dealershipId) {
    return await db.select().from(inquiries).where(eq(inquiries.dealershipId, dealershipId)).orderBy(desc(inquiries.createdAt));
  }
  async getUserByDealershipId(dealershipId) {
    const [user] = await db.select().from(users).where(eq(users.dealershipId, dealershipId));
    return user || void 0;
  }
};
var storage = new DatabaseStorage();

// server/email.ts
import { Resend } from "resend";
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY environment variable is not set");
  }
  if (!fromEmail) {
    throw new Error("RESEND_FROM_EMAIL environment variable is not set");
  }
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}
async function sendLeadNotification(lead) {
  const { client, fromEmail } = getResendClient();
  console.log("Sending email notification...");
  console.log("From email:", fromEmail);
  console.log("To email:", fromEmail);
  const result = await client.emails.send({
    from: fromEmail,
    to: fromEmail,
    // Send to your own email for now
    subject: `New Demo Request from ${lead.dealershipName}`,
    html: `
      <h2>New Demo Request Received</h2>
      <p><strong>Name:</strong> ${lead.name}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      <p><strong>Phone:</strong> ${lead.countryCode} ${lead.phone}</p>
      <p><strong>Dealership:</strong> ${lead.dealershipName}</p>
      ${lead.dealerWebsite ? `<p><strong>Website:</strong> <a href="${lead.dealerWebsite}">${lead.dealerWebsite}</a></p>` : ""}
      ${lead.message ? `<p><strong>Message:</strong> ${lead.message}</p>` : ""}
      <hr>
      <p>Submitted at: ${(/* @__PURE__ */ new Date()).toLocaleString()}</p>
    `
  });
  console.log("Email sent successfully:", result);
}
async function sendWelcomeEmail(user) {
  const { client, fromEmail } = getResendClient();
  console.log("Sending welcome email...");
  console.log("From email:", fromEmail);
  console.log("To email:", user.email);
  const trialDays = Math.ceil((user.trialEndsAt.getTime() - Date.now()) / (1e3 * 60 * 60 * 24));
  const result = await client.emails.send({
    from: fromEmail,
    to: user.email,
    subject: `Welcome to DealerDelight, ${user.dealershipName}!`,
    html: `
      <h2>Welcome to DealerDelight!</h2>
      <p>Hi there,</p>
      <p>Thank you for signing up for DealerDelight! Your dealership website platform is now ready.</p>
      
      <h3>Your Trial Details</h3>
      <p>You have <strong>${trialDays} days</strong> of free access to explore all features.</p>
      
      <h3>Next Steps</h3>
      <ol>
        <li><a href="https://dealerdelight.com/login">Login to your dashboard</a></li>
        <li>Choose your website template (Luxury, Classic, or Modern)</li>
        <li>Add your first vehicle listing</li>
        <li>Start receiving leads!</li>
      </ol>
      
      <h3>Need Help?</h3>
      <p>Our support team is here to help you get started. Reply to this email or contact us at support@dealerdelight.com</p>
      
      <p>Best regards,<br>The DealerDelight Team</p>
      
      <hr>
      <p style="color: #666; font-size: 12px;">
        This email was sent because you created an account at DealerDelight.
      </p>
    `
  });
  console.log("Welcome email sent successfully:", result);
}
async function sendInquiryNotification(inquiry) {
  const { client, fromEmail } = getResendClient();
  console.log("Sending inquiry notification...");
  console.log("From email:", fromEmail);
  console.log("To email:", inquiry.dealerEmail);
  const result = await client.emails.send({
    from: fromEmail,
    to: inquiry.dealerEmail,
    replyTo: inquiry.customerEmail,
    subject: `New Customer Inquiry${inquiry.vehicleTitle ? ` - ${inquiry.vehicleTitle}` : ""}`,
    html: `
      <h2>New Customer Inquiry for ${inquiry.dealershipName}</h2>
      ${inquiry.vehicleTitle ? `<p><strong>Vehicle of Interest:</strong> ${inquiry.vehicleTitle}</p>` : ""}
      
      <h3>Customer Details</h3>
      <p><strong>Name:</strong> ${inquiry.customerName}</p>
      <p><strong>Email:</strong> <a href="mailto:${inquiry.customerEmail}">${inquiry.customerEmail}</a></p>
      <p><strong>Phone:</strong> ${inquiry.customerPhone}</p>
      
      <h3>Message</h3>
      <p>${inquiry.message}</p>
      
      <hr>
      <p><strong>Reply directly to this email to contact the customer.</strong></p>
      <p style="color: #666; font-size: 12px;">
        Submitted at: ${(/* @__PURE__ */ new Date()).toLocaleString()}
      </p>
    `
  });
  console.log("Inquiry notification sent successfully:", result);
}

// server/routes.ts
import bcrypt from "bcrypt";

// server/objectStorage.ts
import { Storage } from "@google-cloud/storage";
import { randomUUID } from "crypto";

// server/objectAcl.ts
var ACL_POLICY_METADATA_KEY = "custom:aclPolicy";
function isPermissionAllowed(requested, granted) {
  if (requested === "read" /* READ */) {
    return ["read" /* READ */, "write" /* WRITE */].includes(granted);
  }
  return granted === "write" /* WRITE */;
}
function createObjectAccessGroup(group) {
  switch (group.type) {
    default:
      throw new Error(`Unknown access group type: ${group.type}`);
  }
}
async function setObjectAclPolicy(objectFile, aclPolicy) {
  const [exists] = await objectFile.exists();
  if (!exists) {
    throw new Error(`Object not found: ${objectFile.name}`);
  }
  await objectFile.setMetadata({
    metadata: {
      [ACL_POLICY_METADATA_KEY]: JSON.stringify(aclPolicy)
    }
  });
}
async function getObjectAclPolicy(objectFile) {
  const [metadata] = await objectFile.getMetadata();
  const aclPolicy = metadata?.metadata?.[ACL_POLICY_METADATA_KEY];
  if (!aclPolicy) {
    return null;
  }
  return JSON.parse(aclPolicy);
}
async function canAccessObject({
  userId,
  objectFile,
  requestedPermission
}) {
  const aclPolicy = await getObjectAclPolicy(objectFile);
  if (!aclPolicy) {
    return false;
  }
  if (aclPolicy.visibility === "public" && requestedPermission === "read" /* READ */) {
    return true;
  }
  if (!userId) {
    return false;
  }
  if (aclPolicy.owner === userId) {
    return true;
  }
  for (const rule of aclPolicy.aclRules || []) {
    const accessGroup = createObjectAccessGroup(rule.group);
    if (await accessGroup.hasMember(userId) && isPermissionAllowed(requestedPermission, rule.permission)) {
      return true;
    }
  }
  return false;
}

// server/objectStorage.ts
var objectStorageClient = new Storage({
  projectId: process.env.GCP_PROJECT_ID
});
var ObjectNotFoundError = class _ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, _ObjectNotFoundError.prototype);
  }
};
var ObjectStorageService = class {
  constructor() {
  }
  // Gets the public object search paths.
  getPublicObjectSearchPaths() {
    const pathsStr = process.env.PUBLIC_OBJECT_SEARCH_PATHS || "";
    const paths = Array.from(
      new Set(
        pathsStr.split(",").map((path3) => path3.trim()).filter((path3) => path3.length > 0)
      )
    );
    if (paths.length === 0) {
      throw new Error(
        "PUBLIC_OBJECT_SEARCH_PATHS not set. Set this environment variable with comma-separated GCS paths (e.g., gs://bucket-name/public)"
      );
    }
    return paths;
  }
  // Gets the private object directory.
  getPrivateObjectDir() {
    const dir = process.env.PRIVATE_OBJECT_DIR || "";
    if (!dir) {
      throw new Error(
        "PRIVATE_OBJECT_DIR not set. Set this environment variable with a GCS path (e.g., gs://bucket-name/private)"
      );
    }
    return dir;
  }
  // Search for a public object from the search paths.
  async searchPublicObject(filePath) {
    for (const searchPath of this.getPublicObjectSearchPaths()) {
      const fullPath = `${searchPath}/${filePath}`;
      const file = await this.getObjectEntityFileFromGsPath(fullPath);
      const [exists] = await file.exists();
      if (exists) {
        return file;
      }
    }
    return null;
  }
  // Gets a private object file.
  async getPrivateObject(filePath) {
    const privateDir = this.getPrivateObjectDir();
    const fullPath = `${privateDir}/${filePath}`;
    return await this.getObjectEntityFileFromGsPath(fullPath);
  }
  // Converts a gs:// path to a File object
  async getObjectEntityFileFromGsPath(gsPath) {
    const path3 = gsPath.replace(/^gs:\/\//, "");
    const parts = path3.split("/");
    const bucketName = parts[0];
    const filePath = parts.slice(1).join("/");
    const bucket = objectStorageClient.bucket(bucketName);
    return bucket.file(filePath);
  }
  // Gets the object entity file from path
  async getObjectEntityFile(path3) {
    const cleanPath = path3.replace(/^\/objects\//, "");
    const publicFile = await this.searchPublicObject(cleanPath);
    if (publicFile) {
      return publicFile;
    }
    try {
      const privateFile = await this.getPrivateObject(cleanPath);
      const [exists] = await privateFile.exists();
      if (exists) {
        return privateFile;
      }
    } catch (error) {
    }
    throw new ObjectNotFoundError();
  }
  // Normalizes an object entity path
  normalizeObjectEntityPath(path3) {
    if (path3.startsWith("gs://")) {
      return path3;
    }
    if (path3.startsWith("/objects/")) {
      return path3.replace("/objects/", "");
    }
    if (path3.startsWith("http://") || path3.startsWith("https://")) {
      const url = new URL(path3);
      return url.pathname.replace(/^\/objects\//, "");
    }
    return path3;
  }
  // Gets a presigned upload URL for uploading objects
  async getObjectEntityUploadURL() {
    const privateDir = this.getPrivateObjectDir();
    const fileName = `${randomUUID()}`;
    const fullPath = `${privateDir}/${fileName}`;
    const file = await this.getObjectEntityFileFromGsPath(fullPath);
    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1e3,
      // 15 minutes
      contentType: "application/octet-stream"
    });
    return url;
  }
  // Downloads an object to the response
  async downloadObject(file, res) {
    const [metadata] = await file.getMetadata();
    const contentType = metadata.contentType || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000");
    const stream = file.createReadStream();
    stream.pipe(res);
  }
  // Checks if the user can access the object
  async canAccessObjectEntity(options) {
    try {
      const policy = await getObjectAclPolicy(options.objectFile);
      if (!policy) {
        const filePath = `gs://${options.objectFile.bucket.name}/${options.objectFile.name}`;
        const publicPaths = this.getPublicObjectSearchPaths();
        return publicPaths.some((path3) => filePath.startsWith(path3));
      }
      return canAccessObject(policy, options.userId);
    } catch (error) {
      console.error("Error checking access:", error);
      return false;
    }
  }
  // Sets the object ACL policy and returns the public URL
  async trySetObjectEntityAclPolicy(path3, policy) {
    const normalizedPath = this.normalizeObjectEntityPath(path3);
    const file = await this.getObjectEntityFile(normalizedPath);
    await setObjectAclPolicy(file, policy);
    if (policy.visibility === "public") {
      await file.makePublic();
    }
    return `/objects/${file.bucket.name}/${file.name}`;
  }
};

// server/routes.ts
var TESTING_EMAILS = ["demo@dealerdelight.com"];
function requireAdmin(req, res, next) {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
function requireAuth(req, res, next) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = req.session.userId;
  next();
}
function generateSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
async function registerRoutes(app2) {
  app2.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    if (!ADMIN_PASSWORD) {
      console.error("ADMIN_PASSWORD environment variable is not set");
      return res.status(500).json({ error: "Server configuration error" });
    }
    if (password === ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Session error" });
        }
        res.json({ success: true });
      });
    } else {
      res.status(401).json({ error: "Invalid password" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, dealershipName } = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      const slug = generateSlug(dealershipName);
      const trialStartsAt = /* @__PURE__ */ new Date();
      const trialEndsAt = /* @__PURE__ */ new Date();
      const isTestingEmail = TESTING_EMAILS.includes(email.toLowerCase());
      trialEndsAt.setDate(trialEndsAt.getDate() + (isTestingEmail ? 9999 : 14));
      const dealership = await storage.createDealership({
        name: dealershipName,
        slug,
        templateStyle: "",
        trialStartsAt,
        trialEndsAt,
        subscriptionStatus: "trial"
      });
      const user = await storage.createUser({
        email,
        passwordHash,
        dealershipId: dealership.id
      });
      req.session.userId = user.id;
      if (user.email) {
        try {
          await sendWelcomeEmail({
            email: user.email,
            dealershipName: dealership.name,
            trialEndsAt: dealership.trialEndsAt
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
        }
      }
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Session error" });
        }
        res.json({
          user: {
            id: user.id,
            email: user.email,
            dealershipId: user.dealershipId
          },
          dealership
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Registration failed"
      });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const dealership = user.dealershipId ? await storage.getDealership(user.dealershipId) : null;
      req.session.userId = user.id;
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Session error" });
        }
        res.json({
          user: {
            id: user.id,
            email: user.email,
            dealershipId: user.dealershipId
          },
          dealership
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", requireAuth, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie("dealerdelight.sid");
      res.json({ success: true });
    });
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const dealership = user.dealershipId ? await storage.getDealership(user.dealershipId) : null;
      const vehicleCount = dealership ? await storage.getVehicleCount(dealership.id) : 0;
      res.json({
        user: {
          id: user.id,
          email: user.email,
          dealershipId: user.dealershipId
        },
        dealership,
        vehicleCount
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Failed to get user data" });
    }
  });
  app2.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(validatedData);
      try {
        await sendLeadNotification({
          name: lead.name,
          email: lead.email,
          countryCode: lead.countryCode,
          phone: lead.phone,
          dealershipName: lead.dealershipName,
          dealerWebsite: lead.dealerWebsite || void 0,
          message: lead.message || void 0
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to create lead"
      });
    }
  });
  app2.patch("/api/dealerships/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const dealershipId = req.params.id;
      const { templateStyle, name } = req.body;
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      const updateData = {};
      if (templateStyle) updateData.templateStyle = templateStyle;
      if (name) {
        updateData.name = name;
        updateData.slug = generateSlug(name);
      }
      const dealership = await storage.updateDealership(dealershipId, updateData);
      res.json(dealership);
    } catch (error) {
      console.error("Error updating dealership:", error);
      res.status(500).json({ error: "Failed to update dealership" });
    }
  });
  app2.patch("/api/dealerships/:id/business-details", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const dealershipId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      const validatedData = insertBusinessDetailsSchema.parse(req.body);
      const dealership = await storage.updateDealership(dealershipId, validatedData);
      res.json(dealership);
    } catch (error) {
      console.error("Error updating business details:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to update business details"
      });
    }
  });
  app2.patch("/api/dealerships/:id/logo", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const dealershipId = req.params.id;
      const { logoUrl } = req.body;
      if (!logoUrl || logoUrl.trim() === "") {
        return res.status(400).json({ error: "Logo URL is required and cannot be empty" });
      }
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      const dealership = await storage.updateDealership(dealershipId, { logoUrl });
      res.json(dealership);
    } catch (error) {
      console.error("Error updating logo:", error);
      res.status(500).json({ error: "Failed to update logo" });
    }
  });
  app2.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });
  app2.patch("/api/dealership/logo/upload", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const { logoUrl } = req.body;
      if (!logoUrl) {
        return res.status(400).json({ error: "logoUrl is required" });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.dealershipId) {
        return res.status(403).json({ error: "User does not have a dealership" });
      }
      const objectStorageService = new ObjectStorageService();
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(
          objectStorageService.normalizeObjectEntityPath(logoUrl)
        );
        const [metadata] = await objectFile.getMetadata();
        const contentType = metadata.contentType || "";
        const fileSize = Number(metadata.size) || 0;
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
        if (!allowedTypes.includes(contentType.toLowerCase())) {
          return res.status(400).json({
            error: "Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed."
          });
        }
        const maxSize = 5 * 1024 * 1024;
        if (fileSize > maxSize) {
          return res.status(400).json({
            error: `File size exceeds maximum of ${(maxSize / 1024 / 1024).toFixed(1)}MB`
          });
        }
      } catch (validateError) {
        console.error("File validation error:", validateError);
        return res.status(400).json({ error: "Invalid or inaccessible file" });
      }
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        logoUrl,
        {
          owner: userId,
          visibility: "public"
        }
      );
      const dealership = await storage.updateDealership(user.dealershipId, {
        logoUrl: objectPath
      });
      res.json({
        objectPath,
        dealership
      });
    } catch (error) {
      console.error("Error saving uploaded logo:", error);
      res.status(500).json({ error: "Failed to save logo" });
    }
  });
  app2.patch("/api/dealerships/:id/tagline", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const { id } = req.params;
      const { tagline } = req.body;
      const user = await storage.getUser(userId);
      if (!user || !user.dealershipId) {
        return res.status(403).json({ error: "User does not have a dealership" });
      }
      if (user.dealershipId !== id) {
        return res.status(403).json({ error: "Unauthorized to update this dealership" });
      }
      const dealership = await storage.updateDealership(id, { tagline });
      res.json({ dealership });
    } catch (error) {
      console.error("Error updating tagline:", error);
      res.status(500).json({ error: "Failed to update tagline" });
    }
  });
  app2.patch("/api/dealership/hero-image/upload", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const { heroImageUrl } = req.body;
      if (!heroImageUrl) {
        return res.status(400).json({ error: "heroImageUrl is required" });
      }
      const user = await storage.getUser(userId);
      if (!user || !user.dealershipId) {
        return res.status(403).json({ error: "User does not have a dealership" });
      }
      const objectStorageService = new ObjectStorageService();
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(
          objectStorageService.normalizeObjectEntityPath(heroImageUrl)
        );
        const [metadata] = await objectFile.getMetadata();
        const contentType = metadata.contentType || "";
        const fileSize = Number(metadata.size) || 0;
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
        if (!allowedTypes.includes(contentType.toLowerCase())) {
          return res.status(400).json({
            error: "Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed."
          });
        }
        const maxSize = 10 * 1024 * 1024;
        if (fileSize > maxSize) {
          return res.status(400).json({
            error: `File size exceeds maximum of ${(maxSize / 1024 / 1024).toFixed(1)}MB`
          });
        }
      } catch (validateError) {
        console.error("File validation error:", validateError);
        return res.status(400).json({ error: "Invalid or inaccessible file" });
      }
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        heroImageUrl,
        {
          owner: userId,
          visibility: "public"
        }
      );
      const dealership = await storage.updateDealership(user.dealershipId, {
        heroImageUrl: objectPath
      });
      res.json({
        objectPath,
        dealership
      });
    } catch (error) {
      console.error("Error saving uploaded hero image:", error);
      res.status(500).json({ error: "Failed to save hero image" });
    }
  });
  app2.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: req.userId
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing object:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });
  app2.post("/api/dealerships/:id/vehicles", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const dealershipId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      const validatedData = insertVehicleSchema.parse(req.body);
      if (validatedData.imageUrl) {
        const objectStorageService = new ObjectStorageService();
        try {
          const permanentUrl = await objectStorageService.trySetObjectEntityAclPolicy(
            validatedData.imageUrl,
            {
              owner: userId,
              visibility: "public"
            }
          );
          validatedData.imageUrl = permanentUrl;
        } catch (error) {
          console.error("Error converting vehicle image URL:", error);
          validatedData.imageUrl = "";
        }
      }
      const vehicle = await storage.createVehicle(dealershipId, validatedData);
      res.json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to create vehicle"
      });
    }
  });
  app2.get("/api/dealerships/:id/vehicles", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const dealershipId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      const vehicles2 = await storage.getVehiclesByDealership(dealershipId);
      res.json(vehicles2);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });
  app2.get("/api/dealerships/:id/inquiries", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const dealershipId = req.params.id;
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      const inquiries2 = await storage.getInquiriesByDealership(dealershipId);
      res.json(inquiries2);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });
  app2.patch("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const vehicleId = req.params.id;
      const vehicle = await storage.getVehicleById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== vehicle.dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this vehicle" });
      }
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      if (validatedData.imageUrl && validatedData.imageUrl !== vehicle.imageUrl) {
        const objectStorageService = new ObjectStorageService();
        try {
          const permanentUrl = await objectStorageService.trySetObjectEntityAclPolicy(
            validatedData.imageUrl,
            {
              owner: userId,
              visibility: "public"
            }
          );
          validatedData.imageUrl = permanentUrl;
        } catch (error) {
          console.error("Error converting vehicle image URL:", error);
          delete validatedData.imageUrl;
        }
      }
      const updatedVehicle = await storage.updateVehicle(vehicleId, validatedData);
      res.json(updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to update vehicle"
      });
    }
  });
  app2.delete("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const vehicleId = req.params.id;
      const vehicle = await storage.getVehicleById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== vehicle.dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this vehicle" });
      }
      await storage.deleteVehicle(vehicleId);
      res.json({ success: true, message: "Vehicle deleted successfully" });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });
  app2.get("/api/leads", requireAdmin, async (req, res) => {
    try {
      const leads2 = await storage.getLeads();
      res.json(leads2);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });
  app2.get("/api/test-email", async (req, res) => {
    try {
      await sendLeadNotification({
        name: "Test User",
        email: "test@example.com",
        countryCode: "+1",
        phone: "1234567890",
        dealershipName: "Test Dealership",
        dealerWebsite: "https://test-dealership.com",
        message: "This is a test email"
      });
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: error
      });
    }
  });
  app2.get("/api/public/dealerships/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const dealership = await storage.getDealershipBySlug(slug);
      if (!dealership) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      res.json(dealership);
    } catch (error) {
      console.error("Error fetching dealership:", error);
      res.status(500).json({ error: "Failed to fetch dealership" });
    }
  });
  app2.get("/api/public/dealerships/:slug/vehicles", async (req, res) => {
    try {
      const { slug } = req.params;
      const dealership = await storage.getDealershipBySlug(slug);
      if (!dealership) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      const vehicles2 = await storage.getVehiclesByDealership(dealership.id);
      res.json(vehicles2);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });
  app2.get("/api/public/vehicles/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const vehicle = await storage.getVehicleById(id);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      res.status(500).json({ error: "Failed to fetch vehicle" });
    }
  });
  app2.post("/api/public/dealerships/:slug/inquiries", async (req, res) => {
    try {
      const { slug } = req.params;
      const dealership = await storage.getDealershipBySlug(slug);
      if (!dealership) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      const validatedData = insertInquirySchema.parse(req.body);
      let vehicleTitle;
      if (validatedData.vehicleId) {
        const vehicle = await storage.getVehicleById(validatedData.vehicleId);
        if (vehicle) {
          vehicleTitle = vehicle.title;
        }
      }
      const inquiry = await storage.createInquiry(dealership.id, validatedData);
      const dealerUser = await storage.getUserByDealershipId(dealership.id);
      if (dealerUser?.email) {
        try {
          await sendInquiryNotification({
            dealerEmail: dealerUser.email,
            dealershipName: dealership.name,
            customerName: validatedData.customerName,
            customerEmail: validatedData.customerEmail,
            customerPhone: validatedData.customerPhone,
            message: validatedData.message,
            vehicleTitle
          });
        } catch (emailError) {
          console.error("Failed to send inquiry notification email:", emailError);
        }
      }
      res.json({ success: true, inquiry });
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(400).json({
        error: error instanceof Error ? error.message : "Failed to submit inquiry"
      });
    }
  });
  app2.get("/sitemap.xml", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const currentDate = (/* @__PURE__ */ new Date()).toISOString();
    const pages = [
      { url: "/", changefreq: "weekly", priority: 1 },
      { url: "/demo", changefreq: "weekly", priority: 0.8 }
    ];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map((page) => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("\n")}
</urlset>`;
    res.header("Content-Type", "application/xml");
    res.send(sitemap);
  });
  app2.get("/robots.txt", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;
    res.header("Content-Type", "text/plain");
    res.send(robotsTxt);
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      ),
      await import("@replit/vite-plugin-dev-banner").then(
        (m) => m.devBanner()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/meta-tags.ts
var metaTagsConfig = {
  "/": {
    title: "Auto Dealership CRM & Website Software | DealerDelight US, UK & Ireland",
    description: "Complete dealership management platform for US, UK & Ireland. Beautiful websites, powerful CRM, and inventory management for car dealers. From $219/month with all features. Book your free demo today.",
    keywords: "auto dealership software USA, car dealer CRM United States, dealership website builder America, auto dealer software UK, car dealership CRM United Kingdom, British dealership platform, dealership software Ireland, Dublin car dealers, inventory management",
    ogImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=630&fit=crop"
  },
  "/demo": {
    title: "Dealership Website Templates - Classic, Luxury, Modern",
    description: "Preview our professional auto dealership website templates: Classic Pro, Luxury Elite, and Modern Edge. Interactive demos with real vehicle inventory displays. Choose the perfect design for your dealership.",
    keywords: "dealership website templates, car dealer website design, auto dealership themes, luxury car websites, modern dealership designs, vehicle inventory showcase",
    ogImage: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&h=630&fit=crop"
  }
};
var defaultMetaTags = {
  title: "Page Not Found - DealerDelight",
  description: "The page you're looking for doesn't exist. Return to DealerDelight to explore our auto dealership website solutions.",
  keywords: "auto dealership software, car dealer websites",
  ogImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=1200&h=630&fit=crop"
};
function getMetaTagsForPath(path3) {
  const cleanPath = path3.split("?")[0].replace(/\/$/, "") || "/";
  return metaTagsConfig[cleanPath] || defaultMetaTags;
}
function injectMetaTags(html, path3, baseUrl) {
  const meta = getMetaTagsForPath(path3);
  const url = `${baseUrl}${path3}`;
  let structuredData = "";
  if (path3 === "/" || path3 === "") {
    structuredData = `
    <!-- Structured Data -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "DealerDelight",
      "applicationCategory": "BusinessApplication",
      "offers": {
        "@type": "Offer",
        "price": "219",
        "priceCurrency": "USD"
      },
      "description": "${meta.description}",
      "url": "${baseUrl}",
      "screenshot": "${meta.ogImage}",
      "provider": {
        "@type": "Organization",
        "name": "DealerDelight",
        "url": "${baseUrl}"
      },
      "areaServed": [
        {
          "@type": "Country",
          "name": "United States"
        },
        {
          "@type": "Country",
          "name": "United Kingdom"
        },
        {
          "@type": "Country",
          "name": "Ireland"
        }
      ]
    }
    </script>`;
  }
  const metaTagsHtml = `
    <title>${meta.title}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${meta.description}">
    <meta name="keywords" content="${meta.keywords}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:image" content="${meta.ogImage}">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:url" content="${url}">
    <meta name="twitter:title" content="${meta.title}">
    <meta name="twitter:description" content="${meta.description}">
    <meta name="twitter:image" content="${meta.ogImage}">
    ${structuredData}
  `;
  let result = html.replace(/<title>.*?<\/title>/, "");
  result = result.replace(/<meta name="description"[^>]*>/, "");
  result = result.replace("</head>", `${metaTagsHtml}
  </head>`);
  return result;
}

// server/migrate.ts
import { sql as sql2 } from "drizzle-orm";
async function runMigrations() {
  try {
    console.log("Ensuring database tables exist...");
    await db.execute(sql2`SELECT 1`);
    console.log("\u2713 Database connection verified");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

// server/session.ts
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
var PgSession = connectPgSimple(session);
var sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: false
    // We'll manage this via migrations
  }),
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    // Use secure cookies in production
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1e3,
    // 30 days
    sameSite: "lax"
  },
  name: "dealerdelight.sid"
  // Custom session cookie name
});

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use(sessionMiddleware);
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path === "/sitemap.xml" || req.path === "/robots.txt" || req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|map|xml)$/)) {
    return next();
  }
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const chunks = [];
  const originalWrite = res.write;
  const originalEnd = res.end;
  const originalSend = res.send;
  res.write = function(chunk, ...args) {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return true;
  };
  res.end = function(chunk, ...args) {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const fullContent = Buffer.concat(chunks).toString("utf-8");
    if (fullContent.includes("<!DOCTYPE html>")) {
      const modifiedContent = injectMetaTags(fullContent, req.path, baseUrl);
      res.removeHeader("Content-Length");
      res.write = originalWrite;
      res.end = originalEnd;
      res.send = originalSend;
      return originalEnd.call(this, modifiedContent, ...args);
    } else {
      res.write = originalWrite;
      res.end = originalEnd;
      res.send = originalSend;
      if (chunks.length > 0) {
        chunks.forEach((c) => originalWrite.call(this, c));
      }
      return originalEnd.call(this, ...args);
    }
  };
  res.send = function(data) {
    if (typeof data === "string" && data.includes("<!DOCTYPE html>")) {
      data = injectMetaTags(data, req.path, baseUrl);
      res.removeHeader("Content-Length");
    }
    res.write = originalWrite;
    res.end = originalEnd;
    res.send = originalSend;
    return originalSend.call(this, data);
  };
  next();
});
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  await runMigrations();
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
