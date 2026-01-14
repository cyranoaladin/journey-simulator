#!/bin/bash
OUTPUT="FULL_CONTEXT.md"
echo "# CONTEXTE PROJET : MONEY FACTORY AI" > $OUTPUT

# 1. Documents Maîtres ( Règles d'Audit )
echo -e "\n## DOCUMENTS D'AUDIT" >> $OUTPUT
for doc in README.md AUDIT.md README.qa.md; do
  if [ -f "$doc" ]; then
    echo -e "\n<file name=\"$doc\">" >> $OUTPUT
    cat "$doc" >> $OUTPUT
    echo -e "\n</file>" >> $OUTPUT
  fi
done

# 2. Arborescence (Ignorer node_modules)
echo -e "\n## ARBORESCENCE" >> $OUTPUT
echo '```text' >> $OUTPUT
# Utilise 'tree' si installé, sinon 'find'
if command -v tree &> /dev/null; then
    tree -L 3 -I "node_modules|dist|build|.git|coverage|test-results" >> $OUTPUT
else
    find . -maxdepth 3 -not -path '*/.*' -not -path './node_modules*' -not -path './*/node_modules*' | sort >> $OUTPUT
fi
echo '```' >> $OUTPUT

# 3. Scripts de Preuve (Artifacts)
echo -e "\n## SCRIPTS ARTIFACTS" >> $OUTPUT
for script in artifacts/*.sh; do
  if [ -f "$script" ]; then
    echo -e "\n<file name=\"$script\">" >> $OUTPUT
    cat "$script" >> $OUTPUT
    echo -e "\n</file>" >> $OUTPUT
  fi
done

echo "✅ Fichier $OUTPUT généré avec succès."
