#!/usr/bin/env python3
"""
Script de Signature Automatisée - Money Factory AI
Marque les fichiers de production avec les noms des contributeurs.
Sécurisé contre les fuites de secrets.
"""

import os

# --- CONFIGURATION ---
SIGNATURE = """/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */
"""

# Extensions autorisées pour la signature
TARGET_EXTENSIONS = ('.ts', '.tsx', '.js', '.py', '.md', '.css', '.scss')

# FICHIERS ET DOSSIERS SENSIBLES À IGNORER ABSOLUMENT
EXCLUDE_LIST = {
    # Dossiers techniques et secrets
    'node_modules', '.git', '.cursor', '.gemini', '.antigravity',
    'test-results', 'dist', 'build', 'coverage',
    
    # Fichiers de secrets et configuration système
    '.env', '.env.local', '.env.example', 'package-lock.json', 
    'auth.json', 'user.json', '.DS_Store', 'pre-flight.log',
    
    # Fichiers de debug à exclure
    'diagnostic_connectivity.md', 'critical_blocker_analysis.md'
}

def sign_files(root_dir):
    print(f"🚀 Démarrage du marquage final des développeurs dans : {root_dir}")
    signed_count = 0
    skipped_count = 0
    
    for root, dirs, files in os.walk(root_dir):
        # Filtrage des dossiers exclus
        dirs[:] = [d for d in dirs if d not in EXCLUDE_LIST]
        
        for file in files:
            if file.endswith(TARGET_EXTENSIONS) and file not in EXCLUDE_LIST:
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    # Éviter la double signature
                    if "Money Factory AI (MFAI)" not in content:
                        print(f"✅ Signature appliquée : {file_path}")
                        with open(file_path, 'w', encoding='utf-8') as f:
                            # Adaptation du style de commentaire pour le Markdown
                            if file.endswith('.md'):
                                f.write(f"<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->\n\n" + content)
                            else:
                                f.write(SIGNATURE + "\n" + content)
                        signed_count += 1
                    else:
                        print(f"⏩ Déjà signé : {file_path}")
                        skipped_count += 1
                except Exception as e:
                    print(f"❌ Erreur sur {file_path}: {e}")
    
    print(f"\n📊 Résumé:")
    print(f"   ✅ Fichiers signés: {signed_count}")
    print(f"   ⏩ Déjà signés: {skipped_count}")
    print(f"\n🏁 Signature terminée. Le projet est officiellement scellé.")

if __name__ == "__main__":
    sign_files('.')
