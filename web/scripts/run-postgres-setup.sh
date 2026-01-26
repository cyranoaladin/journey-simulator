#!/bin/bash

echo "📦 Setting up PostgreSQL database for MFAI..."
echo ""
echo "This script will create:"
echo "  - User: mfai_user"
echo "  - Database: mfai_db"
echo "  - Required permissions"
echo ""
echo "You will be prompted for the PostgreSQL superuser password."
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

sudo -u postgres psql -f "$(dirname "$0")/setup-postgres.sql"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database setup completed!"
    echo ""
    echo "Now running Prisma migrations..."
    cd "$(dirname "$0")/.."
    npx prisma migrate dev --name init
else
    echo ""
    echo "❌ Database setup failed"
    echo "Please check your PostgreSQL installation and try again"
    exit 1
fi
