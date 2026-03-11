#!/bin/bash
# Génère un nouveau keypair pour le minter Solana
# Usage: ./scripts/security/generate-minter-keypair.sh

set -e

echo "🔑 Génération d'un nouveau keypair minter..."

# Vérifier si solana-cli est installé
if ! command -v solana &> /dev/null; then
    echo "❌ solana-cli n'est pas installé"
    echo "Installez-le: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

# Générer le keypair
KEYPAIR_FILE="web/minter.json"
mkdir -p web

solana-keygen new --force --no-passphrase --outfile "$KEYPAIR_FILE"

echo ""
echo "✅ Keypair généré: $KEYPAIR_FILE"
echo ""
echo "📋 Adresse publique:"
solana-keygen pubkey "$KEYPAIR_FILE"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Ce fichier est déjà dans .gitignore"
echo "2. Transférez des SOL devnet vers cette adresse:"
echo "   solana airdrop 2 $(solana-keygen pubkey $KEYPAIR_FILE) --url devnet"
echo "3. Mettez à jour MINTER_SECRET_KEY dans .env avec la clé privée (base58)"
echo ""

# Afficher la clé privée pour copier dans .env
echo "🔐 Clé privée (base58) à copier dans .env:"
cat "$KEYPAIR_FILE" | jq -r '.[]' | xargs printf '%d,' | sed 's/,$//' | xargs -I {} node -e "console.log(require('bs58').encode(Buffer.from([{}])))" 2>/dev/null || cat "$KEYPAIR_FILE"
