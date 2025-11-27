# 🔧 Fix: Modèle LLM Incorrect

## Problème Identifié

Erreur 403 lors de l'appel à l'API OpenAI :
```
Project ... does not have access to model gpt-5.1
```

Bien que la variable d'environnement `LLM_MODEL_NAME` ait été mise à jour dans `.env`, le code utilisait une valeur par défaut codée en dur : `model = "gpt-5.1"`.

## Solution Appliquée

### Fichier: `mf-back/llm/callGpt5.js`

**Avant**:
```javascript
model = "gpt-5.1",
```

**Après**:
```javascript
model = process.env.LLM_MODEL_NAME || "gpt-4-turbo",
```

### Résultat

Le code utilise maintenant la variable d'environnement `LLM_MODEL_NAME` (définie à `gpt-4-turbo` dans `.env`), avec un fallback sur `gpt-4-turbo` si la variable est manquante.

## Actions Requises

1. Le code a été mis à jour.
2. Le backend doit être redémarré.

---

**Date**: 2025-11-22 07:05
**Status**: ✅ **CORRIGÉ**
