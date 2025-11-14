# Migration Guide: Replit to Cursor

This guide will help you smoothly migrate your DealerDelight project from Replit to Cursor (or any other development environment).

## 📋 Table of Contents

1. [What You Need from Replit](#what-you-need-from-replit)
2. [Environment Setup in Cursor](#environment-setup-in-cursor)
3. [Database Migration](#database-migration)
4. [Email Service Configuration](#email-service-configuration)
5. [Object Storage Configuration](#object-storage-configuration)
6. [Session Changes (Already Implemented!)](#session-changes-already-implemented)
7. [Testing Your Migration](#testing-your-migration)
8. [Deployment Options](#deployment-options)
9. [Troubleshooting](#troubleshooting)

---

## 🔑 What You Need from Replit

Before leaving Replit, collect these critical pieces of information:

### 1. **Database Credentials (CRITICAL!)**

Your Replit project uses Neon PostgreSQL. You need to get the connection string:

#### How to find it in Replit:
1. Go to your Replit project
2. Click on "Tools" → "Database" (or the database icon in the left sidebar)
3. Look for "Connection String" or "DATABASE_URL"
4. Copy the entire URL (format: `postgresql://user:password@host:port/database?sslmode=require`)

**Example format:**
```
postgresql://user123:abc123xyz@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

⚠️ **IMPORTANT:** This database contains all your users, dealerships, and vehicles. You MUST have this URL!

### 2. **Resend Email API Key**

Your app sends emails (welcome emails, inquiry notifications) via Resend:

#### How to find it:
1. In Replit, go to "Tools" → "Secrets" or check your environment variables
2. Look for `RESEND_API_KEY` or check the Resend integration
3. If you can't find it, you can create a new one at [resend.com](https://resend.com/api-keys)

Also note:
- **From Email Address**: The email you're sending from (e.g., `noreply@yourdomain.com`)
- This email must be verified in your Resend account

### 3. **Google Cloud Storage Configuration**

Your project stores uploaded images (logos, vehicle photos) in Google Cloud Storage:

#### What to collect:
1. **Bucket Name(s)**: The name(s) of your GCS buckets
2. **Public Search Paths**: Check `PUBLIC_OBJECT_SEARCH_PATHS` in Replit env vars
3. **Private Directory**: Check `PRIVATE_OBJECT_DIR` in Replit env vars  
4. **Service Account Credentials**: You'll need to create or download a service account key from Google Cloud Console

#### How to get GCS credentials:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project
3. Navigate to "IAM & Admin" → "Service Accounts"
4. Create a new service account (or use existing)
5. Download the JSON key file
6. **NEVER commit this file to git!** (Already added to .gitignore)

### 4. **Admin Password**

Check your Replit secrets for `ADMIN_PASSWORD` - this is used to access `/admin`

### 5. **Session Secret (Optional - New!)**

We've migrated to database-backed sessions. Generate a new secure secret:

```bash
openssl rand -hex 32
```

---

## 🚀 Environment Setup in Cursor

### Step 1: Clone or Open Project in Cursor

If you haven't already:
```bash
git clone <your-repo-url>
cd dealerdelight
```

Then open the folder in Cursor.

### Step 2: Create `.env` File

Copy the example environment file:

```bash
cp .env.example .env
```

### Step 3: Fill in Environment Variables

Open `.env` and fill in the values you collected from Replit:

```bash
# Database (FROM REPLIT)
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Sessions (GENERATE NEW)
SESSION_SECRET=your-generated-32-char-hex-string

# Email (FROM REPLIT/RESEND)
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Object Storage (FROM REPLIT/GOOGLE CLOUD)
PUBLIC_OBJECT_SEARCH_PATHS=gs://your-bucket-name/public
PRIVATE_OBJECT_DIR=gs://your-bucket-name/private
GCP_PROJECT_ID=your-gcp-project-id

# Admin (FROM REPLIT)
ADMIN_PASSWORD=your-admin-password

# Server
PORT=5000
NODE_ENV=development
```

### Step 4: Setup Google Cloud Credentials

1. Place your downloaded service account JSON file in project root
2. Reference it in `.env`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

**Security Note:** This file is already in `.gitignore` - it will NOT be committed to git.

### Step 5: Install Dependencies

```bash
npm install
```

---

## 💾 Database Migration

Your Neon database should work immediately with the connection string, but you need to update the schema for session storage.

### Push Session Table to Database

Run this command to create the session table:

```bash
npm run db:push
```

This will add the `session` table required for the new cookie-based authentication.

### Verify Database Connection

Start the dev server to test:

```bash
npm run dev
```

Check the console for any database connection errors.

---

## 📧 Email Service Configuration

### Option 1: Keep Using Resend (Recommended)

If you already have Resend configured:
1. Use the same API key and from email
2. No code changes needed!

### Option 2: Switch to Different Email Provider

If you want to switch from Resend to another provider (SendGrid, Mailgun, etc.):

1. Update `/server/email.ts`
2. Replace Resend client with your preferred service
3. Update environment variables accordingly

---

## 📦 Object Storage Configuration

### Option 1: Keep Using Google Cloud Storage (Current Setup)

Continue using your existing GCS buckets:
1. Ensure service account has proper permissions
2. Buckets must have appropriate access policies
3. Test file uploads in dev environment

### Option 2: Switch to Alternative Storage

Consider these alternatives:

#### AWS S3
- More commonly used
- Excellent documentation
- Update `/server/objectStorage.ts` to use AWS SDK

#### Cloudflare R2
- S3-compatible API
- No egress fees
- Easy migration from GCS

#### Local Storage (Development Only)
- Store files locally during development
- NOT recommended for production

---

## 🔐 Session Changes (Already Implemented!)

✅ **Good news!** We've already migrated your session management:

### What Changed:
- **Before:** Sessions stored in memory (lost on server restart)
- **After:** Sessions stored in PostgreSQL database (persistent)
- **Authentication:** Changed from token-based (localStorage) to cookie-based (httpOnly cookies)

### What This Means:
- Users stay logged in across server restarts
- More secure (httpOnly cookies can't be accessed by JavaScript)
- No localStorage token management needed
- Sessions automatically expire after 30 days of inactivity

### No Action Required:
All frontend code has been updated to use cookie-based sessions. Just make sure you:
1. Added the `session` table via `npm run db:push`
2. Set `SESSION_SECRET` in your `.env` file

---

## 🧪 Testing Your Migration

### 1. Start Development Server

```bash
npm run dev
```

Server should start on `http://localhost:5000`

### 2. Test Authentication

1. Navigate to `http://localhost:5000/signup`
2. Create a test account
3. Verify welcome email is sent (check Resend dashboard if not received)
4. Logout and login again
5. Refresh page - should stay logged in

### 3. Test Vehicle Management

1. Add a vehicle with an image
2. Verify image uploads to Google Cloud Storage
3. Check that image displays correctly

### 4. Test Public Pages

1. Note your dealership slug from dashboard
2. Visit `http://localhost:5000/<your-slug>`
3. Verify public page displays correctly

### 5. Test Inquiries

1. From public page, submit an inquiry
2. Check that email notification is sent to your account
3. View inquiry in dashboard at `/leads`

---

## 🌐 Deployment Options

Now that you're off Replit, you have many deployment options:

### Recommended Options:

#### 1. **Railway** (Easiest)
- Connect GitHub repo
- Auto-deploys on push
- Built-in PostgreSQL support
- Environment variables in dashboard
- ~$5-20/month

```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
railway login
railway init
railway up
```

#### 2. **Vercel** (Popular for Next.js but works for Express)
- Free tier available
- Excellent performance
- Need external database (Neon works great)
- ~$0-20/month

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

#### 3. **Fly.io** (Full Control)
- Great for Node.js apps
- Deploy close to users globally
- Need external database (Neon recommended)
- ~$5-20/month

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
```

#### 4. **Render** (Balanced)
- Easy deployment from GitHub
- Built-in PostgreSQL
- Free tier for testing
- ~$7-25/month for production

### Environment Variables in Production

All platforms let you set environment variables in their dashboard. Copy from your `.env` file.

⚠️ **Remember:**
- Set `NODE_ENV=production`
- Use a strong `SESSION_SECRET` (different from development)
- Ensure `DATABASE_URL` points to production database

---

## 🔧 Troubleshooting

### "Database connection failed"

**Solution:**
- Verify `DATABASE_URL` is correct
- Check Neon dashboard - database might be sleeping (wakes automatically)
- Ensure `?sslmode=require` is in connection string

### "Session not persisting"

**Solution:**
- Run `npm run db:push` to create session table
- Check that `SESSION_SECRET` is set in `.env`
- Clear browser cookies and try again

### "Email not sending"

**Solution:**
- Verify `RESEND_API_KEY` is correct
- Check that from email is verified in Resend
- Check Resend dashboard for error logs
- Ensure code is removing Replit-specific authentication

### "Image upload failing"

**Solution:**
- Verify service account JSON file is in project root
- Check `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Ensure GCS buckets exist and have proper permissions
- Service account needs "Storage Object Admin" role

### "Port already in use"

**Solution:**
```bash
# Find process using port 5000
lsof -ti:5000

# Kill it
kill -9 <PID>

# Or use different port
PORT=3000 npm run dev
```

### "Module not found" errors

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Key Differences: Replit vs. Cursor

| Feature | Replit | Cursor/Local |
|---------|--------|--------------|
| **Environment Variables** | Built-in Secrets | Manual `.env` file |
| **Database** | Integrated Neon | External Neon connection |
| **File Storage** | Integrated GCS | Manual GCS setup |
| **Email** | Integrated Resend | Manual Resend API key |
| **Sessions** | In-memory (lost on restart) | Database-backed (persistent) ✅ |
| **Hot Reload** | Automatic | Via Vite (automatic) |
| **Deployment** | Click "Publish" | Git push + platform CLI |

---

## ✅ Migration Checklist

Use this checklist to ensure you've completed all steps:

- [ ] Collected DATABASE_URL from Replit
- [ ] Collected RESEND_API_KEY from Replit
- [ ] Collected Google Cloud Storage configuration
- [ ] Downloaded GCS service account key JSON
- [ ] Created `.env` file in project root
- [ ] Filled all values in `.env`
- [ ] Ran `npm install`
- [ ] Ran `npm run db:push` to create session table
- [ ] Started dev server with `npm run dev`
- [ ] Tested signup and login
- [ ] Tested vehicle creation with image upload
- [ ] Tested public dealership page
- [ ] Tested email notifications
- [ ] Committed changes to git (without `.env` file!)
- [ ] Deployed to production platform
- [ ] Set production environment variables
- [ ] Tested production deployment

---

## 🆘 Need Help?

If you encounter issues:

1. **Check console errors** - Both browser and server terminal
2. **Verify environment variables** - Use `console.log()` to debug (remove before committing!)
3. **Check database logs** - Neon dashboard has query logs
4. **Test each service individually** - Database, email, storage separately
5. **Ask Cursor AI** - The Cursor AI assistant can help debug issues!

---

## 🎉 Success!

Once everything is working:

1. Remove any Replit-specific code you find
2. Update deployment documentation
3. Consider setting up CI/CD for automatic deployments
4. Monitor error logs in production
5. Keep your `.env` file secure and backed up safely

**You're now fully migrated to Cursor!** 🚀

---

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Resend Documentation](https://resend.com/docs)
- [Google Cloud Storage Node.js SDK](https://cloud.google.com/storage/docs/reference/libraries#client-libraries-install-nodejs)
- [Express.js Session Guide](https://expressjs.com/en/resources/middleware/session.html)
- [Cursor Documentation](https://cursor.sh/docs)
