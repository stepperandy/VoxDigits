#!/bin/bash
# ============================================================
#  VoxTelefony / VoxShield — macOS Production Build Script
#  Builds the Electron app, creates a .dmg, code-signs it,
#  notarizes it with Apple, and staples the notarization ticket.
#
#  Mirrors the Windows build.bat in quality and structure.
#
#  Prerequisites:
#    - Node.js 20+        (https://nodejs.org)
#    - Xcode CLI tools    (xcode-select --install)
#    - Apple Developer ID Application certificate installed in Keychain
#    - App-Specific Password for notarization (appleid.apple.com)
#
#  Environment variables (set before running):
#    APPLE_ID              — your Apple Developer email
#    APPLE_APP_PASSWORD    — App-Specific Password (not your Apple ID password)
#    APPLE_TEAM_ID         — your Developer Team ID (e.g. ABCD1234EF)
#    APPLE_SIGN_IDENTITY   — "Developer ID Application: Your Name (TEAM_ID)"
# ============================================================
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
ELECTRON_DIR="$ROOT_DIR/src/electron"
OUTPUT_DIR="$SCRIPT_DIR/output"
APP_VERSION="3.0.0"
APP_NAME="VoxTelefony"

# ── Colors ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo ""
echo -e "${CYAN}  ██╗   ██╗ ██████╗ ██╗  ██╗██╗   ██╗██████╗ ███╗   ██╗${NC}"
echo -e "${CYAN}  ██║   ██║██╔═══██╗╚██╗██╔╝██║   ██║██╔══██╗████╗  ██║${NC}"
echo -e "${CYAN}  ██║   ██║██║   ██║ ╚███╔╝ ██║   ██║██████╔╝██╔██╗ ██║${NC}"
echo -e "${CYAN}  ╚██╗ ██╔╝██║   ██║ ██╔██╗ ╚██╗ ██╔╝██╔═══╝ ██║╚██╗██║${NC}"
echo -e "${CYAN}   ╚████╔╝ ╚██████╔╝██╔╝ ██╗ ╚████╔╝ ██║     ██║ ╚████║${NC}"
echo -e "${CYAN}    ╚═══╝   ╚═════╝ ╚═╝  ╚═╝  ╚═══╝  ╚═╝     ╚═╝  ╚═══╝${NC}"
echo ""
echo -e "  ${CYAN}macOS Installer Builder v${APP_VERSION}${NC}"
echo -e "  ${NC}===============================================${NC}"
echo ""

# ── Check prerequisites ───────────────────────────────────────
echo -e "${CYAN}[CHECK]${NC} Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "  ${RED}[ERROR] Node.js not found!${NC}"
    echo -e "  Download from: https://nodejs.org (v20 LTS recommended)"
    exit 1
fi
NODE_VER=$(node -v)
echo -e "  Found Node.js ${NODE_VER}"

echo -e "${CYAN}[CHECK]${NC} Xcode Command Line Tools..."
if ! xcode-select -p &> /dev/null; then
    echo -e "  ${YELLOW}[WARN] Xcode CLI tools not found. Installing...${NC}"
    xcode-select --install 2>/dev/null || true
    echo -e "  ${YELLOW}Re-run this script after installation completes.${NC}"
    exit 1
fi
echo -e "  Xcode CLI tools OK"

echo -e "${CYAN}[CHECK]${NC} Apple Developer environment variables..."
MISSING=0
if [ -z "$APPLE_ID" ]; then
    echo -e "  ${YELLOW}[WARN] APPLE_ID not set${NC}"
    MISSING=1
fi
if [ -z "$APPLE_APP_PASSWORD" ]; then
    echo -e "  ${YELLOW}[WARN] APPLE_APP_PASSWORD not set${NC}"
    MISSING=1
fi
if [ -z "$APPLE_TEAM_ID" ]; then
    echo -e "  ${YELLOW}[WARN] APPLE_TEAM_ID not set${NC}"
    MISSING=1
fi
if [ -z "$APPLE_SIGN_IDENTITY" ]; then
    echo -e "  ${YELLOW}[WARN] APPLE_SIGN_IDENTITY not set${NC}"
    MISSING=1
fi

if [ "$MISSING" -eq 1 ]; then
    echo ""
    echo -e "  ${YELLOW}Code signing will be SKIPPED (unsigned build).${NC}"
    echo -e "  ${YELLOW}The DMG will work but macOS Gatekeeper will warn users.${NC}"
    echo -e "  ${YELLOW}Set these env vars for a signed + notarized build:${NC}"
    echo -e "    export APPLE_ID=\"your@email.com\""
    echo -e "    export APPLE_APP_PASSWORD=\"xxxx-xxxx-xxxx-xxxx\""
    echo -e "    export APPLE_TEAM_ID=\"ABCD1234EF\""
    echo -e "    export APPLE_SIGN_IDENTITY=\"Developer ID Application: Your Name (TEAM_ID)\""
    echo ""
    SIGN=false
else
    echo -e "  All signing credentials found"
    SIGN=true
fi

# ── Step 1: Install root dependencies ─────────────────────────
echo ""
echo -e "${CYAN}[1/6]${NC} Installing root dependencies..."
cd "$ROOT_DIR"
npm install
echo -e "  Done."

# ── Step 2: Build Vite frontend ───────────────────────────────
echo ""
echo -e "${CYAN}[2/6]${NC} Building React app (Vite)..."
npm run build
echo -e "  Done."

# ── Step 3: Prepare Electron build ────────────────────────────
echo ""
echo -e "${CYAN}[3/6]${NC} Preparing Electron build..."
cd "$ELECTRON_DIR"
npm install
rm -rf dist
cp -r "$ROOT_DIR/dist" ./dist

# ── Step 4: Build macOS DMG ──────────────────────────────────
echo ""
echo -e "${CYAN}[4/6]${NC} Building macOS .dmg (x64 + arm64)..."
mkdir -p "$OUTPUT_DIR"
if [ "$SIGN" = true ]; then
    CSC_IDENTITY_AUTO_DISCOVERY=true npx electron-builder --mac dmg
else
    CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --mac dmg
fi

# Find the built DMG
DMG_PATH=$(find "$ELECTRON_DIR/dist" "$OUTPUT_DIR" -name "*.dmg" -type f 2>/dev/null | head -1)
if [ -z "$DMG_PATH" ]; then
    echo -e "  ${RED}[ERROR] No .dmg file found after build!${NC}"
    exit 1
fi
DMG_NAME=$(basename "$DMG_PATH")
echo -e "  Built: ${DMG_NAME}"

# Move DMG to output dir
if [ "$(dirname "$DMG_PATH")" != "$OUTPUT_DIR" ]; then
    cp "$DMG_PATH" "$OUTPUT_DIR/"
    DMG_PATH="$OUTPUT_DIR/$DMG_NAME"
fi

# ── Step 5: Code-sign the app ─────────────────────────────────
echo ""
if [ "$SIGN" = true ]; then
    echo -e "${CYAN}[5/6]${NC} Code-signing + Notarizing..."

    ENTITLEMENTS="$ROOT_DIR/src/installer/voxshield/assets/entitlements.mac.plist"

    # Find the .app inside the DMG mount point — sign the app bundle first
    APP_BUNDLE=$(find "$ELECTRON_DIR/dist/mac" "$ELECTRON_DIR/dist/mac-arm64" "$ELECTRON_DIR/dist/mac-universal" -name "*.app" -type d 2>/dev/null | head -1)

    if [ -n "$APP_BUNDLE" ]; then
        echo -e "  Signing app bundle: $(basename "$APP_BUNDLE")"
        codesign --deep --force --options runtime \
            --entitlements "$ENTITLEMENTS" \
            --sign "$APPLE_SIGN_IDENTITY" \
            "$APP_BUNDLE"
        echo -e "  ${GREEN}App signed.${NC}"
    fi

    # Sign the DMG
    echo -e "  Signing DMG..."
    codesign --force --sign "$APPLE_SIGN_IDENTITY" "$DMG_PATH"
    echo -e "  ${GREEN}DMG signed.${NC}"

    # Notarize the DMG
    echo -e "  Submitting to Apple for notarization..."
    echo -e "  ${YELLOW}(this can take 2-10 minutes)${NC}"
    xcrun notarytool submit "$DMG_PATH" \
        --apple-id "$APPLE_ID" \
        --password "$APPLE_APP_PASSWORD" \
        --team-id "$APPLE_TEAM_ID" \
        --wait

    # Staple the notarization ticket
    echo -e "  Stapling notarization ticket..."
    xcrun stapler staple "$DMG_PATH"
    echo -e "  ${GREEN}Notarization stapled.${NC}"

    # Verify
    echo -e "  Verifying signature..."
    codesign --verify --strict --verbose=2 "$DMG_PATH" 2>&1 | head -5
    xcrun stapler validate "$DMG_PATH"
    echo -e "  ${GREEN}Verification complete.${NC}"
else
    echo -e "${YELLOW}[5/6]${NC} Skipping code signing (no credentials set)."
fi

# ── Step 6: Done ──────────────────────────────────────────────
echo ""
echo -e "  ${GREEN}===============================================${NC}"
echo -e "  ${GREEN}  BUILD COMPLETE!${NC}"
echo -e "  ${GREEN}===============================================${NC}"
echo ""
echo -e "  Output: ${OUTPUT_DIR}/${DMG_NAME}"
echo -e "  Size: $(du -h "$DMG_PATH" | cut -f1)"
echo ""
if [ "$SIGN" = true ]; then
    echo -e "  ${GREEN}Status: Signed + Notarized + Stapled${NC}"
    echo -e "  ${GREEN}Gatekeeper: Users can open without warnings${NC}"
else
    echo -e "  ${YELLOW}Status: Unsigned (Gatekeeper will warn users)${NC}"
    echo -e "  ${YELLOW}Users must right-click → Open to bypass${NC}"
fi
echo ""
echo -e "  ${CYAN}Next steps:${NC}"
echo -e "  1. Test the DMG on a clean macOS (Intel + Apple Silicon)"
echo -e "  2. Upload to your hosting / Firebase Storage"
echo -e "  3. Add a macOS Download record in the Admin panel"
echo -e "  4. The download button on the site will pick it up automatically"
echo ""