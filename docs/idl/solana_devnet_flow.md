# Solana devnet — Flow (MVP)

- /api/tx/prepare: construit une TX v0 (base64) pour transfert simple (payer→to). TEST_MODE bypass la signature.
- /api/mint/simulate: calcule une estimation de frais et renvoie un squelette (placeholders UMI/MPL pour Phase 2b).
- /api/mint/execute: nécessite MINTER_SECRET_KEY et KILL_SWITCH=0; signe via SimSigner (web/src/server/signer.ts) et renvoie une signature.

Sécurité
- Jamais de clé en clair côté client. Secret minter via .env serveur uniquement.
- KILL_SWITCH pour bloquer en urgence.
