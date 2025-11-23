import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";

const PgSession = connectPgSimple(session);

// Validate SESSION_SECRET in production
if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) {
  throw new Error(
    "SESSION_SECRET environment variable must be set in production! " +
    "Generate one with: openssl rand -hex 32"
  );
}

// Session configuration
export const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: "session",
    createTableIfMissing: false, // We'll manage this via migrations
  }),
  secret: process.env.SESSION_SECRET || "dev-secret-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production", // Use secure cookies in production
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    sameSite: "lax",
  },
  name: "dealerdelight.sid", // Custom session cookie name
});

// Extend Express Session types
declare module "express-session" {
  interface SessionData {
    userId?: string;
    isAdmin?: boolean;
  }
}

// Helper to check if user is authenticated
export function isAuthenticated(req: session.Session & Partial<session.SessionData>): boolean {
  return !!req.userId;
}

// Helper to check if user is admin
export function isAdmin(req: session.Session & Partial<session.SessionData>): boolean {
  return !!req.isAdmin;
}
