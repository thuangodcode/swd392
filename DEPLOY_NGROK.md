# 🚀 Deploy với Ngrok

## Bước 1: Setup Ngrok (nếu chưa có account)

1. Đăng ký tài khoản miễn phí tại: https://ngrok.com/
2. Lấy authtoken từ dashboard: https://dashboard.ngrok.com/get-started/your-authtoken
3. Setup authtoken:
```powershell
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

## Bước 2: Chạy Backend với Ngrok

### Option A: Chạy backend trực tiếp (Recommended)

```powershell
# Terminal 1: Chạy backend server
cd c:\exe101-group-management\backend
npm run dev
```

```powershell
# Terminal 2: Expose backend qua ngrok
ngrok http 5000
```

Ngrok sẽ tạo public URL như: `https://abc123.ngrok-free.app`

### Option B: Chạy ngrok với custom domain (Paid plan)

```powershell
ngrok http 5000 --domain=your-custom-domain.ngrok-free.app
```

## Bước 3: Cập nhật Frontend Config

Sau khi có ngrok URL (ví dụ: `https://abc123.ngrok-free.app`), tạo file:

**frontend/.env.production**
```
REACT_APP_API_URL=https://abc123.ngrok-free.app/api
```

Hoặc edit file `frontend/src/index.js` để thay axios baseURL:

```javascript
// Thêm vào đầu file
const API_URL = process.env.REACT_APP_API_URL || 'https://abc123.ngrok-free.app/api';

axios.defaults.baseURL = API_URL;
```

## Bước 4: Deploy Frontend

### Option 1: Vercel (Recommended - FREE)

```powershell
# Cài Vercel CLI
npm install -g vercel

# Deploy
cd c:\exe101-group-management\frontend
vercel
```

Làm theo hướng dẫn:
- Setup and deploy? **Y**
- Which scope? **Your account**
- Link to existing project? **N**
- Project name? **exe101-frontend** (hoặc tên khác)
- Directory? **./** (enter)
- Override settings? **N**

### Option 2: Netlify (Alternative - FREE)

```powershell
# Cài Netlify CLI
npm install -g netlify-cli

# Build frontend
cd c:\exe101-group-management\frontend
npm run build

# Deploy
netlify deploy --prod
```

### Option 3: Ngrok cho Frontend (Development only)

```powershell
# Terminal 3: Chạy frontend
cd c:\exe101-group-management\frontend
npm start

# Terminal 4: Expose frontend qua ngrok
ngrok http 3000
```

## Bước 5: Cập nhật CORS trong Backend

Sau khi có frontend URL (ví dụ: `https://exe101.vercel.app`), cập nhật backend:

**backend/server.js** - Tìm dòng CORS:
```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://exe101.vercel.app', 'https://xyz.ngrok-free.app'],
  credentials: true
}));
```

## 🔒 Lưu ý Bảo mật

1. **HTTPS**: Ngrok tự động dùng HTTPS - tốt cho production
2. **Rate Limits**: Ngrok free có giới hạn:
   - 1 concurrent tunnel
   - 40 connections/minute
3. **JWT Secret**: Đổi JWT_SECRET trong `.env.production` thành giá trị mạnh hơn
4. **MongoDB**: Atlas hỗ trợ IP whitelist, thêm `0.0.0.0/0` để cho phép ngrok access

## 📱 Test Deployment

1. Mở ngrok URL trong browser: `https://abc123.ngrok-free.app/api/status`
2. Test AI endpoint: `https://abc123.ngrok-free.app/api/ai/status`
3. Frontend có thể gọi API từ bất kỳ device nào

## 🐛 Troubleshooting

### Lỗi: "ngrok not found"
```powershell
# Download ngrok
# Windows: https://ngrok.com/download
# hoặc cài qua chocolatey
choco install ngrok
```

### Lỗi: "tunnel session failed"
```powershell
# Kiểm tra authtoken
ngrok config check

# Re-authenticate
ngrok config add-authtoken YOUR_TOKEN
```

### Lỗi CORS khi gọi API
- Thêm ngrok URL vào CORS origins trong `backend/server.js`
- Restart backend server

### Ngrok URL thay đổi mỗi lần chạy
- Free plan: URL thay đổi mỗi lần restart
- Paid plan ($8/month): Static domain
- Workaround: Dùng environment variable trong frontend

## 🚀 Production Alternatives (Better than ngrok)

1. **Railway.app** - FREE tier, tự động deploy từ GitHub
2. **Render.com** - FREE tier, HTTPS, custom domain
3. **Fly.io** - FREE tier, edge hosting
4. **Heroku** - $5/month, reliable

Ngrok tốt cho **testing/demo**, nhưng production nên dùng cloud platform.
