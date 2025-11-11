#!/usr/bin/env node
import { cpSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create dist directory if it doesn't exist
try {
  mkdirSync('dist', { recursive: true });
} catch (err) {
  // Directory might already exist, that's fine
}

// Copy migrations folder to dist
try {
  cpSync('migrations', 'dist/migrations', { recursive: true });
  console.log('✓ Copied migrations to dist/migrations');
} catch (err) {
  console.error('Failed to copy migrations:', err);
  process.exit(1);
}
