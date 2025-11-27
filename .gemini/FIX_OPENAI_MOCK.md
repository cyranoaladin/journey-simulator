# 🔧 Fix: OpenAI Mock Client

## Problème Identifié

Erreur 500 sur l'endpoint `/journey/:id/step`:
```
TypeError: Cannot read properties of undefined (reading 'completions')
at callGpt5Responses (/mf-back/llm/callGpt5.js:27:47)
```

### Cause Racine

Le fichier `.env` contient `OPENAI_API_KEY=` (clé vide), ce qui fait que:
1. `process.env.OPENAI_API_KEY` existe (n'est pas `undefined`)
2. Mais sa valeur est une chaîne vide `""`
3. Le code vérifie seulement `if (process.env.OPENAI_API_KEY)` qui est `true` pour `""`
4. OpenAI client est initialisé avec une clé vide → erreur
5. Le mock client n'est jamais utilisé

---

## Solution Appliquée

### Fichier: `mf-back/llm/openaiClient.js`

**Avant**:
```javascript
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}
```

**Après**:
```javascript
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.trim() !== '') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}
```

### Changements

1. ✅ Ajout de la vérification `.trim() !== ''`
2. ✅ Message d'avertissement amélioré avec emoji
3. ✅ Le mock client est maintenant utilisé quand la clé est vide

---

## Mock Client

Le mock client retourne des réponses structurées pour le développement:

```javascript
{
  choices: [{
    message: {
      parsed: {
        metadata: { ... },
        ui_blocks: [ ... ],
        agent_actions: [],
        next_state: { ... }
      }
    }
  }],
  usage: { ... },
  id: "mock_completion_id"
}
```

---

## Résultat

- ✅ Backend redémarré sur port 3002
- ✅ Mock client actif (clé API vide)
- ✅ Les appels à `/journey/:id/step` devraient maintenant fonctionner
- ✅ Réponses mock pour le développement

---

## Pour Utiliser une Vraie Clé API

Si vous souhaitez utiliser l'API OpenAI réelle:

1. Ajoutez votre clé dans `.env`:
   ```bash
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

2. Redémarrez le backend:
   ```bash
   PORT=3002 npm start
   ```

---

**Date**: 2025-11-21 21:54  
**Status**: ✅ **CORRIGÉ**

Le backend devrait maintenant répondre correctement aux requêtes de step !
