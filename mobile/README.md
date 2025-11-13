# SWD392 Mobile App - Student Flow

Mobile application cho sinh viên sử dụng Expo và React Native.

## 📱 Tính năng

### Student Features
- ✅ **Authentication**: Đăng nhập, đăng ký, đăng xuất
- ✅ **Dashboard**: Xem thông tin cá nhân và quick actions
- ✅ **Groups Management**: Xem, tạo và tham gia nhóm
- ✅ **Profile**: Xem và chỉnh sửa thông tin cá nhân
- 🚧 **Projects**: Quản lý dự án nhóm (Coming soon)
- 🚧 **Courses**: Đăng ký và xem khóa học (Coming soon)

## 🚀 Cài đặt

### Prerequisites
- Node.js (v14 trở lên)
- npm hoặc yarn
- Expo CLI
- Expo Go app trên điện thoại (để test)

### Bước 1: Cài đặt dependencies
```bash
cd mobile
npm install
```

### Bước 2: Cấu hình API
Mở file `src/utils/constants.js` và cập nhật `API_BASE_URL`:

```javascript
export const API_BASE_URL = 'http://your-backend-url:5000/api';
```

**Lưu ý**: 
- Nếu chạy backend trên localhost, sử dụng IP máy tính thay vì `localhost`
- Ví dụ: `http://192.168.1.100:5000/api`
- Để tìm IP máy: `ipconfig` (Windows) hoặc `ifconfig` (Mac/Linux)

### Bước 3: Chạy ứng dụng
```bash
npm start
```

Hoặc:
```bash
npx expo start
```

### Bước 4: Mở trên điện thoại
1. Cài đặt **Expo Go** app từ App Store/Play Store
2. Quét QR code từ terminal
3. App sẽ load trên điện thoại của bạn

## 📁 Cấu trúc thư mục

```
mobile/
├── src/
│   ├── components/         # Reusable components
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   └── Loading.js
│   ├── context/           # React Context
│   │   └── AuthContext.js
│   ├── navigation/        # Navigation setup
│   │   ├── AppNavigator.js
│   │   └── MainNavigator.js
│   ├── screens/          # Screen components
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── GroupsScreen.js
│   │   └── ProfileScreen.js
│   ├── services/         # API services
│   │   ├── api.js
│   │   ├── authService.js
│   │   ├── groupService.js
│   │   ├── projectService.js
│   │   └── courseService.js
│   └── utils/           # Utilities & constants
│       └── constants.js
├── App.js              # Main app component
└── package.json
```

## 🔧 Cấu hình

### API Configuration
File: `src/utils/constants.js`

```javascript
export const API_BASE_URL = 'http://your-ip:5000/api';
```

### Colors & Theme
Customize colors trong `src/utils/constants.js`:

```javascript
export const COLORS = {
  primary: '#667eea',
  secondary: '#764ba2',
  success: '#10b981',
  danger: '#ef4444',
  // ...
};
```

## 📱 Screens

### 1. Login Screen
- Student ID và password authentication
- Validation form
- Navigate đến Register screen

### 2. Register Screen
- Đăng ký tài khoản mới
- Các trường: Student ID, Email, Full Name, Course, Major, Password
- Auto login sau khi đăng ký thành công

### 3. Dashboard Screen
- Hiển thị thông tin user
- Quick actions: Groups, Projects, Courses, Profile
- Pull to refresh

### 4. Groups Screen
- Xem nhóm hiện tại
- Browse available groups
- Request to join group
- Create new group (coming soon)

### 5. Profile Screen
- Xem thông tin cá nhân
- Edit profile (coming soon)
- Logout

## 🔐 Authentication Flow

1. User mở app → Check AsyncStorage
2. Nếu có token → Auto login → Navigate to Dashboard
3. Nếu không có token → Show Login Screen
4. Sau khi login/register → Save token & user data → Navigate to Dashboard
5. Logout → Clear AsyncStorage → Navigate to Login

## 🌐 API Integration

### AuthService
- `login(studentId, password)` - Đăng nhập
- `register(userData)` - Đăng ký
- `getProfile()` - Lấy thông tin profile
- `updateProfile(userData)` - Cập nhật profile

### GroupService
- `getGroupsByClass(classCode)` - Lấy groups theo class
- `createGroup(groupData)` - Tạo group mới
- `requestToJoin(groupId)` - Gửi request join group
- `leaveGroup(groupId)` - Rời khỏi group

### ProjectService
- `createProject(projectData)` - Tạo project
- `getProjectByGroup(groupId)` - Lấy project theo group
- `updateProject(projectId, data)` - Cập nhật project
- `submitForApproval(projectId)` - Submit project để duyệt

## 🐛 Troubleshooting

### Không kết nối được backend
1. Kiểm tra backend đang chạy
2. Kiểm tra IP address trong constants.js
3. Kiểm tra firewall không block port 5000
4. Đảm bảo điện thoại và máy tính cùng mạng WiFi

### Lỗi navigation
```bash
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context react-native-gesture-handler
```

### Lỗi AsyncStorage
```bash
npm install @react-native-async-storage/async-storage
```

## 📝 TODO

- [ ] Thêm Projects screens
- [ ] Thêm Courses screens
- [ ] Implement Create Group flow
- [ ] Implement Edit Profile
- [ ] Add push notifications
- [ ] Add image upload for profile
- [ ] Add group chat feature
- [ ] Implement offline mode
- [ ] Add unit tests

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

SWD392 - Student Project Management System

---

Made with ❤️ using Expo & React Native
