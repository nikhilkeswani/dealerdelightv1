CREATE TABLE "dealerships" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"template_style" text DEFAULT '' NOT NULL,
	"address" text,
	"phone" text,
	"hours" text,
	"about" text,
	"tagline" text,
	"logo_url" text,
	"hero_image_url" text,
	"stats_years_in_business" integer,
	"stats_total_clients" integer,
	"stats_rating" text,
	"stats_show_vehicle_count" text DEFAULT 'true',
	"services_enabled" text DEFAULT 'true',
	"services_data" jsonb,
	"show_stats_section" text DEFAULT 'true',
	"show_services_section" text DEFAULT 'true',
	"show_about_section" text DEFAULT 'true',
	"trial_starts_at" timestamp DEFAULT now() NOT NULL,
	"trial_ends_at" timestamp NOT NULL,
	"subscription_status" text DEFAULT 'trial' NOT NULL,
	"stripe_customer_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "dealerships_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealership_id" varchar NOT NULL,
	"vehicle_id" varchar,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"message" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"country_code" text DEFAULT '+1' NOT NULL,
	"phone" text NOT NULL,
	"dealership_name" text NOT NULL,
	"dealer_website" text,
	"message" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" text NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text,
	"password" text,
	"email" text,
	"password_hash" text,
	"dealership_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"dealership_id" varchar NOT NULL,
	"title" text NOT NULL,
	"year" text NOT NULL,
	"make" text NOT NULL,
	"model" text NOT NULL,
	"price" text NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_dealership_id_dealerships_id_fk" FOREIGN KEY ("dealership_id") REFERENCES "public"."dealerships"("id") ON DELETE no action ON UPDATE no action;