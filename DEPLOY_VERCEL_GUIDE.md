# 🚀 Hướng Dẫn Deploy Frontend lên Vercel (Web UI)

## ✅ Bước đã hoàn thành:
- [x] Build frontend thành công → Folder `frontend/build` đã sẵn sàng
- [x] Backend đang chạy trên ngrok: `https://german-unlotted-jeanmarie.ngrok-free.dev`

---

## 📋 Các bước deploy:

### 1️⃣ Chuẩn bị tài khoản Vercel

1. Truy cập: **https://vercel.com/signup**
2. Đăng ký bằng:
   - GitHub account (Recommended) ✅
   - GitLab
   - Bitbucket
   - Email

### 2️⃣ Deploy từ GitHub (CÁCH TỐT NHẤT)

#### Option A: Deploy từ GitHub Repository (Recommended)

**Bước 1: Push code lên GitHub (ĐÃ LÀM RỒI)**
```powershell
# Code đã được push lên: https://github.com/thuangodcode/swd392
```

**Bước 2: Import vào Vercel**
1. Đăng nhập Vercel: https://vercel.com/login
2. Click **"Add New Project"** hoặc **"Import Project"**
3. Chọn **"Import Git Repository"**
4. Authorize Vercel truy cập GitHub
5. Tìm repo: `thuangodcode/swd392`
6. Click **"Import"**

**Bước 3: Configure Project Settings**

```
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

**Bước 4: Add Environment Variables**

Click **"Environment Variables"** và thêm:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://german-unlotted-jeanmarie.ngrok-free.dev/api` |

**Bước 5: Deploy**
- Click **"Deploy"**
- Chờ 2-3 phút
- Done! URL sẽ là: `https://exe101-frontend-xxx.vercel.app`

---

#### Option B: Deploy từ Local (Nếu không dùng GitHub)

**Bước 1: Install Vercel CLI**
```powershell
npm install -g vercel
```

**Bước 2: Login**
```powershell
vercel login
```
Làm theo hướng dẫn để authenticate.

**Bước 3: Deploy**
```powershell
cd c:\exe101-group-management\frontend
vercel --prod
```

Khi được hỏi:
- **Set up and deploy?** → Yes
- **Which scope?** → Your account
- **Link to existing project?** → No
- **Project name?** → `exe101-frontend` (hoặc tên bạn muốn)
- **In which directory is your code located?** → `./`
- **Want to override the settings?** → Yes
  - **Build Command:** `npm run build`
  - **Output Directory:** `build`
  - **Development Command:** `npm start`

**Bước 4: Add Environment Variable**
```powershell
vercel env add REACT_APP_API_URL
```
Khi được hỏi value, nhập: `https://german-unlotted-jeanmarie.ngrok-free.dev/api`

Chọn environment: **Production**

**Bước 5: Redeploy với environment variable**
```powershell
vercel --prod
```

---

### 3️⃣ Deploy thủ công qua Web (Manual Upload)

**⚠️ LƯU Ý: Vercel không hỗ trợ upload folder trực tiếp. Bạn CẦN dùng một trong 2 cách trên.**

Nếu muốn static hosting khác:

#### Option: Netlify Drop (Đơn giản nhất)

1. Truy cập: **https://app.netlify.com/drop**
2. Kéo thả folder `c:\exe101-group-management\frontend\build` vào
3. Netlify sẽ auto deploy
4. Lấy URL (ví dụ: `https://abc123.netlify.app`)

**Nhưng** Netlify Drop không hỗ trợ environment variables, nên cần:

**Cập nhật file trước khi upload:**

Mở file `c:\exe101-group-management\frontend\.env.production` và đảm bảo có:
```
REACT_APP_API_URL=https://german-unlotted-jeanmarie.ngrok-free.dev/api
```

Rồi build lại:
```powershell
cd c:\exe101-group-management\frontend
npm run build
```

Sau đó kéo thả folder `build` vào Netlify Drop.

---

## 🔧 Sau khi deploy

### 1. Cập nhật CORS trong Backend

Lấy URL frontend từ Vercel (ví dụ: `https://exe101-frontend-abc.vercel.app`)

**File: `backend/server.js`** - Dòng CORS đã được update:
```javascript
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://german-unlotted-jeanmarie.ngrok-free.dev',
    /\.vercel\.app$/,  // ✅ Đã cho phép tất cả Vercel domains
    /\.netlify\.app$/
  ],
  credentials: true
}));
```

✅ **CORS đã sẵn sàng!** Không cần thay đổi gì.

### 2. Test Deployment

1. Mở URL Vercel trong browser
2. Thử login/register
3. Thử tạo project với AI
4. Check console (F12) xem có lỗi không

### 3. Monitor Deployment

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Deployment Logs**: Click vào project → "Deployments" → Click build
- **Function Logs**: Xem API calls và errors

---

## 🆘 Troubleshooting

### Lỗi: "API calls không hoạt động"

**Nguyên nhân**: Frontend không kết nối được với backend ngrok

**Giải pháp**:
1. Kiểm tra environment variable trong Vercel:
   - Vào Project Settings → Environment Variables
   - Đảm bảo `REACT_APP_API_URL` = `https://german-unlotted-jeanmarie.ngrok-free.dev/api`
2. Redeploy: Vercel Dashboard → Project → "Redeploy"

### Lỗi: "CORS policy blocked"

**Nguyên nhân**: Backend chưa cho phép Vercel domain

**Giải pháp**: Đã fix sẵn! Regex `/\.vercel\.app$/` trong CORS config cho phép tất cả Vercel domains.

### Lỗi: "Page not found" khi refresh

**Nguyên nhân**: React Router cần rewrites

**Giải pháp**: Vercel tự động xử lý nếu detect Create React App. Nếu vẫn lỗi, thêm file `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Ngrok URL thay đổi

**Nguyên nhân**: Ngrok free plan thay đổi URL mỗi khi restart

**Giải pháp**:
1. Lấy URL mới từ terminal chạy ngrok
2. Update environment variable trong Vercel:
   - Project Settings → Environment Variables
   - Edit `REACT_APP_API_URL` với URL mới
3. Redeploy

**Giải pháp lâu dài**:
- Upgrade ngrok Pro ($8/tháng) → Static domain
- Hoặc deploy backend lên Railway/Render (FREE, static URL)

---

## 📊 So sánh phương án

| Phương án | Ưu điểm | Nhược điểm |
|-----------|---------|------------|
| **GitHub → Vercel** | ✅ Tự động deploy khi push<br>✅ Preview deployments<br>✅ Rollback dễ dàng | Cần push code lên GitHub |
| **Vercel CLI** | ✅ Deploy từ local<br>✅ Không cần push GitHub | Phải manual deploy mỗi lần |
| **Netlify Drop** | ✅ Đơn giản nhất<br>✅ Kéo thả là xong | ⚠️ Không có env variables<br>⚠️ Phải build trước |

**🏆 Recommendation**: Dùng **GitHub → Vercel** (Option A)

---

## ✅ Checklist trước khi deploy

- [x] Backend đang chạy và có ngrok URL
- [x] Frontend đã build thành công (`npm run build`)
- [x] File `.env.production` có `REACT_APP_API_URL` đúng
- [x] CORS trong backend đã config cho Vercel
- [x] Code đã push lên GitHub
- [ ] Tạo Vercel account
- [ ] Import GitHub repo vào Vercel
- [ ] Add environment variable
- [ ] Deploy và test

---

## 🔗 Links quan trọng

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **GitHub Repo**: https://github.com/thuangodcode/swd392
- **Backend Ngrok**: https://german-unlotted-jeanmarie.ngrok-free.dev

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Check ngrok terminal có requests không
4. Test backend API trực tiếp: `https://german-unlotted-jeanmarie.ngrok-free.dev/api/health`
