<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Solana devnet — Flow (MVP)

- /api/tx/prepare: construit une TX v0 (base64) pour transfert simple (payer→to). TEST_MODE bypass la signature.
- /api/mint/simulate: calcule une estimation de frais et renvoie un squelette (placeholders UMI/MPL pour Phase 2b).
- /api/mint/execute: nécessite MINTER_SECRET_KEY et KILL_SWITCH=0; signe via SimSigner (web/src/server/signer.ts) et renvoie une signature.

Sécurité
- Jamais de clé en clair côté client. Secret minter via .env serveur uniquement.
- KILL_SWITCH pour bloquer en urgence.

## 👥 Contributeurs

**Équipe Money Factory AI** :

- **Kamel BEN RHOUMA** : Cofondateur et Full Stack Developer
- **Alaeddine BEN RHOUMA** : Cofondateur et Chief Operating & Blockchain Officer
- **Adem Behajaissa** : Backend Stack Developer
