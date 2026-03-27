#!/bin/bash

# Car Rental System - Rebuild and Run Script
BASE_DIR="/Users/eslimoses/Desktop/carental-system-101"
BACKEND_DIR="$BASE_DIR/carrental-backend"

echo "========================================"
echo "Car Rental System - Rebuild Backend"
echo "========================================"

if [ ! -d "$BACKEND_DIR" ]; then
    echo "Error: Backend directory $BACKEND_DIR not found!"
    exit 1
fi

cd "$BACKEND_DIR"

echo "\n1. Cleaning previous build..."
mvn clean

echo "\n2. Compiling all Java files..."
mvn compile

echo "\n3. Running Spring Boot application..."
echo "Backend will start on http://localhost:8080"
echo "Press Ctrl+C to stop"
echo "\n"

mvn spring-boot:run
