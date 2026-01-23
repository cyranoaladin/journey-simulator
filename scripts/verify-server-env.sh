#!/bin/bash
# Server .env Verification and Update Script
# Run this ON THE SERVER to ensure all critical environment variables are set

set -e

ENV_FILE="/srv/journey-mfai/.env"
BACKUP_FILE="/srv/journey-mfai/.env.backup.$(date +%Y%m%d_%H%M%S)"

echo "🔍 Verifying .env configuration on server..."

# Backup existing .env
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo "✓ Backed up existing .env to $BACKUP_FILE"
fi

# Check critical variables
echo ""
echo "Checking critical variables:"

# OpenAI API Key
if grep -q "^OPENAI_API_KEY=" "$ENV_FILE"; then
    KEY_VALUE=$(grep "^OPENAI_API_KEY=" "$ENV_FILE" | cut -d'=' -f2-)
    if [ -z "$KEY_VALUE" ] || [ "$KEY_VALUE" = "your-openai-key-here" ]; then
        echo "❌ OPENAI_API_KEY is not set or is placeholder"
        echo "   Please update it manually in $ENV_FILE"
    else
        echo "✓ OPENAI_API_KEY is set"
    fi
else
    echo "❌ OPENAI_API_KEY is missing"
fi

# RAG Configuration
if grep -q "^RAG_SEARCH_URL=" "$ENV_FILE"; then
    echo "✓ RAG_SEARCH_URL is set"
else
    echo "⚠ RAG_SEARCH_URL is missing - adding default"
    echo "RAG_SEARCH_URL=http://127.0.0.1:8001/rag/query" >> "$ENV_FILE"
fi

if grep -q "^RAG_API_KEY=" "$ENV_FILE"; then
    echo "✓ RAG_API_KEY is set"
else
    echo "⚠ RAG_API_KEY is missing - adding default"
    echo "RAG_API_KEY=MoneyFactory_2025_Secure_Token_X9" >> "$ENV_FILE"
fi

if grep -q "^RAG_COLLECTION=" "$ENV_FILE"; then
    echo "✓ RAG_COLLECTION is set"
else
    echo "⚠ RAG_COLLECTION is missing - adding default"
    echo "RAG_COLLECTION=mfai-knowledge" >> "$ENV_FILE"
fi

# MongoDB
if grep -q "^MONGO_URI=" "$ENV_FILE"; then
    echo "✓ MONGO_URI is set"
else
    echo "❌ MONGO_URI is missing"
fi

# JWT Secret
if grep -q "^JWT_SECRET=" "$ENV_FILE"; then
    echo "✓ JWT_SECRET is set"
else
    echo "⚠ JWT_SECRET is missing - generating"
    JWT_SECRET=$(openssl rand -hex 32)
    echo "JWT_SECRET=$JWT_SECRET" >> "$ENV_FILE"
fi

echo ""
echo "📝 Current .env file:"
echo "===================="
cat "$ENV_FILE"
echo "===================="
echo ""
echo "✅ Verification complete!"
echo ""
echo "⚠️  IMPORTANT: If OPENAI_API_KEY is not set, update it now:"
echo "   nano $ENV_FILE"
echo ""
echo "Then restart the containers:"
echo "   cd /srv/journey-mfai"
echo "   docker compose -f docker-compose.prod.yml restart"
