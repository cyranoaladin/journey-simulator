# Guide de Déploiement Production - Journey MFAI

## 🎯 Objectif
Déployer les corrections sur `journey.mfai.app` pour que les agents AI fonctionnent avec **OpenAI réel** et **RAG réel**.

---

## 📋 Commandes à Exécuter sur le Serveur

### 1. Connexion SSH
```bash
ssh root@moneyfactory-core
```

### 2. Mise à Jour du Code
```bash
cd /srv/journey-mfai
git pull origin main
```

**Attendu :** Vous devriez voir les commits récents :
- `fix: add production domain to CORS whitelist`
- `feat: add server env verification script`
- `fix: add missing demo mode mocks for agent logs`

### 3. Vérification de l'Environnement
```bash
bash verify-server-env.sh
```

**Ce script va :**
- ✅ Vérifier que `OPENAI_API_KEY` est définie
- ✅ Vérifier les variables RAG
- ✅ Ajouter les variables manquantes
- ⚠️ Vous alerter si la clé OpenAI est manquante

### 4. Configuration de la Clé OpenAI (SI NÉCESSAIRE)

Si le script indique que `OPENAI_API_KEY` est manquante :

```bash
nano /srv/journey-mfai/.env
```

**Ajoutez cette ligne :**
```bash
OPENAI_API_KEY=sk-proj-VOTRE_CLE_OPENAI_ICI
```

**Note :** Remplacez `sk-proj-VOTRE_CLE_OPENAI_ICI` par votre vraie clé OpenAI.

**Sauvegardez :** `Ctrl+O`, `Enter`, `Ctrl+X`

### 5. Vérification Finale du .env

```bash
cat /srv/journey-mfai/.env | grep -E "OPENAI_API_KEY|RAG_"
```

**Vous devriez voir :**
```
OPENAI_API_KEY=sk-proj-hOeeH7a3...
RAG_SEARCH_URL=http://127.0.0.1:8001/rag/query
RAG_API_KEY=MoneyFactory_2025_Secure_Token_X9
RAG_COLLECTION=mfai-knowledge
```

### 6. Redéploiement des Conteneurs

```bash
cd /srv/journey-mfai
docker compose -f docker-compose.prod.yml up -d --build
```

**Attendu :** Les conteneurs vont se reconstruire avec les nouvelles configurations.

### 7. Vérification des Logs

```bash
# Logs du backend (pour voir les appels OpenAI)
docker compose -f docker-compose.prod.yml logs -f mfai-api
```

**Recherchez :** 
- `[callGpt5] Calling model gpt-5.1`
- `[BaseAgent] Running with context`
- Pas d'erreurs `OPENAI_API_KEY is missing`

**Pour arrêter les logs :** `Ctrl+C`

### 8. Test RAG

```bash
# Vérifier que le RAG est accessible
curl -X POST http://127.0.0.1:8001/rag/query \
  -H "x-api-key: MoneyFactory_2025_Secure_Token_X9" \
  -H "Content-Type: application/json" \
  -d '{"q":"web3","collection":"mfai-knowledge","k":3}'
```

**Attendu :** Une réponse JSON avec des snippets.

---

## ✅ Vérification Finale

### Test dans le Navigateur

1. **Ouvrir :** `https://journey.mfai.app`
2. **Cliquer :** "Try Demo"
3. **Cliquer :** "Load Demo" (en haut à droite)
4. **Sélectionner :** Un journey (ex: "Cognitive Activation Hub")
5. **Cliquer :** "Continue Journey"
6. **Vérifier :** 
   - Zyno répond (pas de loading infini)
   - Les réponses sont **pertinentes** (pas du texte générique)
   - Pas d'erreurs 404 dans la console (F12)

### Console du Navigateur (F12)

**Bon signe :**
```
[Demo Mode] Mocking request to /user/profile
[API] Requesting: /journey/step
[API] Response for /journey/step: 200
```

**Mauvais signe :**
```
Failed to load resource: 404
OPENAI_API_KEY is missing
```

---

## 🚨 Dépannage

### Problème : "OPENAI_API_KEY is missing"
```bash
# Vérifier que la clé est dans .env
grep OPENAI_API_KEY /srv/journey-mfai/.env

# Si vide, l'ajouter
nano /srv/journey-mfai/.env

# Redémarrer
docker compose -f docker-compose.prod.yml restart mfai-api
```

### Problème : RAG ne répond pas
```bash
# Vérifier que le RAG tourne
curl http://127.0.0.1:8001/health

# Si erreur, vérifier le service RAG
systemctl status rag-api
```

### Problème : Erreurs CORS
```bash
# Vérifier les logs
docker compose -f docker-compose.prod.yml logs mfai-api | grep CORS

# Le domaine journey.mfai.app doit être dans la whitelist
```

---

## 📊 Statut Attendu

Après déploiement :
- ✅ Backend utilise OpenAI réel
- ✅ Backend utilise RAG réel
- ✅ CORS autorise journey.mfai.app
- ✅ Zyno répond avec de vraies analyses
- ✅ Pas d'erreurs 404

**Le MVP est prêt pour les investisseurs ! 🚀**
