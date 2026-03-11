#!/bin/bash
# =============================================================================
# Money Factory AI - Post-Reorganization Verification Script
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "🔍 Vérification Post-Réorganisation"
echo "=========================================="
echo ""

ERRORS=0
WARNINGS=0

# -----------------------------------------------------------------------------
# 1. Structure de base
# -----------------------------------------------------------------------------
echo "📁 1. Vérification de la structure..."

REQUIRED_DIRS=("apps" "packages" "docs" "infra" "scripts")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "  ${GREEN}✓${NC} $dir/"
    else
        echo -e "  ${RED}✗${NC} $dir/ manquant"
        ((ERRORS++))
    fi
done

# -----------------------------------------------------------------------------
# 2. Applications
# -----------------------------------------------------------------------------
echo ""
echo "🔧 2. Vérification des applications..."

if [ -d "apps/web" ]; then
    if [ -f "apps/web/package.json" ]; then
        echo -e "  ${GREEN}✓${NC} apps/web/ (Next.js)"
    else
        echo -e "  ${YELLOW}⚠${NC} apps/web/ existe mais sans package.json"
        ((WARNINGS++))
    fi
else
    echo -e "  ${RED}✗${NC} apps/web/ manquant"
    ((ERRORS++))
fi

if [ -d "apps/api" ]; then
    if [ -f "apps/api/package.json" ]; then
        echo -e "  ${GREEN}✓${NC} apps/api/ (Express)"
    else
        echo -e "  ${YELLOW}⚠${NC} apps/api/ existe mais sans package.json"
        ((WARNINGS++))
    fi
else
    echo -e "  ${RED}✗${NC} apps/api/ manquant"
    ((ERRORS++))
fi

# -----------------------------------------------------------------------------
# 3. Fichiers critiques
# -----------------------------------------------------------------------------
echo ""
echo "📄 3. Vérification des fichiers critiques..."

REQUIRED_FILES=("README.md" "package.json" "Makefile" ".gitignore")
for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "  ${GREEN}✓${NC} $file"
    else
        echo -e "  ${RED}✗${NC} $file manquant"
        ((ERRORS++))
    fi
done

# -----------------------------------------------------------------------------
# 4. Documentation
# -----------------------------------------------------------------------------
echo ""
echo "📚 4. Vérification de la documentation..."

DOC_DIRS=("10-ARCHITECTURE" "20-API" "30-DEPLOYMENT" "40-SECURITY" "50-PRODUCT" "90-CONTRIBUTING")
for dir in "${DOC_DIRS[@]}"; do
    if [ -d "docs/$dir" ]; then
        COUNT=$(find "docs/$dir" -type f -name "*.md" | wc -l)
        echo -e "  ${GREEN}✓${NC} docs/$dir/ ($COUNT fichiers)"
    else
        echo -e "  ${YELLOW}⚠${NC} docs/$dir/ manquant (sera créé)"
        ((WARNINGS++))
    fi
done

# -----------------------------------------------------------------------------
# 5. Fichiers nettoyés
# -----------------------------------------------------------------------------
echo ""
echo "🧹 5. Vérification du nettoyage..."

# Vérifier que les fichiers générés sont archivés ou supprimés
if [ -f "tous_les_markdowns.txt" ]; then
    echo -e "  ${RED}✗${NC} tous_les_markdowns.txt existe encore"
    ((ERRORS++))
else
    echo -e "  ${GREEN}✓${NC} tous_les_markdowns.txt nettoyé"
fi

if [ -f "arborescence.txt" ]; then
    echo -e "  ${YELLOW}⚠${NC} arborescence.txt existe encore"
else
    echo -e "  ${GREEN}✓${NC} arborescence.txt nettoyé"
fi

# Vérifier que les outils IA sont archivés
IA_TOOLS=(".agent" ".antigravity" ".context" ".serena" ".zencoder")
for tool in "${IA_TOOLS[@]}"; do
    if [ -d "$tool" ]; then
        echo -e "  ${YELLOW}⚠${NC} $tool/ existe encore à la racine"
    else
        echo -e "  ${GREEN}✓${NC} $tool/ archivé"
    fi
done

# -----------------------------------------------------------------------------
# 6. Sécurité
# -----------------------------------------------------------------------------
echo ""
echo "🔒 6. Vérification de la sécurité..."

if [ -f ".env" ]; then
    echo -e "  ${YELLOW}⚠${NC} .env existe (doit être gitignored)"
    if grep -q "^OPENAI_API_KEY=sk-" .env 2>/dev/null; then
        echo -e "  ${RED}✗${NC} Clé OpenAI potentiellement exposée dans .env"
        ((ERRORS++))
    fi
else
    echo -e "  ${GREEN}✓${NC} Pas de .env à la racine"
fi

if [ -f ".husky/pre-commit" ]; then
    echo -e "  ${GREEN}✓${NC} Pre-commit hook présent"
else
    echo -e "  ${YELLOW}⚠${NC} Pre-commit hook manquant"
    ((WARNINGS++))
fi

if grep -q "node_modules" .gitignore 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} node_modules dans .gitignore"
else
    echo -e "  ${RED}✗${NC} node_modules manquant de .gitignore"
    ((ERRORS++))
fi

# -----------------------------------------------------------------------------
# 7. Taille du projet
# -----------------------------------------------------------------------------
echo ""
echo "📊 7. Statistiques du projet..."

TOTAL_SIZE=$(du -sh . 2>/dev/null | cut -f1)
echo "  Taille totale: $TOTAL_SIZE"

TS_FILES=$(find apps -type f \( -name "*.ts" -o -name "*.tsx" \) 2>/dev/null | wc -l)
echo "  Fichiers TypeScript: $TS_FILES"

DOC_FILES=$(find docs -type f -name "*.md" 2>/dev/null | wc -l)
echo "  Fichiers documentation: $DOC_FILES"

# -----------------------------------------------------------------------------
# Résumé
# -----------------------------------------------------------------------------
echo ""
echo "=========================================="
echo "📋 RÉSUMÉ"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Tous les vérifications ont passé !${NC}"
    echo ""
    echo "Prochaines étapes:"
    echo "  1. make install"
    echo "  2. make dev"
    echo "  3. make test"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS avertissement(s)${NC}"
    echo ""
    echo "Le projet est fonctionnel mais pourrait être amélioré."
    exit 0
else
    echo -e "${RED}❌ $ERRORS erreur(s), $WARNINGS avertissement(s)${NC}"
    echo ""
    echo "Veuillez corriger les erreurs avant de continuer."
    exit 1
fi
