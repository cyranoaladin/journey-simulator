# 🎨 Fix UI: Menus Déroulants Illisibles

## Problème

Les menus déroulants (select) pour "Mode" et "Tone" dans la section Zyno étaient illisibles.
Cause : Texte blanc sur fond blanc (ou noir sur noir) dû à l'absence de styles explicites pour les options et le fond du select.

## Solution

Mise à jour des classes CSS des `<select>` dans `PhaseSection.tsx` pour supporter explicitement le mode clair et sombre.

### Classes Appliquées

```css
/* Fond et Texte */
bg-slate-100 dark:bg-slate-800
text-slate-900 dark:text-white

/* Bordures et Focus */
border border-slate-200 dark:border-slate-700
focus:outline-none focus:ring-2 focus:ring-primary-500
```

### Améliorations Supplémentaires

- Capitalisation des labels (ex: "discovery" → "Discovery")
- Ajout d'états de focus pour l'accessibilité

## Résultat

- ✅ Lisible en mode Clair (Fond gris clair, texte foncé)
- ✅ Lisible en mode Sombre (Fond gris foncé, texte blanc)
- ✅ Design cohérent avec le reste de l'interface

---

**Date**: 2025-11-22 06:52
**Status**: ✅ **CORRIGÉ**
