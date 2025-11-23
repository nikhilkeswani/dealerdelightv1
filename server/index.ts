// Load environment variables first, before any other imports
import { config } from "dotenv";
import { resolve } from "path";

// Explicitly load .env file
const result = config({ path: resolve(process.cwd(), '.env') });
if (result.error) {
  console.error('Error loading .env file:', result.error);
} else {
  console.log('✓ Environment variables loaded from .env');
  console.log('✓ DATABASE_URL is', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
}

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { injectMetaTags } from "./meta-tags";
import { runMigrations } from "./migrate";
import { sessionMiddleware } from "./session";
import helmet from "helmet";
import cors from "cors";

const app = express();

// Security headers - helmet must be early in middleware chain
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval needed for Vite in dev
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"], // Allow images from GCS and data URLs
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false, // Needed for some external resources
}));

// CORS configuration - restrict to your domains in production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5000', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: false, limit: '10mb' }));

// Session middleware - must be before routes
app.use(sessionMiddleware);

// Meta tag injection middleware - buffers HTML responses to inject meta tags
app.use((req, res, next) => {
  // Only inject meta tags for HTML requests (not API or static assets or sitemap)
  if (req.path.startsWith('/api') || req.path === '/sitemap.xml' || req.path === '/robots.txt' || req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|json|map|xml)$/)) {
    return next();
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const chunks: Buffer[] = [];
  
  const originalWrite = res.write;
  const originalEnd = res.end;
  const originalSend = res.send;

  // Buffer res.write chunks
  res.write = function(chunk: any, ...args: any[]): boolean {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return true;
  } as any;

  // Intercept res.end to process buffered content
  res.end = function(chunk?: any, ...args: any[]): any {
    if (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const fullContent = Buffer.concat(chunks).toString('utf-8');
    
    // Only inject if this is HTML content
    if (fullContent.includes('<!DOCTYPE html>')) {
      const modifiedContent = injectMetaTags(fullContent, req.path, baseUrl);
      
      // Remove content-length header since we're modifying the content
      res.removeHeader('Content-Length');
      
      // Restore original methods and send modified content
      res.write = originalWrite;
      res.end = originalEnd;
      res.send = originalSend;
      
      return originalEnd.call(this, modifiedContent, ...args);
    } else {
      // Not HTML, send original buffered content
      res.write = originalWrite;
      res.end = originalEnd;
      res.send = originalSend;
      
      if (chunks.length > 0) {
        chunks.forEach(c => originalWrite.call(this, c));
      }
      return originalEnd.call(this, ...args);
    }
  } as any;

  // Also handle res.send
  res.send = function(data: any) {
    if (typeof data === 'string' && data.includes('<!DOCTYPE html>')) {
      data = injectMetaTags(data, req.path, baseUrl);
      res.removeHeader('Content-Length');
    }
    
    // Restore original methods
    res.write = originalWrite;
    res.end = originalEnd;
    res.send = originalSend;
    
    return originalSend.call(this, data);
  } as any;

  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Run database migrations on startup
  await runMigrations();
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Use localhost for Windows compatibility, 0.0.0.0 for production
  const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
  
  server.listen(port, host, () => {
    log(`serving on http://${host}:${port}`);
  });
})();
