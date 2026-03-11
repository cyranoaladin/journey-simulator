#!/bin/bash
# =============================================================================
# Create $MFAI Token on Solana Devnet
# =============================================================================

set -e

echo "🏭 Money Factory AI - Token Creation Script"
echo "============================================"
echo ""

# Configuration
TOKEN_NAME="Money Factory AI"
TOKEN_SYMBOL="MFAI"
TOKEN_DECIMALS=9
INITIAL_SUPPLY=1000000000  # 1 billion tokens

# Check prerequisites
if ! command -v solana &> /dev/null; then
    echo "❌ solana-cli is not installed"
    echo "Install from: https://docs.solana.com/cli/install-solana-cli-tools"
    exit 1
fi

if ! command -v spl-token &> /dev/null; then
    echo "❌ spl-token-cli is not installed"
    echo "Install: cargo install spl-token-cli"
    exit 1
fi

# Ensure we're on devnet
current_cluster=$(solana config get | grep "RPC URL" | grep -o "devnet\|mainnet\|testnet" || echo "unknown")
if [ "$current_cluster" != "devnet" ]; then
    echo "⚠️  Switching to devnet..."
    solana config set --url devnet
fi

echo "📋 Configuration:"
echo "  Name: $TOKEN_NAME"
echo "  Symbol: $TOKEN_SYMBOL"
echo "  Decimals: $TOKEN_DECIMALS"
echo "  Initial Supply: $INITIAL_SUPPLY"
echo "  Network: devnet"
echo ""

# Check payer balance
echo "💰 Checking payer balance..."
PAYER=$(solana config get | grep "Keypair Path" | awk '{print $3}')
PUBKEY=$(solana-keygen pubkey "$PAYER")
BALANCE=$(solana balance)

echo "  Payer: $PUBKEY"
echo "  Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 0.1" | bc -l) )); then
    echo ""
    echo "⚠️  Low balance. Requesting airdrop..."
    solana airdrop 2
fi

echo ""
echo "🚀 Creating token..."

# Create the token
TOKEN_ADDRESS=$(spl-token create-token \
    --decimals $TOKEN_DECIMALS \
    --enable-freeze \
    --output json 2>&1 | grep -o '"commandOutput": "[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN_ADDRESS" ]; then
    # Fallback parsing
    TOKEN_ADDRESS=$(spl-token create-token --decimals $TOKEN_DECIMALS 2>&1 | grep "Creating token" | awk '{print $3}')
fi

echo "✅ Token created: $TOKEN_ADDRESS"
echo ""

# Create token account
echo "📁 Creating token account..."
ACCOUNT_ADDRESS=$(spl-token create-account "$TOKEN_ADDRESS" 2>&1 | grep "Creating account" | awk '{print $3}')
echo "✅ Token account: $ACCOUNT_ADDRESS"
echo ""

# Mint initial supply
echo "🪙 Minting initial supply ($INITIAL_SUPPLY)..."
spl-token mint "$TOKEN_ADDRESS" $INITIAL_SUPPLY
echo "✅ Minted $INITIAL_SUPPLY $TOKEN_SYMBOL"
echo ""

# Disable future minting (optional - remove if you want mint authority)
# echo "🔒 Disabling mint authority..."
# spl-token authorize "$TOKEN_ADDRESS" mint --disable
# echo "✅ Mint authority disabled"
# echo ""

# Save configuration
echo "💾 Saving configuration..."
mkdir -p .config
cat > .config/token-mfai-devnet.json << EOF
{
  "network": "devnet",
  "tokenName": "$TOKEN_NAME",
  "tokenSymbol": "$TOKEN_SYMBOL",
  "decimals": $TOKEN_DECIMALS,
  "mintAddress": "$TOKEN_ADDRESS",
  "tokenAccount": "$ACCOUNT_ADDRESS",
  "payer": "$PUBKEY",
  "createdAt": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF

echo ""
echo "============================================"
echo "✅ $TOKEN_SYMBOL Token Created Successfully!"
echo "============================================"
echo ""
echo "Token Details:"
echo "  Name: $TOKEN_NAME"
echo "  Symbol: $TOKEN_SYMBOL"
echo "  Mint: $TOKEN_ADDRESS"
echo "  Account: $ACCOUNT_ADDRESS"
echo "  Decimals: $TOKEN_DECIMALS"
echo "  Supply: $INITIAL_SUPPLY"
echo ""
echo "View on Explorer:"
echo "  https://explorer.solana.com/address/$TOKEN_ADDRESS?cluster=devnet"
echo ""
echo "Add to your .env:"
echo "  MFAI_TOKEN_MINT=$TOKEN_ADDRESS"
echo "  MFAI_TOKEN_ACCOUNT=$ACCOUNT_ADDRESS"
echo ""
echo "Configuration saved to: .config/token-mfai-devnet.json"
