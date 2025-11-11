#!/bin/bash
# This script sets up the database schema for production deployment
echo "Setting up database schema..."
npx drizzle-kit push --force
echo "✓ Database schema synced"
