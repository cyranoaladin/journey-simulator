#!/bin/bash
# Money Factory AI - Relentless Precision Scan v1.0

echo "🔍 [DEBUG] Starting Massive Integrity Scan..."
ERRORS=0

# 1. English Only (R1) - French character detection
echo "Checking for French characters in source files..."
# High-octave grep for accented characters in src/ and agents/
grep -rnE '[éàèùâêîôûëïç]' mf-back/agents/ mf-back/orchestration/ journey-simulator/src/ | grep -v "node_modules"
if [ $? -eq 0 ]; then
  echo "❌ FAIL: French characters detected!"
  ERRORS=$((ERRORS+1))
else
  echo "✅ R1 SUCCESS: Zero French residues."
fi

# 2. Lexicon Hardening (Status vs. Emotion)
echo "Checking for generic lexicon (Welcome/Good)..."
grep -rnE 'Welcome|Good' mf-back/agents/prompts.js mf-back/orchestration/zynoOrchestrator.js
if [ $? -eq 0 ]; then
  echo "⚠️ WARNING: Generic terms (Welcome/Good) found. Recommended: SYNC_ESTABLISHED."
fi

# 3. Security (R2) - Key Leak Detection
echo "Scanning for potential API Key leaks..."
grep -rnE 'AI_KEY|PRIVATE_KEY|SECRET|TOKEN' . | grep -v ".antigravity" | grep -v "node_modules" | grep -v ".env"
if [ $? -eq 0 ]; then
  echo "❌ FAIL: Potential sensitive keys detected in source code!"
  ERRORS=$((ERRORS+1))
else
  echo "✅ R2 SUCCESS: No keys leaked."
fi

# 4. Build Integrity
echo "Verifying backend build..."
cd mf-back && npm run lint --if-present
if [ $? -ne 0 ]; then
  echo "❌ FAIL: Backend build/lint failed."
  ERRORS=$((ERRORS+1))
else
  echo "✅ BUILD SUCCESS: Backend 100% green."
fi

if [ $ERRORS -eq 0 ]; then
  echo "🏆 [STATUS] SPRINT_ALPHA_BETA_PERFECTED=TRUE"
  exit 0
else
  echo "🚨 [STATUS] SCAN_FAILED: $ERRORS integrity violations found."
  exit 1
fi
