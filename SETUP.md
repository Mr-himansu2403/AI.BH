# AI.BH Setup Guide

## Prerequisites

- Java 17 or higher
- Node.js 18 or higher
- Maven 3.6+
- PostgreSQL (for production) or H2 (for development)

## Quick Start (Development)

### Option 1: Automated Setup (Windows)
```bash
# Run the development startup script
start-dev.bat
```

### Option 2: Manual Setup

#### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Configuration

### Backend Environment Variables
Create `backend/src/main/resources/application-local.properties`:
```properties
openai.api.key=your-openai-api-key-here
```

### Frontend Environment Variables
Create `frontend/.env.local`:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

## Production Deployment

### Using Docker Compose
```bash
cd deployment
export OPENAI_API_KEY=your-openai-api-key
docker-compose up -d
```

### Manual Production Setup

#### Database Setup (PostgreSQL)
```sql
CREATE DATABASE aibh_db;
CREATE USER aibh_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE aibh_db TO aibh_user;
```

#### Backend Production
```bash
cd backend
mvn clean package
java -jar target/ai-bh-backend-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
```

#### Frontend Production
```bash
cd frontend
npm run build
# Deploy dist/ folder to your web server
```

## API Endpoints

- `GET /api/aibh/health` - Health check
- `POST /api/aibh/chat` - Send text message
- `POST /api/aibh/chat/image` - Send image + text
- `GET /api/chat/history?sessionId=xxx` - Get chat history
- `DELETE /api/chat/history?sessionId=xxx` - Clear chat history

## Features

✅ **Implemented:**
- Text-based chat with AI
- Voice input/output (Web Speech API)
- Image upload and analysis
- Conversation memory
- Session management
- Responsive UI
- Real-time typing indicators

🚧 **Future Enhancements:**
- JWT Authentication
- User accounts
- Chat export
- Multiple AI models
- File upload support

## Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check Java version: `java -version`
   - Verify Maven installation: `mvn -version`
   - Check port 8080 availability

2. **Frontend won't start**
   - Check Node.js version: `node -version`
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall

3. **AI responses not working**
   - Verify OpenAI API key is set
   - Check API key permissions
   - Monitor backend logs for errors

4. **Voice features not working**
   - Ensure HTTPS (required for speech API)
   - Check browser permissions
   - Test with Chrome/Edge (better support)

## Development Tips

- Use H2 console for database inspection: http://localhost:8080/api/h2-console
- Backend API docs: http://localhost:8080/api/swagger-ui.html (if Swagger added)
- Frontend dev server: http://localhost:3000
- Backend server: http://localhost:8080/api

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request