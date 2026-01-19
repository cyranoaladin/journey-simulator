<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Specificites des Frais de Priorite Solana (v1.17)

## Mecanisme de Calcul
Depuis la mise a jour v1.17, le calcul des frais de priorite sur Solana suit la regle suivante :
`PriorityFee = ComputeBudget * MicroLamportsPerComputeUnit`

## Valeurs de Reference
- **Base Fee**: 5000 Lamports par signature.
- **Min Priority Fee**: 0 (optionnel).
- **Recommended Priority Fee** (Congestion High): 10,000 micro-lamports per CU.

## Regle MFAI
Dans le contexte de Money Factory AI, tous les agents doivent recommander par defaut l'utilisation de l'API `getRecentPrioritizationFees` pour estimer dynamiquement ces frais avant chaque transaction critique (Mint, Swap).
