#!/bin/bash
#
# MFAI - Ollama Models Setup Script
# Installe les modèles requis pour la stack souveraine
#
# Modèles:
# - nomic-embed-text: Embeddings haute performance CPU (274MB)
# - qwen2.5:7b: Chat rapide pour dev/test (4.7GB)
# - qwen2.5:32b: Intelligence profonde pour production (18GB)
#

set -e

echo "════════════════════════════════════════════════════════════"
echo "  MFAI - Installation des Modèles Ollama"
echo "  Stack Souveraine - Neural Nexus"
echo "════════════════════════════════════════════════════════════"
echo ""

# Vérification de la présence d'Ollama
echo "🔍 Vérification de l'installation Ollama..."
if ! command -v ollama &> /dev/null; then
    echo "❌ ERREUR: Ollama n'est pas installé"
    echo ""
    echo "Installation requise:"
    echo "  Linux: curl -fsSL https://ollama.com/install.sh | sh"
    echo "  macOS: brew install ollama"
    echo ""
    exit 1
fi

echo "✅ Ollama installé: $(which ollama)"
echo ""

# Vérification du service Ollama
echo "🔍 Vérification du service Ollama..."
if ! curl -s http://localhost:11434/api/version &> /dev/null; then
    echo "⚠️  Le service Ollama n'est pas démarré"
    echo ""
    echo "Démarrage automatique..."
    
    # Tenter de démarrer Ollama en arrière-plan
    if command -v systemctl &> /dev/null && systemctl is-enabled ollama &> /dev/null; then
        sudo systemctl start ollama
        echo "✅ Service Ollama démarré via systemd"
    else
        echo "💡 Démarrez Ollama manuellement dans un autre terminal:"
        echo "   ollama serve"
        echo ""
        read -p "Appuyez sur Entrée une fois Ollama démarré..."
    fi
fi

# Vérification finale de la connexion
if ! curl -s http://localhost:11434/api/version &> /dev/null; then
    echo "❌ ERREUR: Impossible de se connecter à Ollama (http://localhost:11434)"
    echo "   Vérifiez que le service est démarré avec: ollama serve"
    exit 1
fi

echo "✅ Service Ollama actif (http://localhost:11434)"
echo ""

# Liste des modèles déjà installés
echo "📋 Modèles déjà installés:"
ollama list
echo ""

# Fonction pour télécharger un modèle
pull_model() {
    local model=$1
    local description=$2
    local size=$3
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Modèle: $model"
    echo "   Description: $description"
    echo "   Taille: ~$size"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Vérifier si le modèle est déjà installé
    if ollama list | grep -q "^$model"; then
        echo "✓ Déjà installé"
        echo ""
        return 0
    fi
    
    echo "⬇️  Téléchargement en cours..."
    if ollama pull "$model"; then
        echo "✅ $model installé avec succès"
    else
        echo "❌ ERREUR lors de l'installation de $model"
        return 1
    fi
    echo ""
}

# Installation des modèles
echo "🚀 Installation des modèles requis..."
echo ""

# 1. Embedding model (prioritaire - requis pour RAG)
pull_model "nomic-embed-text" "Embeddings haute performance (768d)" "274MB"

# 2. Chat model léger (optionnel mais recommandé pour dev)
read -p "Installer qwen2.5:7b (dev/test - 4.7GB)? [O/n] " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Oo]$ ]] || [[ -z $REPLY ]]; then
    pull_model "qwen2.5:7b" "Chat rapide pour développement" "4.7GB"
else
    echo "⊘ qwen2.5:7b ignoré"
    echo ""
fi

# 3. Chat model production (optionnel - très gros)
read -p "Installer qwen2.5:32b (production - 18GB)? [o/N] " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Oo]$ ]]; then
    pull_model "qwen2.5:32b" "Intelligence profonde (production)" "18GB"
else
    echo "⊘ qwen2.5:32b ignoré"
    echo ""
fi

# Résumé final
echo "════════════════════════════════════════════════════════════"
echo "  RÉSUMÉ DE L'INSTALLATION"
echo "════════════════════════════════════════════════════════════"
echo ""
ollama list
echo ""

# Vérification des modèles critiques
CRITICAL_MISSING=0
if ! ollama list | grep -q "nomic-embed-text"; then
    echo "❌ CRITIQUE: nomic-embed-text manquant (requis pour embeddings)"
    CRITICAL_MISSING=1
fi

if ! ollama list | grep -q "qwen2.5:7b" && ! ollama list | grep -q "qwen2.5:32b"; then
    echo "⚠️  ATTENTION: Aucun modèle de chat installé"
    echo "   Recommandé: ollama pull qwen2.5:7b"
fi

echo ""
if [ $CRITICAL_MISSING -eq 0 ]; then
    echo "✅ Installation réussie!"
    echo ""
    echo "Prochaines étapes:"
    echo "  1. Démarrer ChromaDB: docker run -p 8000:8000 chromadb/chroma"
    echo "  2. Ré-indexer la base: npm run reindex"
    echo "  3. Tester le RAG: npx tsx scripts/test-local-rag.ts"
    echo ""
    exit 0
else
    echo "❌ Installation incomplète. Réessayez ou installez manuellement:"
    echo "   ollama pull nomic-embed-text"
    echo ""
    exit 1
fi
