#!/bin/bash
# Direct (non-EAS) App Store IPA build for VoxVPN / VoxShield iOS.
# Uses MANUAL signing so it REUSES the existing iOS Distribution certificate
# already in your Keychain — it will NOT try to create a new one (which causes
# the "ALREADY_EXISTS: reached the limit for iOS Distribution certificates" error).
#
# Prereqs (one-time):
#   1. npx cap add ios && npx cap sync ios
#   2. Have your existing iOS Distribution cert + private key imported into
#      Keychain Access on this Mac.
#   3. Download the App Store provisioning profile for the app's bundle ID and
#      install it (double-click the .mobileprovision, or Xcode → Settings →
#      Accounts → Download Manual Profiles).
#
# Usage: bash scripts/build-ipa.sh
set -euo pipefail

SCHEME="App"
CONFIG="Release"
WORKSPACE="ios/App/App.xcworkspace"
ARCHIVE_PATH="build/VoxVPN.xcarchive"
EXPORT_PATH="build/ipa"
EXPORT_OPTIONS="ios/App/ExportOptions.plist"

if [ ! -f "$EXPORT_OPTIONS" ]; then
  echo "❌ Missing $EXPORT_OPTIONS"
  exit 1
fi

if [ ! -d "$WORKSPACE" ]; then
  echo "❌ iOS workspace not found at $WORKSPACE"
  echo "   Run: npx cap add ios && npx cap sync ios"
  exit 1
fi

# Auto-detect the existing "iPhone Distribution: ..." identity in the keychain.
SIGNING_IDENTITY=$(security find-identity -v -p codesigning | grep "iOS Distribution" | head -1 | sed -E 's/.*"(.*)".*/\1/' || true)

if [ -z "$SIGNING_IDENTITY" ]; then
  echo "❌ No 'iOS Distribution' identity found in Keychain."
  echo "   Import your existing .p12 (cert + private key) into Keychain Access, then re-run."
  exit 1
fi

echo "==> Using existing signing identity: $SIGNING_IDENTITY"

echo "==> Archiving..."
xcodebuild \
  -workspace "$WORKSPACE" \
  -scheme "$SCHEME" \
  -configuration "$CONFIG" \
  -archivePath "$ARCHIVE_PATH" \
  -destination "generic/platform=iOS" \
  archive \
  CODE_SIGN_STYLE=Manual \
  CODE_SIGN_IDENTITY="$SIGNING_IDENTITY" \
  CODE_SIGNING_REQUIRED=YES \
  CODE_SIGNING_ALLOWED=YES \
  | xcpretty

echo "==> Exporting IPA..."
xcodebuild \
  -exportArchive \
  -archivePath "$ARCHIVE_PATH" \
  -exportPath "$EXPORT_PATH" \
  -exportOptionsPlist "$EXPORT_OPTIONS" \
  | xcpretty

IPA=$(find "$EXPORT_PATH" -name "*.ipa" | head -1)
echo "✅ IPA ready: $IPA"