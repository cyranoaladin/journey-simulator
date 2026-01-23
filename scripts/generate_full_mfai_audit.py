/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import requests
import json
from datetime import datetime

# --- CONFIGURATION ---
SONAR_URL = "http://127.0.0.1:9000"
PROJECT_KEY = "MFAI-Monorepo"
TOKEN = "[REDACTED_TOKEN]"
OUTPUT_FILE = "COMPREHENSIVE_SONAR_AUDIT.md"

def fetch_data(endpoint, params=None):
    try:
        response = requests.get(f"{SONAR_URL}/api/{endpoint}", params=params, auth=(TOKEN, ""), timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Erreur lors de l'appel à {endpoint}: {e}")
        return None

def get_rating_label(value):
    ratings = {"1.0": "A (Excellent)", "2.0": "B (Good)", "3.0": "C (Review Needed)", "4.0": "D (Low)", "5.0": "E (Critical)"}
    return ratings.get(value, value)

def run_audit():
    print(f"🛰️ Connexion à SonarQube sur {SONAR_URL}...")
    
    # 1. RÉCUPÉRATION DES MÉTRIQUES (Qualité Globale)
    metrics_list = "bugs,vulnerabilities,security_hotspots,code_smells,sqale_index,reliability_rating,security_rating,sqale_rating,ncloc"
    measures = fetch_data("measures/component", {"component": PROJECT_KEY, "metricKeys": metrics_list})
    
    # 2. RÉCUPÉRATION DE TOUTES LES ISSUES (Gestion de la pagination)
    all_issues = []
    page = 1
    total_expected = 0
    
    print("📥 Extraction des 733+ issues en cours...")
    while True:
        data = fetch_data("issues/search", {
            "componentKeys": PROJECT_KEY,
            "p": page,
            "ps": 500, # Max autorisé par SonarQube
            "statuses": "OPEN,CONFIRMED,REOPENED"
        })
        if not data: break
        
        all_issues.extend(data['issues'])
        total_expected = data['paging']['total']
        
        if len(all_issues) >= total_expected: break
        page += 1

    # 3. GÉNÉRATION DU RAPPORT MARKDOWN
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(f"# 🛡️ Audit Technique Complet : {PROJECT_KEY}\n")
        f.write(f"*Généré le : {datetime.now().strftime('%d/%m/%Y %H:%M')}*\n\n")

        # --- SECTION RÉSUMÉ ---
        f.write("## 📊 Tableau de Bord de Santé\n")
        ms = {m['metric']: m['value'] for m in measures['component']['measures']}
        
        f.write(f"| Métrique | Valeur | Note |\n")
        f.write(f"| :--- | :--- | :--- |\n")
        f.write(f"| **Fiabilité (Bugs)** | {ms.get('bugs')} | {get_rating_label(ms.get('reliability_rating'))} |\n")
        f.write(f"| **Sécurité** | {ms.get('vulnerabilities')} | {get_rating_label(ms.get('security_rating'))} |\n")
        f.write(f"| **Maintenabilité** | {ms.get('code_smells')} | {get_rating_label(ms.get('sqale_rating'))} |\n")
        f.write(f"| **Dette Technique** | {int(ms.get('sqale_index', 0))/60:.1f} heures | - |\n")
        f.write(f"| **Lignes de code (Loc)** | {ms.get('ncloc')} | - |\n\n")

        # --- SECTION ISSUES PAR FICHIER ---
        f.write("## 📂 Détail des Issues par Fichier\n")
        # Tri par fichier pour faciliter le travail de Cursor
        issues_by_file = {}
        for issue in all_issues:
            file_path = issue.get('component', '').split(':')[-1]
            if file_path not in issues_by_file: issues_by_file[file_path] = []
            issues_by_file[file_path].append(issue)

        for file, file_issues in sorted(issues_by_file.items()):
            f.write(f"### 📄 `{file}`\n")
            f.write("| Sévérité | Type | Message | Ligne |\n")
            f.write("| :--- | :--- | :--- | :--- |\n")
            for iss in sorted(file_issues, key=lambda x: x['severity']):
                line = iss.get('line', 'N/A')
                f.write(f"| **{iss['severity']}** | {iss['type']} | {iss['message']} | {line} |\n")
            f.write("\n")

    print(f"✅ Audit complet généré : {OUTPUT_FILE}")
    print(f"📈 Total d'issues extraites : {len(all_issues)}")

if __name__ == "__main__":
    run_audit()
