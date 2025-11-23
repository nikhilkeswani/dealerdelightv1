#!/bin/bash
# Script to remove sensitive files from git history
# ⚠️  WARNING: This rewrites git history. Only run if you haven't pushed to production yet!

echo "🔒 Removing sensitive files from git history..."
echo ""
echo "⚠️  WARNING: This will rewrite git history!"
echo "⚠️  All team members will need to re-clone the repository!"
echo "⚠️  Only proceed if you understand the implications."
echo ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "❌ Aborted."
    exit 1
fi

# Check if git-filter-repo is installed
if ! command -v git-filter-repo &> /dev/null; then
    echo "📦 Installing git-filter-repo..."
    pip3 install git-filter-repo || { echo "❌ Failed to install git-filter-repo"; exit 1; }
fi

# Backup current branch
current_branch=$(git branch --show-current)
echo "📋 Current branch: $current_branch"

# Remove sensitive files
echo "🗑️  Removing service-account-key.json from history..."
git filter-repo --path service-account-key.json --invert-paths --force

echo ""
echo "✅ Sensitive files removed from git history!"
echo ""
echo "📌 Next steps:"
echo "   1. Regenerate your service-account-key.json in Google Cloud Console"
echo "   2. Place new key in project root (it's in .gitignore)"
echo "   3. Force push to remote: git push origin --force --all"
echo "   4. Notify team members to re-clone the repository"
echo ""
echo "⚠️  IMPORTANT: Regenerate the compromised service account key immediately!"
echo "   Go to: https://console.cloud.google.com/iam-admin/serviceaccounts"

