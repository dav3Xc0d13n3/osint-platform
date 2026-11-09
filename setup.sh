#!/bin/bash
# Setup script for OSINT Platform

set -e

echo "🔧 OSINT Platform Setup"
echo "======================="

# Check for .env
if [ ! -f .env ]; then
    echo "📝 Creating .env from example..."
    cp .env.example .env
    echo "⚠️  Please edit .env with your configuration"
fi

# Generate secret key if not set
if ! grep -q "SECRET_KEY=your-super-secret-key" .env; then
    echo "🔐 SECRET_KEY already configured"
else
    SECRET=$(openssl rand -hex 32)
    sed -i "s/SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars/SECRET_KEY=$SECRET/" .env
    echo "🔐 Generated SECRET_KEY"
fi

# Start services
echo "🐳 Starting Docker services..."
docker-compose up -d postgres redis

# Wait for postgres
echo "⏳ Waiting for PostgreSQL..."
until docker-compose exec -T postgres pg_isready -U osint -d osint > /dev/null 2>&1; do
    sleep 1
done

# Run migrations
echo "📦 Running database migrations..."
docker-compose exec -T backend alembic upgrade head

# Create initial API key
echo "🔑 Creating initial API key..."
API_KEY=$(docker-compose exec -T backend python -c "
import asyncio
from app.core.database import init_db, async_session_maker
from app.models.api_key import APIKey
from app.core.security import generate_api_key
from sqlalchemy import select

async def create_key():
    await init_db()
    async with async_session_maker() as db:
        result = await db.execute(select(APIKey).where(APIKey.name == 'default'))
        if result.scalar_one_or_none():
            print('Key already exists')
            return
        plain, hashed = generate_api_key()
        key = APIKey(
            name='default',
            key_hash=hashed,
            key_prefix=plain[:12],
            rate_limit='1000/minute',
        )
        db.add(key)
        await db.commit()
        print(f'API Key: {plain}')

asyncio.run(create_key())
")

echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Your API Key: $API_KEY"
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "To start all services:"
echo "  docker-compose up -d"
echo ""
echo "To view logs:"
echo "  docker-compose logs -f"