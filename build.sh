#!/bin/bash
set -e

echo "Building client..."
npx vite build

echo "Building server..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Copying migrations..."
node scripts/copy-migrations.js

echo "✓ Build complete!"
