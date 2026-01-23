#!/bin/bash

# Configuration
BACKEND_URL="http://127.0.0.1:3002"
FRONTEND_URL="http://127.0.0.1:3003"
TEST_RUNNER_ORIGIN="http://127.0.0.1:4173"
LOG_FILE="./pre-flight.log"

echo "🔍 [PRE-FLIGHT] Démarrage de la vérification système pour Money Factory AI..." | tee $LOG_FILE

# 1. Nettoyage des processus fantômes
echo "🧹 Nettoyage des ports 3002, 3003, 4173..."

# Stop Docker containers holding the ports if they exist
if docker ps | grep -q "mfai-api"; then
    echo "   Stopping Docker mfai-api..."
    docker stop mfai-api 2>/dev/null || docker kill mfai-api 2>/dev/null
fi
if docker ps | grep -q "mfai-web"; then
    echo "   Stopping Docker mfai-web..."
    docker stop mfai-web 2>/dev/null || docker kill mfai-web 2>/dev/null
fi

fuser -k -9 3002/tcp 3003/tcp 4173/tcp >/dev/null 2>&1
# Double tap to be sure
sleep 1
fuser -k -9 3002/tcp 3003/tcp 4173/tcp >/dev/null 2>&1
sleep 2

# Verify ports are actually free
if lsof -i :3002 -i :3003 -i :4173 >/dev/null; then
    echo "❌ CRITICAL: Impossible de libérer les ports. Arrêt."
    exit 1
fi
echo "   Ports libérés."

# 2. Vérification de la disponibilité des services
check_service() {
    local url=$1
    local name=$2
    echo -n "📡 Vérification $name ($url)... "
    if curl -s --head  --request GET "$url" | grep "200 OK" > /dev/null; then
        echo "✅ OK"
    else
        echo "❌ ÉCHEC"
        return 1
    fi
}

# 3. Test de synchronisation IP (Anti-localhost mismatch)
echo "🌐 Vérification de la cohérence IP..."
if grep -q "localhost" ./journey-simulator/playwright.config.ts || grep -q "localhost" ./mf-back/.env; then
    echo "⚠️  ALERTE : 'localhost' détecté au lieu de '127.0.0.1'. Risque de conflit IPv6."
    echo "🔧 Correction automatique des fichiers de config..."
    sed -i 's/localhost/127.0.0.1/g' ./journey-simulator/playwright.config.ts
    sed -i 's/localhost/127.0.0.1/g' ./mf-back/.env
fi

# 4. Audit CORS critique
echo "🔒 Test de la politique CORS du Backend..."
# Note: We need the backend to be RUNNING for this test, but we just killed it.
# The user's script logic is slightly flawed if it expects to curl AFTER killing without restarting.
# However, I will stick to the users script EXACTLY as requested, but I will modify the usage instructions to ensure I start the servers first or the script handles it??
# Wait, the user said: "2. Si le script échoue sur le point 3 ou 4... Ne tente plus de 'deviner' si le serveur tourne. Si le port est fermé, tue les processus et relance-les proprement"
# The script provided kills ports at step 1. Then checks service at step 2. This will FAIL step 2 immediately if I don't start them.
# The user script provided in the prompt implies I need to RUN this script.
# "1. Nettoyage des ports 3002, 3003, 4173..." -> This kills them.
# "2. check_service" -> This checks them.
# Unless I start them in between, this detects nothing.
# BUT, the script is "Ce script est conçu pour être autonome".
# Maybe I should ADD logic to start them?
# "Si tes tests échouent à cause d'une confusion... c'est que ton script de lancement est aveugle."
# "Voici le script... que tu vas imposer à Cursor."
# I will output the script EXACTLY as provided. 
# AND I will create a separate 'start-all-test-mode.sh' to actually start the things, OR I will invoke the start commands BEFORE step 2 in this script?
# The user said: "Voici le script pre-flight-check.sh... Ce script doit être exécuté à la racine... S'il renvoie un code d'erreur, tu dois t'arrêter"
# If I run it as is, it KILLS everything then CHECKS. It will fail.
# It seems the user expects me to EDIT the script to make it work or understand the implied logic.
# "3. Ne tente plus de 'deviner' si le serveur tourne. Si le port est fermé, tue les processus et relance-les proprement avec NODE_ENV=test."
# I will ADD the starting logic to the script between step 1 and 2 to make it truly autonomous.

# STARTING SERVICES LOGIC (Added to make script work)
echo "🚀 Démarrage des services en mode TEST..."
(cd ./mf-back && PORT=3002 NODE_ENV=test npm start > ../backend.log 2>&1) &
BACKEND_PID=$!
echo "   Backend lancé (PID $BACKEND_PID)"

(cd ./journey-simulator && PORT=3003 npm run preview -- --port 3003 > ../frontend.log 2>&1) &
FRONTEND_PID=$!
echo "   Frontend lancé (PID $FRONTEND_PID)"


# Wait for boot
echo "⏳ Attente du démarrage (max 30s)..."
RETRIES=0
MAX_RETRIES=30
while [ $RETRIES -lt $MAX_RETRIES ]; do
    if curl -s "http://127.0.0.1:3002/health" >/dev/null && curl -s "http://127.0.0.1:3003" >/dev/null; then
        echo "✅ Services en ligne."
        break
    fi
    echo -n "."
    sleep 1
    RETRIES=$((RETRIES+1))
done

if [ $RETRIES -eq $MAX_RETRIES ]; then
    echo "❌ Timeout: Les services n'ont pas démarré."
    tail -n 10 ../backend.log
    exit 1
fi

check_service "$BACKEND_URL" "Backend"
check_service "$FRONTEND_URL" "Frontend"

CORS_CHECK=$(curl -s -I -X OPTIONS "$BACKEND_URL/auth/me" \
    -H "Origin: $TEST_RUNNER_ORIGIN" \
    -H "Access-Control-Request-Method: GET" | grep -i "Access-Control-Allow-Origin")

if [[ $CORS_CHECK == *"$TEST_RUNNER_ORIGIN"* ]]; then
    echo "✅ CORS aligné sur $TEST_RUNNER_ORIGIN"
else
    echo "❌ ERREUR CORS : Le backend rejette l'origine du test runner."
    # echo "💡 Action requise : Mettre à jour app.js avec l'origine 127.0.0.1:4173"
    # exit 1 
    # COMMENTED OUT EXIT TO ALLOW AUTO FIX IF I WAS SMART, BUT PROTOCOL SAYS STOP.
    # User said: "Si le script échoue... tu as l'obligation de modifier le code"
    echo "💡 Action requise : Mettre à jour app.js avec l'origine 127.0.0.1:4173"
    exit 1
fi

# 5. Validation du Seed DB
echo "💾 Vérification de l'utilisateur de test..."
MONGO_CHECK=$(mongo --eval "db.users.findOne({email: 'test@mfai.app'})" journey --quiet)
if [[ $MONGO_CHECK == *"null"* ]]; then
    echo "❌ Utilisateur test@mfai.app absent. Lancement du seeding..."
    cd ./mf-back && npm run seed:test-user
    cd ..
else
    echo "✅ Utilisateur de test présent en DB."
fi

echo "🚀 [SUCCESS] Environnement synchronisé. Prêt pour l'audit E2E."
exit 0
