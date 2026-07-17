#!/bin/bash
# App Store IPA build for VoxVPN / VoxShield iOS.
# Uses MANUAL signing with an explicit Apple Distribution certificate and
# App Store provisioning profile — produces a correctly-signed binary that
# passes App Store Connect validation (fixes ITMS-90035 Invalid Signature).
#
# Run on macOS with Xcode installed, OR via a CI Mac (MacStadium / Bitrise).
#
# Prereqs (one-time):
#   1. npx cap add ios && npx cap sync ios
#   2. Import your "Apple Distribution" .p12 certificate into Keychain Access.
#   3. Download the App Store provisioning profile for com.voxvpn.mobile from
#      https://developer.apple.com/account/resources/profiles/list and install
#      it (double-click the .mobileprovision file).
#   4. Find the profile UUID:
#      security cms -D -i ~/Library/MobileDevice/Provisioning\ Profiles/*.mobileprovision \
#        | plutil -p - | grep UUID
#
# Usage:
#   APPLE_TEAM_ID="ABC1234567" \
#   PROVISIONING_PROFILE_UUID="00000000-0000-0000-0000-000000000000" \
#   bash scripts/build-ipa.sh
set -euo pipefail

BUNDLE_ID="com.voxvpn.mobile"
APP_VERSION="2.0.1"
BUILD_NUMBER="4"

SCHEME="App"
CONFIG="Release"
WORKSPACE="ios/App/App.xcworkspace"
ARCHIVE_PATH="build/VoxVPN.xcarchive"
EXPORT_PATH="build/ipa"
EXPORT_OPTIONS="ios/App/ExportOptions.plist"

# ── Validate environment ──────────────────────────────────────────────────
if [ -z "${APPLE_TEAM_ID:-}" ]; then
  echo "❌ Set APPLE_TEAM_ID (your Apple Developer Team ID)."
  echo "   Find it at https://developer.apple.com/account#MembershipDetailsCard"
  exit 1
fi
if [ -z "${PROVISIONING_PROFILE_UUID:-}" ]; then
  echo "❌ Set PROVISIONING_PROFILE_UUID (App Store profile UUID for $BUNDLE_ID)."
  exit 1
fi
if [ ! -d "$WORKSPACE" ]; then
  echo "❌ iOS workspace not found at $WORKSPACE"
  echo "   Run: npx cap add ios && npx cap sync ios"
  exit 1
fi

# ── Resolve the "Apple Distribution" signing identity from Keychain ────────
SIGNING_IDENTITY=$(security find-identity -v -p codesigning \
  | grep "Apple Distribution" \
  | head -1 \
  | sed -E 's/.*"(.*)".*/\1/' || true)

if [ -z "$SIGNING_IDENTITY" ]; then
  echo "❌ No 'Apple Distribution' signing identity found in Keychain."
  echo "   Import your .p12 (cert + private key) into Keychain Access, then re-run."
  exit 1
fi

echo "==> Bundle ID:     $BUNDLE_ID"
echo "==> Team ID:       $APPLE_TEAM_ID"
echo "==> Identity:      $SIGNING_IDENTITY"
echo "==> Profile UUID:  $PROVISIONING_PROFILE_UUID"
echo "==> Version:       $APP_VERSION ($BUILD_NUMBER)"

# ── Render ExportOptions.plist with real values ───────────────────────────
RENDERED_OPTIONS="build/ExportOptions.rendered.plist"
mkdir -p build
export APPLE_TEAM_ID PROVISIONING_PROFILE_UUID
envsubst < "$EXPORT_OPTIONS" > "$RENDERED_OPTIONS"

# ── Archive ───────────────────────────────────────────────────────────────
echo "==> Archiving (v$APP_VERSION build $BUILD_NUMBER)..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIG" \
  -archivePath "$ARCHIVE_PATH" \
  -destination "generic/platform=iOS" \
  archive \
  CODE_SIGN_STYLE="Manual" \
  CODE_SIGN_IDENTITY="$SIGNING_IDENTITY" \
  DEVELOPMENT_TEAM="$APPLE_TEAM_ID" \
  PROVISIONING_PROFILE_SPECIFIER="" \
  PROVISIONING_PROFILE="$PROVISIONING_PROFILE_UUID" \
  PRODUCT_BUNDLE_IDENTIFIER="$BUNDLE_ID" \
  MARKETING_VERSION="$APP_VERSION" \
  CURRENT_PROJECT_VERSION="$BUILD_NUMBER" \
  CODE_SIGN_ENTITLEMENTS="App/App.entitlements" \
  | xcpretty

# ── Export IPA ────────────────────────────────────────────────────────────
echo "==> Exporting IPA (App Store distribution)..."
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$RENDERED_OPTIONS" \
  | xcpretty

IPA=$(find "$EXPORT_PATH" -name "*.ipa" | head -1)

echo ""
echo "✅ IPA ready: $IPA"
echo "   Bundle ID: $BUNDLE_ID"
echo "   Version:   $APP_VERSION  Build: $BUILD_NUMBER"
echo ""
echo "   Upload to App Store Connect:"
echo "     Xcode → Window → Organizer → Distribute App → App Store Connect"
echo "   Or via CLI:"
echo "     xcrun altool --upload-app -f \"$IPA\" --type ios \\"
echo "       --apiKey KEY_ID --apiIssuer ISSUER_ID"