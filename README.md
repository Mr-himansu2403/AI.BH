# AI.BH - Smart AI Assistant

AI.BH is a full-stack AI assistant built using Spring Boot and React, featuring conversational AI, voice interaction, image understanding, and persistent chat memory. Designed for students and developers, AI.BH focuses on clarity, performance, and scalability.

## Features

- 💬 Natural language conversation (OpenAI, Gemini, Anthropic)
- 🎤 Voice input and output
- 👁️ Image understanding
- 🧠 Conversation memory & RAG (Document Ingestion)
- 🔒 Secure RBAC & JWT Authentication
- 📈 Advanced Monitoring & Enterprise Logging
- ⚡ Rate Limiting & Scalability Ready

## Tech Stack

**Backend:**
- Java 17
- Spring Boot 3
- PostgreSQL
- Maven

**Frontend:**
- React (Vite)
- Tailwind CSS
- Web Speech API

**AI Integration:**
- OpenAI/Gemini API
- Multimodal support

## Getting Started

### Backend
```bash
cd backend
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

- `POST /api/aibh/chat` - Text chat
- `POST /api/aibh/chat/image` - Image + text query
- `GET /api/chat/history` - Chat history

## Deployment

- Backend: Render/Railway
- Frontend: Vercel
- Database: Cloud PostgreSQL