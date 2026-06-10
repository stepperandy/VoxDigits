#!/bin/bash

# VoxVPN Keystore Generation Script
# Generates a keystore for signing release APKs

KEYSTORE_FILE="android/app/release.keystore"
ALIAS="voxvpn"
VALIDITY_DAYS=10000

if [ -f "$KEYSTORE_FILE" ]; then
    echo "⚠️  Keystore already exists at $KEYSTORE_FILE"
    read -p "Do you want to regenerate it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Cancelled."
        exit 0
    fi
fi

echo "🔑 Generating keystore for VoxVPN..."
echo "Enter keystore password (min 6 characters):"
read -s KEYSTORE_PASSWORD
echo "Confirm keystore password:"
read -s KEYSTORE_PASSWORD_CONFIRM

if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords don't match!"
    exit 1
fi

if [ ${#KEYSTORE_PASSWORD} -lt 6 ]; then
    echo "❌ Password must be at least 6 characters!"
    exit 1
fi

echo "Enter key password (can be same as keystore):"
read -s KEY_PASSWORD

mkdir -p android/app

keytool -genkey -v \
    -keystore "$KEYSTORE_FILE" \
    -keyalg RSA \
    -keysize 2048 \
    -validity $VALIDITY_DAYS \
    -alias "$ALIAS" \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=VoxVPN, O=VoxVPN Inc, L=Internet, S=Internet, C=US"

if [ -f "$KEYSTORE_FILE" ]; then
    echo "✅ Keystore generated successfully!"
    echo "📄 Location: $KEYSTORE_FILE"
    echo ""
    echo "📝 For environment variables, add to your .env:"
    echo "   KEYSTORE_FILE=$KEYSTORE_FILE"
    echo "   KEYSTORE_PASSWORD=$KEYSTORE_PASSWORD"
    echo "   KEY_ALIAS=$ALIAS"
    echo "   KEY_PASSWORD=$KEY_PASSWORD"
else
    echo "❌ Keystore generation failed!"
    exit 1
fi
