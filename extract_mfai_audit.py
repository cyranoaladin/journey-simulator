/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import requests
import json

# Configuration
SONAR_URL = "http://127.0.0.1:9000"
PROJECT_KEY = "MFAI-Monorepo"
TOKEN = "sqa_c13217644cf55e4d644e1c64d1c6a2c54edc9f9e"
OUTPUT_FILE = "FULL_AUDIT_REPORT.md"

def fetch_sonar_data(endpoint, params=None):
    response = requests.get(f"{SONAR_URL}/api/{endpoint}", params=params, auth=(TOKEN, ""))
    if response.status_code != 200:
        print(f"Erreur API: {response.status_code} - {response.text}")
        return None
    return response.json()

def generate_report():
    print(f"🚀 Début de l'extraction de l'audit pour {PROJECT_KEY}...")
    
    # 1. Récupération des métriques globales
    metrics_params = {
        "component": PROJECT_KEY,
        "metricKeys": "bugs,vulnerabilities,security_hotspots,sqale_index,reliability_rating,security_rating,sqale_rating"
    }
    metrics = fetch_sonar_data("measures/component", metrics_params)
    
    # 2. Récupération de toutes les issues (Pagination gérée)
    all_issues = []
    page = 1
    while True:
        issues_data = fetch_sonar_data("issues/search", {"componentKeys": PROJECT_KEY, "p": page, "ps": 500})
        if not issues_data or not issues_data['issues']:
            break
        all_issues.extend(issues_data['issues'])
        if len(all_issues) >= issues_data['paging']['total']:
            break
        page += 1

    # 3. Rédaction du rapport Markdown
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(f"# 🛡️ Rapport d'Audit Complet : {PROJECT_KEY}\n\n")
        
        # Section Résumé
        f.write("## 📊 Résumé de la Qualité\n")
        measures = {m['metric']: m['value'] for m in metrics['component']['measures']}
        f.write(f"- **Bugs** : {measures.get('bugs', '0')}\n")
        f.write(f"- **Vulnérabilités** : {measures.get('vulnerabilities', '0')}\n")
        f.write(f"- **Dette Technique** : {int(measures.get('sqale_index', 0))/60:.1f} heures\n\n")

        # Section Issues Critiques
        f.write("## ⚠️ Issues Critiques et Majeures\n")
        f.write("| Sévérité | Type | Composant | Message |\n")
        f.write("| :--- | :--- | :--- | :--- |\n")
        
        for issue in all_issues:
            if issue['severity'] in ['BLOCKER', 'CRITICAL', 'MAJOR']:
                f.write(f"| {issue['severity']} | {issue['type']} | `{issue['component'].split(':')[-1]}` | {issue['message']} |\n")

    print(f"✅ Rapport généré avec succès : {OUTPUT_FILE} ({len(all_issues)} issues extraites)")

if __name__ == "__main__":
    generate_report()
