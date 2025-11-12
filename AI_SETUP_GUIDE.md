# 🤖 AI Project Description Generator - Setup Guide

## ✨ Tính Năng AI Đã Thêm

Hệ thống EXE101 Group Management giờ đây có **AI-powered features** để giúp sinh viên tạo mô tả dự án chuyên nghiệp:

### 🎯 Các Chức Năng AI:

1. **Generate Description** - Tự động tạo mô tả dự án từ tên project
2. **Improve Description** - Cải thiện mô tả hiện tại 
3. **Generate Objectives** - Tạo objectives từ description
4. **Tech Stack Suggestions** - Gợi ý công nghệ phù hợp

---

## 🚀 Hướng Dẫn Setup

### Bước 1: Cài Đặt OpenAI Package

Package đã được cài đặt sẵn trong backend. Kiểm tra:

```bash
cd backend
npm list openai
```

Nếu chưa có, cài đặt:
```bash
npm install openai
```

### Bước 2: Lấy OpenAI API Key

1. Truy cập: https://platform.openai.com/api-keys
2. Đăng nhập hoặc tạo tài khoản OpenAI
3. Click **"Create new secret key"**
4. Copy API key (bắt đầu bằng `sk-...`)

**⚠️ LƯU Ý:** 
- API key chỉ hiển thị 1 lần duy nhất
- Không share API key công khai
- OpenAI có free tier với $5 credit cho tài khoản mới

### Bước 3: Cấu Hình Backend

1. Tạo/Cập nhật file `.env` trong thư mục `backend/`:

```bash
# MongoDB Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/exe101_db?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# OpenAI API Configuration
OPENAI_API_KEY=sk-your-actual-api-key-here
```

2. Thay thế `sk-your-actual-api-key-here` bằng API key thật của bạn

### Bước 4: Khởi Động Server

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### Bước 5: Kiểm Tra AI Đã Hoạt Động

1. Đăng nhập với tài khoản Student
2. Tham gia 1 nhóm hoặc tạo nhóm mới
3. Vào trang **Projects**
4. Click **Create Project**
5. Bạn sẽ thấy badge **"AI Powered"** màu tím
6. Nhập tên project và click **"Generate with AI"**

---

## 🎨 Cách Sử Dụng AI Features

### 1️⃣ Tạo Mô Tả Project Hoàn Toàn Mới

```
1. Click "Create Project"
2. Nhập tên project: "Smart Attendance System"
3. (Optional) Nhập tech stack: "React, Node.js, MongoDB"
4. Click "Generate with AI" ở phần Description
5. AI sẽ tự động:
   - Tạo description chi tiết
   - Tạo objectives
   - Gợi ý tech stack
```

### 2️⃣ Cải Thiện Mô Tả Có Sẵn

```
1. Viết một đoạn mô tả ngắn
2. Click "Improve" button
3. AI sẽ làm cho mô tả chuyên nghiệp hơn
```

### 3️⃣ Tạo Objectives Từ Description

```
1. Nhập hoặc generate description trước
2. Click "Generate with AI" ở phần Objectives
3. AI sẽ tạo 3-5 objectives cụ thể
```

---

## 📊 API Endpoints Đã Thêm

### Check AI Status
```http
GET /api/ai/status
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "enabled": true,
    "features": [
      "generate-description",
      "generate-name-suggestions",
      "improve-description",
      "generate-objectives"
    ]
  }
}
```

### Generate Description
```http
POST /api/ai/generate-description
Authorization: Bearer <token>
Content-Type: application/json

{
  "projectName": "Smart Attendance System",
  "techStack": "React, Node.js, MongoDB",
  "additionalInfo": ""
}

Response:
{
  "success": true,
  "data": {
    "description": "Generated description...",
    "objectives": "1. Objective 1\n2. Objective 2...",
    "techStackSuggestions": ["Redis", "Docker"]
  }
}
```

### Improve Description
```http
POST /api/ai/improve-description
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Current description text..."
}

Response:
{
  "success": true,
  "data": {
    "improvedDescription": "Improved professional description..."
  }
}
```

### Generate Objectives
```http
POST /api/ai/generate-objectives
Authorization: Bearer <token>
Content-Type: application/json

{
  "description": "Project description..."
}

Response:
{
  "success": true,
  "data": {
    "objectives": "1. Build...\n2. Implement...\n3. Deploy..."
  }
}
```

---

## 🔧 Files Đã Thêm/Sửa

### Backend:
```
backend/
├── services/
│   └── aiService.js          [NEW] - OpenAI integration
├── routes/
│   └── ai.js                 [NEW] - AI endpoints
├── server.js                 [UPDATED] - Added AI routes
├── package.json              [UPDATED] - Added openai package
└── .env.example              [UPDATED] - Added OPENAI_API_KEY
```

### Frontend:
```
frontend/
└── src/
    └── pages/
        └── Projects.js       [UPDATED] - AI buttons & functions
```

---

## 💰 Chi Phí Sử Dụng OpenAI API

### GPT-3.5-turbo Pricing:
- **Input**: $0.50 / 1M tokens (~750K words)
- **Output**: $1.50 / 1M tokens

### Ước Tính Chi Phí:
- Mỗi lần generate: ~500-1000 tokens (~$0.001-0.002)
- 1000 lần generate: ~$1-2 USD
- Free tier: $5 credit = ~2500-5000 generations

### 💡 Tips Tiết Kiệm:
1. Chỉ generate khi cần thiết
2. Sử dụng "Improve" thay vì generate lại
3. Test với tên project ngắn gọn
4. Set rate limiting nếu deploy production

---

## 🐛 Troubleshooting

### Lỗi: "AI service is not configured"
✅ **Giải pháp:**
- Kiểm tra file `.env` có `OPENAI_API_KEY`
- Restart backend server
- Verify API key còn valid

### Lỗi: "Rate limit exceeded"
✅ **Giải pháp:**
- Chờ vài giây rồi thử lại
- OpenAI free tier có giới hạn 3 requests/minute
- Nâng cấp lên paid plan nếu cần

### Lỗi: "Insufficient quota"
✅ **Giải pháp:**
- Check usage: https://platform.openai.com/usage
- Nạp thêm credit vào tài khoản OpenAI
- Free $5 credit hết sau 3 tháng

### AI Button Không Hiển Thị
✅ **Giải pháp:**
1. Check console log trong browser
2. Verify `/api/ai/status` endpoint hoạt động
3. Clear cache và reload trang
4. Check backend logs

---

## 🎓 Demo Use Cases

### Case 1: Student Management System
```
Input: 
  Project Name: "Student Management System"
  Tech Stack: "React, Express, PostgreSQL"

AI Output:
  Description: "A comprehensive web application designed to 
  streamline student information management for educational 
  institutions. The system provides administrators with tools 
  to manage student records, track academic performance, and 
  generate reports efficiently..."
  
  Objectives:
  1. Develop a secure authentication system for different user roles
  2. Implement CRUD operations for student records
  3. Create an intuitive dashboard for performance tracking
  4. Design a responsive UI for mobile and desktop access
  5. Integrate reporting and analytics features
```

### Case 2: E-commerce Platform
```
Input:
  Project Name: "Fashion E-commerce"
  Tech Stack: "Next.js, Node.js, MongoDB, Stripe"

AI Output: [Professional description + objectives]
```

---

## 📈 Monitoring & Analytics

### Check AI Usage:
```javascript
// In backend console, you'll see:
console.log('AI Service called:', {
  endpoint: '/generate-description',
  projectName: 'ABC',
  tokensUsed: 850
});
```

### Recommended Logging:
```javascript
// Add to backend/services/aiService.js
const logAIUsage = (endpoint, tokens) => {
  console.log(`[AI] ${endpoint} - Tokens: ${tokens}`);
  // Optionally save to database for analytics
};
```

---

## 🔐 Security Best Practices

1. **Không commit `.env` file** - Đã có trong `.gitignore`
2. **Rotate API keys định kỳ** - Mỗi 3-6 tháng
3. **Set rate limiting** - Tránh abuse
4. **Monitor usage** - Check OpenAI dashboard thường xuyên
5. **Validate input** - Limit length của project name/description

---

## 🚀 Future Enhancements

Các tính năng AI có thể thêm sau:

1. **AI Code Review** - Review GitHub repo
2. **AI Project Scoring** - Đánh giá project tự động
3. **AI Suggestions** - Gợi ý cải thiện
4. **AI Chatbot** - Trả lời câu hỏi sinh viên
5. **AI Plagiarism Detection** - Phát hiện đạo văn
6. **AI Team Formation** - Gợi ý nhóm phù hợp

---

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs (Frontend & Backend)
2. Verify OpenAI API key
3. Check network requests trong DevTools
4. Read error messages carefully

---

## ✅ Checklist Setup

- [ ] Cài đặt `openai` package
- [ ] Tạo OpenAI account và lấy API key
- [ ] Thêm `OPENAI_API_KEY` vào `.env`
- [ ] Restart backend server
- [ ] Test AI features trong UI
- [ ] Verify AI badge hiển thị
- [ ] Test generate description
- [ ] Test improve description
- [ ] Test generate objectives
- [ ] Monitor OpenAI usage dashboard

---

**🎉 Chúc mừng! Bạn đã tích hợp AI thành công vào EXE101 Group Management System!**

Made with ❤️ by GitHub Copilot
