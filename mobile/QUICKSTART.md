# Quick Start Guide - SWD392 Mobile App

## 🚀 Chạy App trong 3 bước

### 1. Cài đặt dependencies
```bash
cd mobile
npm install
```

### 2. Cấu hình Backend URL
Mở `src/utils/constants.js` và thay đổi:

```javascript
export const API_BASE_URL = 'http://192.168.1.XXX:5000/api';
```

**Lấy IP máy tính:**
- Windows: Mở CMD → gõ `ipconfig` → tìm IPv4 Address
- Mac/Linux: Mở Terminal → gõ `ifconfig` → tìm inet

### 3. Start App
```bash
npm start
# hoặc
npx expo start
```

Sau đó:
1. Cài **Expo Go** trên điện thoại
2. Quét QR code
3. Xong! 🎉

## 📝 Test Accounts

Có thể test với tài khoản có sẵn trong backend hoặc đăng ký mới.

### Đăng ký mới:
- Student ID: SE123456
- Email: test@student.com
- Password: 123456
- Course: K17
- Major: Software Engineering

## 🔧 Commands

```bash
# Start development server
npm start

# Start for Android
npm run android

# Start for iOS (Mac only)
npm run ios

# Start web version
npm run web

# Clear cache
npx expo start -c
```

## 🐛 Common Issues

### "Unable to connect to backend"
✅ Kiểm tra backend đang chạy: `http://localhost:5000/api`
✅ Thay `localhost` bằng IP máy trong constants.js
✅ Đảm bảo cùng mạng WiFi

### "Module not found"
```bash
npm install
npx expo start -c
```

### "Network error"
- Tắt firewall tạm thời
- Kiểm tra backend CORS settings

## 📱 Screens Overview

1. **Login** → Đăng nhập bằng Student ID
2. **Register** → Đăng ký tài khoản mới
3. **Dashboard** → Trang chủ với thông tin user
4. **Groups** → Quản lý nhóm
5. **Profile** → Thông tin cá nhân

## 🎯 Student Flow

```
Open App
   ↓
Login/Register
   ↓
Dashboard (Home)
   ↓
Browse Groups → Join/Create Group
   ↓
View Group Details
   ↓
Manage Projects (Coming soon)
```

## 💡 Tips

- Pull to refresh để cập nhật data
- Logout và login lại nếu gặp lỗi token
- Kiểm tra console log để debug

## 📞 Support

Nếu gặp vấn đề:
1. Check README.md để biết chi tiết
2. Xem console log
3. Clear cache: `npx expo start -c`
4. Reinstall: `rm -rf node_modules && npm install`

---

Happy Coding! 🚀
