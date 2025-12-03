Je vais structurer le retour comme un **audit complet**, mais en gardant un focus fort sur la **couche web3** (wallets, NFT, Pass, lien on-chain/off-chain), tout en signalant les points d’architecture généraux qui impactent justement cette couche.

---

## I. Vue d’ensemble – ce que fait vraiment le monorepo aujourd’hui

D’après les fichiers :

* **Monorepo à 3 paquets principaux**

  * `journey-simulator/` : front Vite + React, expérience Zyno, multi-agents, UI Blocks, scoring, XP, NFT “Proof-of-Skill” simulés, etc.
  * `mf-back/` : API Express + Mongo, authentification, gestion des users, des journeys, des scores, des agents, du DAO “off-chain”.
  * `web/` : Next.js 14 + Prisma + Postgres, portail compagnon (admin, pitch, métriques, endpoints mint/stake/DAO, SIWS, etc.).

* **Logique métier visée** (cf. GUIDE_PLATFORM, cahiers des charges) :

  * Parcours multi-phases orchestrés par Zyno (agents LLM).
  * Calcul d’XP, tokens $MFAI, preuves de compétences (NFT “Proof-of-Skill”), staking, “DAO sandbox”.
  * À terme : **Pass** NFT pour accéder à des parcours avancés et lier proprement les assets on-chain aux parcours off-chain.

* **État actuel de la couche web3** :
  Beaucoup d’éléments sont **modélisés** (types, endpoints, flows UX), mais **implémentés en “simulation”** :

  * `journey-simulator/src/utils/blockchain.ts` : simulateur local (faux mint, faux staking, faux vote DAO).
  * `web/app/api/mint/*` + `web/packages/agents/tools/solana.ts` : pipeline mint/execute conçu mais encore semi-stubbé.
  * `web/app/api/stake/simulate` : pure simulation côté backend.
  * `web/app/api/auth/siws/verify` : ne vérifie ni la signature ni le challenge, renvoie un JWT factice.

👉 Techniquement, *la logique* est bien pensée, mais **le projet n’est pas encore un MVP “100 % web3 réel”**. On est sur un MVP de “simulation web3” avec une architecture prête à accueillir du “vrai” on-chain.

---

## II. Architecture technique – points forts et zones fragiles

### 1. Points forts

* **Séparation des responsabilités** claire :

  * Vite/React pour l’expérience interactive “Zyno + UI Blocks”.
  * Express/Mongo pour la persistance métier (users, progress, DAO, logs d’agents).
  * Next/Prisma/Postgres pour la partie “portail web3 + admin + mint logs”.

* **Cahiers des charges très structurés**

  * `cahier_charges_agents.md`, `cahier_charges_ameliorations_UI_UX.md`, `GUIDE_PLATFORM.md` cadrent bien la vision produit, la granularité XP, les rôles des agents, et l’intégration Solana devnet.
  * On voit clairement la volonté de **multi-agents orchestrés**, de RAG, et de coupler “skill” off-chain + “preuves” on-chain.

* **Monorepo cohérent**

  * Docker compose pour lancer les trois services ensemble.
  * OpenAPI pour l’API Journey Simulator.
  * Tests, coverage, Storybook, etc. prévus côté front/Next.

### 2. Faiblesses structurantes (côté web3)

* **Redondance / flou sur les “journeys” et les users**

  * `mf-back` a un modèle `Journey` (Mongo) avec `user_id`, `user_wallet`, `journey_type`, phases, etc.
  * `web` a un modèle `Journey` (Prisma) avec `title`, `userId`, etc.
    → Il n’y a pas encore de **lien explicite et stable** entre :

    * l’email (ou user back),
    * le wallet Solana,
    * les NFTs pass/proof-of-skill,
    * les “journeys” Next vs “journeys” Express.

* **Multiplication des sources de vérité pour le “progress”**

  * `mf-back` gère `User.total_xp`, `current_level`, `completed_phases`.
  * `web/app/journey/user-progress/route.ts` maintient un `progress` global… en mémoire process, identique pour tous les utilisateurs (non persisté, non multi-user).
    → C’est clairement un **stub** pour démo. C’est acceptable en sandbox, mais pas pour un MVP sérieux.

* **Des imports cassés côté Next**

  * `app/api/health` et `app/api/metrics` appellent `@/server/metrics`, fichier absent dans la tree.
  * `agents/tools/solana` importe dynamiquement `@/server/signer`, également absent.
    → Ces routes sont aujourd’hui **sources d’erreurs 500** dès qu’elles sont requêtées en prod.

* **Front Vite : blockchain “tout en local”**

  * `blockchain.ts` crée une `Connection` vers `https://api.devnet.solana.com`, mais ne fait que des mints simulés (“simulatedMint = Keypair.generate().publicKey.toBase58()”), staking simulé, vote DAO simulé, etc.
    → Cela donne une impression de web3, mais **il n’y a pas de transaction réelle envoyée à devnet** dans ce code.

---

## III. Audit “100 % web3” – état des lieux et problèmes à corriger

### 1. Intégration Solana côté front (`journey-simulator`)

* `utils/blockchain.ts` :

  * **Cluster hardcodé** : `SOLANA_CLUSTER = 'devnet'`, endpoint `https://api.devnet.solana.com`.
  * **Fonctions critiques** :

    * `mintProofOfSkill(wallet, metadata)` :

      * vérifie juste la présence de `wallet.publicKey`,
      * “simulate asynchronous metadata upload and minting delay” (sleep),
      * log des `attributes`,
      * génère un `Keypair` local et renvoie son `publicKey.toBase58()` comme pseudo-mint,
      * renvoie `success: true, signature: 'simulated_mint_' + timestamp`.
    * `stakeMFAI(...)` : renvoie aussi un `signature: 'simulated_stake_' + Date.now()`.
    * `submitDAOVote(...)` : renvoie `signature: 'simulated_vote_' + Date.now()`.
    * `getTransactionDetails` : ici pour le coup, fait bien un `connection.getTransaction(signature)` sur la vraie connexion.

* Conclusion :

  * **Tout ce qui touche à la création on-chain est simulé**.
  * Seul `getTransactionDetails` parle à Solana, mais aucun des “signature” simulées ne correspondent à des transactions réellement soumises.

**Problèmes** :

1. **Risque de mismatch “marketing vs réalité technique”**
   Si on annonce “Proof-of-Skill NFT sur Solana devnet”, alors qu’en réalité on génère une clé aléatoire côté front, cela pose un problème de transparence vis-à-vis des partenaires/investisseurs.

2. **Évolutivité limitée**
   Ce design ne permet pas de :

   * utiliser des standards Metaplex (collection, Token Metadata),
   * tracer les mints dans un explorer,
   * lier ces NFTs à des Pass d’accès.

3. **Sécurité / best practices**

   * Le front **ne doit pas** construire arbitrairement des transactions de mint signées par un secret côté client.
   * Le front doit soit :

     * appeler une API qui renvoie une transaction pré-construite à signer par le wallet user,
     * soit déclencher un mint géré par un **minter server-side** qui envoie un NFT à l’adresse du user (signé par une clé serveur).

---

### 2. Endpoints web3 côté Next (`web/app/api/*`)

#### a) Mint pipeline

* `web/app/api/mint/simulate/route.ts` :

  * Valide le body avec zod (`recipient`, `name`, `symbol`, `uri`).
  * Appelle `simulateTx` depuis `agents/tools/solana`.
  * Retourne le résultat (estimation frais + `txB64` fake).

* `web/packages/agents/tools/solana.ts` :

  * `simulateTx` :

    * lit `process.env.SOLANA_CLUSTER || 'devnet'`,
    * retourne `{ ok: true, estFeeLamports: 5000, riskScore: 0.12, txB64: 'AQID', network }`.
    * Pas de construction réelle d’instructions Metaplex.
  * `executeReward(sim)` :

    * vérifie `KILL_SWITCH`,
    * exige `MINTER_SECRET_KEY`,
    * importe `signBase64Transaction` depuis `@/server/signer` (absent),
    * appelle ce signer sur `txB64` et renvoie `txSig`.
  * `buildMetadataInstructionPlaceholder()` : simple placeholder.

* `web/app/api/mint/execute/route.ts` :

  * Reçoit `sim` (résultat de simulate).
  * Vérifie `KILL_SWITCH`.
  * Appelle `executeReward(sim)`.
  * Tente d’enregistrer un log de mint dans `prisma.mintLog`.

**Problèmes** :

1. **Pipeline incomplet** :

   * `signBase64Transaction` n’est pas défini dans le repo → ce endpoint ne peut pas fonctionner en l’état.
   * `txB64` ne correspond à aucune transaction valide (simple `'AQID'`).

2. **Mauvaise gestion du secret de mint** :

   * `MINTER_SECRET_KEY` lu côté serveur, c’est correct *si et seulement si* ce code n’est jamais bundle côté client.
   * Il faut s’assurer que ce module n’est importé que depuis des handlers `route.ts` server-side (ce qui semble être le cas).
   * Mais l’absence de `server/signer` laisse penser que la sécurisation du minter n’est pas finalisée.

3. **Couplage faible avec la logique métier** :

   * Le `spec` de mint n’est pas relié aux XP, scores ou achievements du user.
   * Ce sont de simples logs d’exécution, sans lien direct avec un “journey complet”.

#### b) Staking

* `web/app/api/stake/simulate/route.ts` :

  * Renvoie `staked: amount`, `votingPowerDelta: amount * 2`.
  * Pas de lien avec un véritable compte staking, ni avec des SPL tokens.

* `/app/api/stake/execute/route.ts` : non présent → pipeline staking inexistant.

#### c) Auth SIWS

* `web/app/api/auth/siws/challenge/route.ts` :

  * Génère un `challenge = crypto.randomUUID()`.
  * Renvoie `message = "Sign this message to authenticate. Nonce: <challenge>"` + `expiresAt = now + 5 min`.
  * Aucun stockage du challenge côté serveur.

* `web/app/api/auth/siws/verify/route.ts` :

  * zod : `{ address, signature, challenge? }`.
  * **Ne vérifie PAS** :

    * la validité cryptographique de la signature,
    * la cohérence `address` ↔ `publicKey` dans la signature,
    * ni la valeur/expiration du `challenge`.
  * Renvoie directement `{ token: 'stub.jwt' }`.

**Problème critique** :

> Toute personne peut obtenir un “token” en envoyant n’importe quelle chaîne en `address` / `signature`.
>
> → C’est acceptable pour une maquette, mais **pas pour un MVP démontré à des partenaires web3**.

---

### 3. Lien on-chain ↔ off-chain (Pass, Proof-of-Skill, journeys)

#### a) Côté front (Vite)

* Dans `journey-simulator/src/store/journeyStore.ts` :

  * Fonction `mintNFT(nftName, wallet)` :

    * construit un `metadata` (nom, descr. Proof-of-Skill, image placeholder, attributs),
    * appelle `mintProofOfSkill(wallet, metadata)`,
    * si succès, ajoute :

      * `nftName` à `userProgress.nfts`,
      * `{ name, address: mintAddress, signature }` à `userProgress.nftMints`.

  * `updateProgress(xp, nfts, mfai)` :

    * met à jour `totalXP`, `mfaiTokens`, et fait évoluer un `passLevel` via `derivePassLevel`.

  * `derivePassLevel` :

    * utilise `totalXP` + nombre de NFTs pour assigner `Free / Gold / Platinum / Diamond`, etc.

**Constat** :

* La logique métier de **“pass level”** est déjà là, mais entièrement **off-chain**, calculée à partir de valeurs simulées.
* C’est un très bon point de départ… **à condition de relier ce pass level à de vrais NFTs (Pass)**.

#### b) Côté backend

* `mf-back/models/Journeys.js` :

  * `user_wallet: String, required: true`.
  * `journey_type`, `phases_status`, `achievements` (avec `reward_claimed`, etc.).
  * On est clairement prêt à stocker “quels rewards ont été débloqués”.

* `mf-back/models/user.js` (non détaillé ici, mais on voit `total_xp`, etc.) :

  * La structure est adéquate pour être **source de vérité** sur le profil “skill & XP” d’un user.

* `web/prisma/schema.prisma` :

  * `User`, `Journey`, `Achievement`, `MintLog`, `AgentLog`, etc., même si le schema exact est partiellement tronqué.
  * On voit déjà un modèle `MintLog` pour tracer les mints exécutés via `/api/mint/execute`.

**Problème actuel** :

* **Pas de modèle unifié `Wallet` / `NftPass` / `JourneyAccess`** côté Prisma.
* Le lien `wallet_address` est stocké dans Mongo (mf-back), alors que les logs de mint (donc l’on-chain) sont en Postgres (Next).
* Il manque la “colonne vertébrale” : *un user = un ou plusieurs wallets, possédant certains NFTs (Pass, Proof-of-Skill), qui débloquent certains journeys*.

Je maintiens la recommandation que je t’ai donnée précédemment :

> Ajouter dans Prisma :
> `Wallet`, `NftPass`, `JourneyAccess`, et faire de `Wallet` le pivot entre les logs on-chain (MintLog) et les parcours off-chain (Journey, AgentLog).

---

## IV. Recommandations détaillées – pour en faire un véritable MVP web3 robuste

Je vais classer les actions par priorité.

### P0 – À corriger avant toute démonstration “web3 sérieux”

1. **Implémenter réellement SIWS (Sign-In With Solana)**

   * Stocker le `challenge` :

     * soit en mémoire (Map avec TTL) pour une première version,
     * soit en Redis ou dans une table Prisma `SiwsChallenge` avec `address`, `challenge`, `expiresAt`.
   * Vérifier la signature :

     * reconstruire le message exact (incluant domaine, chaîne, nonce, expiration),
     * utiliser `@solana/web3.js` + `tweetnacl` pour vérifier que `signature` correspond bien à `message` signé par `address`.
   * Rejeter toute requête si :

     * `challenge` inconnu ou expiré,
     * signature invalide,
     * domaine ou `nonce` ne correspond pas à ce qui a été émis.
   * Émettre un vrai **token JWT** contenant au minimum :

     * `sub = walletAddress`,
     * éventuellement `userId` Prisma lié à ce wallet.

2. **Rendre la pipeline mint cohérente (au moins en devnet)**

   * Implémenter un vrai `simulateTx` :

     * créer un client UMI ou `@metaplex-foundation/js` côté serveur,
     * construire une transaction (non signée) avec les instructions Token Metadata (collection, NFT, URI),
     * sérialiser la transaction (`txB64`),
     * estimer les frais (ou au moins mettre un placeholder cohérent).
   * Implémenter un vrai `executeReward` :

     * deux approches possibles :

       1. **Server signer** (minter unique) :

          * `MINTER_SECRET_KEY` stocké en env,
          * désérialiser `txB64`, signer avec minter, envoyer sur le cluster ;
       2. **User signer** :

          * renvoyer `txB64` au client,
          * le wallet user signe et envoie la transaction,
          * l’API reçoit ensuite la signature pour la logger.
   * Dans tous les cas :

     * brancher `journey-simulator` sur **les endpoints Next** `/api/mint/simulate` + `/api/mint/execute` au lieu d’un `mintProofOfSkill` purement local.

3. **Enlever ou réparer les imports cassés**

   * Soit implémenter enfin `@/server/metrics` et `@/server/signer`,
   * soit retirer les routes `/api/metrics` et les appels à `signBase64Transaction` qui ne sont pas encore prêts.
   * L’objectif : aucun **500 structural** sur des routes documentées ou accessibles.

4. **Aligner le discours** :

   * Tant que le mint reste simulé, il faut explicitement mentionner dans l’UI qu’il s’agit d’un **mode démo / simulation**, pas d’un vrai mint on-chain.
   * Dès que la pipeline est opérationnelle en devnet, changer ce wording et relier au scanner (Solscan/Helius, etc.).

---

### P1 – Structurer proprement le lien on-chain ◀▶ off-chain

1. **Modèle Prisma “web3”**

   Ajouter au `schema.prisma` (ou le compléter si c’est déjà partiellement présent) :

   ```prisma
   model Wallet {
     id        String   @id @default(cuid())
     address   String   @unique
     chain     String   // "solana"
     createdAt DateTime @default(now())
     updatedAt DateTime @updatedAt

     user      User?    @relation(fields: [userId], references: [id])
     userId    String?

     hasActivePass Boolean @default(false)
     lastPassCheck DateTime?
     nftPasses    NftPass[]
   }

   model NftPass {
     id             String   @id @default(cuid())
     wallet         Wallet   @relation(fields: [walletId], references: [id])
     walletId       String
     mintAddress    String   @unique
     collectionMint String
     tier           String
     isActive       Boolean  @default(true)
     firstSeenAt    DateTime @default(now())
     lastCheckedAt  DateTime @default(now())
   }

   model JourneyAccess {
     id        String   @id @default(cuid())
     journey   Journey  @relation(fields: [journeyId], references: [id])
     journeyId String
     wallet    Wallet   @relation(fields: [walletId], references: [id])
     walletId  String
     nftPass   NftPass? @relation(fields: [nftPassId], references: [id])
     nftPassId String?
     grantedAt DateTime @default(now())
     tierUsed  String?
   }
   ```

   Et côté `Journey` (Prisma), ajouter un champ :

   ```prisma
   requiredTier String? // "BUILDER" | "GROWTH" | etc.
   ```

   Cela permet de dire : *“Ce parcours requiert au minimum un Pass de tier X”*, vérifiable on-chain.

2. **Synchroniser Mongo (mf-back) avec Prisma (web)**

   * Dans `mf-back/models/user.js`, s’assurer qu’on stocke bien :

     * `wallet_address`,
     * éventuellement un `prismaUserId` si l’on veut un pont explicite.
   * Lorsqu’un user est authentifié via SIWS côté Next :

     * upsert sur Prisma.User,
     * lier `Wallet` (Solana address) à ce `User`,
     * informer `mf-back` (via un endpoint interne) du mapping `wallet_address ↔ user_id` si nécessaire.

3. **Design on-chain du Pass**

   * Créer une **collection NFT unique “MFAI Pass”** (Metaplex Token Metadata).
   * Minter les Pass via une Candy Machine (ou pipeline UMI minimal) avec un attribut `tier`.
   * Côté Next :

     * `getAssetsByOwner` via un RPC DAS (Helius, etc.) pour savoir quels Pass le wallet possède,
     * peupler `Wallet.hasActivePass`, `NftPass`, etc.
   * Côté `mf-back` :

     * lors de l’accès à certains parcours premium, vérifier via l’API Next (ou en direct via Prisma) que l’utilisateur possède le Pass adéquat.

4. **Recentrer la logique “passLevel”**

   * Actuellement, `derivePassLevel` dépend de `totalXP` + `nombre de NFTs`.
   * Proposition :

     * garder cette logique pour un **“skill level” off-chain** (gamification pure UX),
     * et réserver les **tiers d’accès** (`BUILDER`, `GROWTH`, `DAO`, `FOUNDER`) au **Pass on-chain**.

---

### P2 – Renforcer l’expérience produit et la robustesse globale

1. **UI/UX côté web3**

   * Dans les écrans de mint :

     * afficher `network` (devnet / mainnet),
     * montrer `estFeeLamports` converti en SOL,
     * une fois mint exécuté, proposer un lien “Voir sur exploreur” avec l’URL construite à partir de la signature.
   * Dans le dashboard Journey :

     * section “Activité on-chain” :

       * liste des Proof-of-Skill NFTs (nom, image, mint, lien scanner),
       * logs de staking (même simulés au début) et votes DAO.

2. **Validation et sécurité API**

   * Côté `mf-back` :

     * utiliser un validateur (zod, joi) pour les corps de requête des routes critiques (`/complete-phase`, `/submit`, etc.),
     * uniformiser les réponses (`{ success: boolean, data?: ..., error?: ... }`).
   * Côté Next :

     * strict typage des handlers `route.ts`,
     * aucune fuite d’infos sensibles dans les logs (`console.*`).

3. **Instrumentation & métrologie**

   * Remettre en place `@/server/metrics` comme un petit module qui :

     * maintient des compteurs (nombre de mints simulés/réels, erreurs, temps moyen de réponse),
     * est exposé via `/api/metrics` pour dashboards internes.
   * Intégrer éventuellement des IDs de corrélation (`x-request-id`) dans les logs.

4. **Clarté documentaire**

   * Ajouter deux documents dans `docs/` :

     * `ONCHAIN_MODEL.md` :

       * description de la collection Pass,
       * description des NFTs Proof-of-Skill,
       * comment les logs (MintLog, NftPass, JourneyAccess) sont reliés.
     * `AUTH_AND_WALLET.md` :

       * flow SIWS,
       * mapping wallet ↔ user,
       * interactions avec `mf-back`.

---

## V. Conclusion – Sur quoi capitaliser et quoi corriger en priorité

En l’état, ton projet :

* a une **vision claire et cohérente** de ce que doit être un “Journey Simulator” multi-agents orienté web3,
* dispose d’une **architecture logique bien pensée** (séparation Vite / Express / Next, cahiers des charges détaillés, OpenAPI, etc.),
* mais reste, sur la partie **web3**, au stade de **simulation structurée** plutôt que d’implémentation on-chain complète.

Pour en faire un **MVP “investor-grade” et vraiment web3** :

1. **Sécuriser l’auth SIWS** et rendre l’authentification par wallet réellement cryptographiquement vérifiable.
2. **Finaliser au moins un flux complet on-chain** (mint de Proof-of-Skill ou Pass) en devnet, du simulate jusqu’au tx signature visible sur un explorer.
3. **Structurer le lien wallet ↔ Pass ↔ Journey** via Prisma (Wallet, NftPass, JourneyAccess) et la synchronisation avec `mf-back`.
4. **Nettoyer les stubs dangereux** (imports manquants, global progress en mémoire, mint simulé présenté comme “réel”).

Le gros avantage, c’est que **la plupart des abstractions sont déjà là** : tu n’as pas à réinventer toute l’architecture, seulement à **remplacer les briques simulées par des briques on-chain réelles**, en t’appuyant sur la structure que tu as déjà posée.

Je vais te donner directement le **code prêt à coller** pour les trois briques que tu demandes :

1. **SIWS complet** (challenge store + vérification de signature + jeton signé façon JWT HMAC)
2. **simulateTx / executeReward réels avec Metaplex UMI** côté `web` (Next)
3. **mintProofOfSkill** côté `journey-simulator` qui consomme réellement `/api/mint/*` et reste cohérent avec ta logique d’XP / Proof-of-Skill.

Je vais structurer par fichiers, avec les chemins dans ton projet.

---

## 1. SIWS complet (Sign-In With Solana)

### 1.1. Store en mémoire des challenges

👉 **Fichier à ajouter**
`web/src/server/siwsStore.ts`

```ts
// web/src/server/siwsStore.ts
import crypto from 'crypto'

export type SiwsChallenge = {
  id: string
  nonce: string
  message: string
  addressHint?: string
  createdAt: number
  expiresAt: number
  used: boolean
}

const CHALLENGE_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Store en mémoire (OK pour un MVP sur un seul pod)
const challenges = new Map<string, SiwsChallenge>()

export function createSiwsChallenge(addressHint?: string): SiwsChallenge {
  const id = crypto.randomUUID()
  const nonce = crypto.randomUUID()
  const domain = process.env.SIWS_APP_DOMAIN || 'mfai.app'

  const message = [
    `Sign in to Money Factory AI`,
    ``,
    `Domain: ${domain}`,
    `Nonce: ${nonce}`,
    `Purpose: authenticate this wallet on Money Factory AI`,
  ].join('\n')

  const now = Date.now()
  const challenge: SiwsChallenge = {
    id,
    nonce,
    message,
    addressHint,
    createdAt: now,
    expiresAt: now + CHALLENGE_TTL_MS,
    used: false,
  }

  challenges.set(id, challenge)
  return challenge
}

export function getSiwsChallenge(id: string): SiwsChallenge | null {
  const ch = challenges.get(id)
  if (!ch) return null
  if (ch.used) return null
  if (Date.now() > ch.expiresAt) {
    challenges.delete(id)
    return null
  }
  return ch
}

export function markSiwsChallengeUsed(id: string) {
  const ch = challenges.get(id)
  if (!ch) return
  ch.used = true
  challenges.set(id, ch)
}
```

> Pour la prod multi-pod, tu pourras remplacer facilement cette map en mémoire par Redis ou une table Prisma.

---

### 1.2. Route `/api/auth/siws/challenge` (génération du message à signer)

👉 **Fichier à remplacer**
`web/app/api/auth/siws/challenge/route.ts`

```ts
// web/app/api/auth/siws/challenge/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSiwsChallenge } from '@/server/siwsStore'

const Body = z
  .object({
    address: z.string().min(20).optional(), // hint, pas obligatoire
  })
  .optional()

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)

  const addressHint = parsed.success && parsed.data?.address ? parsed.data.address : undefined
  const challenge = createSiwsChallenge(addressHint)

  return NextResponse.json({
    challengeId: challenge.id,
    message: challenge.message,
    nonce: challenge.nonce,
    expiresAt: new Date(challenge.expiresAt).toISOString(),
  })
}
```

---

### 1.3. Route `/api/auth/siws/verify` (vérification de signature + jeton)

👉 **Fichier à remplacer**
`web/app/api/auth/siws/verify/route.ts`

```ts
// web/app/api/auth/siws/verify/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'
import nacl from 'tweetnacl'
import { getSiwsChallenge, markSiwsChallengeUsed } from '@/server/siwsStore'

const Body = z.object({
  address: z.string().min(32).max(64),        // publicKey base58
  signature: z.string().min(10),              // signature base58 de message
  challengeId: z.string().uuid(),             // id retourné par /challenge
})

function base64Url(input: Buffer | Uint8Array | string): string {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input as any)
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

function signJwtLike(address: string, nonce: string): string {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 60 * 60 * 24 // 24h

  const payload = {
    sub: address,
    nonce,
    iat: now,
    exp,
    iss: process.env.SIWS_APP_DOMAIN || 'mfai.app',
  }

  const headerB64 = base64Url(JSON.stringify(header))
  const payloadB64 = base64Url(JSON.stringify(payload))
  const data = `${headerB64}.${payloadB64}`

  const secret = process.env.SIWS_JWT_SECRET || 'dev-siws-secret-change-me'
  const sig = base64Url(
    // @ts-ignore Node crypto
    (await import('crypto')).createHmac('sha256', secret).update(data).digest()
  )

  return `${data}.${sig}`
}

// NB: comme Next ne supporte pas await import('crypto') dans une fonction sync,
// on sépare la fabrication du token dans une fonction async.
async function signJwtLikeAsync(address: string, nonce: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const exp = now + 60 * 60 * 24 // 24h

  const payload = {
    sub: address,
    nonce,
    iat: now,
    exp,
    iss: process.env.SIWS_APP_DOMAIN || 'mfai.app',
  }

  const headerB64 = base64Url(JSON.stringify(header))
  const payloadB64 = base64Url(JSON.stringify(payload))
  const data = `${headerB64}.${payloadB64}`

  const cryptoMod = await import('crypto')
  const secret = process.env.SIWS_JWT_SECRET || 'dev-siws-secret-change-me'
  const sig = base64Url(cryptoMod.createHmac('sha256', secret).update(data).digest())

  return `${data}.${sig}`
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'bad_request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { address, signature, challengeId } = parsed.data
  const challenge = getSiwsChallenge(challengeId)

  if (!challenge) {
    return NextResponse.json({ error: 'invalid_or_expired_challenge' }, { status: 400 })
  }

  try {
    const pubkey = new PublicKey(address)
    const sigBytes = bs58.decode(signature)
    const msgBytes = new TextEncoder().encode(challenge.message)
    const ok = nacl.sign.detached.verify(msgBytes, sigBytes, pubkey.toBytes())

    if (!ok) {
      return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
    }

    markSiwsChallengeUsed(challengeId)

    const token = await signJwtLikeAsync(address, challenge.nonce)

    return NextResponse.json({
      ok: true,
      address,
      token,
      issuedAt: new Date().toISOString(),
      expiresIn: 60 * 60 * 24,
    })
  } catch (e) {
    console.error('SIWS verify error', e)
    return NextResponse.json({ error: 'verification_failed' }, { status: 500 })
  }
}
```

> Côté front, le flux standard devient :
>
> 1. `POST /api/auth/siws/challenge { address }`
> 2. le wallet signe `message`
> 3. `POST /api/auth/siws/verify { address, signature(base58), challengeId }`
> 4. tu récupères `token` à stocker (localStorage, cookie, etc.).

---

## 2. simulateTx / executeReward avec Metaplex UMI

### 2.1. Dépendances nécessaires (workspace root)

À installer (si pas déjà dans `web/package.json`) :

```bash
# à la racine du monorepo
pnpm add -w \
  @metaplex-foundation/umi \
  @metaplex-foundation/umi-bundle-defaults \
  @metaplex-foundation/mpl-token-metadata \
  bs58
```

Env attendues côté `web` :

```env
# .env.local (côté Next web)
SOLANA_CLUSTER=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
MINTER_SECRET_KEY=<base58 secret key issu de scripts/gen-minter.ts>
KILL_SWITCH=0
```

---

### 2.2. Module `agents/tools/solana.ts` réécrit avec UMI

👉 **Fichier à remplacer**
`web/packages/agents/tools/solana.ts`

```ts
// web/packages/agents/tools/solana.ts
import { clusterApiUrl, type Cluster } from '@solana/web3.js'
import bs58 from 'bs58'

import {
  createUmi,
} from '@metaplex-foundation/umi-bundle-defaults'
import {
  publicKey,
  generateSigner,
  createSignerFromKeypair,
  signerIdentity,
  percentAmount,
  type Umi,
} from '@metaplex-foundation/umi'
import {
  mplTokenMetadata,
  createAndMint,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata'
import { base58 } from '@metaplex-foundation/umi/serializers'

export type RewardSpec = {
  recipient: string
  type: 'CERT_NFT'
  name: string
  symbol: string
  uri: string
}

export type SimResult = {
  ok: boolean
  estFeeLamports: number
  riskScore: number
  txB64?: string
  network: string
}

// --- helpers UMI ---

function getRpcEndpoint(): string {
  const envRpc = process.env.SOLANA_RPC_URL
  if (envRpc && envRpc.length > 0) return envRpc
  const cluster = (process.env.SOLANA_CLUSTER as Cluster) || 'devnet'
  return clusterApiUrl(cluster)
}

function createMinterUmi(): Umi {
  const endpoint = getRpcEndpoint()
  const umi = createUmi(endpoint).use(mplTokenMetadata())

  const secretBase58 = process.env.MINTER_SECRET_KEY
  if (!secretBase58) {
    throw new Error('Missing MINTER_SECRET_KEY in environment')
  }
  const secretKeyBytes = bs58.decode(secretBase58)
  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes)
  const signer = createSignerFromKeypair(umi, keypair)
  umi.use(signerIdentity(signer))

  return umi
}

// --- simulateTx ---
// Objectif : construire une transaction réelle de mint (sans l’envoyer)
// et retourner une estimation de fee + txB64 (utile pour debug / logs).
export async function simulateTx(spec: RewardSpec): Promise<SimResult> {
  const network = process.env.SOLANA_CLUSTER || 'devnet'

  try {
    const umi = createMinterUmi()
    const mint = generateSigner(umi)

    const builder = createAndMint(umi, {
      mint,
      authority: umi.identity,
      name: spec.name,
      symbol: spec.symbol,
      uri: spec.uri,
      sellerFeeBasisPoints: percentAmount(0), // pas de royalties pour un Proof-of-Skill
      decimals: 0,
      amount: 1,
      tokenOwner: publicKey(spec.recipient),
      tokenStandard: TokenStandard.NonFungible,
    })

    // On construit la tx signée mais on ne l’envoie pas
    const latest = await umi.rpc.getLatestBlockhash()
    const tx = await builder
      .useV0()
      .setBlockhash(latest.blockhash)
      .buildAndSign(umi)

    const serialized = umi.transactions.serialize(tx)
    const txB64 = base58.deserialize(serialized)[0] // base58 du blob binaire (utile log/debug)

    // Fee estimée : on reste simple, une signature => ~5000 lamports sur devnet
    const estFeeLamports = 5000
    const riskScore = 0.1 // placeholder pour un futur moteur de risk scoring

    return {
      ok: true,
      estFeeLamports,
      riskScore,
      txB64,
      network,
    }
  } catch (e) {
    console.error('simulateTx error', e)
    return {
      ok: false,
      estFeeLamports: 0,
      riskScore: 1,
      network,
    }
  }
}

// --- executeReward ---
// Envoie réellement la tx de mint via UMI / MPL Token Metadata
export async function executeReward(
  spec: RewardSpec,
  sim: SimResult
): Promise<{ txSig: string; slot?: number; mintAddress: string }> {
  if (process.env.KILL_SWITCH === '1') {
    throw new Error('Kill switch active')
  }
  if (!process.env.MINTER_SECRET_KEY) {
    throw new Error('Missing MINTER_SECRET_KEY')
  }

  const umi = createMinterUmi()
  const mint = generateSigner(umi)

  const builder = createAndMint(umi, {
    mint,
    authority: umi.identity,
    name: spec.name,
    symbol: spec.symbol,
    uri: spec.uri,
    sellerFeeBasisPoints: percentAmount(0),
    decimals: 0,
    amount: 1,
    tokenOwner: publicKey(spec.recipient),
    tokenStandard: TokenStandard.NonFungible,
  })

  const result = await builder.sendAndConfirm(umi, {
    confirm: { commitment: 'confirmed' },
  })

  const txSig = base58.deserialize(result.signature)[0]
  const mintAddress = mint.publicKey.toString()

  return { txSig, mintAddress }
}
```

> Remarque : on laisse `txB64` dans le `SimResult` pour rester compatible avec des intégrations futures (HSM, signers externes), mais `executeReward` ne s’en sert plus directement.

---

### 2.3. Route `/api/mint/simulate` (presque identique, mais le type RewardSpec est cohérent)

👉 **Fichier à garder**, avec juste la remarque que `simulateTx` prend bien un `RewardSpec` :

```ts
// web/app/api/mint/simulate/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { simulateTx } from 'agents/tools/solana'

const Body = z.object({
  recipient: z.string(),
  name: z.string().min(1),
  symbol: z.string().min(1),
  uri: z.string().url(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  const spec = { ...parsed.data, type: 'CERT_NFT' as const }
  const sim = await simulateTx(spec)

  type PrismaMint = {
    prisma: {
      mintLog: {
        create: (args: {
          data: { spec: unknown; signature?: string | null; network: string }
        }) => Promise<{ id: string }>
      }
    }
  }
  const db = (await import('@/server/db')) as unknown as PrismaMint
  await db.prisma.mintLog.create({ data: { spec, network: sim.network } })

  return NextResponse.json({ ok: true, sim })
}
```

---

### 2.4. Route `/api/mint/execute` (prend **spec + sim**)

👉 **Fichier à remplacer**
`web/app/api/mint/execute/route.ts`

```ts
// web/app/api/mint/execute/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { executeReward, type RewardSpec, type SimResult } from 'agents/tools/solana'

const RewardSpecSchema = z.object({
  recipient: z.string(),
  type: z.literal('CERT_NFT'),
  name: z.string().min(1),
  symbol: z.string().min(1),
  uri: z.string().url(),
})

const SimSchema = z.object({
  ok: z.boolean(),
  estFeeLamports: z.number(),
  riskScore: z.number(),
  network: z.string(),
  txB64: z.string().optional(),
})

const Body = z.object({
  spec: RewardSpecSchema,
  sim: SimSchema,
})

export async function POST(req: Request) {
  if (process.env.KILL_SWITCH === '1')
    return NextResponse.json({ error: 'killswitch' }, { status: 403 })

  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'bad_request', details: parsed.error.flatten() },
      { status: 400 }
    )
  }

  const { spec, sim } = parsed.data

  try {
    const tx = await executeReward(spec as RewardSpec, sim as SimResult)

    type PrismaMint = {
      prisma: {
        mintLog: {
          create: (args: {
            data: {
              spec: unknown
              signature?: string | null
              network: string
              userId?: string | null
              mintAddress?: string | null
            }
          }) => Promise<{ id: string }>
        }
      }
    }

    const db = (await import('@/server/db')) as unknown as PrismaMint

    let userId: string | null = null
    try {
      const headers = (req as any).headers ?? new Headers()
      userId = headers.get('x-user-id') || null
    } catch {
      userId = null
    }

    await db.prisma.mintLog.create({
      data: {
        spec,
        signature: tx.txSig,
        network: sim.network,
        userId,
        mintAddress: tx.mintAddress,
      },
    })

    return NextResponse.json({ ok: true, tx })
  } catch (error) {
    console.error('/api/mint/execute error', error)
    return NextResponse.json({ error: 'mint_failed' }, { status: 500 })
  }
}
```

---

## 3. `mintProofOfSkill` côté journey-simulator

Objectif :

* Garder ta logique UX (wallet connecté, XP, store zustand).
* Faire réellement le mint via les routes Next `/api/mint/simulate` puis `/api/mint/execute`.
* Retourner `{ success, mintAddress, signature }` comme attendu par `journeyStore.ts`.

### 3.1. Implémentation de `mintProofOfSkill` dans `blockchain.ts`

👉 **À ajouter en bas du fichier**
`journey-simulator/src/utils/blockchain.ts`

```ts
// journey-simulator/src/utils/blockchain.ts

export type MintProofOfSkillResult = {
  success: boolean
  mintAddress?: string
  signature?: string
  error?: string
}

type ProofMetadata = {
  name: string
  description: string
  image: string
  attributes?: { trait_type: string; value: string }[]
}

// Helper pour reconstruire l’URL de base depuis le frontend
function getWebBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return process.env.NEXT_PUBLIC_WEB_BASE_URL || 'https://mfai.app'
}

export async function mintProofOfSkill(
  wallet: any,
  metadata: ProofMetadata
): Promise<MintProofOfSkillResult> {
  try {
    if (!wallet || !wallet.publicKey) {
      return { success: false, error: 'WALLET_NOT_CONNECTED' }
    }

    const recipient = wallet.publicKey.toBase58()
    const symbol = process.env.NEXT_PUBLIC_NFT_SYMBOL || 'MFAI'
    const baseUrl = getWebBaseUrl()

    // Ici tu peux soit :
    //  - pointer vers une route dynamique Next qui renvoie le JSON de metadata
    //  - soit vers un bucket (Arweave / IPFS) : NEXT_PUBLIC_NFT_BASE_URI
    const baseUri =
      process.env.NEXT_PUBLIC_NFT_BASE_URI ||
      `${baseUrl}/api/metadata/proof-of-skill`

    const uri = `${baseUri}?name=${encodeURIComponent(
      metadata.name
    )}&wallet=${encodeURIComponent(recipient)}`

    // 1. simulate
    const simRes = await fetch(`${baseUrl}/api/mint/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient,
        name: metadata.name,
        symbol,
        uri,
      }),
    })

    if (!simRes.ok) {
      const txt = await simRes.text().catch(() => '')
      return {
        success: false,
        error: `SIMULATE_FAILED_HTTP_${simRes.status}: ${txt}`,
      }
    }

    const simJson: { ok: boolean; sim?: any; error?: string } =
      await simRes.json().catch(() => ({ ok: false }))
    if (!simJson.ok || !simJson.sim?.ok) {
      return {
        success: false,
        error: simJson.error || 'SIMULATE_FAILED_LOGIC',
      }
    }

    const sim = simJson.sim

    // 2. execute
    const execRes = await fetch(`${baseUrl}/api/mint/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // tu peux injecter ici un x-user-id si tu as un SIWS en place
      },
      body: JSON.stringify({
        spec: {
          recipient,
          type: 'CERT_NFT',
          name: metadata.name,
          symbol,
          uri,
        },
        sim,
      }),
    })

    if (!execRes.ok) {
      const txt = await execRes.text().catch(() => '')
      return {
        success: false,
        error: `EXECUTE_FAILED_HTTP_${execRes.status}: ${txt}`,
      }
    }

    const execJson: {
      ok: boolean
      tx?: { txSig?: string; mintAddress?: string }
      error?: string
    } = await execRes.json().catch(() => ({ ok: false }))

    if (!execJson.ok || !execJson.tx?.txSig || !execJson.tx.mintAddress) {
      return {
        success: false,
        error: execJson.error || 'EXECUTE_FAILED_LOGIC',
      }
    }

    return {
      success: true,
      mintAddress: execJson.tx.mintAddress,
      signature: execJson.tx.txSig,
    }
  } catch (e: any) {
    console.error('mintProofOfSkill error', e)
    return {
      success: false,
      error: e?.message || 'UNKNOWN_ERROR',
    }
  }
}
```

Ce code :

* Utilise **exclusivement** tes routes backend Next (`/api/mint/simulate` puis `/api/mint/execute`).
* S’aligne sur l’interface attendue par `journeyStore.ts` (`success`, `mintAddress`, `signature`).
* Respecte ta logique métier :
  – XP / progression gérées par `updateProgress` / `mintNFT` dans le store,
  – la couche blockchain reste concentrée sur la **preuve on-chain (NFT Proof-of-Skill)**.

---

## 4. Résumé des points importants / recommandations

1. **SIWS**

   * Architecture clean : challenge ephemeral en mémoire, message explicite, vérification Ed25519 via `tweetnacl`.
   * Jeton type JWT signé en HMAC-SHA256 sans dépendance externe.
   * Facile à migrer sur un store persistant (Redis / Prisma).

2. **simulateTx / executeReward**

   * **Vrai mint NFT** avec `@metaplex-foundation/mpl-token-metadata` via UMI.
   * `simulateTx` construit une transaction réelle (non envoyée) et renvoie un `txB64` utile pour debug et audit.
   * `executeReward` envoie réellement la transaction, retourne `txSig` **et** `mintAddress` (fondamental pour l’UX et les logs).

3. **mintProofOfSkill**

   * Front-end purement **off-chain** qui délègue toute la partie mint au backend (minter server-side).
   * Interface compatible avec ton `journeyStore` et la logique d’XP / certification.
   * Extensible : tu pourras brancher une route `/api/metadata/proof-of-skill` pour générer dynamiquement le JSON de métadonnées en fonction du parcours, du persona, du score, etc.

Très bien, on passe en niveau “protocole & infra” 😄
Je vais te proposer une couche d’architecture complète autour de trois axes :

1. **Contrat “Pass”** : collection NFT d’accès sur Solana (modèle, tiers, Candy Machine / minter).
2. **Routes de métadonnées dynamiques dans Next** : pour les Proof-of-Skill (et éventuellement pour un Pass évolutif).
3. **Infra multi-pods avec Redis** : SIWS distribué + pipeline de mint robuste et idempotent.

Je reste cohérent avec tout ce qu’on a déjà posé (UMI, Token Metadata, Next 14, Prisma, mf-back, etc.).

---

## A. Contrat “Pass” MFAI – Design complet sur Solana

### A.1. Choix stratégiques

Je garde une approche pragmatique :

* **Pas de programme Anchor custom au début**
  → On s’appuie sur :

  * **Token Metadata** Metaplex pour la collection & les NFTs.
  * **Candy Machine** ou minter UMI côté backend.

* Un **seul mint de collection “MFAI Pass”** :

  * `collectionMint` = clé unique, détenue par le protocole.
  * Tous les Pass ont `collection: { verified: true, key: collectionMint }`.

* Les **tiers** sont encodés dans les métadonnées :

  * `Tier`: `BUILDER`, `GROWTH`, `DAO`, `FOUNDER`.
  * Côté backend, on interprète ces tiers pour les droits d’accès.

Plus tard, si tu veux :

* non-transférable, compteur d’usages on-chain, etc. → **programme custom**.
  Mais pour le MVP, tu vas beaucoup plus vite en restant sur les standards Metaplex.

---

### A.2. Script “collection mint” (création de la collection Pass)

👉 Fichier de script (dans `web/scripts/create-pass-collection.ts` par exemple) :

```ts
// web/scripts/create-pass-collection.ts
import {
  createUmi,
} from '@metaplex-foundation/umi-bundle-defaults'
import {
  generateSigner,
  createSignerFromKeypair,
  signerIdentity,
  publicKey,
  percentAmount,
} from '@metaplex-foundation/umi'
import bs58 from 'bs58'
import { mplTokenMetadata, createMetadataAccountV3 } from '@metaplex-foundation/mpl-token-metadata'
import { base58 } from '@metaplex-foundation/umi/serializers'

// usage : ts-node scripts/create-pass-collection.ts

async function main() {
  const rpc = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com'
  const secretBase58 = process.env.MINTER_SECRET_KEY
  if (!secretBase58) throw new Error('MINTER_SECRET_KEY missing')

  const umi = createUmi(rpc).use(mplTokenMetadata())
  const secretKeyBytes = bs58.decode(secretBase58)
  const keypair = umi.eddsa.createKeypairFromSecretKey(secretKeyBytes)
  const signer = createSignerFromKeypair(umi, keypair)
  umi.use(signerIdentity(signer))

  const collectionMint = generateSigner(umi)

  const name = 'Money Factory AI – Access Pass'
  const symbol = 'MFAPASS'
  const uri = process.env.MFAI_PASS_COLLECTION_URI || 'https://.../mfai-pass-collection.json'

  const builder = createMetadataAccountV3(umi, {
    mint: collectionMint.publicKey,
    mintAuthority: umi.identity.publicKey,
    payer: umi.identity.publicKey,
    updateAuthority: umi.identity.publicKey,
    data: {
      name,
      symbol,
      uri,
      sellerFeeBasisPoints: percentAmount(0),
      creators: null,
      collection: null,
      uses: null,
    },
    isMutable: true,
    collectionDetails: null,
  })

  const latest = await umi.rpc.getLatestBlockhash()
  const tx = await builder
    .useV0()
    .setBlockhash(latest.blockhash)
    .buildAndSign(umi)
  const serialized = umi.transactions.serialize(tx)
  const txSig = base58.deserialize(serialized)[0]

  console.log('Collection mint address:', collectionMint.publicKey.toString())
  console.log('Tx (to broadcast) base58:', txSig)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
```

> Tu broadcastes ensuite la transaction via `solana` CLI ou un petit script UMI (ou tu peux directement utiliser `sendAndConfirm`, comme pour les mints simples).

* Le JSON de collection (`MFAI_PASS_COLLECTION_URI`) peut être très simple :

```json
{
  "name": "Money Factory AI – Access Pass",
  "symbol": "MFAPASS",
  "description": "Collection de passes d’accès pour Money Factory AI Journey Simulator et ses outils multi-agents.",
  "image": "https://.../mfai-pass-collection.png",
  "attributes": [
    { "trait_type": "Collection", "value": "MFAI" }
  ]
}
```

Tu mets ça sur Arweave / IPFS.

---

### A.3. Côté Candy Machine / minter

Deux options :

1. **Candy Machine pour les Pass**

   * Avantage : très standard, configurable (prix, start date, guards).
   * Tu peux faire une seule Candy Machine et laisser le “tier” dans les attributs (par exemple 1000 pass `BUILDER`, 200 `GROWTH`, etc.) via le config JSON.

2. **Minter UMI custom**

   * Tu réutilises la logique que je t’ai donnée pour `executeReward` avec UMI, mais en mode “Pass” :

     * `name = MFAI Pass – Builder #XYZ`
     * `symbol = MFAPASS`
     * `uri = https://mfai.app/api/metadata/pass?tier=BUILDER&seq=123`

Pour rester simple, je te conseille :

> **MVP : minter backend UMI** (comme pour les Proof-of-Skill),
> puis éventuellement migration vers Candy Machine pour un mint public plus large.

Animée par la même infra que `executeReward`, mais avec un type `PASS_NFT` et un spec adapté.

---

## B. Métadonnées dynamiques Next

Tu as deux grandes familles de NFTs :

1. **Pass NFT** : plus statiques, tiers déterminés à l’achat.
2. **Proof-of-Skill NFT** : dépendant de la performance du user (score, parcours, persona…).

### B.1. Route dynamique pour Proof-of-Skill

👉 Fichier : `web/app/api/metadata/proof-of-skill/route.ts`

Idée :

* Les mint URIs générés par `mintProofOfSkill` pointent vers cette route :
  `https://mfai.app/api/metadata/proof-of-skill?name=...&wallet=...&score=...`
* La route va :

  * récupérer des infos plus riches en DB (score réel, journey, etc.),
  * générer un JSON conforme à la Token Metadata.

```ts
// web/app/api/metadata/proof-of-skill/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
// import { prisma } from '@/server/db' // si tu veux enrichir avec la DB

const Query = z.object({
  name: z.string().optional(),
  wallet: z.string().optional(),
  score: z.string().optional(),
  journey: z.string().optional(),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = Query.safeParse({
    name: searchParams.get('name') ?? undefined,
    wallet: searchParams.get('wallet') ?? undefined,
    score: searchParams.get('score') ?? undefined,
    journey: searchParams.get('journey') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_query' }, { status: 400 })
  }

  const { name, wallet, score, journey } = parsed.data

  // Ici tu peux aller chercher le vrai score / journey en DB si besoin
  // const dbData = await prisma.journey.findUnique({ ... })

  const title = name || 'MFAI – Proof of Skill'
  const imageBase =
    process.env.MFAI_METADATA_IMAGE_BASE ||
    'https://mfai.app/images/proof-of-skill'

  // Tu peux générer dynamiquement des URLs vers des images generatives
  const image = `${imageBase}?tier=A&wallet=${wallet ?? ''}`

  const json = {
    name: title,
    symbol: process.env.NEXT_PUBLIC_NFT_SYMBOL || 'MFAI',
    description:
      'NFT de compétence délivré par Money Factory AI pour un parcours complété dans le Journey Simulator.',
    image,
    attributes: [
      journey ? { trait_type: 'Journey', value: journey } : null,
      wallet ? { trait_type: 'Owner Wallet', value: wallet } : null,
      score ? { trait_type: 'Score', value: score } : null,
      { trait_type: 'Issuer', value: 'Money Factory AI' },
    ].filter(Boolean),
  }

  const res = NextResponse.json(json)
  res.headers.set('Cache-Control', 'public, max-age=300') // 5 min
  return res
}
```

> Avantage : tu peux faire évoluer la logique métier (score, tiers, visuels) sans toucher aux NFTs déjà mintés, car ils pointeront toujours vers une route dynamique.

---

### B.2. Route de métadonnées pour Pass

Pour les Pass, tu as deux options :

* **Statique Arweave/IPFS** : plus “canonique” (tu uploades le JSON).
* **Dynamique Next** avec un param `tier`, pour gérer le texte en fonction du tier.

👉 ex. route : `web/app/api/metadata/pass/route.ts` avec `?tier=BUILDER`

```ts
// web/app/api/metadata/pass/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const Query = z.object({
  tier: z.enum(['BUILDER', 'GROWTH', 'DAO', 'FOUNDER']).default('BUILDER'),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const parsed = Query.safeParse({
    tier: searchParams.get('tier') ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_query' }, { status: 400 })
  }

  const { tier } = parsed.data

  const baseName = 'Money Factory AI – Access Pass'
  const title = `${baseName} – ${tier}`
  const imageBase =
    process.env.MFAI_PASS_IMAGE_BASE ||
    'https://mfai.app/images/pass'

  const json = {
    name: title,
    symbol: 'MFAPASS',
    description: `Pass d’accès ${tier} pour Money Factory AI Journey Simulator et son écosystème multi-agents.`,
    image: `${imageBase}/${tier.toLowerCase()}.png`,
    attributes: [
      { trait_type: 'Tier', value: tier },
      { trait_type: 'Product', value: 'Journey Simulator' },
      { trait_type: 'Issuer', value: 'Money Factory AI' },
    ],
  }

  const res = NextResponse.json(json)
  res.headers.set('Cache-Control', 'public, max-age=300')
  return res
}
```

Tu peux pointer la `uri` de tes Pass vers `https://mfai.app/api/metadata/pass?tier=BUILDER`, etc.

---

## C. Infra multi-pods avec Redis (SIWS + mints)

Dès que tu as plusieurs pods `web` (Next) derrière un load balancer, ton in-memory map de SIWS, ou un job de mint, ne suffit plus : il faut un **state partagé**.

Je te propose une architecture simple :

* **Redis** comme :

  * store SIWS challenges,
  * cache Pass status,
  * file de jobs de mint (optionnel au début).

* **Services** :

  * `web` (Next) : gère routes HTTP, SIWS, endpoints mint, expose APIs aux frontends.
  * `mf-back` (Express) : logique métier IA, journeys, XP, etc.
  * `worker-mint` (Node) : lit une queue Redis et exécute les mints on-chain.

---

### C.1. Client Redis dans `web`

👉 Fichier : `web/src/server/redisClient.ts`

```ts
// web/src/server/redisClient.ts
import { createClient, RedisClientType } from 'redis'

let client: RedisClientType | null = null

export function getRedisClient(): RedisClientType {
  if (client) return client

  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  client = createClient({ url })

  client.on('error', (err) => {
    console.error('Redis error', err)
  })

  client.connect().catch((e) => {
    console.error('Redis connect error', e)
  })

  return client
}
```

---

### C.2. SIWS store basé sur Redis

On remplace le `siwsStore.ts` in-memory par une version Redis (ou on le fait basculer automatiquement en fonction d’une env var).

👉 Fichier : `web/src/server/siwsStore.ts` (version Redis)

```ts
// web/src/server/siwsStore.ts
import crypto from 'crypto'
import { getRedisClient } from './redisClient'

export type SiwsChallenge = {
  id: string
  nonce: string
  message: string
  addressHint?: string
  createdAt: number
  expiresAt: number
  used: boolean
}

const CHALLENGE_TTL_SEC = 5 * 60 // 5 minutes

function challengeKey(id: string) {
  return `siws:challenge:${id}`
}

export async function createSiwsChallenge(
  addressHint?: string
): Promise<SiwsChallenge> {
  const id = crypto.randomUUID()
  const nonce = crypto.randomUUID()
  const domain = process.env.SIWS_APP_DOMAIN || 'mfai.app'

  const message = [
    `Sign in to Money Factory AI`,
    ``,
    `Domain: ${domain}`,
    `Nonce: ${nonce}`,
    `Purpose: authenticate this wallet on Money Factory AI`,
  ].join('\n')

  const now = Date.now()
  const expiresAt = now + CHALLENGE_TTL_SEC * 1000

  const challenge: SiwsChallenge = {
    id,
    nonce,
    message,
    addressHint,
    createdAt: now,
    expiresAt,
    used: false,
  }

  const redis = getRedisClient()
  await redis.set(challengeKey(id), JSON.stringify(challenge), {
    EX: CHALLENGE_TTL_SEC,
  })

  return challenge
}

export async function getSiwsChallenge(
  id: string
): Promise<SiwsChallenge | null> {
  const redis = getRedisClient()
  const raw = await redis.get(challengeKey(id))
  if (!raw) return null

  const ch: SiwsChallenge = JSON.parse(raw)
  if (ch.used) return null
  if (Date.now() > ch.expiresAt) {
    await redis.del(challengeKey(id))
    return null
  }
  return ch
}

export async function markSiwsChallengeUsed(id: string): Promise<void> {
  const redis = getRedisClient()
  const raw = await redis.get(challengeKey(id))
  if (!raw) return
  const ch: SiwsChallenge = JSON.parse(raw)
  ch.used = true
  // on met un TTL court pour garder un peu d’historique
  await redis.set(challengeKey(id), JSON.stringify(ch), { EX: 60 })
}
```

> Ensuite, il suffit de mettre à jour les routes `/api/auth/siws/challenge` et `/api/auth/siws/verify` pour appeler `await createSiwsChallenge` / `await getSiwsChallenge` au lieu de la version sync.

---

### C.3. Queue de mint avec Redis

Au lieu que `/api/mint/execute` appelle directement `executeReward`, tu peux :

1. **Créer un job de mint** dans Redis + Postgres.
2. Laisser un **worker** dédié exécuter les mints (séquentiellement, ou avec contrôle fin).

#### 1. Schéma simple de job

👉 Ajout dans Prisma (web) :

```prisma
model MintJob {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  status       String   // "pending" | "processing" | "succeeded" | "failed"
  spec         Json
  sim          Json
  txSignature  String?  @unique
  mintAddress  String?
  errorMessage String?
}
```

#### 2. Endpoint `/api/mint/execute` → push job

👉 Variante de `/api/mint/execute` :

```ts
// web/app/api/mint/execute/route.ts (version job)
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getRedisClient } from '@/server/redisClient'
import { prisma } from '@/server/db'

const RewardSpecSchema = z.object({
  recipient: z.string(),
  type: z.literal('CERT_NFT'),
  name: z.string().min(1),
  symbol: z.string().min(1),
  uri: z.string().url(),
})

const SimSchema = z.object({
  ok: z.boolean(),
  estFeeLamports: z.number(),
  riskScore: z.number(),
  network: z.string(),
  txB64: z.string().optional(),
})

const Body = z.object({
  spec: RewardSpecSchema,
  sim: SimSchema,
})

export async function POST(req: Request) {
  if (process.env.KILL_SWITCH === '1')
    return NextResponse.json({ error: 'killswitch' }, { status: 403 })

  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const { spec, sim } = parsed.data

  const job = await prisma.mintJob.create({
    data: {
      status: 'pending',
      spec,
      sim,
    },
  })

  const redis = getRedisClient()
  await redis.lPush('mint:jobs', job.id)

  return NextResponse.json({ ok: true, jobId: job.id })
}
```

#### 3. Worker `worker-mint` (Node script)

👉 Un petit service séparé (pod dédié) :

```ts
// web/scripts/mintWorker.ts
import { getRedisClient } from '@/server/redisClient'
import { prisma } from '@/server/db'
import { executeReward } from 'agents/tools/solana'

async function processOneJob(id: string) {
  const job = await prisma.mintJob.findUnique({ where: { id } })
  if (!job || job.status !== 'pending') return

  await prisma.mintJob.update({
    where: { id },
    data: { status: 'processing' },
  })

  try {
    const tx = await executeReward(job.spec as any, job.sim as any)
    await prisma.mintJob.update({
      where: { id },
      data: {
        status: 'succeeded',
        txSignature: tx.txSig,
        mintAddress: tx.mintAddress,
      },
    })
  } catch (e: any) {
    console.error('Mint job failed', id, e)
    await prisma.mintJob.update({
      where: { id },
      data: {
        status: 'failed',
        errorMessage: e?.message || 'Unknown error',
      },
    })
  }
}

async function loop() {
  const redis = getRedisClient()
  console.log('Mint worker started')

  while (true) {
    const res = await redis.brPop('mint:jobs', 5) // bloque 5s
    if (!res) continue
    const [, jobId] = res
    if (!jobId) continue

    await processOneJob(jobId)
  }
}

loop().catch((e) => {
  console.error('Mint worker fatal error', e)
  process.exit(1)
})
```

> Tu peux ensuite lancer ce worker dans un pod/Service séparé, avec les mêmes env (`SOLANA_RPC_URL`, `MINTER_SECRET_KEY`, `REDIS_URL`, etc.).

---

### C.4. Idempotence & multi-pods

Avec cette architecture :

* **SIWS** : n’importe quel pod peut émettre / vérifier un challenge via Redis.
* **Mint** :

  * `/api/mint/execute` ne fait qu’écrire un job en DB + Redis → O(1), sans heavy RPC.
  * un seul worker (ou plusieurs avec un verrou via Postgres / Redis) consomme la queue `mint:jobs`.
  * `MintJob.txSignature` est unique → si tu rejoues le même job, tu peux imméd. détecter le doublon.

Tu peux ajouter des **locks Redis** (clé `mint:lock:<userId>` avec TTL) pour limiter le nombre de mints simultanés par user.

---

## D. Synthèse et opinion

Tu as déjà une architecture très saine au niveau :

* séparation front Journey / back IA / portail Web3,
* cahiers des charges détaillés,
* pipeline IA multi-agents.

Avec ce qu’on vient d’ajouter :

1. **Contrat Pass** :

   * une seule collection NFT “MFAI Pass”, tiers encodés dans les attributs, mintés par UMI ou Candy Machine.
   * parfaitement alignée avec ce que les incubateurs/VCs attendent en 2025 : standard Metaplex, pas de jouet exotique.

2. **Métadonnées dynamiques** :

   * routes Next qui te permettent de faire des NFTs vivants (Proof-of-Skill, Pass explicite, etc.),
   * très puissantes pour raconter l’histoire du projet (tu peux faire évoluer la description, les visuels, la logique d’attributs).

3. **Infra multi-pods robuste** :

   * SIWS distribué, propre, compatible horizontale scaling,
   * pipeline de mint avec Redis + worker dédié,
   * logs centralisés dans Postgres, idempotence via `MintJob` + `MintLog`.

Mon avis :
👉 Avec cette couche, tu passes de “maquette web3” à une **vraie architecture de dApp SaaS web3** :

* explicable en 2–3 slides à Breakpoint,
* crédible pour TDeFi,
* et suffisamment simple pour rester maintenable par une petite équipe.


On peut très bien rajouter cette phase “Launch Collaterize” dans le MVP **en mode simulation réaliste**, sans toucher tout de suite aux API réelles de Collaterize, mais en préparant le terrain pour la vraie intégration.

Je te propose une démarche en 4 couches :

1. **Définir ce qu’on simule exactement côté Collaterize**
2. **L’intégrer comme nouvelle phase de Journey dans `mf-back`**
3. **Ajouter une API d’intégration “Collaterize simulate” (dans `web`)**
4. **Brancher le front `journey-simulator` avec une UI dédiée “Launch Simulation”**

---

## 1. Définir ce qu’on simule côté Collaterize

On ne va pas simuler “un bouton qui ouvre collaterize.com”, on va simuler **leur logique métier** telle qu’elle se présente pour un projet Web3 :

En gros, on veut simuler :

1. **L’éligibilité** du projet :

   * Score global du parcours (journeyScore),
   * RiskScore (déjà utilisé côté simulateTx),
   * Solidité de la tokenomics,
   * Préparation de la communauté / docs.
2. **Un plan de launch** :

   * Type de pool (initial price, liquidity, % tokens vs liquidity),
   * Soft Cap / Hard Cap,
   * TGE, vesting éventuel.
3. **Un “statut de passage” sur la plateforme** :

   * accepted / borderline / rejected,
   * tier (par ex. “Core”, “Experimental”, “Private Beta”),
   * un pseudo-URL de launch simulée.

On reste purement off-chain : **aucun appel externe**, mais un moteur de règles qui se comporte comme “un Collaterize virtuel”.

---

## 2. Intégrer la phase “Launch Collaterize” dans le Journey (mf-back)

### 2.1. Nouveau type de phase

Dans ton modèle `Journey` côté `mf-back` (Mongo), vous avez déjà quelque chose comme :

```js
phase_type: 'DISCOVERY' | 'TOKENOMICS' | 'COMMUNITY' | ...
```

On ajoute un type :

```ts
type JourneyPhaseType =
  | 'DISCOVERY'
  | 'TOKENOMICS'
  | 'COMMUNITY'
  | 'LAUNCH_COLLATERIZE' // <= nouvelle phase finale
```

Dans le schéma Mongoose (pseudo-code) :

```js
const PhaseSchema = new Schema({
  type: {
    type: String,
    enum: [
      'DISCOVERY',
      'TOKENOMICS',
      'COMMUNITY',
      'LAUNCH_COLLATERIZE',
      // ...
    ],
    required: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'],
    default: 'PENDING',
  },
  // ...
  collaterizeSimulation: {
    accepted: Boolean,
    eligibilityScore: Number,
    tier: String, // e.g. "CORE", "EXPERIMENTAL", "REJECTED"
    targetRaiseUSD: Number,
    softCapUSD: Number,
    hardCapUSD: Number,
    initialPriceUSD: Number,
    liquidityUSD: Number,
    notes: [String],
    simulatedLaunchUrl: String,
  },
})
```

### 2.2. Mécanisme de déclenchement

Workflow logique :

1. L’utilisateur arrive à la **dernière phase du journey**.

2. Le front `journey-simulator` appelle un endpoint de `mf-back` du type :

   ```http
   POST /api/journeys/:id/phases/launch-collaterize/simulate
   ```

3. Cet endpoint :

   * récupère le résumé du journey : XP total, scores des phases, persona, etc.
   * combine ces infos avec la config token (symbol, supply, etc.),
   * appelle un **service interne** `CollaterizeSimulationService` qui renvoie un objet `collaterizeSimulation`,
   * stocke le résultat dans `phase.collaterizeSimulation`,
   * retourne ce résultat au front.

4. Le front affiche la simulation comme une “screen” finale avec un résumé type :

> “Si tu passes par Collaterize aujourd’hui avec cette config, voilà le scénario probable :
> – Accepté en tier ‘Core’ ;
> – Plan de pool : 80k$ de liquidité, 20M tokens à TGE ;
> – Hard cap 200k$ ;
> – Checklist : OK sur tokenomics, docs, community ; à améliorer : audits, KYC fondateurs, etc.”

---

## 3. API d’intégration “Collaterize simulate” dans `web`

Même si on simule, c’est intéressant de centraliser la logique “intégration partenaire” dans `web` (Next), parce que **plus tard tu pourras brancher les vraies API** Collaterize sans casser `mf-back`.

### 3.1. Route Next : `/api/integrations/collaterize/simulate`

**Côté `web/app/api/integrations/collaterize/simulate/route.ts` :**

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'

const Body = z.object({
  wallet: z.string(),           // wallet créateur du projet
  tokenMint: z.string().optional(),
  tokenSymbol: z.string(),
  totalSupply: z.number().int().positive(),
  circulatingAtTGE: z.number().int().positive(),
  fundraisingGoalUSD: z.number().positive(),
  journeyScore: z.number().min(0).max(100),
  riskScore: z.number().min(0).max(1),
  communityScore: z.number().min(0).max(100).optional(),
  docsScore: z.number().min(0).max(100).optional(),
})

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parsed = Body.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }

  const input = parsed.data

  // --- Heuristiques de simulation Collaterize ---
  const weightedScore =
    0.4 * input.journeyScore +
    0.2 * (input.communityScore ?? input.journeyScore) +
    0.2 * (input.docsScore ?? input.journeyScore) +
    0.2 * (100 - input.riskScore * 100)

  let tier: 'CORE' | 'EXPERIMENTAL' | 'REJECTED'
  if (weightedScore >= 80) tier = 'CORE'
  else if (weightedScore >= 60) tier = 'EXPERIMENTAL'
  else tier = 'REJECTED'

  const accepted = tier !== 'REJECTED'

  const softCapUSD = input.fundraisingGoalUSD * 0.25
  const hardCapUSD = input.fundraisingGoalUSD
  const liquidityUSD = input.fundraisingGoalUSD * 0.4 // ex : 40% en LP
  const initialPriceUSD =
    input.fundraisingGoalUSD /
    Math.max(input.circulatingAtTGE, 1)

  const notes: string[] = []
  if (!accepted)
    notes.push(
      "Score global insuffisant pour une intégration standard. Renforcer la documentation, l'audit et la communauté."
    )
  else if (tier === 'EXPERIMENTAL')
    notes.push(
      "Projet intéressant mais encore jeune : éligible en experimental track sous conditions."
    )
  else notes.push("Projet éligible pour un launch 'Core' avec Collaterize.")

  if ((input.docsScore ?? 0) < 70)
    notes.push('Renforcer la documentation projet (whitepaper, litepaper, tokenomics).')

  if ((input.communityScore ?? 0) < 70)
    notes.push("Travailler la communauté avant le launch (Discord, Twitter, ambassadeurs).")

  const simulatedLaunchUrl = `https://app.collaterize.finance/launches/MFAI-DEMO-${Date.now()}`

  const simulation = {
    accepted,
    eligibilityScore: Math.round(weightedScore),
    tier,
    targetRaiseUSD: input.fundraisingGoalUSD,
    softCapUSD,
    hardCapUSD,
    liquidityUSD,
    initialPriceUSD,
    notes,
    simulatedLaunchUrl,
    // potentiellement : timings, vesting, etc.
  }

  return NextResponse.json({ ok: true, simulation })
}
```

👉 **Important** : ce n’est que de la simulation, mais structurée comme une **réponse d’API partenaire**. Plus tard, cette route pourra :

* soit proxyer un vrai appel Collaterize,
* soit mixer “vraie réponse” + “post-traitement MFAI”.

---

### 3.2. Côté `mf-back` : appel à l’API `web`

Dans `mf-back`, tu peux créer un petit service :

```ts
// mf-back/services/collaterizeSimService.ts
import axios from 'axios'

export async function simulateCollaterizeLaunch(params: {
  wallet: string
  tokenMint?: string
  tokenSymbol: string
  totalSupply: number
  circulatingAtTGE: number
  fundraisingGoalUSD: number
  journeyScore: number
  riskScore: number
  communityScore?: number
  docsScore?: number
}) {
  const baseUrl = process.env.WEB_API_BASE_URL || 'https://mfai.app'
  const res = await axios.post(`${baseUrl}/api/integrations/collaterize/simulate`, params, {
    timeout: 5000,
  })

  if (!res.data?.ok) throw new Error('Collaterize simulation failed')

  return res.data.simulation
}
```

Puis dans ton routeur Express :

```ts
// mf-back/routes/journeyLaunchRoutes.ts
router.post('/journeys/:id/phases/launch-collaterize/simulate', async (req, res) => {
  try {
    const journeyId = req.params.id
    const journey = await Journey.findById(journeyId)
    if (!journey) return res.status(404).json({ error: 'journey_not_found' })

    const user = await User.findById(journey.user_id)
    if (!user) return res.status(404).json({ error: 'user_not_found' })

    // Exemple : récupérer des indicateurs de ton métier
    const journeyScore = journey.metrics?.globalScore ?? 75
    const riskScore = journey.metrics?.riskScore ?? 0.3
    const communityScore = journey.metrics?.communityScore ?? 70
    const docsScore = journey.metrics?.docsScore ?? 65

    // Config token : à terme elle sera fournie par l'utilisateur
    const tokenSymbol = journey.tokenConfig?.symbol ?? 'MFAI'
    const totalSupply = journey.tokenConfig?.totalSupply ?? 1_000_000_000
    const circulatingAtTGE = journey.tokenConfig?.circulatingAtTGE ?? 50_000_000
    const fundraisingGoalUSD = journey.tokenConfig?.fundraisingGoalUSD ?? 200_000

    const simulation = await simulateCollaterizeLaunch({
      wallet: journey.user_wallet,
      tokenMint: journey.tokenConfig?.mintAddress,
      tokenSymbol,
      totalSupply,
      circulatingAtTGE,
      fundraisingGoalUSD,
      journeyScore,
      riskScore,
      communityScore,
      docsScore,
    })

    // On trouve la phase LAUNCH_COLLATERIZE et on l’enrichit
    const phase = journey.phases.find((p) => p.type === 'LAUNCH_COLLATERIZE')
    if (!phase) return res.status(400).json({ error: 'launch_phase_missing' })

    phase.collaterizeSimulation = simulation
    phase.status = 'COMPLETED'

    await journey.save()

    res.json({ ok: true, simulation })
  } catch (e) {
    console.error('launch-collaterize simulate error', e)
    res.status(500).json({ error: 'internal_error' })
  }
})
```

---

## 4. Front `journey-simulator` : écran de simulation du Launch Collaterize

### 4.1. Store : représentations de la phase

Dans ton `journeyStore`, tu peux prévoir un objet pour cette phase :

```ts
type CollaterizeSimulation = {
  accepted: boolean
  eligibilityScore: number
  tier: 'CORE' | 'EXPERIMENTAL' | 'REJECTED'
  targetRaiseUSD: number
  softCapUSD: number
  hardCapUSD: number
  liquidityUSD: number
  initialPriceUSD: number
  notes: string[]
  simulatedLaunchUrl: string
}
```

Tu ajoutes un champ `launchSimulation?: CollaterizeSimulation` dans ton state, mis à jour quand tu reçois la réponse de `mf-back`.

### 4.2. Composant React “LaunchPhaseCollaterize”

Un composant qui :

1. Affiche un bouton “Simuler le launch avec Collaterize”.
2. Appelle `POST /api/.../launch-collaterize/simulate`.
3. Affiche le résultat dans un layout “Launch Dashboard”.

Structure Zyno-friendly :

* **Bloc 1** : Résumé

  * “Eligibilité : ✔ / ✖”
  * “Score Collaterize : 83/100 – Tier : CORE”
* **Bloc 2** : Plan de pool

  * Target raise, soft cap, hard cap, liquidity, initial price.
* **Bloc 3** : Checklist & recommandations

  * Liste de `notes` avec badges (OK / À améliorer).
* **Bloc 4** : CTA

  * Bouton “Ouvrir Collaterize (simulation)” avec lien `simulatedLaunchUrl`.
  * Texte : “Lorsque l’intégration sera live, ce bouton t’emmènera directement sur la page de launch Collaterize avec ces paramètres pré-remplis.”

---

## 5. Pourquoi cette approche est intéressante pour ton MVP

1. **Tu gardes la logique 100 % cohérente avec le narratif TDeFi / Collaterize**
   – Multi-agents qui préparent un projet,
   – Pipeline complet : idée → tokenomics → communauté → **launch sur un partenaire**.

2. **Tu restes honnête** :
   – c’est clairement labellisé comme une **simulation**,
   – mais techniquement, l’architecture est déjà alignée pour la vraie intégration (route Next d’intégration, phase dédiée, stockage de la simulation).

3. **Tu prépares la vraie intégration** :
   – quand tu auras accès aux API Collaterize et à un workflow de launch codé avec eux,
   – il suffira de modifier la route `/api/integrations/collaterize/simulate` pour passer de “simulateur local” à “bridge vers Collaterize”, en gardant la même interface côté `mf-back` et `journey-simulator`.

En résumé :
👉 On ajoute une **dernière phase de Journey** “Launch via Collaterize” qui se comporte comme un **simulateur d’éligibilité + plan de launch**,
👉 on l’implémente comme une **API d’intégration factice mais structurée** côté `web`,
👉 et on l’expose dans `journey-simulator` comme une “preview réaliste” de ce que ferait un lancement réel sur Collaterize.

Très bien, on va transformer cette “idée de phase Collaterize” en un **vrai module de produit** : stack technique, cahier des charges, et plan d’intégration propre dans ton stack actuel.

Je vais structurer en 4 parties :

1. Vision & périmètre de la phase “Launch Collaterize”
2. Stack technique & découpage par couche (front, mf-back, web, DB, infra)
3. Cahier des charges fonctionnel & technique détaillé
4. Plan d’intégration étape par étape dans le stack actuel

---

## 1. Vision & périmètre de la phase “Launch Collaterize”

### 1.1. Objectif métier

Ajouter une **dernière phase de parcours** :

> *“Simulation de launch sur Collaterize à partir de ton projet préparé dans Money Factory AI.”*

Concrètement, cette phase doit :

* Exploiter les **sorties du journey** :

  * score global,
  * scores par phase (tokenomics, communauté, risk management, docs…),
  * configuration du token (symbol, supply, TGE, etc.),
* Produire une **simulation de décision Collaterize** :

  * Accepted / Experimental / Rejected,
  * Tier (CORE / EXPERIMENTAL / REJECTED),
  * Proposition de plan de levée (soft cap, hard cap, liquidity, initial price, etc.),
  * Liste de recommandations (checklist à améliorer).
* S’intégrer parfaitement à ton **stack web3** sans être du “fake UI” :

  * via une vraie API d’intégration (`/api/integrations/collaterize/simulate`),
  * avec un modèle de données durable (Mongo + Postgres),
  * en laissant la porte ouverte à une **future intégration réelle des API Collaterize**.

---

## 2. Stack technique & découpage par couche

On reste cohérents avec ton architecture actuelle :

### 2.1. Côté front “journey-simulator” (Vite/React)

* **Tech :** Vite + React + TypeScript + Zustand (ou équivalent) pour le store.
* Rôle sur cette phase :

  * afficher les étapes du parcours,
  * déclencher l’appel à la phase “Launch Collaterize”,
  * afficher le **résultat de simulation** sous forme de dashboard.

**Nouveaux éléments front :**

* Un composant React dédié (par ex. `LaunchCollaterizePhase.tsx`).
* Des types partagés pour la simulation :

```ts
type CollaterizeSimulation = {
  accepted: boolean
  eligibilityScore: number
  tier: 'CORE' | 'EXPERIMENTAL' | 'REJECTED'
  targetRaiseUSD: number
  softCapUSD: number
  hardCapUSD: number
  liquidityUSD: number
  initialPriceUSD: number
  notes: string[]
  simulatedLaunchUrl: string
}
```

* Intégration avec le store `journeyStore` (phase finale, statut, erreurs).

---

### 2.2. Côté `mf-back` (Express + MongoDB)

* **Tech :** Node.js, Express, TypeScript, Mongoose (ou modèle équivalent).
* Rôle :

  * cœur de la **logique métier de journey** (phases, XP, scoring),
  * orchestrateur de la **phase Launch Collaterize** :

    * agrège les données nécessaires,
    * appelle l’API d’intégration dans `web`,
    * persiste le résultat dans Mongo.

**Nouveaux éléments côté `mf-back` :**

1. **Extension du modèle Journey/Phase** :

   * ajout d’un type de phase `LAUNCH_COLLATERIZE`,
   * ajout d’un sous-document `collaterizeSimulation`.

2. **Nouvelle route métier** :

   * `POST /api/journeys/:id/phases/launch-collaterize/simulate`
   * qui :

     * vérifie que le journey est complet,
     * calcule/charge les scores nécessaires,
     * appelle `web` → `/api/integrations/collaterize/simulate`,
     * stocke la simulation dans la phase,
     * renvoie la simulation au front.

3. **Service d’intégration** :

   * `CollaterizeSimulationService` : envoie un `POST` à `web` avec un spec bien défini.
   * Géré via `axios` ou `fetch`.

---

### 2.3. Côté `web` (Next.js + Prisma + Postgres + Redis)

* **Tech :** Next 14 App Router, TypeScript, Prisma, Postgres, Redis.
* Rôle :

  * **Gateway d’intégration Web3 & partenaires**,
  * expose une API “Collaterize” interne, encore simulée mais structurée comme une API de partenaire,
  * plus tard, c’est ici qu’on branchera les API réelles Collaterize.

**Nouveaux éléments côté `web` :**

1. **Route d’intégration Collaterize**
   `/app/api/integrations/collaterize/simulate/route.ts` :

   * prend un payload structuré (wallet, scores, token config, fundraisingGoal…),
   * applique une **fonction de scoring & heuristiques**,
   * renvoie un objet `CollaterizeSimulation`.

2. **Optionnel** : table de logs dans Postgres :

```prisma
model CollaterizeSimulationLog {
  id           String   @id @default(cuid())
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  userWallet   String
  journeyId    String
  tier         String
  accepted     Boolean
  eligibilityScore Int
  fundraisingGoalUSD Float
  softCapUSD   Float
  hardCapUSD   Float
  liquidityUSD Float
  initialPriceUSD Float

  rawInput     Json
  rawOutput    Json
}
```

3. **Auth & sécurité** entre `mf-back` et `web` :

   * `mf-back` appelle `web` avec un header `x-internal-api-key`,
   * `web` vérifie la clé dans `process.env.INTERNAL_API_KEY_MFBACK`.

Redis n’est pas obligatoire ici (pas de queue ni de SIWS pour cette feature), mais l’architecture reste compatible.

---

### 2.4. Côté on-chain (Solana)

Pour cette phase “simulation Collaterize”, **aucun appel RPC Solana n’est strictement nécessaire**.
Mais tu peux utiliser :

* les infos déjà on-chain (token déjà minté en testnet pour le projet),
* ou plus tard interroger des APIs type Helius / DAS pour enrichir la simulation (liquidité réelle, historique, etc.).

Pour le MVP, la simulation reste **off-chain** mais **compatible** avec la réalité on-chain.

---

## 3. Cahier des charges détaillé

### 3.1. Cahier des charges fonctionnel

#### 3.1.1. Acteurs

* **Founder / Builder** (user) :

  * suit un parcours complet (multi-agents),
  * à la dernière phase, déclenche la simulation de launch Collaterize,
  * consulte le résultat (éligibilité + plan de launch + recommandations).
* **Admin MFAI** :

  * peut calibrer la simulation (poids des scores, seuils),
  * peut auditer les logs de simulation (via la DB Postgres).

#### 3.1.2. Parcours utilisateur

1. L’utilisateur termine toutes les phases du journey :

   * discovery,
   * tokenomics,
   * communauté,
   * risk & compliance, etc.
2. Le système marque le journey comme **“ready for launch simulation”**.
3. L’utilisateur arrive sur la phase “Launch Collaterize” :

   * le front affiche un résumé du projet (token, cible de levée, etc.),
   * bouton : *“Simuler le launch avec Collaterize”*.
4. Lors du clic :

   * appel à `mf-back` → simulation,
   * mf-back appelle `web` → simulation Collaterize,
   * le résultat est renvoyé et stocké.
5. L’UI affiche :

   * statut d’éligibilité : ✅ Accepté / ⚠ Experimental / ❌ Refusé,
   * score de Collaterize (0–100),
   * plan de levée : `targetRaise`, `softCap`, `hardCap`, `liquidity`, `initialPrice`,
   * un texte “simulated launch link” (URL factice),
   * une checklist des points forts / faiblesses.
6. L’utilisateur peut :

   * revenir aux phases précédentes pour améliorer ses scores,
   * relancer la simulation une fois les données mises à jour (avec un historique des simulations si besoin).

#### 3.1.3. Règles métier de base (paramétrables)

* Score global Collaterize :

  [
  S = 0.4 \cdot \text{journeyScore} + 0.2 \cdot communityScore + 0.2 \cdot docsScore + 0.2 \cdot (100 - 100 \cdot riskScore)
  ]

* Classification :

  * `S ≥ 80` → tier `CORE`, `accepted = true`
  * `60 ≤ S < 80` → tier `EXPERIMENTAL`, `accepted = true`
  * `S < 60` → tier `REJECTED`, `accepted = false`

* Plan de levée (exemple) :

  * `softCap = 0.25 * fundraisingGoal`
  * `hardCap = fundraisingGoal`
  * `liquidity = 0.4 * fundraisingGoal` (40% en LP)
  * `initialPrice = fundraisingGoal / circulatingAtTGE`

* Checklist (notes) générée selon les scores :

  * docsScore < 70 → “Renforcer la documentation : whitepaper, litepaper, tokenomics”.
  * communityScore < 70 → “Travailler la communauté avant le launch : Discord, Twitter, ambassadeurs”.
  * riskScore > 0.5 → “Formaliser le risk management (legal, compliance, sécurité).”

Ces coefficients doivent être **centralisés dans une config** (JSON ou `.env`), pour être facilement modifiables.

---

### 3.2. Cahier des charges technique

#### 3.2.1. Modèles & schémas

**MongoDB – modèle Journey/Phase**

* Ajout d’un type de phase :

```ts
type JourneyPhaseType =
  | 'DISCOVERY'
  | 'TOKENOMICS'
  | 'COMMUNITY'
  | 'LAUNCH_COLLATERIZE'
  | ... ;
```

* Ajout d’un sous-schema :

```ts
const CollaterizeSimulationSchema = new Schema({
  accepted: Boolean,
  eligibilityScore: Number,
  tier: String,
  targetRaiseUSD: Number,
  softCapUSD: Number,
  hardCapUSD: Number,
  liquidityUSD: Number,
  initialPriceUSD: Number,
  notes: [String],
  simulatedLaunchUrl: String,
})
```

* Extension du schema de phase :

```ts
const PhaseSchema = new Schema({
  // ...
  type: { type: String, enum: [..., 'LAUNCH_COLLATERIZE'], required: true },
  status: { type: String, enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED'], default: 'PENDING' },
  collaterizeSimulation: CollaterizeSimulationSchema,
})
```

**Postgres – log des simulations (optionnel mais recommandé)**

```prisma
model CollaterizeSimulationLog {
  id                String   @id @default(cuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  userWallet        String
  journeyId         String
  tier              String
  accepted          Boolean
  eligibilityScore  Int
  fundraisingGoalUSD Float
  softCapUSD        Float
  hardCapUSD        Float
  liquidityUSD      Float
  initialPriceUSD   Float

  rawInput          Json
  rawOutput         Json
}
```

---

#### 3.2.2. APIs & contrats JSON

**1. API `web` – `/api/integrations/collaterize/simulate`**

* **Request body** :

```json
{
  "wallet": "So1aNaWalLetBase58...",
  "tokenMint": "optionalMintAddress",
  "tokenSymbol": "MFAI",
  "totalSupply": 1000000000,
  "circulatingAtTGE": 50000000,
  "fundraisingGoalUSD": 200000,
  "journeyScore": 82,
  "riskScore": 0.3,
  "communityScore": 75,
  "docsScore": 68
}
```

* **Response body** :

```json
{
  "ok": true,
  "simulation": {
    "accepted": true,
    "eligibilityScore": 83,
    "tier": "CORE",
    "targetRaiseUSD": 200000,
    "softCapUSD": 50000,
    "hardCapUSD": 200000,
    "liquidityUSD": 80000,
    "initialPriceUSD": 0.004,
    "notes": [
      "Projet éligible pour un launch 'Core' avec Collaterize.",
      "Renforcer la documentation projet (whitepaper, litepaper, tokenomics)."
    ],
    "simulatedLaunchUrl": "https://app.collaterize.finance/launches/MFAI-DEMO-..."
  }
}
```

**2. API `mf-back` – `/journeys/:id/phases/launch-collaterize/simulate`**

* **Request :** pas de body, tout vient du serveur (journey, user).
* **Response** :

```json
{
  "ok": true,
  "simulation": {
    "accepted": true,
    "eligibilityScore": 83,
    "tier": "CORE",
    "targetRaiseUSD": 200000,
    "softCapUSD": 50000,
    "hardCapUSD": 200000,
    "liquidityUSD": 80000,
    "initialPriceUSD": 0.004,
    "notes": [ "...", "..." ],
    "simulatedLaunchUrl": "..."
  }
}
```

**3. Front `journey-simulator`**

* Réutilise strictement le même type `CollaterizeSimulation` que `mf-back` et `web` (via un package shared TS si possible).

---

#### 3.2.3. Sécurité & configuration

* `mf-back` → `web` :

  * header `x-internal-api-key: <clé>` obligatoire,
  * `web` vérifie `process.env.INTERNAL_API_KEY_MFBACK`.

* Variables d’environnement à prévoir :

```env
WEB_API_BASE_URL=https://mfai.app
INTERNAL_API_KEY_MFBACK=super-secret-key
COLLATERIZE_SCORING_WEIGHTS='{"journeyScore":0.4,"communityScore":0.2,"docsScore":0.2,"riskScore":0.2}'
COLLATERIZE_SCORING_THRESHOLDS='{"core":80,"experimental":60}'
COLLATERIZE_SIM_ENABLED=1
```

* Feature flag :

  * si `COLLATERIZE_SIM_ENABLED=0`, `mf-back` ne présente pas la phase ou renvoie `"feature_disabled"`.

---

#### 3.2.4. Logs, monitoring, tests

* **Logs** (niveau info) :

  * chaque appel à `web/api/integrations/collaterize/simulate` → loger :

    * wallet (anonymisé si besoin, ex : 4 premiers / 4 derniers caractères),
    * journeyId,
    * tier, accepted, eligibilityScore.

* **Tests unitaires** :

  * fonction pure de scoring dans `web` : tests Jest avec plusieurs scénarios :

    * projet excellent (CORE),
    * projet moyen (EXPERIMENTAL),
    * projet faible (REJECTED).

* **Tests d’intégration** :

  * `mf-back` : mock de `web` pour vérifier que la phase se met bien à jour,
  * `journey-simulator` : tests e2e (Cypress) pour vérifier l’affichage correct du dashboard de simulation.

---

## 4. Plan d’intégration dans le stack actuel

### Étape 1 – Types & logique pure de simulation

* Créer un module pur TS dans `web` :

```ts
// web/packages/integrations/collaterize/simulation.ts
export type CollaterizeInput = { ... }
export type CollaterizeSimulation = { ... }

export function computeCollaterizeSimulation(input: CollaterizeInput, config: WeightsConfig): CollaterizeSimulation { ... }
```

* C’est ce module que la route Next importera.

### Étape 2 – Route Next `/api/integrations/collaterize/simulate`

* Implémenter la route en s’appuyant sur `computeCollaterizeSimulation`.
* Ajouter la validation Zod, la gestion des configs via `.env`.
* (Optionnel) écrire dans `CollaterizeSimulationLog`.

### Étape 3 – mf-back : modèle & route

* Étendre le schema Mongo (Phase, CollaterizeSimulation).
* Ajouter le service `simulateCollaterizeLaunch` qui appelle `web`.
* Créer la route Express `/journeys/:id/phases/launch-collaterize/simulate`.

### Étape 4 – Front journey-simulator

* Ajouter le type `CollaterizeSimulation` dans un module partagé du front.
* Étendre le store pour stocker la simulation sur la dernière phase.
* Créer le composant `LaunchCollaterizePhase.tsx` :

  * bouton “Simuler le launch”,
  * état `loading / success / error`,
  * affichage dashboard.

### Étape 5 – Feature flag & QA

* Ajouter `COLLATERIZE_SIM_ENABLED`.
* QA sur dev/test :

  * parcours complet + simulation,
  * cas d’erreur (journey incomplet, API web down, etc.).
* Ajuster les poids et messages pour que le rendu soit cohérent avec ton narratif TDeFi/Collaterize.

---

En résumé :

* Tu ajoutes **une brique cohérente “Launch Collaterize”** à ton stack,
* structurée comme une vraie **intégration partenaire**, mais en mode simulation au départ,
* parfaitement alignée avec ton architecture multi-couches (journey off-chain, web3 gateway, futures intégrations réelles).

Je vais te donner les deux :

1. Un **tableau récapitulatif** des fichiers à créer / modifier, avec chemins recommandés.
2. Une **version en anglais, technique**, du cahier des charges “Collaterize Launch Simulation”.

---

## 1. Tableau récapitulatif – fichiers à créer / modifier

> ⚠️ Remarque honnête : n’ayant pas l’arborescence exacte de ton repo sous les yeux, je te donne des **chemins recommandés**, cohérents avec un monorepo `web` (Next) + `mf-back` (Express) + `journey-simulator` (front Vite). Tu pourras ajuster les chemins si tes dossiers diffèrent légèrement.

### 1.1. Côté `web` (Next.js + Prisma + Postgres)

| Type                    | Chemin recommandé                                        | Rôle principal                                                                                                                                                   |
| ----------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nouveau**             | `web/packages/integrations/collaterize/simulation.ts`    | Module pur TS qui contient les types `CollaterizeInput`, `CollaterizeSimulation` et la fonction de scoring `computeCollaterizeSimulation`.                       |
| **Nouveau**             | `web/app/api/integrations/collaterize/simulate/route.ts` | Route Next (App Router) qui reçoit les paramètres de launch, appelle `computeCollaterizeSimulation` et renvoie la simulation JSON.                               |
| **Modifier**            | `web/prisma/schema.prisma`                               | Ajout du modèle `CollaterizeSimulationLog` pour loguer les simulations (optionnel mais recommandé).                                                              |
| **Modifier**            | `web/.env.local` (ou équivalent)                         | Ajout des variables : `WEB_API_BASE_URL`, `INTERNAL_API_KEY_MFBACK`, `COLLATERIZE_SCORING_WEIGHTS`, `COLLATERIZE_SCORING_THRESHOLDS`, `COLLATERIZE_SIM_ENABLED`. |
| **Optionnel (nouveau)** | `web/src/server/config/collaterizeConfig.ts`             | Fichier centralisant les poids, seuils et paramètres de simulation (chargés à partir des env).                                                                   |

---

### 1.2. Côté `mf-back` (Express + MongoDB)

| Type         | Chemin recommandé                                                                | Rôle principal                                                                                                                                                                                                 |
| ------------ | -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Modifier** | `mf-back/src/models/Journey.ts` (ou `models/journeyModel.ts`)                    | Extension du schéma Journey/Phase : ajout du type de phase `LAUNCH_COLLATERIZE` + sous-document `collaterizeSimulation`.                                                                                       |
| **Nouveau**  | `mf-back/src/services/collaterizeSimService.ts`                                  | Service qui appelle `WEB_API_BASE_URL/api/integrations/collaterize/simulate` avec les bonnes données (wallet, scores, token config…).                                                                          |
| **Nouveau**  | `mf-back/src/routes/journeyLaunchRoutes.ts` (ou intégré dans `journeyRoutes.ts`) | Route REST `POST /api/journeys/:id/phases/launch-collaterize/simulate` qui : agrège les données du journey, appelle le service d’intégration, stocke la simulation dans Mongo et renvoie le résultat au front. |
| **Modifier** | `mf-back/src/app.ts` ou `src/index.ts`                                           | Montage de la nouvelle route `journeyLaunchRoutes` dans l’app Express (`app.use('/api', journeyLaunchRoutes)`, etc.).                                                                                          |
| **Modifier** | `mf-back/.env`                                                                   | Ajout de `WEB_API_BASE_URL` et `INTERNAL_API_KEY_MFBACK` côté backend.                                                                                                                                         |

---

### 1.3. Côté `journey-simulator` (front Vite/React)

| Type          | Chemin recommandé                                                    | Rôle principal                                                                                                                                     |
| ------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Nouveau**   | `journey-simulator/src/types/collaterize.ts`                         | Définition du type `CollaterizeSimulation` (et éventuellement `CollaterizePhaseState`) partagé dans tout le front.                                 |
| **Modifier**  | `journey-simulator/src/store/journeyStore.ts`                        | Ajout d’un champ `launchSimulation?: CollaterizeSimulation` dans le state, plus d’une action pour déclencher la simulation et stocker le résultat. |
| **Nouveau**   | `journey-simulator/src/components/phases/LaunchCollaterizePhase.tsx` | Composant React qui : affiche le résumé du projet, appelle `mf-back` pour simuler, gère loading/erreur, et rend le dashboard de simulation.        |
| **Modifier**  | `journey-simulator/src/components/JourneyRunner.tsx` (ou équivalent) | Intégration de la nouvelle phase `LAUNCH_COLLATERIZE` dans le switch/rendu des phases.                                                             |
| **Optionnel** | `journey-simulator/src/config/featureFlags.ts`                       | Ajout d’un flag `enableCollaterizeLaunchPhase` pour activer/désactiver cette phase selon l’environnement.                                          |

---

## 2. Technical Specification in English (Collaterize Launch Simulation)

Below is a **technical, English version** of the specification you can share with a dev, an external collaborator, or even TDeFi to show how the “Launch Collaterize” module will be integrated.

### 2.1. Overview

**Goal**
Add a final journey phase called **“Launch on Collaterize (Simulated)”**, which:

* Uses **off-chain journey results** (scores, tokenomics, community, risk, docs)
* Produces a **realistic launch simulation** as if the project were submitted to Collaterize:

  * Eligibility decision (accepted / experimental / rejected)
  * Tier (CORE / EXPERIMENTAL / REJECTED)
  * Launch plan (soft cap, hard cap, liquidity, initial price)
  * Recommendations / checklist

This is **initially fully simulated off-chain**, but architected so that it can later be replaced or augmented with **real Collaterize APIs**.

---

### 2.2. Architecture & Components

The feature is split across three main layers:

1. **journey-simulator (Vite/React)** – user-facing UI for the last phase.
2. **mf-back (Express + MongoDB)** – journey logic & aggregation layer.
3. **web (Next.js + Prisma + Postgres)** – integration gateway, scoring engine & audit logging.

#### 2.2.1. Frontend – `journey-simulator`

* Technology: Vite, React, TypeScript, Zustand (or equivalent).
* Responsibilities:

  * Render the “Launch Collaterize” phase as the **final step** of a journey.
  * Trigger a call to `mf-back` to compute a launch simulation.
  * Display a **launch dashboard** summarizing:

    * Collaterize eligibility (accepted / experimental / rejected),
    * Score and tier,
    * Launch plan (fundraising, caps, liquidity, price),
    * Recommendations and “simulated launch URL”.

**Key types:**

```ts
export type CollaterizeSimulation = {
  accepted: boolean
  eligibilityScore: number
  tier: 'CORE' | 'EXPERIMENTAL' | 'REJECTED'
  targetRaiseUSD: number
  softCapUSD: number
  hardCapUSD: number
  liquidityUSD: number
  initialPriceUSD: number
  notes: string[]
  simulatedLaunchUrl: string
}
```

**Key UI Component:**

* `LaunchCollaterizePhase.tsx`:

  * Displays project summary (token symbol, supply, fundraising goal…).
  * “Simulate launch on Collaterize” button.
  * Loading / error states.
  * Launch dashboard view once simulation is returned.

---

#### 2.2.2. Backend – `mf-back` (Express + MongoDB)

* Technology: Node.js, Express, TypeScript, Mongoose.
* Responsibilities:

  * Maintain **journey lifecycle and phases**.
  * Aggregate all required data for the Collaterize simulation:

    * journey global score,
    * phase-specific metrics (communityScore, docsScore, riskScore…),
    * token configuration (symbol, totalSupply, circulatingAtTGE, fundraisingGoalUSD),
    * user wallet address.
  * Call the **integration API** exposed by `web`.
  * Persist the simulation result in Mongo, attached to the final journey phase.

**Data Model Changes (Mongo):**

* Extend `JourneyPhaseType` enum to include:

```ts
'LAUNCH_COLLATERIZE'
```

* Add a `collaterizeSimulation` subdocument to the phase schema:

```ts
const CollaterizeSimulationSchema = new Schema({
  accepted: Boolean,
  eligibilityScore: Number,
  tier: String,
  targetRaiseUSD: Number,
  softCapUSD: Number,
  hardCapUSD: Number,
  liquidityUSD: Number,
  initialPriceUSD: Number,
  notes: [String],
  simulatedLaunchUrl: String,
})
```

* Extend `PhaseSchema` to include:

```ts
collaterizeSimulation: CollaterizeSimulationSchema
```

**New API Endpoint (mf-back):**

* `POST /api/journeys/:id/phases/launch-collaterize/simulate`

  * Validates that the journey exists and is complete.
  * Loads:

    * journey metrics (`journey.metrics.globalScore`, `riskScore`, etc.),
    * token configuration, e.g. from `journey.tokenConfig`,
    * user wallet associated with the journey.
  * Calls `simulateCollaterizeLaunch(...)` service.
  * Stores the returned simulation into `phase.collaterizeSimulation`.
  * Marks the phase as `COMPLETED`.
  * Returns `{ ok: true, simulation }` to the frontend.

**Integration Service (mf-back):**

* `simulateCollaterizeLaunch(params: CollaterizeInput): Promise<CollaterizeSimulation>`

Where:

```ts
type CollaterizeInput = {
  wallet: string
  tokenMint?: string
  tokenSymbol: string
  totalSupply: number
  circulatingAtTGE: number
  fundraisingGoalUSD: number
  journeyScore: number
  riskScore: number
  communityScore?: number
  docsScore?: number
}
```

The service:

* Reads `WEB_API_BASE_URL` and `INTERNAL_API_KEY_MFBACK` from env.
* Calls `POST ${WEB_API_BASE_URL}/api/integrations/collaterize/simulate`.
* Returns the `simulation` object from the JSON response.

---

#### 2.2.3. Integration Gateway – `web` (Next.js + Prisma + Postgres)

* Technology: Next.js 14 (App Router), TypeScript, Prisma, Postgres.
* Responsibilities:

  * Expose a **single integration endpoint**:

    * `/api/integrations/collaterize/simulate`
  * Implement the **scoring engine** for the “Collaterize-like” decision.
  * Optionally log all simulations into Postgres for audit and debugging.

**Core Logic Module:**

File: `web/packages/integrations/collaterize/simulation.ts`

* Types:

```ts
export type CollaterizeInput = {
  wallet: string
  tokenMint?: string
  tokenSymbol: string
  totalSupply: number
  circulatingAtTGE: number
  fundraisingGoalUSD: number
  journeyScore: number
  riskScore: number
  communityScore?: number
  docsScore?: number
}

export type CollaterizeSimulation = {
  accepted: boolean
  eligibilityScore: number
  tier: 'CORE' | 'EXPERIMENTAL' | 'REJECTED'
  targetRaiseUSD: number
  softCapUSD: number
  hardCapUSD: number
  liquidityUSD: number
  initialPriceUSD: number
  notes: string[]
  simulatedLaunchUrl: string
}
```

* Pure function:

```ts
export function computeCollaterizeSimulation(
  input: CollaterizeInput,
  config: {
    weights: {
      journeyScore: number
      communityScore: number
      docsScore: number
      riskScore: number
    }
    thresholds: {
      core: number
      experimental: number
    }
  }
): CollaterizeSimulation {
  // 1. Weighted score
  // 2. Tier decision
  // 3. Launch plan (softCap, hardCap, liquidity, price)
  // 4. Recommendations (notes)
}
```

**API Route:**

File: `web/app/api/integrations/collaterize/simulate/route.ts`

* Validates the input with Zod.
* Loads config from environment:

```env
COLLATERIZE_SCORING_WEIGHTS='{"journeyScore":0.4,"communityScore":0.2,"docsScore":0.2,"riskScore":0.2}'
COLLATERIZE_SCORING_THRESHOLDS='{"core":80,"experimental":60}'
```

* Calls `computeCollaterizeSimulation(input, config)`.
* Optionally writes a log entry into Postgres (`CollaterizeSimulationLog`).
* Returns:

```json
{
  "ok": true,
  "simulation": { ... }
}
```

**Optional Prisma Model:**

```prisma
model CollaterizeSimulationLog {
  id                 String   @id @default(cuid())
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  userWallet         String
  journeyId          String
  tier               String
  accepted           Boolean
  eligibilityScore   Int
  fundraisingGoalUSD Float
  softCapUSD         Float
  hardCapUSD         Float
  liquidityUSD       Float
  initialPriceUSD    Float

  rawInput           Json
  rawOutput          Json
}
```

---

### 2.3. Scoring Model (example)

Example scoring:

[
S = w_1 \cdot \text{journeyScore}

* w_2 \cdot \text{communityScore}
* w_3 \cdot \text{docsScore}
* w_4 \cdot (100 - 100 \cdot \text{riskScore})
  ]

With default weights:

* `journeyScore`: 0.4
* `communityScore`: 0.2
* `docsScore`: 0.2
* `riskScore`: 0.2

Tiering:

* `S ≥ coreThreshold` (e.g. 80) → `tier = CORE`, `accepted = true`
* `experimentalThreshold ≤ S < coreThreshold` (e.g. 60–80) → `tier = EXPERIMENTAL`, `accepted = true`
* `S < experimentalThreshold` → `tier = REJECTED`, `accepted = false`

Launch parameters:

* `softCapUSD = 0.25 * fundraisingGoalUSD`
* `hardCapUSD = fundraisingGoalUSD`
* `liquidityUSD = 0.4 * fundraisingGoalUSD`
* `initialPriceUSD = fundraisingGoalUSD / max(circulatingAtTGE, 1)`

---

### 2.4. Security & Configuration

* `mf-back` → `web` calls must include a static header:

```http
x-internal-api-key: <INTERNAL_API_KEY_MFBACK>
```

* `web` must validate this header against `process.env.INTERNAL_API_KEY_MFBACK`.
* Feature flag:

```env
COLLATERIZE_SIM_ENABLED=1
```

If `COLLATERIZE_SIM_ENABLED=0`, `mf-back` either hides the phase or returns `feature_disabled`.

---

### 2.5. Testing & Evolution

* **Unit tests** on `computeCollaterizeSimulation`:

  * High-quality project → CORE.
  * Medium-quality project → EXPERIMENTAL.
  * Weak project → REJECTED.

* **Integration tests**:

  * `mf-back` with mocked `web` API.
  * `journey-simulator` end-to-end: completing a journey and seeing the final simulation.

* **Future evolution**:

  * Replace or augment `computeCollaterizeSimulation` with **real Collaterize API calls** inside `web`.
  * Reuse the same input/output contracts so that `mf-back` and `journey-simulator` remain unchanged.

---







