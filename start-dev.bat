@echo off
echo Starting AI.BH Development Environment...

echo.
echo Starting Backend (Spring Boot)...
start "AI.BH Backend" cmd /k "cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev"

timeout /t 5

echo.
echo Starting Frontend (React + Vite)...
start "AI.BH Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo AI.BH is starting up!
echo Backend: http://localhost:8080/api
echo Frontend: http://localhost:3000
echo H2 Console: http://localhost:8080/api/h2-console
echo.
pause