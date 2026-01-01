# Spécificités des Frais de Priorité Solana (v1.17)

## Mécanisme de Calcul
Depuis la mise à jour v1.17, le calcul des frais de priorité sur Solana suit la règle suivante :
`PriorityFee = ComputeBudget * MicroLamportsPerComputeUnit`

## Valeurs de Référence
- **Base Fee**: 5000 Lamports par signature.
- **Min Priority Fee**: 0 (optionnel).
- **Recommended Priority Fee** (Congestion High): 10,000 micro-lamports per CU.

## Règle MFAI
Dans le contexte de Money Factory AI, tous les agents doivent recommander par défaut l'utilisation de l'API `getRecentPrioritizationFees` pour estimer dynamiquement ces frais avant chaque transaction critique (Mint, Swap).
