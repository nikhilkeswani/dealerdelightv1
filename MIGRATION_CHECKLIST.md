# ✅ Migration Checklist: Replit → Cursor

This checklist helps you migrate your environment variables from Replit to Cursor.

## 📋 Step-by-Step Migration

### 1. **Get Values from Replit** 🔒

Before leaving Replit, collect these values:

#### In Replit, go to **Secrets** (🔒 lock icon in sidebar):

- [ ] `DATABASE_URL` - Copy from **Tools → Database → Connection String**
- [ ] `RESEND_API_KEY` - Should start with `re_`
- [ ] `RESEND_FROM_EMAIL` - Your verified sender email
- [ ] `PUBLIC_OBJECT_SEARCH_PATHS` - GCS bucket paths (comma-separated)
- [ ] `PRIVATE_OBJECT_DIR` - GCS private bucket path
- [ ] `GCP_PROJECT_ID` - Your Google Cloud project ID
- [ ] `ADMIN_PASSWORD` - Your admin login password

### 2. **Download Google Cloud Service Account Key** ☁️

**This is NEW - Replit handled this automatically, but you need it now:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project (use `GCP_PROJECT_ID` from above)
3. Navigate to **IAM & Admin → Service Accounts**
4. Create a new service account OR select existing one
5. Grant role: **Storage Object Admin**
6. Go to **Keys** tab → **Add Key** → **Create New Key** → **JSON**
7. Download the JSON file
8. **Save it as `service-account-key.json` in your project root**
9. ⚠️ **NEVER commit this file!** (Already in `.gitignore`)

### 3. **Create `.env` File in Cursor** 📝

1. Copy the template:
   ```bash
   cp env.template .env
   ```

2. Open `.env` and fill in all values from Step 1

3. Set `GOOGLE_APPLICATION_CREDENTIALS` to:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
   ```

### 4. **Required Environment Variables** ✅

Your `.env` file MUST have these (all are required):

```bash
# Database (from Replit)
DATABASE_URL=postgresql://...

# Email (from Replit Secrets)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Google Cloud Storage (from Replit + new service account)
GCP_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
PUBLIC_OBJECT_SEARCH_PATHS=gs://bucket-name/public
PRIVATE_OBJECT_DIR=gs://bucket-name/private

# Authentication (from Replit Secrets)
ADMIN_PASSWORD=your-password
SESSION_SECRET=your-secret-here

# Server (optional)
PORT=5000
NODE_ENV=development
```

### 5. **Verify Setup** 🧪

1. **Check file exists:**
   ```bash
   ls -la service-account-key.json
   ```

2. **Test database connection:**
   ```bash
   npm run db:push
   ```

3. **Start server:**
   ```bash
   npm run dev
   ```

4. **Check for errors** - Look for:
   - ✅ "Server running on port 5000"
   - ❌ Any "environment variable is not set" errors

### 6. **Common Issues** 🔧

#### ❌ "RESEND_FROM_EMAIL environment variable is not set"
**Fix:** Add `RESEND_FROM_EMAIL` to your `.env` file

#### ❌ "GCP_PROJECT_ID not set"
**Fix:** Add `GCP_PROJECT_ID=your-project-id` to your `.env`

#### ❌ "Cannot find module './service-account-key.json'"
**Fix:** 
- Download the service account key from Google Cloud Console
- Save it as `service-account-key.json` in project root
- Verify path in `.env`: `GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json`

#### ❌ "Authentication error" with Google Cloud
**Fix:** 
- Verify service account has "Storage Object Admin" role
- Check that JSON key file is valid
- Ensure `GCP_PROJECT_ID` matches the project in the JSON file

### 7. **Alternative Services** 🔄

If you want to switch from Google Cloud Storage, see `SERVICE_ALTERNATIVES.md` for:
- Cloudflare R2 (cheapest bandwidth)
- AWS S3 (industry standard)
- Backblaze B2 (cheapest storage)

---

## ✅ Final Checklist

- [ ] All Replit secrets copied to `.env`
- [ ] `service-account-key.json` downloaded and placed in project root
- [ ] `.env` file created with all required variables
- [ ] Server starts without errors
- [ ] Database connection works
- [ ] Email sending works (test with a signup)
- [ ] File uploads work (test with image upload)

---

## 🎉 You're Ready!

Once all checks pass, your app is fully migrated from Replit and ready to deploy anywhere!

**Next Steps:**
- Deploy to Railway, Render, Fly.io, or your preferred platform
- See `SERVICE_ALTERNATIVES.md` for hosting recommendations

