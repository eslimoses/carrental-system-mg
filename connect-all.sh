#!/bin/bash

# Car Rental System - Connect and Start All
BASE_DIR="/Users/eslimoses/Desktop/carental-system-101"
BACKEND_DIR="$BASE_DIR/carrental-backend"
FRONTEND_DIR="$BASE_DIR/carrental-frontend"

echo "========================================"
echo "Car Rental System - Full Stack Start"
echo "========================================"

# 1. Check MySQL
echo "Checking MySQL connection..."
mysql -u root -pMaxtony8625 -e "USE car_rental_db; SHOW TABLES;" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ MySQL is running and car_rental_db is accessible."
else
    echo "✗ MySQL connection failed. Please ensure MySQL is running and credentials are correct."
    exit 1
fi

# 2. Kill existing processes
echo "Stopping any existing backend/frontend processes..."
pkill -f "mvn spring-boot:run" || true
pkill -f "node" || true

# 3. Start Backend
echo "Starting Backend (Spring Boot)..."
cd "$BACKEND_DIR"
mvn spring-boot:run > "$BASE_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

echo "Waiting for backend to start on http://localhost:8080..."
until curl -s http://localhost:8080/api/vehicles > /dev/null; do
    sleep 5
    echo -n "."
done
echo "\n✓ Backend is ready!"

# 4. Start Frontend
echo "Starting Frontend (Vite)..."
cd "$FRONTEND_DIR"
npm run dev -- --port 3001 > "$BASE_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

echo "✓ Frontend is starting on http://localhost:3001"
echo "----------------------------------------"
echo "System is now connected!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:3001"
echo "----------------------------------------"
echo "Logs: $BASE_DIR/backend.log and $BASE_DIR/frontend.log"
echo "Press Ctrl+C to stop (via pkill if in background)"

# Wait for both
wait $BACKEND_PID $FRONTEND_PID
