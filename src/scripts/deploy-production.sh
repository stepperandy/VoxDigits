#!/bin/bash
set -e

echo "🚀 Deploying to Production..."

# Confirmation
read -p "Are you sure? This will deploy to production. (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Deployment cancelled."
  exit 1
fi

# Load production environment
export NODE_ENV=production
export $(cat .env.production | xargs)

# Run tests
echo "🧪 Running tests..."
npm run test

# Build React app
echo "📦 Building app..."
npm run build

# Build desktop apps
echo "🖥️ Building desktop apps..."
npm run electron:build:all

# Build and submit mobile apps
echo "📱 Building and submitting mobile apps..."
eas build --platform all --profile production --non-interactive
eas submit --platform all --latest --non-interactive

# Upload to production CDN
echo "☁️ Uploading to production..."
aws s3 sync dist/ s3://voxvpn-prod/desktop/ --delete
aws s3 sync build/ s3://voxvpn-prod/web/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

echo "✅ Production deployment complete!"
echo "Desktop: https://download.voxvpn.com"
echo "Web: https://voxvpn.com"
echo "API: https://api.voxvpn.com"

# Slack notification
curl -X POST -H 'Content-type: application/json' \
  --data "{\"text\":\"✅ Production deployment successful\n🎉 Version $(git describe --tags)\",\"channel\":\"#voxvpn-deploys\"}" \
  $SLACK_WEBHOOK_URL