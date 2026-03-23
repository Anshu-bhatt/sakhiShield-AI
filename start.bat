@echo off
echo ====================================
echo SakhiShield AI - Start Script
echo ====================================
echo.
echo Starting backend server on port 5000...
start "SakhiShield Backend" cmd /k npm run dev:backend
echo.
timeout /t 3
echo.
echo Starting frontend dev server...
start "SakhiShield Frontend" cmd /k npm run dev:frontend
echo.
echo ====================================
echo ✅ Both servers should open in new windows
echo ====================================
echo.
echo Waiting for servers to start (30 seconds)...
timeout /t 30
echo.
echo Opening browser to http://localhost:5173...
start http://localhost:5173
