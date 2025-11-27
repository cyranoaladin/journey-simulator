# 🔧 Fix: DevTools s'ouvre automatiquement

## Problème

Les DevTools (console de développement) s'ouvrent automatiquement et de manière répétée pendant l'utilisation de l'application.

---

## Causes Possibles

### 1. Pause on Exceptions Activé
Les DevTools peuvent s'ouvrir automatiquement si "Pause on exceptions" est activé et qu'il y a des erreurs dans le code.

### 2. Breakpoints Actifs
Des breakpoints peuvent être définis dans le code source.

### 3. Extensions de Navigateur
Certaines extensions (React DevTools, Redux DevTools, etc.) peuvent déclencher l'ouverture.

### 4. Erreurs en Boucle
Des erreurs répétées peuvent déclencher l'ouverture automatique.

---

## Solutions

### Solution 1: Désactiver "Pause on Exceptions"

1. **Ouvrez les DevTools** (F12)
2. Allez dans l'onglet **Sources**
3. Cherchez l'icône de pause (⏸️) en haut à droite
4. Cliquez dessus pour désactiver "Pause on caught exceptions"
5. Assurez-vous que les deux options sont **décochées**:
   - ❌ Pause on exceptions
   - ❌ Pause on caught exceptions

### Solution 2: Vider les Breakpoints

1. **Ouvrez les DevTools** (F12)
2. Allez dans l'onglet **Sources**
3. Dans le panneau de droite, section **Breakpoints**
4. Cliquez sur "Remove all breakpoints" ou désactivez-les un par un

### Solution 3: Désactiver les Extensions

1. **Ouvrez une fenêtre de navigation privée** (Ctrl+Shift+N)
2. Les extensions sont désactivées par défaut en mode privé
3. Testez si le problème persiste

### Solution 4: Réinitialiser les DevTools

1. **Ouvrez les DevTools** (F12)
2. Cliquez sur l'icône ⚙️ (Settings)
3. Allez dans **Preferences**
4. Cliquez sur **Restore defaults and reload**

### Solution 5: Vider le Cache du Navigateur

1. **Ctrl+Shift+Delete** (ou Cmd+Shift+Delete sur Mac)
2. Sélectionnez "Depuis toujours"
3. Cochez:
   - Cookies et données de site
   - Images et fichiers en cache
4. Cliquez sur "Effacer les données"
5. Redémarrez le navigateur

---

## Vérification

Après avoir appliqué une solution:

1. Fermez complètement le navigateur
2. Rouvrez-le
3. Accédez à `http://localhost:5173`
4. Vérifiez si les DevTools s'ouvrent encore automatiquement

---

## Si le Problème Persiste

### Vérifier les Erreurs Console

1. Ouvrez les DevTools manuellement (F12)
2. Allez dans l'onglet **Console**
3. Notez les erreurs qui apparaissent
4. Partagez-les pour investigation

### Essayer un Autre Navigateur

Testez avec un navigateur différent (Chrome, Firefox, Edge) pour voir si le problème est spécifique au navigateur.

---

## Notes

- Ce comportement est généralement lié aux paramètres des DevTools, pas au code de l'application
- Les erreurs console normales (warnings, logs) ne devraient pas déclencher l'ouverture automatique
- Seuls les breakpoints et "Pause on exceptions" peuvent causer ce comportement

---

**Date**: 2025-11-21 21:57  
**Recommandation**: Commencez par la **Solution 1** (désactiver Pause on Exceptions)
