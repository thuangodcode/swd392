# Deployment Guide

## 🚀 Deploy SWD392 Mobile App

Có nhiều cách để deploy và test mobile app.

---

## 1️⃣ Development Mode (Expo Go)

**Dễ nhất, phù hợp để test ngay**

### Setup
```bash
cd mobile
npm install
npm start
```

### Test trên điện thoại
1. Cài **Expo Go** app (iOS/Android)
2. Quét QR code từ terminal
3. App sẽ load và chạy

**Pros:**
- ✅ Nhanh, không cần build
- ✅ Hot reload tự động
- ✅ Debug dễ dàng
- ✅ Không cần Apple/Google developer account

**Cons:**
- ❌ Cần cùng mạng WiFi
- ❌ Không phải standalone app
- ❌ Giới hạn native modules

---

## 2️⃣ Build với EAS (Expo Application Services)

**Tạo standalone app, production-ready**

### Prerequisites
```bash
npm install -g eas-cli
eas login
```

### Setup EAS Project
```bash
cd mobile
eas init
```

### Build for Android (APK/AAB)
```bash
# Development build
eas build --platform android --profile development

# Production build (APK)
eas build --platform android --profile preview

# Production build (AAB for Play Store)
eas build --platform android --profile production
```

### Build for iOS
```bash
# Simulator build
eas build --platform ios --profile development

# TestFlight/App Store
eas build --platform ios --profile production
```

**Note:** iOS build cần Apple Developer Account ($99/year)

### Download & Install
1. Build xong → Nhận link download
2. Tải APK về điện thoại Android
3. Install và test

---

## 3️⃣ Local Build

### Android Local Build
```bash
# Install dependencies
npm install

# Build APK
npm run android

# Or with Expo
npx expo run:android
```

**Requirements:**
- Android Studio installed
- Android SDK configured
- Emulator or physical device connected

### iOS Local Build (Mac only)
```bash
# Install CocoaPods
cd ios
pod install
cd ..

# Build
npm run ios

# Or with Expo
npx expo run:ios
```

**Requirements:**
- Xcode installed
- iOS Simulator
- Mac computer

---

## 4️⃣ Web Build (Progressive Web App)

```bash
# Build web version
npm run web

# Or
npx expo start --web
```

Deploy web version:
```bash
# Build for production
npx expo export --platform web

# Deploy to Vercel/Netlify/Firebase
```

---

## 📱 Configuration for Production

### 1. Update API URL
File: `src/utils/constants.js`
```javascript
export const API_BASE_URL = 'https://your-production-api.com/api';
```

### 2. Update app.json
```json
{
  "expo": {
    "name": "SWD392 Student",
    "slug": "swd392-student",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.swd392.student"
    },
    "android": {
      "package": "com.swd392.student"
    }
  }
}
```

### 3. Create eas.json
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

---

## 🔐 Environment Variables

### Create .env file
```bash
cp .env.example .env
```

### Edit .env
```
API_BASE_URL=https://your-production-api.com/api
```

### Load in app
Install dotenv:
```bash
npm install react-native-dotenv
```

Update babel.config.js:
```javascript
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }]
    ]
  };
};
```

Use in code:
```javascript
import { API_BASE_URL } from '@env';
```

---

## 🏪 Submit to App Stores

### Google Play Store (Android)

1. **Create Google Play Developer Account** ($25 one-time)

2. **Build AAB**
```bash
eas build --platform android --profile production
```

3. **Upload to Play Console**
- Go to Google Play Console
- Create new app
- Upload AAB file
- Fill app details
- Submit for review

4. **Review Process:** 1-7 days

### Apple App Store (iOS)

1. **Create Apple Developer Account** ($99/year)

2. **Build IPA**
```bash
eas build --platform ios --profile production
```

3. **Upload to App Store Connect**
- Use Transporter or Xcode
- Fill app information
- Submit for review

4. **Review Process:** 1-3 days

---

## 🧪 Testing Builds

### TestFlight (iOS)
```bash
# Build for TestFlight
eas build --platform ios --profile production

# Upload to TestFlight
eas submit --platform ios
```

### Internal Testing (Android)
```bash
# Build APK for testing
eas build --platform android --profile preview

# Share APK link with testers
```

---

## 🔄 Over-the-Air (OTA) Updates

**Update app without rebuild**

### Setup EAS Update
```bash
npm install expo-updates
eas update:configure
```

### Publish Update
```bash
# Publish to production
eas update --branch production --message "Bug fixes"

# Publish to staging
eas update --branch staging --message "New features"
```

**Pros:**
- ✅ Instant updates
- ✅ No app store review
- ✅ Fix bugs quickly

**Limits:**
- ❌ Only JS/assets changes
- ❌ No native code changes

---

## 📊 Analytics & Monitoring

### Add Sentry for Error Tracking
```bash
npm install @sentry/react-native
npx @sentry/wizard -i reactNative -p ios android
```

### Add Analytics
```bash
# Firebase Analytics
npm install @react-native-firebase/analytics

# Or Segment
npm install @segment/analytics-react-native
```

---

## 🚦 CI/CD Pipeline

### GitHub Actions Example
Create `.github/workflows/build.yml`:
```yaml
name: Build App
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: eas build --platform android --non-interactive
```

---

## 📋 Pre-Deployment Checklist

### Code Quality
- [ ] Remove console.logs
- [ ] Fix all ESLint warnings
- [ ] Remove unused dependencies
- [ ] Optimize images
- [ ] Add error boundaries

### Configuration
- [ ] Update API_BASE_URL to production
- [ ] Update app version in app.json
- [ ] Add proper app icons
- [ ] Add splash screen
- [ ] Configure app permissions

### Testing
- [ ] Test all user flows
- [ ] Test on different devices
- [ ] Test network errors
- [ ] Test offline mode (if applicable)
- [ ] Load testing

### Security
- [ ] Secure API keys
- [ ] Add SSL pinning (if needed)
- [ ] Validate user inputs
- [ ] Add authentication timeout
- [ ] Encrypt sensitive data

### Documentation
- [ ] Update README
- [ ] Document API changes
- [ ] Create user guide
- [ ] Update changelog

---

## 🎯 Deployment Strategies

### 1. Staged Rollout
- Deploy to 10% users first
- Monitor crashes/errors
- Gradually increase to 100%

### 2. A/B Testing
- Test new features with subset
- Measure user engagement
- Roll out winning version

### 3. Beta Testing
- TestFlight (iOS) or Internal Testing (Android)
- Get feedback from beta users
- Fix issues before public release

---

## 🆘 Troubleshooting Deployment

### Build Failed
- Check eas.json configuration
- Verify app.json settings
- Check package.json dependencies
- Review error logs

### App Crashes on Launch
- Test on physical device
- Check native dependencies
- Review Sentry error reports
- Check permissions

### Slow App Performance
- Enable Hermes (Android)
- Optimize images
- Code splitting
- Reduce bundle size

---

## 📱 App Store Optimization (ASO)

### App Title
- Include keywords
- Keep under 30 characters
- Make it descriptive

### Description
- Highlight key features
- Use bullet points
- Include screenshots
- Update regularly

### Screenshots
- Show key features
- Use on different devices
- Add captions
- High quality images

### Keywords (iOS)
- Research popular keywords
- Update every release
- Track rankings

---

## 🔗 Useful Links

- **Expo Docs:** https://docs.expo.dev/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/introduction/
- **Google Play Console:** https://play.google.com/console
- **App Store Connect:** https://appstoreconnect.apple.com/

---

## 🎉 Success!

Your app is now deployed and ready for users! 🚀

Monitor analytics, collect feedback, and iterate quickly.

---

**Need help?** Check TROUBLESHOOTING.md or contact the team.
