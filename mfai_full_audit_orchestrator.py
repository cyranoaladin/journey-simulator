import subprocess
import requests
import time
import sys
from datetime import datetime

# --- CONFIGURATION ---
SONAR_URL = "http://127.0.0.1:9000"
PROJECT_KEY = "MFAI-Monorepo"
TOKEN = "sqa_c13217644cf55e4d644e1c64d1c6a2c54edc9f9e"
NETWORK = "journey_mfai_back_front_audit-network"
OUTPUT_FILE = "FINAL_COMPLETE_AUDIT.md"

def run_scanner():
    """Lance le scan SonarQube via Docker"""
    print("🚀 1. Lancement du SonarScanner via Docker...")
    repo_root = subprocess.check_output(["pwd"], text=True).strip()
    cmd = [
        "docker", "run", "--rm",
        f"--network={NETWORK}",
        "-e", "SONAR_HOST_URL=http://sonarqube-server:9000",
        "-e", f"SONAR_TOKEN={TOKEN}",
        "-v", f"{repo_root}:/usr/src",
        "sonarsource/sonar-scanner-cli"
    ]
    result = subprocess.run(cmd, check=False)
    if result.returncode != 0:
        print("❌ Erreur lors du scan. Vérifiez vos conteneurs.")
        sys.exit(1)
    print("✅ Scan terminé avec succès.")

def wait_for_processing():
    """Attend que le serveur SonarQube termine l'analyse du rapport"""
    print("⏳ 2. Attente du traitement du rapport par le serveur (30s)...")
    time.sleep(30)

def fetch_sonar_api(endpoint, params=None):
    """Utilitaire pour interroger l'API SonarQube"""
    try:
        response = requests.get(f"{SONAR_URL}/api/{endpoint}", params=params, auth=(TOKEN, ""), timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ Erreur API sur {endpoint}: {e}")
        return None

def generate_markdown_report():
    """Extrait toutes les données et génère le fichier .md"""
    print(f"📄 3. Extraction de l'audit complet pour {PROJECT_KEY}...")

    # A. Métriques globales
    metrics_list = "bugs,vulnerabilities,security_hotspots,code_smells,sqale_index,reliability_rating,security_rating,sqale_rating,ncloc"
    measures = fetch_sonar_api("measures/component", {"component": PROJECT_KEY, "metricKeys": metrics_list})

    # B. Toutes les Issues (Pagination 500)
    all_issues = []
    page = 1
    while True:
        data = fetch_sonar_api("issues/search", {"componentKeys": PROJECT_KEY, "p": page, "ps": 500, "statuses": "OPEN,CONFIRMED"})
        if not data: break
        all_issues.extend(data['issues'])
        if len(all_issues) >= data['paging']['total']: break
        page += 1

    # C. Tous les Security Hotspots
    all_hotspots = []
    hs_data = fetch_sonar_api("hotspots/search", {"projectKey": PROJECT_KEY, "ps": 500})
    if hs_data: all_hotspots = hs_data.get('hotspots', [])

    # D. Écriture du fichier
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(f"# 🛡️ AUDIT TECHNIQUE EXHAUSTIF : {PROJECT_KEY}\n")
        f.write(f"*Généré le : {datetime.now().strftime('%d/%m/%Y %H:%M')}*\n\n")

        # Résumé
        f.write("## 📊 Tableau de Bord\n")
        ms = {m['metric']: m['value'] for m in measures['component']['measures']}
        f.write(f"| Métrique | Valeur |\n| :--- | :--- |\n")
        f.write(f"| **Bugs** | {ms.get('bugs')} |\n| **Dette** | {int(ms.get('sqale_index',0))/60:.1f}h |\n")
        f.write(f"| **Issues Totales** | {len(all_issues)} |\n| **Hotspots** | {len(all_hotspots)} |\n\n")

        # Security Hotspots
        f.write("## 🚩 Security Hotspots (Revue Manuelle)\n")
        f.write("| Fichier | Risque | Ligne |\n| :--- | :--- | :--- |\n")
        for hs in all_hotspots:
            f.write(f"| `{hs['component'].split(':')[-1]}` | {hs['message']} | {hs.get('line','N/A')} |\n")

        # Issues par fichier
        f.write("\n## 📂 Détail Complet des Issues\n")
        issues_by_file = {}
        for iss in all_issues:
            path = iss['component'].split(':')[-1]
            issues_by_file.setdefault(path, []).append(iss)

        for file, file_issues in sorted(issues_by_file.items()):
            f.write(f"### 📄 `{file}`\n")
            f.write("| Sévérité | Type | Message | Ligne |\n| :--- | :--- | :--- | :--- |\n")
            for i in sorted(file_issues, key=lambda x: x['severity']):
                f.write(f"| {i['severity']} | {i['type']} | {i['message']} | {i.get('line','N/A')} |\n")
            f.write("\n")

    print(f"✅ Rapport complet généré : {OUTPUT_FILE}")

if __name__ == "__main__":
    run_scanner()
    wait_for_processing()
    generate_markdown_report()
