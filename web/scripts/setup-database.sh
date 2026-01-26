#!/bin/bash
set -e

echo "🗄️  MFAI Database Setup"
echo "======================="
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "❌ PostgreSQL is not running on localhost:5432"
    echo "Please start PostgreSQL first:"
    echo "  sudo systemctl start postgresql"
    exit 1
fi

echo "✓ PostgreSQL is running"
echo ""

# Try to create user and database
echo "Creating database user and database..."
sudo -u postgres psql -f "$(dirname "$0")/setup-postgres.sql" 2>&1

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Database setup completed successfully"
    echo ""
    echo "Running Prisma migrations..."
    cd "$(dirname "$0")/.."
    npx prisma migrate dev --name init
    echo ""
    echo "✅ Database is ready!"
else
    echo ""
    echo "⚠️  Could not setup database automatically"
    echo "Please run manually as postgres user:"
    echo "  sudo -u postgres psql -f web/scripts/setup-postgres.sql"
fi
