#!/bin/bash
set -e

echo "Current directory: $(pwd)"
echo "Files: $(ls -la)"
echo "DATABASE_URL: ${DATABASE_URL:0:50}..."

echo "Running migrations..."
alembic upgrade head || echo "Migration failed, continuing..."

echo "Starting app..."
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}
