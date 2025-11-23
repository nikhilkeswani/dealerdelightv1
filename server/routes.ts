import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertUserSchema, insertBusinessDetailsSchema, insertVehicleSchema, insertInquirySchema } from "@shared/schema";
import { sendLeadNotification, sendWelcomeEmail, sendInquiryNotification } from "./email";
import bcrypt from "bcrypt";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import rateLimit from "express-rate-limit";
import DOMPurify from "isomorphic-dompurify";

// Testing emails that bypass trial restrictions
const TESTING_EMAILS = ['demo@dealerdelight.com'];

// Rate limiters for different endpoint types
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  message: "Too many authentication attempts. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: "Too many accounts created. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 API requests per window
  message: "Too many requests. Please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Helper function to sanitize user input (XSS protection)
function sanitizeInput(input: string | undefined | null): string | null {
  if (!input) return null;
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }); // Strip all HTML tags
}

// Middleware to check admin authentication
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Middleware to check user authentication
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  // Attach userId to request for convenience
  (req as any).userId = req.session.userId;
  next();
}

// Generate URL-friendly slug from dealership name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // POST /api/admin/login - Admin login with password
  app.post("/api/admin/login", authLimiter, (req, res) => {
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

  // POST /api/auth/register - User registration
  app.post("/api/auth/register", registrationLimiter, async (req, res) => {
    try {
      const { email, password, dealershipName } = insertUserSchema.parse(req.body);
      
      // Check if email already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "Email already registered" });
      }
      
      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);
      
      // Generate slug from dealership name
      const slug = generateSlug(dealershipName);
      
      // Set trial dates (14 days from now, or 9999 days for testing emails)
      const trialStartsAt = new Date();
      const trialEndsAt = new Date();
      const isTestingEmail = TESTING_EMAILS.includes(email.toLowerCase());
      trialEndsAt.setDate(trialEndsAt.getDate() + (isTestingEmail ? 9999 : 14));
      
      // Create dealership first (no default template - user must choose)
      const dealership = await storage.createDealership({
        name: dealershipName,
        slug,
        templateStyle: '',
        trialStartsAt,
        trialEndsAt,
        subscriptionStatus: 'trial',
      });
      
      // Create user linked to dealership
      const user = await storage.createUser({
        email,
        passwordHash,
        dealershipId: dealership.id,
      });
      
      // Create session
      req.session.userId = user.id;
      
      // Send welcome email (don't block on this)
      if (user.email) {
        try {
          await sendWelcomeEmail({
            email: user.email,
            dealershipName: dealership.name,
            trialEndsAt: dealership.trialEndsAt,
          });
        } catch (emailError) {
          console.error("Failed to send welcome email:", emailError);
          // Continue anyway - don't block signup
        }
      }
      
      // Save session and return user data
      req.session.save((err) => {
        if (err) {
          console.error("Session save error:", err);
          return res.status(500).json({ error: "Session error" });
        }
        res.json({ 
          user: {
            id: user.id,
            email: user.email,
            dealershipId: user.dealershipId,
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

  // POST /api/auth/login - User login
  app.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password required" });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Verify password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Get dealership
      const dealership = user.dealershipId ? await storage.getDealership(user.dealershipId) : null;
      
      // Create session
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
            dealershipId: user.dealershipId,
          },
          dealership
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // POST /api/auth/logout - User logout
  app.post("/api/auth/logout", requireAuth, (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destroy error:", err);
        return res.status(500).json({ error: "Logout failed" });
      }
      res.clearCookie('dealerdelight.sid');
      res.json({ success: true });
    });
  });

  // GET /api/auth/me - Get current user and dealership
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
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
          dealershipId: user.dealershipId,
        },
        dealership,
        vehicleCount
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({ error: "Failed to get user data" });
    }
  });

  // POST /api/leads - Create a new lead and send notification email
  app.post("/api/leads", async (req, res) => {
    try {
      const validatedData = insertLeadSchema.parse(req.body);
      
      // Create lead in database
      const lead = await storage.createLead(validatedData);
      
      // Send email notification
      try {
        await sendLeadNotification({
          name: lead.name,
          email: lead.email,
          countryCode: lead.countryCode,
          phone: lead.phone,
          dealershipName: lead.dealershipName,
          dealerWebsite: lead.dealerWebsite || undefined,
          message: lead.message || undefined
        });
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
        // Continue even if email fails - lead is still saved
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error creating lead:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to create lead" 
      });
    }
  });

  // PATCH /api/dealerships/:id - Update dealership
  app.patch("/api/dealerships/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const dealershipId = req.params.id;
      const { 
        templateStyle, 
        name,
        // Content
        about,
        // Stats configuration
        statsYearsInBusiness,
        statsTotalClients,
        statsRating,
        statsShowVehicleCount,
        // Services configuration
        servicesEnabled,
        servicesData,
        // Section visibility
        showStatsSection,
        showServicesSection,
        showAboutSection
      } = req.body;
      
      // Get user to verify ownership
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      
      // Update dealership - only include provided fields with validation
      const updateData: any = {};
      if (templateStyle !== undefined) updateData.templateStyle = templateStyle;
      if (name !== undefined) {
        updateData.name = name;
        updateData.slug = generateSlug(name);
      }
      
      // Content fields - validate and sanitize about text
      if (about !== undefined) {
        const sanitized = sanitizeInput(about);
        const trimmedAbout = sanitized?.trim();
        if (trimmedAbout && trimmedAbout.length < 20) {
          return res.status(400).json({ error: "About text must be at least 20 characters" });
        }
        updateData.about = trimmedAbout || null;
      }
      
      // Stats fields - validate numeric values
      if (statsYearsInBusiness !== undefined) {
        if (statsYearsInBusiness !== null && (isNaN(statsYearsInBusiness) || statsYearsInBusiness < 0)) {
          return res.status(400).json({ error: "Years in business must be a positive number" });
        }
        updateData.statsYearsInBusiness = statsYearsInBusiness;
      }
      if (statsTotalClients !== undefined) {
        if (statsTotalClients !== null && (isNaN(statsTotalClients) || statsTotalClients < 0)) {
          return res.status(400).json({ error: "Total clients must be a positive number" });
        }
        updateData.statsTotalClients = statsTotalClients;
      }
      if (statsRating !== undefined) {
        if (statsRating !== null) {
          const rating = parseFloat(statsRating);
          if (isNaN(rating) || rating < 0 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 0 and 5" });
          }
        }
        updateData.statsRating = statsRating;
      }
      if (statsShowVehicleCount !== undefined) updateData.statsShowVehicleCount = statsShowVehicleCount;
      
      // Services fields - validate and sanitize services data
      if (servicesEnabled !== undefined) updateData.servicesEnabled = servicesEnabled;
      if (servicesData !== undefined) {
        // Validate and sanitize services structure
        if (servicesData.services && Array.isArray(servicesData.services)) {
          const sanitizedServices = servicesData.services.map((service: any) => ({
            icon: service.icon, // Icon names are safe (from predefined list)
            title: sanitizeInput(service.title) || '',
            description: sanitizeInput(service.description) || '',
          }));
          
          const validServices = sanitizedServices.every((service: any) => {
            const hasTitle = service.title.trim().length > 0;
            const hasDesc = service.description.trim().length >= 10;
            return hasTitle && hasDesc;
          });
          
          if (!validServices) {
            return res.status(400).json({ error: "All services must have a title and description (min 10 characters)" });
          }
          
          updateData.servicesData = { services: sanitizedServices };
        } else {
          updateData.servicesData = servicesData;
        }
      }
      
      // Section visibility
      if (showStatsSection !== undefined) updateData.showStatsSection = showStatsSection;
      if (showServicesSection !== undefined) updateData.showServicesSection = showServicesSection;
      if (showAboutSection !== undefined) updateData.showAboutSection = showAboutSection;
      
      const dealership = await storage.updateDealership(dealershipId, updateData);
      res.json(dealership);
    } catch (error) {
      console.error("Error updating dealership:", error);
      res.status(500).json({ error: "Failed to update dealership" });
    }
  });

  // PATCH /api/dealerships/:id/business-details - Update business details
  app.patch("/api/dealerships/:id/business-details", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const dealershipId = req.params.id;
      
      // Get user to verify ownership
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      
      // Validate business details
      const validatedData = insertBusinessDetailsSchema.parse(req.body);
      
      // Update dealership with business details
      const dealership = await storage.updateDealership(dealershipId, validatedData);
      res.json(dealership);
    } catch (error) {
      console.error("Error updating business details:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to update business details" 
      });
    }
  });

  // PATCH /api/dealerships/:id/logo - Update dealership logo
  app.patch("/api/dealerships/:id/logo", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const dealershipId = req.params.id;
      const { logoUrl } = req.body;
      
      // Validate logoUrl is not empty
      if (!logoUrl || logoUrl.trim() === '') {
        return res.status(400).json({ error: "Logo URL is required and cannot be empty" });
      }
      
      // Get user to verify ownership
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      
      // Update dealership with logo
      const dealership = await storage.updateDealership(dealershipId, { logoUrl });
      res.json(dealership);
    } catch (error) {
      console.error("Error updating logo:", error);
      res.status(500).json({ error: "Failed to update logo" });
    }
  });

  // POST /api/objects/upload - Get presigned URL for uploading files
  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    try {
      // Note: File validation happens server-side after upload in the save endpoint
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // PATCH /api/dealership/logo/upload - Save uploaded logo with ACL and validation
  app.patch("/api/dealership/logo/upload", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { logoUrl } = req.body;
      
      if (!logoUrl) {
        return res.status(400).json({ error: "logoUrl is required" });
      }
      
      // Get user's dealership
      const user = await storage.getUser(userId);
      if (!user || !user.dealershipId) {
        return res.status(403).json({ error: "User does not have a dealership" });
      }
      
      const objectStorageService = new ObjectStorageService();
      
      // Server-side validation: Verify file exists and check metadata
      try {
        const normalizedPath = objectStorageService.normalizeObjectEntityPath(logoUrl);
        
        // Use getObjectEntityFileFromGsPath for full gs:// paths
        const objectFile = await objectStorageService.getObjectEntityFileFromGsPath(normalizedPath);
        
        const [metadata] = await objectFile.getMetadata();
        const contentType = metadata.contentType || '';
        const fileSize = Number(metadata.size) || 0;
        
        // Validate content type (must be image)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(contentType.toLowerCase())) {
          return res.status(400).json({ 
            error: "Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed." 
          });
        }
        
        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
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
          visibility: "public",
        },
      );
      
      // Update dealership with new logo path
      const dealership = await storage.updateDealership(user.dealershipId, { 
        logoUrl: objectPath 
      });
      
      res.json({
        objectPath: objectPath,
        dealership,
      });
    } catch (error) {
      console.error("Error saving uploaded logo:", error);
      res.status(500).json({ error: "Failed to save logo" });
    }
  });

  // PATCH /api/dealerships/:id/tagline - Update dealership tagline
  app.patch("/api/dealerships/:id/tagline", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { id } = req.params;
      const { tagline } = req.body;
      
      // Get user's dealership
      const user = await storage.getUser(userId);
      if (!user || !user.dealershipId) {
        return res.status(403).json({ error: "User does not have a dealership" });
      }

      // Verify ownership
      if (user.dealershipId !== id) {
        return res.status(403).json({ error: "Unauthorized to update this dealership" });
      }

      // Update dealership tagline
      const dealership = await storage.updateDealership(id, { tagline });
      
      res.json({ dealership });
    } catch (error) {
      console.error("Error updating tagline:", error);
      res.status(500).json({ error: "Failed to update tagline" });
    }
  });

  // PATCH /api/dealership/hero-image/upload - Save uploaded hero image with ACL and validation
  app.patch("/api/dealership/hero-image/upload", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const { heroImageUrl } = req.body;
      
      if (!heroImageUrl) {
        return res.status(400).json({ error: "heroImageUrl is required" });
      }
      
      // Get user's dealership
      const user = await storage.getUser(userId);
      if (!user || !user.dealershipId) {
        return res.status(403).json({ error: "User does not have a dealership" });
      }
      
      const objectStorageService = new ObjectStorageService();
      
      // Server-side validation: Verify file exists and check metadata
      try {
        const objectFile = await objectStorageService.getObjectEntityFile(
          objectStorageService.normalizeObjectEntityPath(heroImageUrl)
        );
        
        const [metadata] = await objectFile.getMetadata();
        const contentType = metadata.contentType || '';
        const fileSize = Number(metadata.size) || 0;
        
        // Validate content type (must be image)
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        if (!allowedTypes.includes(contentType.toLowerCase())) {
          return res.status(400).json({ 
            error: "Invalid file type. Only images (JPEG, PNG, GIF, WebP, SVG) are allowed." 
          });
        }
        
        // Validate file size (10MB max for hero images)
        const maxSize = 10 * 1024 * 1024; // 10MB
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
          visibility: "public",
        },
      );
      
      // Update dealership with new hero image path
      const dealership = await storage.updateDealership(user.dealershipId, { 
        heroImageUrl: objectPath 
      });
      
      res.json({
        objectPath: objectPath,
        dealership,
      });
    } catch (error) {
      console.error("Error saving uploaded hero image:", error);
      res.status(500).json({ error: "Failed to save hero image" });
    }
  });

  // GET /objects/:objectPath(*) - Serve uploaded files
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: (req as any).userId,
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

  // POST /api/dealerships/:id/vehicles - Add a vehicle
  app.post("/api/dealerships/:id/vehicles", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const dealershipId = req.params.id;
      
      // Get user to verify ownership
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      
      // Validate vehicle data
      const validatedData = insertVehicleSchema.parse(req.body);
      
      // If imageUrl is provided, convert presigned URL to permanent public URL
      if (validatedData.imageUrl) {
        const objectStorageService = new ObjectStorageService();
        try {
          const permanentUrl = await objectStorageService.trySetObjectEntityAclPolicy(
            validatedData.imageUrl,
            {
              owner: userId,
              visibility: "public",
            },
          );
          validatedData.imageUrl = permanentUrl;
        } catch (error) {
          console.error("Error converting vehicle image URL:", error);
          // Continue without image rather than failing the whole request
          validatedData.imageUrl = "";
        }
      }
      
      // Create vehicle
      const vehicle = await storage.createVehicle(dealershipId, validatedData);
      res.json(vehicle);
    } catch (error) {
      console.error("Error creating vehicle:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to create vehicle" 
      });
    }
  });

  // GET /api/dealerships/:id/vehicles - Get all vehicles for a dealership
  app.get("/api/dealerships/:id/vehicles", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const dealershipId = req.params.id;
      
      // Get user to verify ownership
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      
      const vehicles = await storage.getVehiclesByDealership(dealershipId);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  // GET /api/dealerships/:id/inquiries - Get all customer inquiries for a dealership
  app.get("/api/dealerships/:id/inquiries", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const dealershipId = req.params.id;
      
      // Get user to verify ownership
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this dealership" });
      }
      
      const inquiries = await storage.getInquiriesByDealership(dealershipId);
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ error: "Failed to fetch inquiries" });
    }
  });

  // PATCH /api/vehicles/:id - Update a vehicle
  app.patch("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const vehicleId = req.params.id;
      
      // Get the vehicle to verify ownership
      const vehicle = await storage.getVehicleById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      // Get user to verify they own this vehicle's dealership
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== vehicle.dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this vehicle" });
      }
      
      // Validate vehicle data (partial update)
      const validatedData = insertVehicleSchema.partial().parse(req.body);
      
      // If imageUrl is provided and different from current, convert presigned URL to permanent public URL
      if (validatedData.imageUrl && validatedData.imageUrl !== vehicle.imageUrl) {
        const objectStorageService = new ObjectStorageService();
        try {
          const permanentUrl = await objectStorageService.trySetObjectEntityAclPolicy(
            validatedData.imageUrl,
            {
              owner: userId,
              visibility: "public",
            },
          );
          validatedData.imageUrl = permanentUrl;
        } catch (error) {
          console.error("Error converting vehicle image URL:", error);
          // Keep the existing image if conversion fails
          delete validatedData.imageUrl;
        }
      }
      
      // Update vehicle
      const updatedVehicle = await storage.updateVehicle(vehicleId, validatedData);
      res.json(updatedVehicle);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Failed to update vehicle" 
      });
    }
  });

  // DELETE /api/vehicles/:id - Delete a vehicle
  app.delete("/api/vehicles/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req as any).userId;
      const vehicleId = req.params.id;
      
      // Get the vehicle to verify ownership
      const vehicle = await storage.getVehicleById(vehicleId);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      
      // Get user to verify they own this vehicle's dealership
      const user = await storage.getUser(userId);
      if (!user || user.dealershipId !== vehicle.dealershipId) {
        return res.status(403).json({ error: "Forbidden: You don't own this vehicle" });
      }
      
      // Delete vehicle
      await storage.deleteVehicle(vehicleId);
      res.json({ success: true, message: "Vehicle deleted successfully" });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // GET /api/leads - Get all leads (protected, admin only)
  app.get("/api/leads", requireAdmin, async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads:", error);
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // Test endpoint to check email configuration
  app.get("/api/test-email", async (req, res) => {
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

  // PUBLIC API ROUTES - No authentication required

  // GET /api/public/dealerships/:slug - Get dealership by slug
  app.get("/api/public/dealerships/:slug", async (req, res) => {
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

  // GET /api/public/dealerships/:slug/vehicles - Get all vehicles for a dealership
  app.get("/api/public/dealerships/:slug/vehicles", async (req, res) => {
    try {
      const { slug } = req.params;
      const dealership = await storage.getDealershipBySlug(slug);
      
      if (!dealership) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      
      const vehicles = await storage.getVehiclesByDealership(dealership.id);
      res.json(vehicles);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  // GET /api/public/vehicles/:id - Get a specific vehicle by ID
  app.get("/api/public/vehicles/:id", async (req, res) => {
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

  // POST /api/public/dealerships/:slug/inquiries - Submit customer inquiry
  app.post("/api/public/dealerships/:slug/inquiries", async (req, res) => {
    try {
      const { slug } = req.params;
      
      // Get dealership by slug
      const dealership = await storage.getDealershipBySlug(slug);
      if (!dealership) {
        return res.status(404).json({ error: "Dealership not found" });
      }
      
      // Validate inquiry data
      const validatedData = insertInquirySchema.parse(req.body);
      
      // Get vehicle title if vehicleId is provided
      let vehicleTitle: string | undefined;
      if (validatedData.vehicleId) {
        const vehicle = await storage.getVehicleById(validatedData.vehicleId);
        if (vehicle) {
          vehicleTitle = vehicle.title;
        }
      }
      
      // Create inquiry
      const inquiry = await storage.createInquiry(dealership.id, validatedData);
      
      // Get dealership owner's email to send notification
      const dealerUser = await storage.getUserByDealershipId(dealership.id);
      
      if (dealerUser?.email) {
        // Send email notification to dealer
        try {
          await sendInquiryNotification({
            dealerEmail: dealerUser.email,
            dealershipName: dealership.name,
            customerName: validatedData.customerName,
            customerEmail: validatedData.customerEmail,
            customerPhone: validatedData.customerPhone,
            message: validatedData.message,
            vehicleTitle,
          });
        } catch (emailError) {
          // Log email error but don't fail the inquiry submission
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

  // GET /sitemap.xml - Generate dynamic sitemap for SEO
  app.get("/sitemap.xml", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const currentDate = new Date().toISOString();
    
    // Only public pages - exclude /admin (password-protected)
    const pages = [
      { url: '/', changefreq: 'weekly', priority: 1.0 },
      { url: '/demo', changefreq: 'weekly', priority: 0.8 }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // GET /robots.txt - Guide search engine crawlers
  app.get("/robots.txt", (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

Sitemap: ${baseUrl}/sitemap.xml`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  const httpServer = createServer(app);

  return httpServer;
}
