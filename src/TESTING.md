# VoxVPN Testing Guide

## Local Testing

### Setup
```bash
npm install
npm run dev
```

### Manual Testing Checklist
- [ ] **Authentication**: Login/signup flow
- [ ] **Connection**: VPN connect/disconnect
- [ ] **Server Selection**: Filter and switch servers
- [ ] **Settings**: Update profile and preferences
- [ ] **Billing**: Subscription management
- [ ] **Account**: View subscription details

### Device Testing
- [ ] Windows Desktop (Electron)
- [ ] macOS Desktop (Electron)
- [ ] Linux Desktop (Electron)
- [ ] iOS Mobile (Simulator & Real Device)
- [ ] Android Mobile (Emulator & Real Device)
- [ ] Web (Chrome, Safari, Firefox)

## Automated Testing

### Run Tests
```bash
npm run test
```

### Coverage Report
```bash
npm run test:coverage
```

### Test UI
```bash
npm run test:ui
```

## Staging Testing

### Deploy to Staging
```bash
npm run deploy:staging
```

### Test Checklist
- [ ] Web: https://staging.voxvpn.com
- [ ] API: https://staging-api.voxvpn.com/health
- [ ] Download desktop apps
- [ ] Install desktop app on Windows/Mac/Linux
- [ ] Test mobile apps via TestFlight (iOS) and Play Store internal testing (Android)
- [ ] Verify Stripe payments work
- [ ] Check email notifications send

## Beta Testing

### Invite Testers
1. **Desktop**: Share GitHub Release links
2. **iOS**: Add email to TestFlight
3. **Android**: Share Play Store internal test link
4. **Web**: Share staging URL

### Collect Feedback
- Create GitHub issue with label `beta-feedback`
- Monitor Discord/Slack for bug reports
- Track crashes in Sentry

## Performance Testing

### Desktop Performance
```bash
# Use Electron DevTools to profile
npm run electron:dev
# Press Ctrl+Shift+I to open DevTools
```

### Mobile Performance
- Use iOS Instruments (Xcode)
- Use Android Profiler (Android Studio)
- Monitor with Firebase Performance Monitoring

### Load Testing
```bash
# Test API endpoints with concurrent requests
ab -n 1000 -c 10 https://staging-api.voxvpn.com/health
```

## Security Testing

### Checklist
- [ ] Verify HTTPS enforced everywhere
- [ ] Test API authentication (invalid tokens rejected)
- [ ] Verify no sensitive data in logs
- [ ] Check for XSS vulnerabilities
- [ ] Test SQL injection on forms
- [ ] Verify rate limiting on API endpoints

## Bug Report Template

```markdown
## Title
[Brief description]

## Environment
- **Platform**: Windows 10 / macOS / Linux / iOS / Android / Web
- **Version**: v1.0.0
- **Build**: Beta / Staging / Production

## Steps to Reproduce
1. 
2.
3.

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happens]

## Screenshots/Logs
[Attach error logs, screenshots, or screen recordings]
```

## Known Issues

Track in GitHub Issues with labels:
- `bug`: Defects
- `enhancement`: Improvements
- `documentation`: Docs needed
- `beta-feedback`: Feedback from testers