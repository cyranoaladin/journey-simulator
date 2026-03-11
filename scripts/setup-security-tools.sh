#!/bin/bash
# =============================================================================
# Setup Security Tools - Husky + git-secrets
# JOUR 1 - Critical Security Actions
# =============================================================================

set -e

echo "🔒 Setting up Security Tools"
echo "============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================================================
# 1. Setup Husky Pre-commit Hook
# ============================================================================
echo "📦 1. Setting up Husky pre-commit hook..."

# Install husky if not already installed
if [ ! -d ".husky" ]; then
    npx husky-init
fi

# Configure git to use husky
git config core.hooksPath .husky

# Create pre-commit hook if not exists
if [ ! -f ".husky/pre-commit" ]; then
    cat > .husky/pre-commit << 'HUSKY_EOF'
#!/bin/sh
# Pre-commit hook for Money Factory AI

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🔍 Running pre-commit checks..."

# Check for .env files
echo "  Checking for .env files..."
STAGED_FILES=$(git diff --cached --name-only)

if echo "$STAGED_FILES" | grep -E "^\.env$|^\.env\." > /dev/null; then
    echo "${RED}  ✗ ERROR: .env file detected in staging!${NC}"
    echo "${RED}     Environment files should NEVER be committed.${NC}"
    echo ""
    echo "To bypass (NOT RECOMMENDED):"
    echo "  git commit --no-verify"
    exit 1
fi

# Check for potential secrets
echo "  Checking for potential secrets..."

# Patterns to check
PATTERNS=(
    "sk-[a-zA-Z0-9]{20,}"           # OpenAI keys
    "password123"
    "admin-secret"
    "change-me"
    "test-secret"
    "private_key"
    "apikey"
    "api_key"
)

for pattern in "${PATTERNS[@]}"; do
    if echo "$STAGED_FILES" | xargs git diff --cached -U0 2>/dev/null | grep -E "^\+.*$pattern" > /dev/null 2>&1; then
        echo "${RED}  ✗ WARNING: Potential secret pattern found: $pattern${NC}"
        echo ""
        echo "Review your changes before committing."
        echo "To bypass: git commit --no-verify"
        exit 1
    fi
done

echo "${GREEN}  ✓ Pre-commit checks passed${NC}"
exit 0
HUSKY_EOF
    chmod +x .husky/pre-commit
    echo -e "${GREEN}✅ Pre-commit hook created${NC}"
else
    echo -e "${YELLOW}⚠️  Pre-commit hook already exists${NC}"
fi

# ============================================================================
# 2. Setup git-secrets
# ============================================================================
echo ""
echo "🔍 2. Setting up git-secrets..."

# Check if git-secrets is installed
if ! command -v git-secrets &> /dev/null; then
    echo -e "${YELLOW}⚠️  git-secrets not found. Installing...${NC}"
    
    # Try to install via package manager
    if command -v brew &> /dev/null; then
        brew install git-secrets
    elif command -v apt-get &> /dev/null; then
        sudo apt-get install -y git-secrets
    else
        # Clone and install manually
        cd /tmp
        git clone https://github.com/awslabs/git-secrets.git
        cd git-secrets
        sudo make install
        cd -
        rm -rf /tmp/git-secrets
    fi
fi

# Install git-secrets hooks
git secrets --install --force

# Add AWS patterns
git secrets --register-aws

# Add custom patterns for this project
git secrets --add 'sk-[a-zA-Z0-9]{20,}'  # OpenAI keys
git secrets --add 'sk_live_[a-zA-Z0-9]{20,}'  # Stripe live keys
git secrets --add 'sk_test_[a-zA-Z0-9]{20,}'  # Stripe test keys
git secrets --add 'MINTER_SECRET_KEY=.*'  # Solana minter keys
git secrets --add 'JWT_SECRET=.*'  # JWT secrets (not examples)
git secrets --add 'OPENAI_API_KEY=sk-.*'  # OpenAI keys

echo -e "${GREEN}✅ git-secrets configured${NC}"

# ============================================================================
# 3. Scan existing repository
# ============================================================================
echo ""
echo "🔎 3. Scanning repository for existing secrets..."

# Scan with git-secrets
echo "  Running git-secrets scan..."
if git secrets --scan; then
    echo -e "${GREEN}✅ No secrets found in repository${NC}"
else
    echo -e "${RED}⚠️  Potential secrets detected!${NC}"
    echo "Review the output above and clean up any exposed secrets."
    echo ""
    echo "To view history:"
    echo "  git log --all -p | grep -E 'sk-[a-zA-Z0-9]{20,}'"
fi

# ============================================================================
# Summary
# ============================================================================
echo ""
echo "============================="
echo "✅ Security Tools Setup Complete"
echo "============================="
echo ""
echo "Configured tools:"
echo "  ✓ Husky pre-commit hook"
echo "  ✓ git-secrets"
echo ""
echo "What these tools do:"
echo "  • Block commits with .env files"
echo "  • Detect potential secrets (API keys, passwords)"
echo "  • Scan code for sensitive patterns"
echo ""
echo "Next steps:"
echo "  1. Test: Try to commit a file with 'sk-test123' - should be blocked"
echo "  2. Regular scans: Run 'git secrets --scan' periodically"
echo "  3. Team setup: Ensure all team members run this script"
echo ""
