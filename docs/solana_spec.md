<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Spécifications Solana (MVP devnet)

Objectif: prouver un flux réel devnet minimal (simulate/execute), intégration wallet, et pratiques de sécurité.

## Paramètres & env
- `SOLANA_CLUSTER=devnet`
- `SOLANA_RPC_URL` (serveur côté), `NEXT_PUBLIC_SOLANA_RPC_URL` (client côté)
- `MINTER_SECRET_KEY` (base58) pour l’exécution contrôlée serveur
- `KILL_SWITCH=1|0` (bloque l’exécution quand 1)

## Endpoints (backend)
- `POST /api/mint/simulate`
  - body: `{ recipient, name, symbol, uri }`
  - réponse: `{ ok, sim: { estFeeLamports, riskScore, txB64?, network } }`
- `POST /api/mint/execute`
  - headers: `x-user-id` (optionnel)
  - body: `{ sim: { ok, estFeeLamports, riskScore, txB64?, network } }`
  - garde‑fous: `KILL_SWITCH`, `MINTER_SECRET_KEY` requis
  - logs MintLog (best-effort)
- `GET /api/mint/last` (optionnel filtre par header ou query userId)
- `POST /api/tx/prepare` (exemple transfert devnet minimal)

## Wallet (frontend)
- @solana/wallet-adapter (Phantom, etc.)
- Page `/wallet` + provider global (connexion/affichage adresse)
- Transaction signée côté client (non-custodial)

## Sécurité
- Jamais de clé en clair côté client
- `MINTER_SECRET_KEY` en .env serveur
- `KILL_SWITCH` activable en prod
- Headers de sécurité (CSP stricte)

## Observabilité
- Logs Admin: `AgentLog` (actions step/submit), `MintLog` (signature, réseau)
- Pages: `/admin/logs`, `/admin/users`, `/admin/state`

## vNext (post-MVP)
- IDL/Program SPL personnalisé pour NFT/stake (on-chain), documentation IDL et comptes
- Intégration UMI complète (signer isolé, KMS/HSM)
- Tests sur testnet/mainnet partitions (selon budget)

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
