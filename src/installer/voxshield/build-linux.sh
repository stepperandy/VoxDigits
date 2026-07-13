#!/bin/bash
set -e

# ============================================================
#  VoxShield Business Security — Linux Build Script
#  Builds the Electron app and creates an AppImage
# ============================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
cd "$ROOT_DIR"

echo ""
echo "================================================"
echo "  VoxShield Business Security v1.0.0 — Linux"
echo "================================================"
echo ""

# Step 1: Install dependencies
echo "[1/3] Installing dependencies..."
npm install

# Step 2: Build Electron app (AppImage)
echo ""
echo "[2/3] Building Electron app..."
npm run build:linux

# Step 3: Locate output
OUTPUT_DIR="installer/windows/output"
mkdir -p "$OUTPUT_DIR"

APPIMAGE_FILE=$(find . -name "*.AppImage" -path "*/output/*" 2>/dev/null | head -1)
if [ -z "$APPIMAGE_FILE" ]; then
  APPIMAGE_FILE=$(find . -name "VoxShield*.AppImage" 2>/dev/null | head -1)
fi

if [ -n "$APPIMAGE_FILE" ]; then
  cp "$APPIMAGE_FILE" "$OUTPUT_DIR/"
  chmod +x "$OUTPUT_DIR/$(basename "$APPIMAGE_FILE")"
  echo ""
  echo "================================================"
  echo "  Build complete!"
  echo "  Output: $OUTPUT_DIR/$(basename "$APPIMAGE_FILE")"
  echo "================================================"
else
  echo ""
  echo "================================================"
  echo "  Build complete! Check installer/windows/output/"
  echo "================================================"
fi