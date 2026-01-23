#!/bin/bash

# ==============================================================================
# SCRIPT DE NETTOYAGE PROFOND ZENFLOW / ZENCODER
# Niveau : Senior Lead / Deep Clean
# ==============================================================================

# Couleurs pour le logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

CURRENT_DIR=$(pwd)

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   DÉMARRAGE DU PROTOCOLE DE NETTOYAGE ZENFLOW        ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo -e "Dossier courant cible pour le nettoyage local : ${YELLOW}$CURRENT_DIR${NC}"
echo ""

# ------------------------------------------------------------------------------
# 1. ARRÊT FORCÉ DES PROCESSUS (KILL SWITCH)
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[1/6] Arrêt forcé des processus et démons...${NC}"

# On tue tout ce qui ressemble à zenflow, zencoder ou electron associé
pkill -9 -f zenflow 2>/dev/null && echo -e "  - Processus 'zenflow' tués."
pkill -9 -f zencoder 2>/dev/null && echo -e "  - Processus 'zencoder' tués."
# On vérifie s'il reste des processus Node liés
pkill -9 -f "node.*zenflow" 2>/dev/null && echo -e "  - Processus Node/Zenflow tués."

echo -e "${GREEN}✓ Processus arrêtés.${NC}"

# ------------------------------------------------------------------------------
# 2. NETTOYAGE DES FICHIERS GLOBAUX (HOME & SYSTÈME)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/6] Suppression des configurations et caches globaux...${NC}"

# Liste des dossiers connus pour stocker des données Zenflow
DIRS_TO_NUKE=(
    "$HOME/.zenflow"                 # Config globale workflows
    "$HOME/.zencoder"                # Config globale auth/settings
    "$HOME/.config/Zenflow"          # Cache Electron / App Data
    "$HOME/.config/zencoder-nodejs"  # Ancien cache node
    "$HOME/.cache/Zenflow"           # Cache GPU/Shader
    "$HOME/.local/share/zenflow"     # Données locales Linux
    "/tmp/zencoder*"                 # Fichiers temporaires
    "/tmp/zenflow*"
)

for DIR in "${DIRS_TO_NUKE[@]}"; do
    if [ -d "$DIR" ] || [ -f "$DIR" ]; then
        rm -rf "$DIR"
        echo -e "  - Supprimé : $DIR"
    else
        echo -e "  - Introuvable (déjà propre) : $DIR"
    fi
done

echo -e "${GREEN}✓ Nettoyage global terminé.${NC}"

# ------------------------------------------------------------------------------
# 3. DÉSINSTALLATION DES BINAIRES ET PAQUETS
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/6] Suppression des exécutables et paquets NPM...${NC}"

# Désinstallation NPM Global (si installé via npm i -g)
if command -v npm &> /dev/null; then
    echo "  - Vérification des paquets globaux NPM..."
    npm uninstall -g zencoder @zenflow/cli zenflow 2>/dev/null
    echo "  - Nettoyage cache NPM..."
    npm cache clean --force >/dev/null 2>&1
else
    echo "  - NPM non trouvé, étape ignorée."
fi

# Suppression des AppImages courantes (souvent dans Downloads ou Applications)
echo "  - Recherche et suppression des AppImages Zenflow..."
find "$HOME/Downloads" -name "*Zenflow*.AppImage" -type f -delete 2>/dev/null
find "$HOME/Applications" -name "*Zenflow*.AppImage" -type f -delete 2>/dev/null
# Suppression du lien symbolique si l'utilisateur l'avait mis dans le PATH
if [ -f "/usr/local/bin/zenflow" ]; then
    echo "  - Suppression binaire /usr/local/bin/zenflow (sudo requis)..."
    sudo rm -f /usr/local/bin/zenflow
fi

echo -e "${GREEN}✓ Binaires supprimés.${NC}"

# ------------------------------------------------------------------------------
# 4. NETTOYAGE DU DOSSIER COURANT (PROJET)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/6] Nettoyage du projet local ($CURRENT_DIR)...${NC}"

if [ -d "$CURRENT_DIR/.zenflow" ]; then
    rm -rf "$CURRENT_DIR/.zenflow"
    echo -e "  - Dossier projet '.zenflow' supprimé."
fi

if [ -d "$CURRENT_DIR/.zencoder" ]; then
    rm -rf "$CURRENT_DIR/.zencoder"
    echo -e "  - Dossier projet '.zencoder' supprimé."
fi

# Nettoyage des logs d'erreurs éventuels
find "$CURRENT_DIR" -name "zencoder-error.log" -delete
find "$CURRENT_DIR" -name "zenflow-debug.log" -delete

echo -e "${GREEN}✓ Projet local nettoyé.${NC}"

# ------------------------------------------------------------------------------
# 5. NETTOYAGE CHIRURGICAL DU SHELL (.bashrc / .profile)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/6] Assainissement des fichiers de configuration Shell...${NC}"

# Fonction de nettoyage de fichier
clean_file() {
    local file="$1"
    if [ -f "$file" ]; then
        # On fait un backup avant de toucher
        cp "$file" "$file.bak_before_zenflow_clean"
        
        # On cherche si des lignes contiennent zenflow ou zencoder
        if grep -qE "zenflow|zencoder" "$file"; then
            echo -e "  - Traces trouvées dans $file. Nettoyage..."
            # Sed pour supprimer les lignes contenant zenflow ou zencoder (case insensitive)
            sed -i '/[Zz]enflow/d' "$file"
            sed -i '/[Zz]encoder/d' "$file"
            echo -e "  - $file nettoyé (Backup créé : $file.bak_before_zenflow_clean)."
        else
            echo -e "  - Aucune trace dans $file."
        fi
    fi
}

clean_file "$HOME/.bashrc"
clean_file "$HOME/.profile"
clean_file "$HOME/.bash_profile"
clean_file "$HOME/.zshrc"

echo -e "${GREEN}✓ Fichiers Shell vérifiés.${NC}"

# ------------------------------------------------------------------------------
# 6. VÉRIFICATION FINALE (POST-MORTEM)
# ------------------------------------------------------------------------------
echo -e "\n${BLUE}======================================================${NC}"
echo -e "${BLUE}   RAPPORT DE VÉRIFICATION                            ${NC}"
echo -e "${BLUE}======================================================${NC}"

# Check Process
if pgrep -f zenflow > /dev/null; then
    echo -e "${RED}[FAIL] Des processus Zenflow tournent encore !${NC}"
else
    echo -e "${GREEN}[OK] Aucun processus actif.${NC}"
fi

# Check Files
if [ -d "$HOME/.zenflow" ]; then
    echo -e "${RED}[FAIL] Le dossier ~/.zenflow existe encore.${NC}"
else
    echo -e "${GREEN}[OK] Dossiers globaux supprimés.${NC}"
fi

# Check CLI
if command -v zencoder > /dev/null 2>&1; then
     echo -e "${RED}[FAIL] La commande 'zencoder' est toujours accessible dans le PATH.${NC}"
else
     echo -e "${GREEN}[OK] Commandes CLI introuvables.${NC}"
fi

echo -e "\n${YELLOW}NOTE IMPORTANTE :${NC}"
echo "Pour finaliser le nettoyage des variables d'environnement, veuillez"
echo "redémarrer votre terminal ou exécuter : source ~/.bashrc"
echo ""
echo -e "${BLUE}Nettoyage terminé.${NC}"
