#!/bin/bash
set -e

echo "🚀 Deploying to Staging..."

# Load staging environment
export NODE_ENV=staging
export $(cat .env.staging | xargs)

# Build React app
echo "📦 Building app..."
npm run build

# Build desktop apps
echo "🖥️ Building desktop apps..."
npm run electron:build:all

# Build mobile apps
echo "📱 Building mobile apps..."
eas build --platform all --profile staging --non-interactive

# Upload to staging servers
echo "☁️ Uploading to staging..."
aws s3 sync dist/ s3://voxvpn-staging/desktop/ --delete
aws s3 sync build/ s3://voxvpn-staging/web/ --delete

# Notify team
echo "✅ Staging deployment complete!"
echo "Web: https://staging.voxvpn.com"
echo "API: https://staging-api.voxvpn.com"

# Slack notification
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"✅ Staging deployment successful","channel":"#voxvpn-deploys"}' \
  $SLACK_WEBHOOK_URL