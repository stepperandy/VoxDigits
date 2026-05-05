# VoxVPN Deployment Guide

## Overview
This document outlines the complete deployment pipeline for VoxVPN across desktop, mobile, and web platforms.

## Environments

### Development
- **URL**: http://localhost:5173
- **API**: http://localhost:3000
- **Purpose**: Local development and testing

### Staging
- **URL**: https://staging.voxvpn.com
- **API**: https://staging-api.voxvpn.com
- **Purpose**: Pre-release testing, beta features
- **Environment File**: `.env.staging`

### Production
- **URL**: https://voxvpn.com
- **API**: https://api.voxvpn.com
- **Purpose**: Live user-facing environment
- **Environment File**: `.env.production`

## Deployment Workflows

### 1. Automatic CI/CD (GitHub Actions)

Triggered on:
- Push to `main` or `develop` branches
- Pull requests to `main`
- Tag push (v*)

**Workflows**:
- `desktop-build.yml`: Windows/Mac/Linux Electron builds
- `mobile-build.yml`: iOS (TestFlight) & Android (Play Store) builds
- `tests.yml`: Linting, type checks, tests

### 2. Manual Staging Deployment

```bash
bash scripts/deploy-staging.sh
```

**What it does**:
- Builds React app with staging config
- Builds desktop apps (Windows/Mac/Linux)
- Builds mobile apps via EAS
- Uploads to S3 staging bucket
- Notifies team via Slack

### 3. Manual Production Deployment

```bash
bash scripts/deploy-production.sh
```

**Prerequisites**:
- All tests passing
- Code merged to `main`
- Version tag created (v1.2.3)

**What it does**:
- Runs full test suite
- Builds all platforms
- Submits to TestFlight & Play Store
- Uploads to production CDN
- Invalidates CloudFront cache
- Requires confirmation

## Release Process

### 1. Create Release Branch
```bash
git checkout -b release/v1.2.0
```

### 2. Update Version
- Update `package.json` version
- Update `electron/package.json` version
- Update `capacitor.config.json` version

### 3. Create Git Tag
```bash
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0
```

### 4. GitHub Actions Builds Automatically
- Desktop apps built and released to GitHub
- Mobile apps submitted to app stores
- Web app deployed to CDN

### 5. Monitor Deployment
- Check GitHub Actions workflow status
- Monitor Slack #voxvpn-deploys channel
- Verify app stores show new versions

## Desktop App Build Scripts

### Windows
```bash
npm run electron:build:win
```
Creates: `dist/VoxVPN-windows-setup.exe`

### macOS
```bash
npm run electron:build:mac
```
Creates: `dist/VoxVPN-macos.dmg`

### Linux
```bash
npm run electron:build:linux
```
Creates: `dist/VoxVPN-linux-*.AppImage`

## Mobile App Builds

### iOS (TestFlight)
```bash
eas build --platform ios --profile staging
eas submit --platform ios --latest
```

### Android (Play Store)
```bash
eas build --platform android --profile staging
eas submit --platform android --latest --track internal
```

## Beta Testing

### Desktop Beta
1. Create git tag: `v1.2.0-beta.1`
2. GitHub Actions auto-builds and releases
3. Share download link from GitHub Releases
4. Collect feedback in Discord/Slack

### Mobile Beta
1. iOS: Internal testers via TestFlight
2. Android: Internal testing track on Play Store
3. EAS profile: `preview` or `staging`

## Environment Variables Required

**GitHub Secrets** (for CI/CD):
- `VITE_API_URL`
- `EXPO_TOKEN` (Expo account)
- `APPLE_ID` (Apple Developer ID)
- `APPLE_PASSWORD` (App-specific password)
- `APPLE_TEAM_ID`
- `ANDROID_KEYSTORE_PASSWORD`
- `WIN_SIGNING_CERT`
- `WIN_SIGNING_PASSWORD`
- `SLACK_WEBHOOK_URL`

**Server Environment**:
- `NODE_ENV` (staging|production)
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `VOXVPN_API_URL`

## Rollback Procedure

### Web Rollback (CloudFront)
```bash
aws cloudfront create-invalidation --distribution-id DIST_ID --paths "/*"
# Redeploy previous version to S3
```

### Mobile Rollback
- iOS: Release new version (Apple doesn't allow instant rollback)
- Android: Open Play Store console → Release Management → Rollback button

### Desktop Rollback
- Release new version with patch
- Users update when app checks for updates

## Monitoring & Alerts

### Check Deployment Status
```bash
# GitHub Actions
gh run list --repo voxvpn/voxvpn

# EAS Build Status
eas build:list
```

### Error Recovery
- Check GitHub Actions logs for build failures
- Review Sentry for runtime errors
- Check Slack notifications for deployment issues
- Monitor server health: `GET /health` endpoint

## Tips & Best Practices

1. **Always test in staging first** before production
2. **Tag releases** with semantic versioning (v1.2.3)
3. **Keep .env files** in .gitignore
4. **Test on real devices** before App Store submission
5. **Monitor app store reviews** for issues
6. **Keep desktop app updater** working for auto-updates
7. **Document breaking changes** in release notes
8. **Notify users** of major updates via in-app notifications

## Support

- Issues: GitHub Issues
- Team: #voxvpn-deploys Slack channel
- Docs: See deployment logs in GitHub Actions