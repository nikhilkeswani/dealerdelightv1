# DealerDelight - Auto Dealership SaaS Platform

## Overview

DealerDelight is a SaaS platform providing auto dealerships with an all-in-one solution for website management, inventory display, and customer relationship management. It follows a product-led growth model, emphasizing instant trial access, beautiful templates, and self-service conversion. The platform enables users to sign up for a 14-day free trial, select website templates, and manage their dealership online, with an upgrade path to a paid subscription. The core ambition is to provide a complete SaaS product ready for initial customers, supporting multi-tenant architecture with data isolation and an intuitive user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is built with React 18 and TypeScript, using Vite for development and bundling. It leverages Wouter for routing and TanStack React Query for server state management. Form handling is managed by React Hook Form with Zod for validation. The UI is built using Shadcn/ui (New York style) with Radix UI primitives and styled with Tailwind CSS, supporting a custom theming system with light/dark modes. The design follows a product-first SaaS landing page approach with a custom color palette, Inter and Poppins typography, and responsive mobile-first breakpoints. Key features include a signup/login flow, a dashboard with trial countdown, template selection, and an upgrade page.

### Backend Architecture

The backend utilizes Express.js with TypeScript and Node.js, employing an ESM module system. It includes custom middleware for logging and error handling. The API follows a RESTful design under the `/api` prefix, with centralized route registration. A `IStorage` interface provides data access abstraction, currently implemented with in-memory storage (`MemStorage`) for development, designed for easy swap to a database-backed solution.

### Data Storage Solutions

The platform uses Drizzle ORM configured for PostgreSQL, targeting Neon serverless PostgreSQL for production. It employs a schema-first approach with TypeScript type inference and a migration system via Drizzle Kit. The current schema includes `users` for authentication, `dealerships` for managing trial and subscription statuses, and `leads` for CRM functionality.

**Database Schema Management:** The platform uses `drizzle-kit push` to sync the database schema. Before first deployment, run `npm run db:push` to create the necessary tables. The server verifies database connectivity on startup (`server/migrate.ts`) but does not run migrations automatically - schema changes are applied via `drizzle-kit push` command.

### Authentication and Authorization

Authentication is token-based, using bcrypt for password hashing and in-memory session storage. Protected API routes utilize `requireAuth` middleware to ensure multi-tenant data isolation by `dealershipId`. The system enforces ownership verification for dealership-specific actions.

### Product-Led Growth Features

A central feature is the "Instant Preview Generator," an interactive frontend component that allows users to instantly visualize their dealership website by typing in their dealership name. This feature provides a real-time mock-up with a sanitized domain URL, branded header, sample inventory, and a CTA to the signup form, creating an immediate "aha moment" without backend interaction.

### Onboarding System

The platform implements **honest progress tracking** with a 5-step onboarding flow (20% per step):
1. **Account Creation (20%)** - User signs up with email/password
2. **Template Selection (40%)** - User selects website template from gallery
3. **Business Details (60%)** - User provides dealership info (address, phone, hours, about)
4. **Logo Upload (80%)** - User adds dealership logo URL
5. **First Vehicle (100%)** - User adds their first vehicle to inventory

**Progressive Reveal UX:** The dashboard uses progressive disclosure, showing only the next available action instead of grayed-out "coming soon" cards. This reduces friction and guides users naturally through setup. The website URL is only revealed at 100% completion.

**Key Implementation Details:**
- Progress calculated server-side based on actual completion fields
- Each step has dedicated form page with validation
- Dashboard cards unlock sequentially as steps complete
- `apiRequest` function includes authentication headers for all mutations
- `getQueryFn` normalizes URLs to prevent double-slash issues with hierarchical query keys

### Inventory Management System (Phase 1 - Complete)

The platform includes a complete vehicle inventory management system with full CRUD operations:

**Features:**
- **Add Vehicles:** Form-based vehicle entry with direct image upload (file picker with preview)
- **View Inventory:** Grid-based listing page displaying all vehicles with images, details, and pricing
- **Edit Vehicles:** Dialog modal for updating vehicle information with pre-filled forms
- **Delete Vehicles:** Confirmation dialog to prevent accidental deletions
- **Image Management:** Direct file upload with permanent URL storage via ObjectStorageService

**Security & Multi-Tenancy:**
- All vehicle operations require authentication via `requireAuth` middleware
- Ownership validation ensures users can only manage their dealership's vehicles
- Vehicle queries filtered by `dealershipId` for complete data isolation

**Technical Implementation:**
- **Backend:** RESTful endpoints at `/api/dealerships/:id/vehicles` (POST, GET) and `/api/vehicles/:id` (PATCH, DELETE)
- **Frontend:** React Query for data fetching/caching, React Hook Form with Zod validation
- **Storage:** Vehicle images uploaded to object storage with automatic conversion from presigned upload URLs to permanent public URLs
- **UI Components:** EditVehicleForm component, AlertDialog for deletions, responsive grid layout

**API Endpoints:**
- `POST /api/dealerships/:id/vehicles` - Create vehicle (converts temporary image URLs to permanent)
- `GET /api/dealerships/:id/vehicles` - List all vehicles for dealership
- `PATCH /api/vehicles/:id` - Update vehicle (with ownership check)
- `DELETE /api/vehicles/:id` - Delete vehicle (with ownership check)

## External Dependencies

### Third-Party Services

- **Fonts & Assets:** Google Fonts (Inter, Poppins), Unsplash for stock photography.
- **UI Libraries:** Radix UI, Embla Carousel, Lucide React, Vaul.
- **Email:** Resend for transactional emails (e.g., welcome emails, lead notifications).

### API Integrations

- **Database:** Neon Serverless PostgreSQL, Drizzle ORM.
- **Form Validation:** Zod, React Hook Form, @hookform/resolvers.
- **Styling & Utilities:** Tailwind CSS, class-variance-authority, clsx, tailwind-merge, date-fns.

### Build & Deployment

- **Development:** Vite (client), `tsx` (server), Replit-specific plugins.
- **Production:** ESBuild (server bundling), `dist/public` (client build), `dist/index.js` (server build).