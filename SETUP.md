# 🚀 Setup Instructions for Developers

## Prerequisites
- Node.js v16+ 
- MongoDB Atlas account (free)
- Google Gemini API key (free)

## Quick Setup (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/thuangodcode/swd392.git
cd swd392
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your credentials
```

**Update `backend/.env` with:**
```env
MONGODB_URI=your_mongodb_atlas_uri_here
JWT_SECRET=your_random_secret_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

**Get MongoDB URI:**
1. Visit: https://cloud.mongodb.com
2. Create free cluster
3. Get connection string

**Get Gemini API Key (FREE):**
1. Visit: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy key (starts with AIzaSy...)

```bash
# Start backend server
npm run dev
```

Backend runs on: http://localhost:5000

### 3. Frontend Setup

```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

Frontend opens on: http://localhost:3000

## 🎉 Done!

Visit http://localhost:3000 and register an account!

## Features

- ✅ User authentication (JWT)
- ✅ Course management
- ✅ Group formation & voting
- ✅ Project creation
- ✅ **AI-powered project descriptions** (Gemini 2.5 Flash)
- ✅ Role-based access (Student, Lecturer, Moderator)

## Troubleshooting

**Backend won't start:**
- Check MongoDB URI is correct
- Ensure port 5000 is not in use

**AI features not working:**
- Verify GEMINI_API_KEY in .env
- Check API key at: https://aistudio.google.com/app/apikey

**Frontend can't connect:**
- Make sure backend is running on port 5000
- Check CORS settings

## Documentation

- [Gemini AI Setup](./GEMINI_AI_SETUP.md)
- [AI Features Guide](./AI_STATUS.md)
- [Main README](./README.md)

## Tech Stack

**Backend:** Node.js, Express, MongoDB, JWT, Gemini AI  
**Frontend:** React 18, Ant Design, Axios

---

Made with ❤️ by thuangodcode
