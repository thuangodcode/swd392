# EXE101 Group Management System

Hệ thống quản lý nhóm môn học EXE101 với các tính năng:
- Quản lý sinh viên, giảng viên, moderator
- Đăng ký lớp học (courses)
- Tạo và quản lý nhóm học
- Bình chọn leader nhóm
- Quản lý project của nhóm
- 🤖 **AI-Powered Project Description Generator** (NEW!) - **100% FREE với Gemini!**

## ✨ New AI Features (FREE Forever!)

Hệ thống giờ đây tích hợp **Google Gemini AI** (hoàn toàn miễn phí!) để giúp sinh viên:
- ⚡ **Tự động tạo mô tả dự án** chuyên nghiệp từ tên project
- 💡 **Cải thiện mô tả** hiện có
- 🎯 **Tạo objectives** từ description
- 🔧 **Gợi ý tech stack** phù hợp

**🎉 Đặc biệt: KHÔNG CẦN THẺ TÍN DỤNG - Chỉ cần tài khoản Gmail!**

👉 **[Hướng dẫn setup Gemini AI (2 phút)](./GEMINI_AI_SETUP.md)**

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB Atlas (Online Database)
- JWT Authentication
- Nodemon (Development)
- **Google Gemini AI** (NEW - 100% FREE!)

**Frontend:**
- React 18
- Ant Design UI
- Axios (HTTP Client)
- React Router

## Setup Guide

### 1. MongoDB Atlas Setup

1. Đăng ký tài khoản tại [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Tạo một cluster mới (Free tier)
3. Tạo database user:
   - Database Access → Add New Database User
   - Ghi nhớ username và password
4. Whitelist IP Address:
   - Network Access → Add IP Address
   - Chọn "Allow access from anywhere" (0.0.0.0/0) cho development
5. Lấy connection string:
   - Databases → Connect → Drivers
   - Copy connection string theo format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?retryWrites=true&w=majority`

### 2. Backend Setup

```bash
cd backend

# Copy .env.example thành .env
cp .env.example .env

# Cập nhật .env với MongoDB URI
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exe101db?retryWrites=true&w=majority
# JWT_SECRET=your_secret_key

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Server sẽ chạy trên: `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm start
```

Frontend sẽ mở trên: `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

### Courses
- `GET /api/courses/available` - Danh sách lớp có sẵn
- `GET /api/courses/:id` - Chi tiết lớp
- `POST /api/courses` - Tạo lớp (Lecturer/Moderator)

### Groups
- `POST /api/groups` - Tạo nhóm
- `GET /api/groups/course/:courseId` - Danh sách nhóm theo lớp
- `POST /api/groups/:id/join` - Tham gia nhóm
- `POST /api/groups/:id/vote-leader` - Bình chọn leader
- `PUT /api/groups/:id/status` - Đóng/Mở nhóm

### Projects
- `POST /api/projects` - Tạo project (Leader)
- `GET /api/projects/group/:groupId` - Chi tiết project
- `PUT /api/projects/:id` - Cập nhật project
- `POST /api/projects/:id/submit` - Nộp project

### Users
- `GET /api/users/me` - Thông tin người dùng hiện tại
- `PUT /api/users/me` - Cập nhật thông tin

## Roles

- **Student** - Sinh viên (đăng ký lớp, tạo/tham gia nhóm, bình chọn leader)
- **Leader** - Leader nhóm (tạo project, điều hành nhóm)
- **Lecturer** - Giảng viên (tạo lớp, xem danh sách học sinh)
- **Moderator** - Quản lý (hỗ trợ toàn bộ hệ thống)

## Project Structure

```
exe101-group-management/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Group.js
│   │   └── Project.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── courses.js
│   │   ├── groups.js
│   │   └── projects.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Dashboard.js
    │   │   ├── Courses.js
    │   │   ├── Groups.js
    │   │   └── Projects.js
    │   ├── components/
    │   │   └── Navigation.js
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── .env
```

## Luồng Sử Dụng

### Bước 1: Sinh viên đăng ký lớp
- Đăng nhập hoặc đăng ký tài khoản với role "Student"
- Vào mục "Courses" xem các lớp có sẵn
- Chọn lớp để đăng ký

### Bước 2: Tạo/Tham gia nhóm
- Vào mục "Groups"
- Tạo nhóm mới hoặc tham gia nhóm có sẵn

### Bước 3: Bình chọn Leader
- Các thành viên nhóm bình chọn leader
- Khi đạt đa số, leader được xác định

### Bước 4: Leader hoàn thành công việc
- Tạo project cho nhóm
- Thêm thông tin dự án
- Quản lý trạng thái nhóm (đóng/mở khi đủ thành viên)
- Nộp project

## Environment Variables

```
# Backend .env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exe101db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# AI Features (100% FREE - No credit card required!)
GEMINI_API_KEY=your-gemini-api-key-here
```

**🎉 Gemini AI Setup (2 phút):**
1. Truy cập: https://aistudio.google.com/app/apikey
2. Đăng nhập bằng Gmail (KHÔNG CẦN THẺ)
3. Click "Create API Key" và copy
4. Thêm vào file `.env`
5. Xem hướng dẫn chi tiết: **[GEMINI_AI_SETUP.md](./GEMINI_AI_SETUP.md)**

## Deployment (Tương lai)

- Backend: Deploy trên Heroku, Railway, hoặc Render
- Frontend: Deploy trên Vercel, Netlify, hoặc GitHub Pages
- Database: Sử dụng MongoDB Atlas (đã online)

## Liên Hệ & Hỗ Trợ

Cho các vấn đề hoặc câu hỏi, vui lòng liên hệ với nhóm phát triển.
