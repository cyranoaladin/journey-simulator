# 🔙 Rollback vers GPT-4o

## Problème Critique

Suite à une investigation approfondie, il a été confirmé que le projet actuel **n'a pas accès au modèle GPT-5.1**.
Les tentatives d'utilisation de l'API `responses.create` avec `gpt-5.1` se soldent systématiquement par une erreur 403 :
```
Project ... does not have access to model gpt-5.1
```

## Solution Appliquée

Pour rétablir le service immédiatement, un rollback vers **GPT-4o** a été effectué.

### 1. Fichier `.env`
```bash
LLM_MODEL_NAME=gpt-4o
```

### 2. Fichier `mf-back/llm/callGpt5.js`
- Retour à l'utilisation de l'API `openai.chat.completions.parse` (compatible GPT-4o).
- Suppression des paramètres spécifiques à GPT-5.1 (`reasoningEffort`, `verbosity`, `text.format`).
- Nettoyage du code et des commentaires.

## Impact

- ✅ Le service devrait être opérationnel immédiatement.
- ❌ Les fonctionnalités spécifiques à GPT-5.1 (raisonnement avancé, outils custom grammar) ne sont pas disponibles.
- ℹ️ Le nom de la fonction `callGpt5Responses` a été conservé pour éviter de casser les imports, mais elle appelle GPT-4o.

---

**Date**: 2025-11-22 07:35
**Status**: ✅ **ROLLBACK EFFECTUÉ**
