# 🚀 Migration vers GPT-5.1 (Responses API) - Mise à jour

## Contexte

GPT-5.1 est un nouveau modèle "flagship" qui nécessite l'utilisation de l'API `responses` au lieu de l'API `chat.completions` traditionnelle.
L'utilisation de l'API Chat Completions avec le modèle `gpt-5.1` provoquait une erreur 403 `model_not_found`.

## Changements Effectués

### 1. Mise à jour de `.env`
Retour à l'utilisation explicite de `gpt-5.1`.
```bash
LLM_MODEL_NAME=gpt-5.1
```

### 2. Refonte de `mf-back/llm/callGpt5.js`
Migration complète de la fonction `callGpt5Responses` pour utiliser `openai.responses.create`.

**Nouvelle Signature d'Appel (Corrigée):**
```javascript
const response = await openai.responses.create({
  model: "gpt-5.1",
  input: "SYSTEM INSTRUCTIONS: ... \n\n USER REQUEST: ...",
  reasoning: { effort: "medium" },
  text: { 
      verbosity: "medium",
      format: responseFormat // Déplacé dans text.format
  }
});
```

**Gestion de la Réponse :**
- Extraction du contenu depuis `response.output_text` (ou `response.output`).
- Parsing manuel du JSON.

## Points d'Attention

- Le paramètre `response_format` n'est plus supporté au niveau racine, il doit être passé dans `text.format`.
- L'input est passé comme une chaîne unique (concaténation System + User) pour l'instant, bien que l'API puisse supporter des structures plus complexes.

---

**Date**: 2025-11-22 07:20
**Status**: ✅ **MIGRÉ & CORRIGÉ**
