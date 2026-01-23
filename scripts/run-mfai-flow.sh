#!/bin/bash
# run-mfai-flow.sh
echo "--- Lancement de l'audit SonarQube ---"
python3 mfai_full_audit_orchestrator.py
echo "--- Audit terminé. Prêt pour analyse IA ---"
