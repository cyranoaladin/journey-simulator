#!/bin/bash

# Nom du fichier de sortie
OUTPUT_FILE="arborescence_complete.txt"

echo "Analyse du projet en cours..."

# Commande tree avec options détaillées :
# -a : Inclut les fichiers cachés (comme .antigravity)
# -I : Ignore les dossiers lourds qui pollueraient le document
# --dirsfirst : Affiche les dossiers avant les fichiers
# -F : Ajoute un indicateur visuel (/ pour dossiers, * pour exécutables)
# -h : Affiche la taille des fichiers (rend l'arborescence "détaillée")

tree -a -h -I 'node_modules|.git|__pycache__|venv|.next|dist|build|.DS_Store' --dirsfirst --noreport > "$OUTPUT_FILE"

echo "----------------------------------------------------"
echo "L'arborescence détaillée a été sauvegardée dans :"
echo "$OUTPUT_FILE"
echo "----------------------------------------------------"
