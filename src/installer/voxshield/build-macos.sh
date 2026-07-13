#!/bin/bash
set -e

# ============================================================
#  VoxShield Business Security — macOS Build Script
#  Builds the Electron app and creates a .dmg installer
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo "================================================"
echo "  VoxShield Business Security v1.0.0 — macOS"
echo "================================================"
echo ""

# Step 1: Install dependencies
echo "[1/3] Installing dependencies..."
npm install

# Step 2: Build Electron app (.dmg)
echo ""
echo "[2/3] Building Electron app..."
npm run build:mac

# Step 3: Locate output
OUTPUT_DIR="installer/windows/output"
mkdir -p "$OUTPUT_DIR"

# electron-builder outputs to the directory configured in package.json
# Copy the .dmg to our output folder for consistency
DMG_FILE=$(find . -name "*.dmg" -path "*/output/*" 2>/dev/null | head -1)
if [ -z "$DMG_FILE" ]; then
  DMG_FILE=$(find . -name "VoxShield*.dmg" 2>/dev/null | head -1)
fi

if [ -n "$DMG_FILE" ]; then
  cp "$DMG_FILE" "$OUTPUT_DIR/"
  echo ""
  echo "================================================"
  echo "  Build complete!"
  echo "  Output: $OUTPUT_DIR/$(basename "$DMG_FILE")"
  echo "================================================"
else
  echo ""
  echo "================================================"
  echo "  Build complete! Check installer/windows/output/"
  echo "================================================"
fi