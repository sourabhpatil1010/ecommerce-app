#!/bin/sh
set -e

# ─── Wait for PostgreSQL ─────────────────────────────────
echo "⏳ Waiting for PostgreSQL to be ready..."

# Extract host and port from DATABASE_URL
# Format: postgresql+asyncpg://user:pass@host:port/dbname
DB_HOST=$(echo "$DATABASE_URL" | sed -n 's|.*@\([^:]*\):.*|\1|p')
DB_PORT=$(echo "$DATABASE_URL" | sed -n 's|.*:\([0-9]*\)/.*|\1|p')

MAX_RETRIES=30
RETRY_COUNT=0

while [ "$RETRY_COUNT" -lt "$MAX_RETRIES" ]; do
  if pg_isready -h "$DB_HOST" -p "$DB_PORT" > /dev/null 2>&1; then
    echo "✅ PostgreSQL is ready!"
    break
  fi
  
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "   Attempt $RETRY_COUNT/$MAX_RETRIES — waiting 2s..."
  sleep 2
done

if [ "$RETRY_COUNT" -eq "$MAX_RETRIES" ]; then
  echo "❌ PostgreSQL did not become ready in time. Exiting."
  exit 1
fi

# ─── Run Alembic Migrations ──────────────────────────────
echo "🔄 Running database migrations..."
alembic upgrade head || echo "⚠️  Alembic migrations skipped (tables may be created by app startup)"

# ─── Start FastAPI ────────────────────────────────────────
echo "🚀 Starting FastAPI server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
