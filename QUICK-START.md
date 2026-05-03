# AI.BH - Quick Start Guide

## 🚀 Start the Application

### Windows (Easiest)
```bash
.\start-dev.bat
```

### Manual Start

**Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Access URLs

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080/api
- **H2 Database Console:** http://localhost:8080/api/h2-console

## 🔑 OpenAI API Key (Optional)

The app works without an API key using intelligent fallback responses.

To enable full AI capabilities:

1. Create `backend/src/main/resources/application-local.properties`
2. Add: `openai.api.key=your-key-here`
3. Restart backend

## ✅ What Works Now

- ✅ Text chat with intelligent responses
- ✅ Voice input/output
- ✅ Image upload and analysis (with API key)
- ✅ Session management
- ✅ Chat history
- ✅ Responsive UI

## 📚 More Information

- **Full Status:** See `PROJECT-STATUS.md`
- **Setup Details:** See `SETUP.md`
- **Project Overview:** See `README.md`
