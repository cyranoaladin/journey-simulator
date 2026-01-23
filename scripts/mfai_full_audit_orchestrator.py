# Project: Money Factory AI (MFAI)
# Status: Production Ready - 2026
# Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA

import subprocess
import requests
import time
import sys
from datetime import datetime

# --- CONFIGURATION ---
SONAR_URL = "http://127.0.0.1:9000"
PROJECT_KEY = "MFAI-Monorepo"
TOKEN = "[REDACTED_SONAR_TOKEN]"
NETWORK = "journey_mfai_back_front_audit-network"
OUTPUT_FILE = "FINAL_COMPLETE_AUDIT.md"

def run_scanner():
    """Starts SonarQube scan via Docker"""
    print("🚀 1. Launching SonarScanner via Docker...")
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
        print("❌ Scan error. Check your containers.")
        sys.exit(1)
    print("✅ Scan completed successfully.")

def wait_for_processing():
    """Waits for SonarQube server to finish processing the report"""
    print("⏳ 2. Waiting for server processing (30s)...")
    time.sleep(30)

def fetch_sonar_api(endpoint, params=None):
    """Utility to query SonarQube API"""
    try:
        response = requests.get(f"{SONAR_URL}/api/{endpoint}", params=params, auth=(TOKEN, ""), timeout=30)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"❌ API Error on {endpoint}: {e}")
        return None

def generate_markdown_report():
    """Extracts all data and generates the .md report"""
    print(f"📄 3. Extracting full audit for {PROJECT_KEY}...")

    # A. Global Metrics
    metrics_list = "bugs,vulnerabilities,security_hotspots,code_smells,sqale_index,reliability_rating,security_rating,sqale_rating,ncloc"
    measures = fetch_sonar_api("measures/component", {"component": PROJECT_KEY, "metricKeys": metrics_list})

    # B. All Issues (Pagination 500)
    all_issues = []
    page = 1
    while True:
        data = fetch_sonar_api("issues/search", {"componentKeys": PROJECT_KEY, "p": page, "ps": 500, "statuses": "OPEN,CONFIRMED"})
        if not data: break
        all_issues.extend(data['issues'])
        if len(all_issues) >= data['paging']['total']: break
        page += 1

    # C. All Security Hotspots
    all_hotspots = []
    hs_data = fetch_sonar_api("hotspots/search", {"projectKey": PROJECT_KEY, "ps": 500})
    if hs_data: all_hotspots = hs_data.get('hotspots', [])

    # D. File Writing
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(f"# 🛡️ EXHAUSTIVE TECHNICAL AUDIT: {PROJECT_KEY}\n")
        f.write(f"*Generated on: {datetime.now().strftime('%d/%m/%Y %H:%M')}*\n\n")

        # Summary
        f.write("## 📊 Dashboard\n")
        ms = {m['metric']: m['value'] for m in measures['component']['measures']}
        f.write(f"| Metric | Value |\n| :--- | :--- |\n")
        f.write(f"| **Bugs** | {ms.get('bugs')} |\n| **Debt** | {int(ms.get('sqale_index',0))/60:.1f}h |\n")
        f.write(f"| **Total Issues** | {len(all_issues)} |\n| **Hotspots** | {len(all_hotspots)} |\n\n")

        # Security Hotspots
        f.write("## 🚩 Security Hotspots (Manual Review)\n")
        f.write("| File | Risk | Line |\n| :--- | :--- | :--- |\n")
        for hs in all_hotspots:
            f.write(f"| `{hs['component'].split(':')[-1]}` | {hs['message']} | {hs.get('line','N/A')} |\n")

        # Issues per file
        f.write("\n## 📂 Detailed Issues\n")
        issues_by_file = {}
        for iss in all_issues:
            path = iss['component'].split(':')[-1]
            issues_by_file.setdefault(path, []).append(iss)

        for file, file_issues in sorted(issues_by_file.items()):
            f.write(f"### 📄 `{file}`\n")
            f.write("| Severity | Type | Message | Line |\n| :--- | :--- | :--- | :--- |\n")
            for i in sorted(file_issues, key=lambda x: x['severity']):
                f.write(f"| {i['severity']} | {i['type']} | {i['message']} | {i.get('line','N/A')} |\n")
            f.write("\n")

    print(f"✅ Full report generated: {OUTPUT_FILE}")

if __name__ == "__main__":
    run_scanner()
    wait_for_processing()
    generate_markdown_report()
