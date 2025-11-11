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
  insertDealershipSchema: () => insertDealershipSchema,
  insertLeadSchema: () => insertLeadSchema,
  insertUserSchema: () => insertUserSchema,
  leads: () => leads,
  users: () => users
});
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var dealerships = pgTable("dealerships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  templateStyle: text("template_style").notNull().default("classic"),
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
import { eq, desc } from "drizzle-orm";
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
};
var storage = new DatabaseStorage();

// server/email.ts
import { Resend } from "resend";
var connectionSettings;
async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY ? "repl " + process.env.REPL_IDENTITY : process.env.WEB_REPL_RENEWAL ? "depl " + process.env.WEB_REPL_RENEWAL : null;
  if (!xReplitToken) {
    throw new Error("X_REPLIT_TOKEN not found for repl/depl");
  }
  connectionSettings = await fetch(
    "https://" + hostname + "/api/v2/connection?include_secrets=true&connector_names=resend",
    {
      headers: {
        "Accept": "application/json",
        "X_REPLIT_TOKEN": xReplitToken
      }
    }
  ).then((res) => res.json()).then((data) => data.items?.[0]);
  if (!connectionSettings || !connectionSettings.settings.api_key) {
    throw new Error("Resend not connected");
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}
async function getUncachableResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}
async function sendLeadNotification(lead) {
  const { client, fromEmail } = await getUncachableResendClient();
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
  const { client, fromEmail } = await getUncachableResendClient();
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

// server/routes.ts
import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
var sessions = /* @__PURE__ */ new Set();
var userSessions = /* @__PURE__ */ new Map();
var TESTING_EMAILS = ["test@dealerdelight.com"];
function requireAdmin(req, res, next) {
  const sessionToken = req.headers.authorization?.replace("Bearer ", "");
  if (!sessionToken || !sessions.has(sessionToken)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}
function requireAuth(req, res, next) {
  const sessionToken = req.headers.authorization?.replace("Bearer ", "");
  if (!sessionToken || !userSessions.has(sessionToken)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  req.userId = userSessions.get(sessionToken);
  next();
}
function generateToken() {
  return randomBytes(32).toString("hex");
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
      const token = generateToken();
      sessions.add(token);
      res.json({ token });
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
        templateStyle: "classic",
        trialStartsAt,
        trialEndsAt,
        subscriptionStatus: "trial"
      });
      const user = await storage.createUser({
        email,
        passwordHash,
        dealershipId: dealership.id
      });
      const token = generateToken();
      userSessions.set(token, user.id);
      try {
        await sendWelcomeEmail({
          email: user.email,
          dealershipName: dealership.name,
          trialEndsAt: dealership.trialEndsAt
        });
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
      }
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          dealershipId: user.dealershipId
        },
        dealership
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
      const token = generateToken();
      userSessions.set(token, user.id);
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          dealershipId: user.dealershipId
        },
        dealership
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  app2.post("/api/auth/logout", requireAuth, (req, res) => {
    const sessionToken = req.headers.authorization?.replace("Bearer ", "");
    if (sessionToken) {
      userSessions.delete(sessionToken);
    }
    res.json({ success: true });
  });
  app2.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const userId = req.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const dealership = user.dealershipId ? await storage.getDealership(user.dealershipId) : null;
      res.json({
        user: {
          id: user.id,
          email: user.email,
          dealershipId: user.dealershipId
        },
        dealership
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

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
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
