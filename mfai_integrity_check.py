/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import re
import os
import subprocess

FILES = {
    "orchestrator": "mf-back/orchestration/zynoVerticalSlice.js",
    "service": "mf-back/orchestration/services/executionService.js"
}

def get_param_count_from_def(content):
    """Extrait le nombre de paramètres de la définition de la fonction."""
    # Cherche: const name = async (a, b, c) => ou function name(a, b, c)
    match = re.search(r'executeAgentWithRetry\s*=\s*(?:async\s*)?\((.*?)\)', content, re.DOTALL)
    if not match:
        match = re.search(r'(?:async\s+)?function\s+executeAgentWithRetry\s*\((.*?)\)', content, re.DOTALL)
    
    if match:
        params = match.group(1).strip()
        # Handle empty params case
        if not params:
            return 0
        return len([p for p in params.split(',') if p.strip()])
    return None

def get_param_counts_from_calls(content):
    """Extrait le nombre d'arguments passés lors des appels dans l'orchestrateur."""
    # Cherche: ExecutionService.executeAgentWithRetry(arg1, arg2...) OR executionEngine.executeAgentWithRetry
    # We look for ExecutionService.executeAgentWithRetry since that's what zynoVerticalSlice uses now.
    calls = re.findall(r'ExecutionService\.executeAgentWithRetry\s*\((.*?)\)', content, re.DOTALL)
    if not calls:
         calls = re.findall(r'executionEngine\.executeAgentWithRetry\s*\((.*?)\)', content, re.DOTALL)

    counts = []
    for call in calls:
        # Nettoyage rudimentaire des virgules à l'intérieur d'objets {} ou tableaux []
        # On compte les virgules de premier niveau
        depth = 0
        commas = 0
        for char in call:
            if char in '{[(': depth += 1
            if char in '}])': depth -= 1
            if char == ',' and depth == 0:
                commas += 1
        counts.append(commas + 1 if call.strip() else 0)
    return counts

def check_signature_match():
    if not all(os.path.exists(f) for f in FILES.values()):
        return ["⚠️ Fichiers manquants pour vérification de signature."]

    with open(FILES["service"], 'r') as f: service_content = f.read()
    with open(FILES["orchestrator"], 'r') as f: orch_content = f.read()

    def_count = get_param_count_from_def(service_content)
    call_counts = get_param_counts_from_calls(orch_content)

    errors = []
    if def_count is None:
        errors.append("❌ Définition de 'executeAgentWithRetry' introuvable dans le service.")
    else:
        print(f"📊 Définition service : {def_count} paramètres.")
        for i, count in enumerate(call_counts):
            if count != def_count:
                errors.append(f"❌ Appel n°{i+1} : {count} arguments envoyés vs {def_count} attendus.")
    
    return errors

# ... (garder les fonctions check_syntax et check_integrity du script précédent) ...

def main():
    print("🛡️  MFAI INTEGRITY SCANNER (V2) starting...")
    # Lancer les vérifications d'intégrité habituelles
    # ... 
    
    print("\n🔗 Checking Function Signatures...")
    sig_errors = check_signature_match()
    if not sig_errors:
        print("✅ Signatures cohérentes.")
    else:
        for err in sig_errors:
            print(err)

if __name__ == "__main__":
    main()
