#!/bin/bash

# Nom du fichier final
OUTPUT="projet_complet_contenu.txt"

# Dossiers à ignorer absolument (on ajoute 'data' car ce sont des binaires DB)
EXCLUDE_DIRS="node_modules|.git|.next|venv|__pycache__|dist|build|data"

# Extensions à ignorer
EXCLUDE_EXT="png|jpg|jpeg|gif|ico|woff|woff2|ttf|eot|pdf|zip|tar.gz|db|sqlite"

echo "Génération de l'export complet (en ignorant les dossiers de données)..."

# Initialisation du fichier
echo "EXPORT DU PROJET : $(basename "$PWD")" > "$OUTPUT"
echo "DATE : $(date)" >> "$OUTPUT"
echo "==========================================================" >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Commande principale optimisée
# On ajoute une condition pour ignorer le fichier de sortie lui-même ($OUTPUT)
find . -type f \
    -not -name "$OUTPUT" \
    -not -path "*/.*" \
    | grep -vE "($EXCLUDE_DIRS)" \
    | grep -vE "\.($EXCLUDE_EXT)$" \
    | while read -r file; do
        
        # Vérification si le fichier est lisible (évite les erreurs de permission)
        if [ -r "$file" ]; then
            echo "Traitement de : $file"
            echo "----------------------------------------------------------" >> "$OUTPUT"
            echo "FILE: $file" >> "$OUTPUT"
            echo "----------------------------------------------------------" >> "$OUTPUT"
            
            cat "$file" >> "$OUTPUT"
            echo -e "\n" >> "$OUTPUT"
        else
            echo "Saut de (Permission refusée) : $file"
        fi
    done

echo "----------------------------------------------------------"
echo "Terminé ! Le contenu est disponible dans : $OUTPUT"
