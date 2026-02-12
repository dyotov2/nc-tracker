#!/usr/bin/env bash
set -e

echo "========================================="
echo "  NC Tracker - Docker Setup"
echo "========================================="
echo ""

# Check Docker is installed and running
if ! command -v docker &> /dev/null; then
    echo "ERROR: Docker is not installed."
    echo "Install it from https://www.docker.com/products/docker-desktop"
    exit 1
fi

if ! docker info &> /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

echo "[1/3] Setting up email config (optional)..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "  Created backend/.env from template."
    echo "  Edit it later to enable email notifications (optional)."
else
    echo "  backend/.env already exists, skipping."
fi

echo ""
echo "[2/3] Building Docker images..."
docker compose up -d --build

echo ""
echo "[3/3] Waiting for services to start..."
# Wait for backend to respond
for i in $(seq 1 30); do
    if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Check results
BACKEND_OK=false
FRONTEND_OK=false

if curl -sf http://localhost:5000/api/health > /dev/null 2>&1; then
    BACKEND_OK=true
fi
if curl -sf http://localhost:3000 > /dev/null 2>&1; then
    FRONTEND_OK=true
fi

echo ""
echo "========================================="
if $BACKEND_OK && $FRONTEND_OK; then
    echo "  NC Tracker is running!"
    echo ""
    echo "  Open in browser: http://localhost:3000"
    echo "  Backend API:     http://localhost:5000/api"
    echo ""
    echo "  To stop:    docker compose down"
    echo "  To restart: docker compose up -d"
    echo "  View logs:  docker compose logs -f"
else
    echo "  Something may not be ready yet."
    echo "  Check status with: docker compose ps"
    echo "  Check logs with:   docker compose logs"
fi
echo "========================================="
