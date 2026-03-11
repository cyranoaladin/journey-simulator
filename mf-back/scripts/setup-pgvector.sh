#!/bin/bash

echo "========================================"
echo "pgvector Setup Script"
echo "Neural Nexus Performance Enhancement"
echo "========================================"
echo ""

DB_URL="${DATABASE_URL:-postgresql://mfai:mfai_secure_2024@localhost:5433/mfai_db}"

echo "📋 Pre-requisites:"
echo "   1. PostgreSQL 11+ installed"
echo "   2. pgvector extension compiled and available"
echo "   3. Database superuser access"
echo ""

read -p "Do you have pgvector installed? (y/n): " HAS_PGVECTOR

if [ "$HAS_PGVECTOR" != "y" ]; then
  echo ""
  echo "📦 pgvector Installation Instructions:"
  echo ""
  echo "Ubuntu/Debian:"
  echo "  sudo apt install postgresql-<version>-pgvector"
  echo ""
  echo "Or build from source:"
  echo "  git clone https://github.com/pgvector/pgvector.git"
  echo "  cd pgvector"
  echo "  make"
  echo "  sudo make install"
  echo ""
  exit 0
fi

echo ""
echo "🔧 Running pgvector migration..."

cd "$(dirname "$0")/.."

psql "$DB_URL" -f migrations/pgvector-setup.sql

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ pgvector setup complete!"
  echo ""
  echo "Next steps:"
  echo "  1. Regenerate embeddings with OpenAI (1536d)"
  echo "  2. Update neuralNexusService.ts to use pgvector queries"
  echo "  3. Test performance improvements"
else
  echo ""
  echo "❌ Setup failed. Check error messages above."
fi
