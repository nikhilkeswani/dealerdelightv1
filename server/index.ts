import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { injectMetaTags } from "./meta-tags";
import { runMigrations } from "./migrate";
import { sessionMiddleware } from "./session";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
