# Troubleshooting Guide

## 🔧 Common Issues & Solutions

### 1. Cannot connect to backend

**Problem:** App shows "Network Error" or "Failed to load data"

**Solutions:**
- ✅ Make sure backend is running on `http://localhost:5000`
- ✅ Update `API_BASE_URL` in `src/utils/constants.js` to use your computer's IP
- ✅ Find your IP:
  - Windows: `ipconfig` in CMD
  - Mac: `ifconfig` in Terminal
  - Use IP like: `http://192.168.1.100:5000/api`
- ✅ Ensure phone and computer are on the same WiFi network
- ✅ Check firewall settings (temporarily disable if needed)
- ✅ Verify backend CORS is configured properly

### 2. Module not found errors

**Problem:** `Unable to resolve module...`

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npx expo start -c
```

### 3. Expo Go won't connect

**Problem:** QR code scanned but app doesn't load

**Solutions:**
- ✅ Make sure Expo CLI is latest version: `npm install -g expo-cli`
- ✅ Try tunnel mode: `npx expo start --tunnel`
- ✅ Restart Expo: `npx expo start -c`
- ✅ Check if port 19000, 19001, 19002 are open

### 4. Authentication not working

**Problem:** Login fails or token errors

**Solutions:**
- ✅ Clear app data in Expo Go (shake device → Dev Menu → Reload)
- ✅ Check backend authentication endpoints are working
- ✅ Verify token is being saved: Check console logs
- ✅ Test with Postman first to ensure backend is working

### 5. Groups/Projects not loading

**Problem:** Empty screens or loading forever

**Solutions:**
- ✅ Make sure you're enrolled in a course first
- ✅ Check API responses in console logs
- ✅ Verify user has `currentClass` set
- ✅ Pull to refresh the screen

### 6. Navigation errors

**Problem:** "The action ... was not handled by any navigator"

**Solutions:**
```bash
# Reinstall navigation packages
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler
npx expo start -c
```

### 7. AsyncStorage errors

**Problem:** Cannot read/write to storage

**Solutions:**
```bash
npm install @react-native-async-storage/async-storage
npx expo start -c
```

### 8. Metro bundler issues

**Problem:** "Metro bundler has encountered an error"

**Solutions:**
```bash
# Kill all node processes
# Windows:
taskkill /f /im node.exe

# Mac/Linux:
killall node

# Clear watchman
watchman watch-del-all

# Clear metro cache
npx expo start -c
```

### 9. iOS Simulator issues

**Problem:** App crashes on iOS simulator

**Solutions:**
- ✅ Reset simulator: Device → Erase All Content and Settings
- ✅ Install pods: `cd ios && pod install && cd ..`
- ✅ Clean build: `npx expo run:ios --clean`

### 10. Android Emulator issues

**Problem:** App crashes on Android emulator

**Solutions:**
- ✅ Cold boot emulator (don't use snapshot)
- ✅ Increase emulator RAM in AVD Manager
- ✅ Clean gradle: `cd android && ./gradlew clean && cd ..`
- ✅ Clear build: `npx expo run:android --clean`

## 📱 Testing Tips

### Check API Connection
```javascript
// Add to your screen temporarily
useEffect(() => {
  console.log('API_BASE_URL:', API_BASE_URL);
  fetch(`${API_BASE_URL}/auth/test`)
    .then(res => res.json())
    .then(data => console.log('API Test:', data))
    .catch(err => console.error('API Error:', err));
}, []);
```

### Check AsyncStorage
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check stored data
AsyncStorage.getAllKeys()
  .then(keys => {
    console.log('Stored keys:', keys);
    return AsyncStorage.multiGet(keys);
  })
  .then(data => console.log('Stored data:', data));
```

### Enable Remote Debugging
1. Shake device or press `Ctrl+M` (Android) / `Cmd+D` (iOS)
2. Select "Debug Remote JS"
3. Open Chrome DevTools
4. Check Console for errors

## 🔄 Reset Everything

If all else fails, start fresh:

```bash
# Stop Expo
Ctrl+C

# Remove everything
rm -rf node_modules
rm -rf .expo
rm -rf .expo-shared

# Clear package lock
rm package-lock.json
# or
rm yarn.lock

# Reinstall
npm install

# Clear cache and start
npx expo start -c

# In Expo Go app: Dev Menu → Reload
```

## 🆘 Still Having Issues?

1. Check Expo logs: Look for red error messages
2. Check backend logs: Make sure API is responding
3. Use Postman to test API endpoints directly
4. Check React DevTools for component issues
5. Look for typos in file paths/imports
6. Verify all packages are installed correctly

## 📋 Environment Checklist

Before running the app, ensure:
- [ ] Node.js v14+ installed
- [ ] npm or yarn installed
- [ ] Expo CLI installed globally
- [ ] Backend server is running
- [ ] API_BASE_URL is correct in constants.js
- [ ] Phone and computer on same network
- [ ] Expo Go app installed on phone
- [ ] Firewall allows connections

## 🐛 Report Issues

If you find a bug:
1. Note what you were doing when it happened
2. Check console logs for errors
3. Check network tab for API failures
4. Document steps to reproduce
5. Report to the team with details

---

**Need more help?** Check the main README.md for setup instructions.
