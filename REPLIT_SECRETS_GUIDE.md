# 🔐 Getting Your Secrets from Replit

**IMPORTANT:** Do this BEFORE leaving Replit! These are the credentials you need to copy from your Replit project.

---

## 📍 Where to Find Secrets in Replit

1. **Open your Replit project**
2. **Click the 🔒 Lock Icon** in the left sidebar (called "Secrets" tool)
3. **Copy each value** shown below

---

## ✅ Critical Values to Copy from Replit

### 1. **DATABASE_URL** ⭐ MOST IMPORTANT!

**Where to find:**
- Click **"Tools"** → **"Database"** in Replit
- Look for **"Connection String"** or **"DATABASE_URL"**
- Copy the entire string

**Format looks like:**
```
postgresql://user123:abc123xyz@ep-cool-cloud-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

**⚠️ CRITICAL:** This contains ALL your data (users, dealerships, vehicles). Without this, you lose access to your database!

---

### 2. **RESEND_API_KEY** (Email)

**Where to find:**
- Replit Secrets panel (🔒 lock icon)
- Look for: `RESEND_API_KEY`
- Should start with `re_`

**Format looks like:**
```
re_abc123def456_xyz789
```

**Alternative:** Create new key at [resend.com/api-keys](https://resend.com/api-keys)

---

### 3. **RESEND_FROM_EMAIL** (Email Sender)

**Where to find:**
- Replit Secrets panel
- Look for: `RESEND_FROM_EMAIL`

**Format looks like:**
```
noreply@yourdomain.com
```

**Note:** This email must be verified in your Resend account.

---

### 4. **PUBLIC_OBJECT_SEARCH_PATHS** (Image Storage)

**Where to find:**
- Replit Secrets panel
- Look for: `PUBLIC_OBJECT_SEARCH_PATHS`

**Format looks like:**
```
gs://your-bucket-name/public
```

**Multiple paths separated by commas:**
```
gs://bucket1/public,gs://bucket2/assets
```

---

### 5. **PRIVATE_OBJECT_DIR** (Private Image Storage)

**Where to find:**
- Replit Secrets panel
- Look for: `PRIVATE_OBJECT_DIR`

**Format looks like:**
```
gs://your-bucket-name/private
```

---

### 6. **GCP_PROJECT_ID** (Google Cloud Project)

**Where to find:**
- Replit Secrets panel OR
- Google Cloud Console → Project Settings

**Format looks like:**
```
dealerdelight-prod-123456
```

---

### 7. **ADMIN_PASSWORD** (Admin Panel Access)

**Where to find:**
- Replit Secrets panel
- Look for: `ADMIN_PASSWORD`

**What it's for:** Access to `/admin` page

---

## 🆕 New Values to Generate (Not in Replit)

### **SESSION_SECRET** (New - Required!)

**Not in Replit** - Generate a new secure secret:

**On Mac/Linux:**
```bash
openssl rand -hex 32
```

**Result looks like:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

**On Windows (PowerShell):**
```powershell
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 🔑 Google Cloud Service Account (New Setup Required)

**Replit handles this automatically, but you need to set it up manually:**

### Steps to Get Service Account Key:

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com

2. **Select Your Project**
   - Choose the project that owns your GCS buckets

3. **Navigate to Service Accounts**
   - Go to: **IAM & Admin** → **Service Accounts**

4. **Find or Create Service Account**
   - Look for existing account OR
   - Click **"+ Create Service Account"**
   - Name it: `dealerdelight-storage`
   - Grant role: **"Storage Object Admin"**

5. **Download JSON Key**
   - Click on the service account
   - Go to **"Keys"** tab
   - Click **"Add Key"** → **"Create New Key"**
   - Choose **"JSON"**
   - Download the file

6. **Save the File**
   - Rename to: `service-account-key.json`
   - Place in your project root folder
   - **DON'T COMMIT TO GIT!** (Already in .gitignore)

---

## 📋 Checklist - What to Copy

Use this checklist when collecting values from Replit:

```
From Replit Secrets Panel (🔒):
□ RESEND_API_KEY
□ RESEND_FROM_EMAIL
□ PUBLIC_OBJECT_SEARCH_PATHS
□ PRIVATE_OBJECT_DIR
□ GCP_PROJECT_ID (might be here or in GCP Console)
□ ADMIN_PASSWORD

From Replit Database Tool:
□ DATABASE_URL (connection string)

Generate Fresh:
□ SESSION_SECRET (openssl rand -hex 32)

Download from Google Cloud:
□ service-account-key.json file
```

---

## 🎯 Quick Copy Template

Create a temporary text file with this format (fill in your values):

```bash
# Database
DATABASE_URL=postgresql://...

# Session (generate new)
SESSION_SECRET=

# Email
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=

# Storage
PUBLIC_OBJECT_SEARCH_PATHS=gs://...
PRIVATE_OBJECT_DIR=gs://...
GCP_PROJECT_ID=

# Admin
ADMIN_PASSWORD=

# Service Account: Download service-account-key.json from GCP
```

---

## ⚠️ Security Tips

1. **Never share these values publicly**
2. **Don't commit them to Git** (.env is in .gitignore)
3. **Store securely** - Use password manager or secure notes
4. **Rotate regularly** - Especially API keys and passwords
5. **Different values** - Use different passwords for dev vs. production

---

## 🔄 What Changed from Replit?

| Feature | Replit | Cursor/Local |
|---------|--------|--------------|
| **Database** | Built-in UI | Direct connection string |
| **Resend Email** | Auto-connected | Manual API key |
| **Google Storage** | Sidecar auth | Service account JSON |
| **Sessions** | In-memory | Database-backed (new!) |
| **Secrets** | Built-in panel | `.env` file |

---

## ✅ Verification Steps

After copying values to `.env`:

1. **Test Database Connection**
   ```bash
   npm run db:push
   ```
   Should show "Session table created" or "already exists"

2. **Test Email**
   - Create a test account
   - Check if welcome email arrives

3. **Test Storage**
   - Upload a vehicle image
   - Check if it displays correctly

4. **Test Sessions**
   - Log in
   - Restart server
   - Refresh page - should still be logged in!

---

## 🆘 Troubleshooting

### "Database connection failed"
- Double-check DATABASE_URL is complete
- Ensure `?sslmode=require` is at the end
- Check Neon dashboard - database might be paused

### "Resend authentication failed"
- Verify RESEND_API_KEY starts with `re_`
- Check key is active in Resend dashboard
- Ensure FROM email is verified

### "Storage bucket not found"
- Verify bucket names in PUBLIC_OBJECT_SEARCH_PATHS
- Check service account has "Storage Object Admin" role
- Ensure GOOGLE_APPLICATION_CREDENTIALS points to correct file

### "Service account error"
- Make sure `service-account-key.json` is in project root
- Check file permissions (should be readable)
- Verify project ID matches the service account's project

---

## 🎉 You're Ready!

Once you have all values:
1. Create `.env` file: `cp .env.example .env`
2. Fill in all values from this guide
3. Place `service-account-key.json` in project root
4. Run `npm install` and `npm run db:push`
5. Start with `npm run dev`

**Your app is now free from Replit dependencies!** 🚀
