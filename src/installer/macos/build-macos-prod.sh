#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/src/installer/macos/output"
APP_DIR="${DESKTOP_APP_DIR:-.}"

if [[ "$APP_DIR" != /* ]]; then
  APP_DIR="$ROOT_DIR/$APP_DIR"
fi

mkdir -p "$OUTPUT_DIR"

echo "VoxTelefony macOS production build"
echo "Root: $ROOT_DIR"
echo "Desktop app: $APP_DIR"
echo "Output: $OUTPUT_DIR"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "ERROR: macOS DMG signing/notarization must run on macOS." >&2
  exit 1
fi

if [[ ! -f "$APP_DIR/package.json" ]]; then
  echo "ERROR: package.json not found in desktop app directory: $APP_DIR" >&2
  echo "Set DESKTOP_APP_DIR to the Electron desktop app folder." >&2
  exit 1
fi

required_env=(
  APPLE_ID
  APPLE_APP_PASSWORD
  APPLE_TEAM_ID
  APPLE_SIGN_IDENTITY
)

for name in "${required_env[@]}"; do
  if [[ -z "${!name:-}" ]]; then
    echo "ERROR: Missing required environment variable: $name" >&2
    exit 1
  fi
done

cd "$APP_DIR"

if [[ ! -f assets/icon.icns ]]; then
  ICON_SOURCE=""
  if [[ -f assets/logo.png ]]; then
    ICON_SOURCE="assets/logo.png"
  elif [[ -f assets/icon.png ]]; then
    ICON_SOURCE="assets/icon.png"
  fi

  if [[ -n "$ICON_SOURCE" ]]; then
    echo "Creating macOS icon from $ICON_SOURCE..."
    ICONSET_DIR="build/VoxTelefony.iconset"
    mkdir -p "$ICONSET_DIR"
    sips -z 16 16 "$ICON_SOURCE" --out "$ICONSET_DIR/icon_16x16.png" >/dev/null
    sips -z 32 32 "$ICON_SOURCE" --out "$ICONSET_DIR/icon_16x16@2x.png" >/dev/null
    sips -z 32 32 "$ICON_SOURCE" --out "$ICONSET_DIR/icon_32x32.png" >/dev/null
    sips -z 64 64 "$ICON_SOURCE" --out "$ICONSET_DIR/icon_32x32@2x.png" >/dev/null
    sips -z 128 128 "$ICON_SOURCE" --out "$ICONSET_DIR/icon_128x128.png" >/dev/null
    sips -z 256 256 "$ICON_SOURCE" --out "$ICONSET_DIR/icon_128x128@2x.png" >/dev/null
    sips -z 256 256 "$ICON_SOURCE" --out "$ICONSET_DIR/icon_256x256.png" >/dev/null
    sips -z 512 512 "$ICON_SOURCE" --out "$ICONSET_DIR/icon_256x256@2x.png" >/dev/null
    sips -z 512 512 "$ICON_SOURCE" --out "$ICONSET_DIR/icon_512x512.png" >/dev/null
    sips -z 1024 1024 "$ICON_SOURCE" --out "$ICONSET_DIR/icon_512x512@2x.png" >/dev/null
    iconutil -c icns "$ICONSET_DIR" -o assets/icon.icns
  else
    echo "ERROR: No assets/logo.png or assets/icon.png found to create assets/icon.icns" >&2
    exit 1
  fi
fi

if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

export CSC_IDENTITY_AUTO_DISCOVERY=false
# Strip the "Developer ID Application: " prefix if present — electron-builder
# expects only the name portion (e.g. "Your Name (TEAMID)"), not the full
# certificate type prefix.
export CSC_NAME="${APPLE_SIGN_IDENTITY#Developer ID Application: }"
export APPLEID="$APPLE_ID"
export APPLEIDPASS="$APPLE_APP_PASSWORD"
export APPLETEAMID="$APPLE_TEAM_ID"
export APPLE_APP_SPECIFIC_PASSWORD="$APPLE_APP_PASSWORD"

echo "Building signed and notarized DMG..."
npx electron-builder --mac dmg --publish never

DMG_PATH="$(find "$APP_DIR/dist" -maxdepth 1 -type f -name "*.dmg" -print -quit)"
if [[ -z "$DMG_PATH" ]]; then
  echo "ERROR: No DMG produced under $APP_DIR/dist" >&2
  exit 1
fi

cp "$DMG_PATH" "$OUTPUT_DIR/"

FINAL_DMG="$OUTPUT_DIR/$(basename "$DMG_PATH")"
echo "Verifying notarization staple..."
xcrun stapler validate "$FINAL_DMG"
spctl --assess --type open --context context:primary-signature --verbose "$FINAL_DMG"

echo "DMG ready: $FINAL_DMG"