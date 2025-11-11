# Deployment Guide

## First-Time Deployment Setup

Before publishing your app for the first time, you need to set up the database schema:

### Step 1: Push Database Schema

Run this command once to create the database tables:

```bash
npm run db:push
```

This will create the `users`, `dealerships`, and `leads` tables in your production database.

### Step 2: Publish Your App

Click the "Publish" button in Replit. Your app will:
- Build the frontend and backend
- Deploy to Replit's servers
- Be accessible at your `.replit.app` URL

### Step 3: Test Customer Signup

Visit your published app and try creating an account to verify everything works!

## Updating Your Deployment

When you make changes:

1. If you changed the database schema (added/removed tables or columns):
   ```bash
   npm run db:push
   ```

2. Republish your app to deploy the changes

## Database Management

- **Development**: Tables are automatically set up when you run `npm run dev`
- **Production**: Run `npm run db:push` before your first deployment
- **Schema Changes**: Always run `npm run db:push` after modifying `shared/schema.ts`

## Troubleshooting

### "Registration failed" error
- Make sure you ran `npm run db:push` before deploying
- Check that your database is provisioned in the Replit console

### Build fails
- Ensure all dependencies are installed: `npm install`
- Check the build logs in the deployment console
