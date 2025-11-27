# 🐛 Fix Logique: Bouton "Complete Phase"

## Problème

Le bouton "Complete Phase" était visible dès le début de la phase, permettant aux utilisateurs de valider la phase et de minter le NFT sans avoir terminé les étapes ni obtenu le score requis.

## Solution

Ajout d'une validation stricte basée sur la dernière réponse de Zyno (`lastStep`).

### Logique Implémentée

```typescript
const canCompletePhase = useMemo(() => {
    // 1. Vérifier si une étape a été effectuée
    if (!lastStep) return false;
    
    // 2. Chercher un bloc d'évaluation
    const evalBlock = lastStep.ui_blocks?.find(b => b.kind === 'evaluation_block');
    if (!evalBlock) return false;
    
    // 3. Vérifier le score
    const score = Number(evalBlock.global_score || 0);
    const maxScore = Number(evalBlock.max_score || 100);
    const threshold = Math.max(70, Math.round(maxScore * 0.6)); // Seuil de 70% ou 60% dynamique
    
    return score >= threshold;
}, [lastStep]);
```

### Condition d'Affichage

Le bouton n'apparaît que si :
1. C'est la phase courante (`currentPhaseIndex === userProgress.completedPhases.length`)
2. **ET** la condition `canCompletePhase` est vraie.

## Résultat

- 🔒 Le bouton est masqué par défaut.
- ✅ Il n'apparaît qu'après une interaction réussie avec Zyno (score suffisant).
- 🛡️ Empêche le minting prématuré des certifications.

---

**Date**: 2025-11-22 07:00
**Status**: ✅ **CORRIGÉ**
