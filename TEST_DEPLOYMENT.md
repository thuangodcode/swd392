# 🧪 Testing Deployment - EXE101 Group Management System

## 📍 URLs cần biết

**Frontend (Vercel):** `https://swd392-xxx.vercel.app` (lấy từ Vercel Dashboard)  
**Backend (Ngrok):** `https://german-unlotted-jeanmarie.ngrok-free.app`  
**GitHub Repo:** https://github.com/thuangodcode/swd392

---

## ✅ Checklist Test Cơ Bản

### 1️⃣ Test Frontend Deployment

- [ ] Mở Vercel URL trong browser
- [ ] Trang load thành công (không có 404 hoặc 500 error)
- [ ] Login page hiển thị đúng
- [ ] Console không có lỗi (F12 → Console tab)

### 2️⃣ Test Backend Connection

- [ ] Mở browser console (F12)
- [ ] Check API URL: Xem log `🌐 API URL: https://german-unlotted-jeanmarie.ngrok-free.dev/api`
- [ ] Test endpoint backend trực tiếp:
  - Mở: `https://german-unlotted-jeanmarie.ngrok-free.app/api/health`
  - Expected: `{"status":"OK","message":"EXE101 Group Management API is running",...}`

### 3️⃣ Test Authentication

**Test Register:**
- [ ] Click "Register" button
- [ ] Điền form:
  - Student ID: `SE123456`
  - Full Name: `Test User`
  - Email: `test@fpt.edu.vn`
  - Password: `Test1234!`
  - Role: Student
  - Course: EXE101
  - Major: Software Engineering
- [ ] Submit và check:
  - [ ] Success message hiện ra
  - [ ] Tự động redirect về Dashboard
  - [ ] Thấy thông tin user ở Navigation bar

**Test Login:**
- [ ] Logout (nếu đã login)
- [ ] Login với account vừa tạo
- [ ] Check redirect về Dashboard

### 4️⃣ Test AI Features

**Prerequisites:** Backend và ngrok phải đang chạy!

```powershell
# Check trong terminal:
# Terminal 1: Backend running
cd c:\exe101-group-management\backend
npm run dev

# Terminal 2: Ngrok running  
ngrok http 5000
```

**Test AI Project Description:**

- [ ] Navigate to **Projects** page
- [ ] Click **"Create Project"** button
- [ ] Thấy modal với nút **"✨ Generate with AI"** (màu tím)
- [ ] Click **"Generate with AI"**
- [ ] Check:
  - [ ] Loading spinner xuất hiện
  - [ ] Sau 2-5 giây: Description tự động fill vào textbox
  - [ ] Console không có error 503 hoặc CORS
  - [ ] Có thể edit description sau khi generate
  
- [ ] Test **"💡 Improve Description"** button:
  - [ ] Nhập text bất kỳ vào Description
  - [ ] Click "Improve"
  - [ ] Text được cải thiện tự động

- [ ] Test **"🎯 Generate Objectives"** button:
  - [ ] Click button
  - [ ] Objectives tự động fill với numbered list

- [ ] Submit project và check lưu thành công

### 5️⃣ Test CORS

**Nếu thấy lỗi CORS trong console:**

```
Access to XMLHttpRequest at 'https://german-unlotted-jeanmarie.ngrok-free.app/api/...' 
from origin 'https://swd392-xxx.vercel.app' has been blocked by CORS policy
```

**Fix:**
1. Mở `backend/server.js`
2. Kiểm tra CORS config có Vercel domain:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://german-unlotted-jeanmarie.ngrok-free.dev',
    /\.vercel\.app$/,  // ✅ Đã có rồi
    /\.netlify\.app$/
  ],
  credentials: true
}));
```
3. Restart backend server

### 6️⃣ Test Responsive Design

- [ ] Desktop (1920x1080): Layout đẹp
- [ ] Tablet (768px): Responsive tốt  
- [ ] Mobile (375px): Navigation collapse, table scroll

### 7️⃣ Test Performance

- [ ] Lighthouse Score (F12 → Lighthouse tab):
  - Performance: > 80
  - Accessibility: > 90
  - Best Practices: > 80
  - SEO: > 80

---

## 🐛 Common Issues & Solutions

### Issue 1: "Cannot read properties of undefined"

**Nguyên nhân:** Frontend load trước khi backend ready

**Giải pháp:**
1. Đảm bảo backend đang chạy: `npm run dev` trong `backend/`
2. Đảm bảo ngrok đang chạy: `ngrok http 5000`
3. Refresh browser (Ctrl+F5)

---

### Issue 2: AI Features không hoạt động (503 Error)

**Console Error:**
```
POST https://german-unlotted-jeanmarie.ngrok-free.app/api/ai/generate-description 503
Error: The model is overloaded
```

**Nguyên nhân:** Gemini API bị overload (free tier)

**Giải pháp:** 
- Đợi 30 giây và thử lại
- Retry logic tự động chạy 3 models: `gemini-2.5-flash` → `gemini-2.0-flash` → `gemini-2.5-flash-lite`
- Nếu vẫn lỗi: Check Gemini API key còn quota không tại https://aistudio.google.com/

---

### Issue 3: Ngrok URL không hoạt động

**Error:** `ERR_NAME_NOT_RESOLVED` hoặc `This site can't be reached`

**Nguyên nhân:** Ngrok đã stop hoặc URL đã thay đổi

**Giải pháp:**
1. Check ngrok terminal có running không
2. Lấy URL mới từ ngrok output:
   ```
   Forwarding  https://abc123.ngrok-free.dev -> http://localhost:5000
   ```
3. Update frontend environment variable trong Vercel:
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Edit `REACT_APP_API_URL` = `https://abc123.ngrok-free.dev/api`
   - Redeploy

---

### Issue 4: "Failed to fetch" khi call API

**Console Error:**
```
GET https://german-unlotted-jeanmarie.ngrok-free.app/api/courses/available net::ERR_FAILED
```

**Nguyên nhân:** Backend server chưa chạy hoặc ngrok chưa chạy

**Checklist:**
```powershell
# 1. Check backend running
cd c:\exe101-group-management\backend
npm run dev
# Expected: ✓ Server is running on port 5000

# 2. Check ngrok running
# Terminal khác:
ngrok http 5000
# Expected: Forwarding https://...ngrok-free.dev -> http://localhost:5000

# 3. Check MongoDB connected
# Backend console should show: ✓ MongoDB connected successfully
```

---

### Issue 5: "Token expired" hoặc tự động logout

**Nguyên nhân:** JWT token hết hạn (mặc định 7 ngày)

**Giải pháp:**
- Login lại
- Nếu muốn tăng thời gian: Edit `backend/.env` → `JWT_EXPIRES_IN=30d`

---

### Issue 6: Frontend deploy nhưng API calls đi sai URL

**Check trong Console:**
```javascript
🌐 API URL: http://localhost:5000/api  // ❌ WRONG in production
```

**Nguyên nhân:** Environment variable không được set trong Vercel

**Fix:**
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add/Edit:
   - Name: `REACT_APP_API_URL`
   - Value: `https://german-unlotted-jeanmarie.ngrok-free.dev/api`
   - Environment: Production
3. Click "Redeploy"

---

## 📱 Test trên Devices Khác

### Test trên điện thoại:

1. Lấy Vercel URL: `https://swd392-xxx.vercel.app`
2. Mở bằng điện thoại (WiFi hoặc 4G đều được)
3. Test tất cả features:
   - ✅ Login/Register
   - ✅ Navigate giữa các pages
   - ✅ Tạo project với AI
   - ✅ Enroll courses
   - ✅ Create/join groups

### Test trên máy bạn bè:

1. Share Vercel URL
2. Họ có thể register account riêng
3. Test multi-user scenarios:
   - 2 students join cùng 1 group
   - Lecturer tạo class
   - Moderator quản lý users

---

## 🔍 Debug Tools

### 1. Browser DevTools (F12)

**Console Tab:**
- Check API calls: `🌐 API URL: ...`
- Check errors: Red messages
- Check network: Filter by "Fetch/XHR"

**Network Tab:**
- Filter: `Fetch/XHR`
- Check failed requests (red)
- Click vào request → Headers → Request URL
- Check Response status: 200 OK, 401 Unauthorized, 503 Overload, etc.

**Application Tab:**
- Storage → Local Storage → Check `token` key có giá trị không

### 2. Vercel Logs

- Vercel Dashboard → Project → Deployments → Click deployment
- Tab "Functions" → Real-time logs
- Check runtime errors

### 3. Backend Logs

Terminal đang chạy `npm run dev` sẽ hiện:
```
✓ Server is running on port 5000
✓ MongoDB connected successfully
[Gemini] Trying model: gemini-2.5-flash
POST /api/ai/generate-description 200 2345ms
```

### 4. Ngrok Web Interface

- Mở: http://localhost:4040
- Xem tất cả requests đến backend
- Check request body, response, timing

---

## ✅ Production Checklist

Trước khi chia sẻ với người dùng:

- [ ] Backend đang chạy và stable
- [ ] Ngrok đang chạy (hoặc dùng Railway/Render cho stable URL)
- [ ] MongoDB có data test (ít nhất 1 moderator, 1 lecturer, 2 students)
- [ ] AI features test thành công ít nhất 3 lần
- [ ] CORS config đúng cho Vercel domain
- [ ] Environment variables đúng trong Vercel
- [ ] Deployment thành công (green checkmark)
- [ ] Test login/register flow hoàn chỉnh
- [ ] Test responsive trên mobile
- [ ] Không có console errors nghiêm trọng

---

## 📊 Sample Test Data

**Moderator Account:**
- Email: `admin@fpt.edu.vn`
- Password: `Admin123!`

**Lecturer Account:**
- Email: `lecturer@fpt.edu.vn`  
- Password: `Lecturer123!`

**Student Accounts:**
- Student 1: `student1@fpt.edu.vn` / `Student123!`
- Student 2: `student2@fpt.edu.vn` / `Student123!`

**Test Class:**
- Class Code: `SE1234`
- Semester: `SPRING2024`
- Room: `AL-R101`

**Test Project:**
- Name: `Student Management System`
- Description: (Generate with AI)
- Tech Stack: `React, Node.js, MongoDB`

---

## 🚀 Next Steps

Sau khi test xong:

1. **Document bugs** (nếu có)
2. **Create demo video** showcase các tính năng
3. **Share URL** với team/teacher để review
4. **Plan improvements** dựa trên feedback

**Important Links:**
- Vercel Dashboard: https://vercel.com/dashboard
- GitHub Repo: https://github.com/thuangodcode/swd392
- Gemini AI Studio: https://aistudio.google.com/
- MongoDB Atlas: https://cloud.mongodb.com/

---

## 💡 Pro Tips

1. **Keep ngrok running:** Nếu ngrok stop, frontend sẽ không kết nối được backend
2. **Monitor quota:** Gemini free tier có limit, check tại AI Studio
3. **Use Postman:** Test API endpoints trực tiếp để debug
4. **Check Vercel logs:** Nếu frontend có vấn đề, check Function logs
5. **Use incognito mode:** Test như user mới, không bị cache

---

## 📞 Support

Nếu gặp vấn đề không giải quyết được:

1. Check browser console (F12)
2. Check backend terminal logs
3. Check ngrok web interface (http://localhost:4040)
4. Check Vercel deployment logs
5. Test API trực tiếp với curl/Postman

**Happy Testing! 🎉**
