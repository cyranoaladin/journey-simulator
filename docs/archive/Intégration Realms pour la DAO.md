# **Rapport Technique Exhaustif : Intégration de l'Architecture Realms et du Protocole SPL Governance au sein du Moteur d'Orchestration Money Factory AI**

## **1\. Introduction et Analyse Contextuelle**

### **1.1 Le Paradigme de la Gouvernance Décentralisée dans l'Orchestration d'IA**

L'intégration d'une Organisation Autonome Décentralisée (DAO) au sein du projet **Money Factory AI \- Journey Simulator & Orchestration Engine** représente une évolution structurelle majeure, transformant une plateforme d'orchestration technique en un écosystème économique et décisionnel souverain. Le projet, défini comme un environnement de simulation décentralisé haute performance pour l'orchestration de parcours Web3, repose actuellement sur une architecture de micro-services robuste, intégrant un Backend Orchestrator (Express), une interface Frontend (Vite/React), et une persistance de données via MongoDB et Redis.1 L'objectif fondamental de cette intégration n'est pas uniquement la gestion de trésorerie, mais l'extension du contrôle décentralisé sur les agents autonomes du système — l'InvestorDemoAgent, le CoachAgent et le SentinelAgent 1 — permettant ainsi à la communauté de gouverner les paramètres vitaux de l'intelligence artificielle.

Dans le contexte spécifique de Money Factory AI, la gouvernance ne se limite pas à des votes symboliques. Elle implique la capacité technique d'exécuter des instructions sur la blockchain Solana qui modifient l'état opérationnel du protocole. En s'appuyant sur les principes de la blockchain Solana et de l'intégration RPC existante gérée par le Backend Orchestrator 1, l'architecture de Realms (l'interface utilisateur standard pour le protocole SPL Governance) offre les primitives nécessaires pour sécuriser, proposer et exécuter ces changements. L'absence de mention explicite du terme "DAO" dans la documentation initiale 1 suggère que cette couche de gouvernance doit être construite comme une surcouche (overlay) qui interagit avec l'infrastructure existante sans compromettre la "Politique Zéro Défaut" et la rigueur des tests E2E Playwright déjà en place.1

L'analyse approfondie des ressources techniques disponibles révèle une dichotomie critique dans l'écosystème de développement Solana actuel, opposant les bibliothèques historiques maintenues par Solana Labs aux nouvelles implémentations gérées par le **Mythic Project**.2 Ce rapport établira que pour une pérennité technique alignée sur les standards de 2026, l'adoption du governance-idl-sdk est impérative pour interagir avec le programme SPL Governance via TypeScript, remplaçant les méthodes obsolètes.3 Cette décision architecturale influence directement la manière dont le Backend Orchestrator et le Frontend React interagiront avec la chaîne.

### **1.2 Objectifs de l'Intégration Realms**

L'implémentation de Realms vise à répondre à trois impératifs stratégiques pour Money Factory AI. Premièrement, la **décentralisation de la configuration des agents**. Les agents tels que le SentinelAgent ou l'InvestorDemoAgent opèrent selon des contextes et des paramètres définis actuellement dans le code ou la base de données.1 Une DAO permettrait de stocker ces configurations sur la blockchain (dans des comptes de données PDA) et de n'autoriser leur modification que par un vote réussi via Realms. Deuxièmement, la **sécurisation de la trésorerie**. Le projet implique une intégration Web3 et des flux financiers potentiels. Realms, via ses fonctionnalités de Multisig et de gestion de trésorerie native, permet de placer les fonds sous le contrôle direct des détenteurs de tokens de gouvernance ou d'un conseil élu.4 Troisièmement, la **gestion des mises à jour protocolaires**. En transférant l'autorité de mise à jour des programmes Solana (Upgrade Authority) vers l'adresse PDA de la DAO, le projet garantit que toute modification du code des smart contracts sous-jacents doit être validée par la communauté, éliminant le risque de "rug pull" technique ou de modification unilatérale malveillante.5

## ---

**2\. Architecture Technique du Protocole SPL Governance**

### **2.1 Les Primitives Fondamentales de SPL Governance**

Pour concevoir une intégration robuste, il est essentiel de disséquer l'architecture interne du programme SPL Governance, qui constitue le moteur backend de Realms. Ce programme, écrit en Rust et déployé sur Solana, utilise une structure modulaire permettant la création de DAOs (appelées "Realms") agnostiques quant au type d'actifs gérés.5

Le **Realm** est l'entité racine. Sur le plan technique, c'est un compte Solana qui agrège les configurations de gouvernance pour un jeton communautaire spécifique (Community Mint) et, optionnellement, un jeton de conseil (Council Mint).5 La création d'un Realm génère une adresse dérivée (PDA \- Program Derived Address) qui servira d'identifiant unique pour l'organisation. Dans le cadre de Money Factory AI, ce Realm sera l'autorité suprême. Il est crucial de noter que le programme supporte deux modèles de déploiement : une instance partagée (le modèle standard utilisé par la plupart des projets via Realms.today) ou une instance privée appartenant à la DAO.5 Pour Money Factory AI, l'utilisation de l'instance partagée est recommandée pour bénéficier de l'interface utilisateur Realms existante tout en conservant la souveraineté sur les paramètres.

Au sein d'un Realm, l'unité fonctionnelle est la **Governance**. Une Governance est un compte qui définit des règles spécifiques (seuils de vote, délais d'exécution) pour un ensemble d'actifs ou d'actions. Il est courant d'avoir plusieurs Governances dans un seul Realm : une "Token Governance" pour gérer la trésorerie, une "Mint Governance" pour gérer l'émission de nouveaux tokens, et une "Program Governance" pour gérer les mises à jour de code.5 Chaque Governance possède sa propre GovernanceConfig, permettant une granularité fine. Par exemple, modifier les paramètres du CoachAgent pourrait requérir une majorité simple de 51%, tandis que débloquer des fonds de la trésorerie pourrait exiger une super-majorité de 75%.

### **2.2 Le Cycle de Vie d'une Proposition (Proposal Lifecycle)**

La compréhension du cycle de vie des propositions est déterminante pour l'implémentation des interfaces utilisateur dans le Frontend React de Money Factory. Une proposition (Proposal) est un conteneur d'instructions transactionnelles. Son cycle de vie est régi par l'énumération ProposalState définie dans le code Rust du programme.6

Le flux standard est le suivant :

1. **Draft (Brouillon) :** La proposition est créée mais n'est pas encore soumise au vote. C'est le seul moment où des instructions peuvent être ajoutées ou modifiées. Des signataires doivent "signer" la proposition pour la faire avancer.  
2. **Voting (Vote) :** Une fois les signatures requises obtenues, la proposition entre en période de vote. Les détenteurs de tokens (définis par le TokenOwnerRecord) peuvent cast leur vote (Approve/Deny).  
3. **Succeeded / Defeated (Succès / Échec) :** Si le seuil de vote ("Vote Threshold") est atteint et que la période de vote est terminée (ou que le seuil de basculement "Tipping" est atteint), l'état change.5  
4. **Executing (Exécution) :** C'est l'étape critique pour l'automatisation. Une proposition réussie ne s'exécute pas seule. Une transaction externe doit appeler l'instruction execute\_transaction sur le programme SPL Governance.3  
5. **Completed / Cancelled :** États finaux.

Pour Money Factory AI, le **Backend Orchestrator** devra surveiller ces états. Lorsqu'une proposition de modification des paramètres d'IA passe à l'état Succeeded, l'orchestrateur peut, soit attendre l'exécution on-chain pour réagir (approche réactive), soit déclencher des processus de préparation (approche proactive).

### **2.3 Voter Stake Registry (VSR) : Mécanisme de Pondération Avancé**

L'intégration simple de SPL Governance utilise le solde de tokens liquide pour le poids du vote (1 token \= 1 vote). Cependant, pour un projet d'orchestration complexe comme Money Factory AI, il est recommandé d'implémenter le **Voter Stake Registry (VSR)**.8 Le VSR est un "plugin" (add-in) pour SPL Governance qui permet de manipuler le poids du vote.

Le VSR introduit la notion de verrouillage (locking) et de vesting. Il permet de donner plus de poids aux utilisateurs qui verrouillent leurs tokens pour une longue période. Par exemple, un token verrouillé pour 5 ans pourrait valoir 100 voix, contre 1 voix pour un token liquide. Ce mécanisme est vital pour aligner les incitations des participants avec la vision à long terme du projet, évitant que des acteurs malveillants n'acquièrent des tokens à court terme pour perturber les algorithmes des agents IA.9 L'intégration technique du VSR nécessite de configurer un Registrar lors de la création du Realm et d'ajouter des instructions spécifiques de dépôt (Deposit) et de vote qui passent par le programme VSR avant d'atteindre SPL Governance.9

## ---

**3\. Stratégie d'Intégration et Choix Technologiques**

### **3.1 Migration vers le SDK Mythic Project**

Une découverte cruciale lors de l'analyse documentaire est l'état de maintenance des bibliothèques Solana. Le repository original solana-labs/solana-program-library indique explicitement que les packages de gouvernance ont été déplacés et que le code source est archivé.2 Continuer à utiliser @solana/spl-governance (version 0.3.x ou antérieure) expose le projet à des dettes techniques majeures et à des incompatibilités avec les nouvelles versions du runtime Solana et d'Anchor.

La recommandation formelle pour Money Factory AI est d'adopter le **governance-idl-sdk** maintenu par le **Mythic Project**.3 Ce SDK moderne est construit sur le concept d'IDL (Interface Definition Language), qui est le standard actuel pour le développement Solana avec Anchor.11 L'IDL fournit une représentation JSON de l'interface du programme, permettant de générer automatiquement des clients TypeScript typés et sécurisés. Contrairement à l'ancien SDK qui nécessitait une construction manuelle complexe des transactions binaire, le governance-idl-sdk abstrait ces opérations en méthodes intuitives comme createRealmInstruction ou castVoteInstruction.3

### **3.2 Stack Technologique Cible**

Pour intégrer Realms dans l'architecture existante de Money Factory AI, la stack technologique doit être augmentée comme suit :

| Composant | Technologie Actuelle | Technologie Ajoutée / Mise à Jour | Rôle dans la DAO |
| :---- | :---- | :---- | :---- |
| **Blockchain Client** | Solana RPC (via Web3.js) | **governance-idl-sdk**, **@coral-xyz/anchor** | Interaction typée avec les contrats de gouvernance. |
| **Backend** | Express, Node.js | **Watcher Service (Cron/Websocket)** | Indexation des états de propositions (ProposalState) vers MongoDB. |
| **Frontend** | Vite, React | **@solana/wallet-adapter-react**, **Realms UI Components** | Interface de vote et de création de propositions intégrée au simulateur. |
| **Persistence** | MongoDB | **Nouvelles Collections DAO** | Stockage cache des propositions pour performance UI (éviter RPC spam). |
| **Smart Contracts** | N/A (Intégration RPC) | **SPL Governance Program**, **Voter Stake Registry** | Moteurs de logique on-chain déployés sur Solana. |

Cette architecture hybride conserve la performance du "Backend Orchestrator" pour la simulation (temps réel) tout en utilisant la blockchain comme source de vérité ultime pour la configuration et la gouvernance.1

## ---

**4\. Implémentation Phase 1 : Déploiement et Configuration On-Chain**

Cette section détaille les étapes techniques pour instancier la DAO sur la blockchain Solana. Ces opérations doivent être exécutées par l'équipe DevOps/Blockchain (Alaeddine/Kamel) via des scripts TypeScript utilisant le SDK Mythic.

### **4.1 Script de Création du Realm**

L'initialisation du Realm est l'étape fondatrice. Le script suivant illustre l'utilisation du governance-idl-sdk pour créer un Realm configuré pour Money Factory AI. Il définit le jeton communautaire (Community Token) et configure les autorités.

Il est impératif de sécuriser les clés privées utilisées pour ce déploiement, conformément à la politique de sécurité du projet interdisant les secrets hardcodés.1

TypeScript

import { Connection, Keypair, PublicKey, Transaction, sendAndConfirmTransaction } from "@solana/web3.js";  
import { SplGovernance } from "governance-idl-sdk";  
import { Wallet } from "@coral-xyz/anchor";

// Configuration des constantes  
const RPC\_ENDPOINT \= "https://api.mainnet-beta.solana.com";   
const GOVERNANCE\_PROGRAM\_ID \= new PublicKey("GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw");  
// Adresses des Mints (Jetons) existants du projet Money Factory  
const COMMUNITY\_MINT \= new PublicKey("MFAITokenMintAddress...");   
const COUNCIL\_MINT \= new PublicKey("MFAICouncilMintAddress..."); // Optionnel

async function deployRealm() {  
    const connection \= new Connection(RPC\_ENDPOINT, "confirmed");  
    // Chargement sécurisé du wallet administrateur (ex: depuis Variable d'Env ou Hardware Wallet)  
    const walletKeyPair \= Keypair.fromSecretKey(Uint8Array.from(JSON.parse(process.env.DEPLOYER\_KEY\!)));  
    const wallet \= new Wallet(walletKeyPair);

    // Initialisation du SDK  
    const splGovernance \= new SplGovernance(connection, GOVERNANCE\_PROGRAM\_ID);

    console.log("Déploiement du Realm Money Factory DAO...");

    // 1\. Création de l'instruction de Realm  
    // Le paramètre '1' indique qu'il faut au moins 1 token pour créer une gouvernance (anti-spam minime)  
    const realmName \= "Money Factory DAO";  
    const createRealmIx \= await splGovernance.createRealmInstruction(  
        realmName,  
        COMMUNITY\_MINT,  
        1,   
        wallet.publicKey, // realmAuthority initial  
        undefined,        // source de poids (utilisé pour VSR plus tard)  
        COUNCIL\_MINT,     // mint du conseil  
        "liquid",         // type de token communauté  
        "membership"      // type de token conseil  
    );

    // 2\. Envoi de la transaction  
    const tx \= new Transaction().add(createRealmIx);  
    const signature \= await sendAndConfirmTransaction(connection, tx, \[walletKeyPair\]);

    console.log(\`Realm créé avec succès. Signature: ${signature}\`);  
      
    // Récupération de l'adresse PDA du Realm pour les étapes suivantes  
    const realmPda \= splGovernance.pda.realmAccount({ name: realmName });  
    console.log(\`Adresse du Realm (PDA): ${realmPda.publicKey.toBase58()}\`);  
}

Ce script établit l'identité on-chain de l'organisation. L'adresse PDA générée (realmPda) deviendra l'identifiant central que le Backend Orchestrator devra surveiller.

### **4.2 Configuration des Gouvernances Spécifiques**

Une fois le Realm créé, il faut instancier la **Governance** qui gérera les paramètres des agents. C'est ici que l'on définit les règles politiques (seuils de vote).

Pour Money Factory AI, une configuration recommandée pour la gestion des agents serait :

* **Vote Threshold :** 60% (pour éviter des changements radicaux trop faciles).  
* **Min Community Tokens to Create Proposal :** 10,000 $MFAI (pour limiter le spam de propositions).  
* **Voting Cool-off Time :** 24 heures (temps de réflexion).  
* **Deposit Exempt Proposal Count :** 10 (permet aux membres très actifs de proposer sans verrouiller trop de capital).

Le code d'instruction correspondant via le SDK utiliserait createGovernanceInstruction en passant un objet GovernanceConfig structuré selon ces paramètres.3 Il est crucial de noter que cette gouvernance détiendra l'autorité sur les comptes de configuration des agents.

### **4.3 Intégration du Voter Stake Registry (VSR)**

Pour activer le VSR, le processus se complexifie. Il faut d'abord déployer une instance du programme VSR (ou utiliser une instance existante) et configurer un Registrar pour le Realm Money Factory.  
Le script de configuration doit appeler l'instruction CreateRegistrar du programme VSR, puis ConfigureVotingMint pour chaque jeton accepté (le $MFAI et potentiellement des LP tokens).  
Le paramètre voter\_weight\_addin lors de la création du Realm (ou via une instruction SetRealmConfig ultérieure) doit pointer vers l'ID du programme VSR.9 Cela indique à SPL Governance de ne pas regarder le solde SPL Token standard, mais de consulter le programme VSR pour calculer le poids du vote d'un utilisateur.

## ---

**5\. Implémentation Phase 2 : Intégration Backend (Express/Node.js)**

L'intégration backend est le pont entre la blockchain et le moteur de simulation. Le Backend Orchestrator doit être conscient de l'état de la DAO pour ajuster les simulations.

### **5.1 Architecture du "Governance Indexer"**

Puisque le backend utilise MongoDB pour la persistance 1, il est inefficace de requêter la blockchain (RPC) à chaque requête utilisateur. La solution est de créer un service d'indexation léger au sein de l'architecture micro-services existante.

Ce service aura pour responsabilité de :

1. **Poller (Interroger périodiquement)** les comptes de Gouvernance et de Proposition associés au Realm Money Factory.  
2. **Désérialiser** les données binaires des comptes (Account Data) en utilisant les types fournis par le governance-idl-sdk.14  
3. **Mettre à jour** une collection MongoDB dao\_proposals avec l'état actuel (ProposalState), le nombre de votes (yesVotesCount, noVotesCount), et les instructions exécutables.

**Structure de la Collection MongoDB Suggérée :**

JSON

{  
  "\_id": "ProposalPDA\_Address",  
  "realm": "MoneyFactoryRealmAddress",  
  "title": "Ajustement Risque InvestorAgent",  
  "state": "Voting", // Enum: Draft, SigningOff, Voting, Succeeded, Executing...  
  "descriptionUrl": "https://forum.moneyfactory.ai/p/123",  
  "instructions": \[  
    {  
      "programId": "AgentConfigProgramId",  
      "data": "base64\_encoded\_instruction\_data",  
      "accounts": \[...\]  
    }  
  \],  
  "votingEndsAt": "timestamp",  
  "updatedAt": "timestamp"  
}

### **5.2 Interaction Orchestrator \- Agent**

Le workflow "Agent Journey" décrit dans la documentation 1 doit être modifié. Actuellement, l'orchestrateur récupère le contexte depuis MongoDB. Avec la DAO, l'orchestrateur doit vérifier si une configuration d'agent a été modifiée par une proposition exécutée.

Cependant, pour maintenir la performance, l'Orchestrator ne devrait pas lire la blockchain en temps réel. Il doit lire la configuration "active" dans MongoDB. Le maillon manquant est un Exécuteur de changement d'état.  
Lorsqu'une proposition passe à l'état Completed (après exécution sur la blockchain), le service d'indexation backend doit détecter cet événement et mettre à jour le document de configuration de l'agent dans MongoDB. Ainsi, la prochaine instanciation de l'InvestorDemoAgent utilisera les nouveaux paramètres validés par la DAO, sans latence pour l'utilisateur final.

### **5.3 Sécurité des API Backend**

Le backend doit exposer des endpoints pour le Frontend afin de récupérer les données de gouvernance sans exposer les clés API RPC au client.

* GET /api/governance/proposals : Retourne les propositions depuis MongoDB (rapide, cache).  
* POST /api/governance/webhook : Endpoint sécurisé pour recevoir des notifications de Helius ou Quicknode (si utilisé pour remplacer le polling) lors de changements de comptes on-chain.15

## ---

**6\. Implémentation Phase 3 : Interface Frontend (React)**

L'interface utilisateur est le point de contact de la communauté avec la DAO. L'objectif est d'intégrer l'expérience de vote directement dans le "Journey Simulator" sans forcer l'utilisateur à quitter l'application pour aller sur Realms.today.

### **6.1 Intégration du Wallet et du SDK**

Le frontend utilise déjà React et Vite. Il faut s'assurer que le WalletContextProvider est correctement configuré pour supporter les transactions de gouvernance, qui peuvent être lourdes en taille.16  
L'installation de @solana/wallet-adapter-react-ui est standard. Le governance-idl-sdk doit être instancié à l'intérieur d'un hook React personnalisé ou d'un Context Provider pour être accessible dans les composants.  
Exemple de Hook : useGovernance.ts  
Ce hook encapsule la logique de connexion au SDK.

TypeScript

import { useConnection, useAnchorWallet } from '@solana/wallet-adapter-react';  
import { SplGovernance } from 'governance-idl-sdk';  
import { useMemo } from 'react';

export const useGovernance \= () \=\> {  
    const { connection } \= useConnection();  
    const wallet \= useAnchorWallet();

    const governanceClient \= useMemo(() \=\> {  
        if (\!wallet) return null;  
        // Le SDK peut fonctionner en mode lecture seule sans wallet,   
        // mais pour voter/créer, le wallet est requis.  
        return new SplGovernance(connection, new PublicKey("Gov..."));   
    }, \[connection, wallet\]);

    return governanceClient;  
};

### **6.2 Création de Propositions via l'UI**

L'interface de création de proposition est complexe. Elle doit permettre à l'utilisateur de :

1. Saisir un titre et une description.  
2. Définir l'instruction à exécuter. Pour Money Factory, il faut pré-coder des "Templates" d'instructions. Par exemple, un formulaire "Mettre à jour le CoachAgent" qui génère automatiquement l'instruction binaire correcte pour le programme de configuration des agents.  
3. Envoyer la transaction.

Le SDK simplifie la création de l'instruction de proposition, mais l'insertion de l'instruction transactionnelle (insertTransactionInstruction) est une étape séparée qui doit être chaînée ou groupée dans la même transaction atomique si la taille le permet.3

TypeScript

// Logique simplifiée d'envoi de proposition  
const submitProposal \= async () \=\> {  
    // 1\. Créer le compte de proposition  
    const createIx \= await sdk.createProposalInstruction(...);  
    // 2\. Insérer l'instruction payload (ex: modifier paramètre IA)  
    const insertIx \= await sdk.insertTransactionInstruction(...);  
    // 3\. Signer et envoyer  
    const tx \= new Transaction().add(createIx).add(insertIx);  
    await sendTransaction(tx, connection);  
};

### **6.3 Interface de Vote**

L'interface de vote doit afficher clairement le statut de la proposition. En utilisant les énumérations du SDK, l'UI peut afficher des badges "Vote en cours", "Succès", "Exécuté".  
Le vote lui-même est une transaction on-chain. Le SDK fournit castVoteInstruction. Il est essentiel de gérer les erreurs UI, notamment si l'utilisateur n'a pas de tokens, ou si ses tokens ne sont pas déposés dans le Realm (les tokens doivent être déposés dans le TokenOwnerRecord avant de pouvoir voter).5 L'UI doit donc inclure un flux "Dépôt de Tokens" avant le flux "Vote".

## ---

**7\. Considérations de Sécurité et Tests**

### **7.1 Politique Zéro Défaut et Tests E2E**

Money Factory AI applique une "Politique Zéro Défaut" avec des tests Playwright.1 L'intégration de la DAO doit suivre cette rigueur.  
Tester une DAO est difficile car les périodes de vote durent des jours. Pour les tests E2E :

1. Utiliser des outils comme **Amman** ou **Bankrun** (tests basés sur solana-program-test) qui permettent de manipuler l'horloge de la blockchain locale ("Time Travel").  
2. Le scénario de test Playwright doit :  
   * Démarrer un validateur local (solana-test-validator).  
   * Déployer le Realm et les Gouvernances via le script de déploiement.  
   * Simuler un utilisateur créant une proposition.  
   * Avancer le temps (via RPC call au validateur local).  
   * Simuler le vote d'autres utilisateurs.  
   * Avancer le temps pour finir la période de vote.  
   * Exécuter la transaction.  
   * Vérifier que le paramètre de l'agent a bien changé dans l'état simulé.

Cette approche garantit que la logique de gouvernance est testée de bout en bout sans attendre les délais réels.

### **7.2 Sécurité des Instructions "Execute"**

L'instruction execute\_transaction est puissante car elle permet au Governance PDA de signer n'importe quelle instruction.5 Il existe un risque que des propositions malveillantes tentent de vider la trésorerie.

* **Protection 1 :** Utiliser le **Council Mint** avec un droit de veto.4 Si une proposition malveillante passe le vote communautaire, le Conseil (l'équipe technique) peut opposer son veto avant l'exécution.  
* **Protection 2 :** Imposer un instruction\_hold\_up\_time (délai de garde) non nul. Même si le vote réussit, la transaction ne peut être exécutée qu'après X jours, laissant le temps d'analyser et de réagir.

## ---

**8\. Conclusion et Synthèse**

L'intégration de Realms et de SPL Governance dans **Money Factory AI** n'est pas une simple addition de fonctionnalité, mais une refonte fondamentale de la structure de contrôle du projet. En passant d'une orchestration centralisée à une orchestration gouvernée par DAO, le projet aligne sa technologie (Agents Autonomes, Simulation Web3) avec sa philosophie (Décentralisation).

L'utilisation du **governance-idl-sdk** du Mythic Project est l'impératif technique central de cette migration, garantissant la compatibilité avec l'écosystème Solana moderne. L'architecture hybride proposée — un cœur on-chain sécurisé synchronisé via un indexer vers le backend MongoDB haute performance — respecte les contraintes de performance du simulateur tout en offrant la transparence de la blockchain.

La mise en œuvre du **Voter Stake Registry** permettra de pondérer le pouvoir décisionnel, favorisant les acteurs engagés sur le long terme, ce qui est crucial pour la stabilité des paramètres des agents IA. Enfin, l'intégration rigoureuse des tests via Bankrun/Playwright assure que cette nouvelle couche de complexité ne compromettra pas la fiabilité certifiée du moteur d'orchestration. Money Factory AI est ainsi positionné pour devenir un modèle de référence en matière de "Gouvernance d'IA Décentralisée".

#### **Sources des citations**

1. README.md  
2. spl-governance \- Lib.rs, consulté le janvier 2, 2026, [https://lib.rs/crates/spl-governance](https://lib.rs/crates/spl-governance)  
3. Mythic-Project/governance-sdk \- GitHub, consulté le janvier 2, 2026, [https://github.com/Mythic-Project/governance-sdk](https://github.com/Mythic-Project/governance-sdk)  
4. How to Create a DAO on Solana using Realms | Quicknode Guides, consulté le janvier 2, 2026, [https://www.quicknode.com/guides/solana-development/3rd-party-integrations/dao-with-realms](https://www.quicknode.com/guides/solana-development/3rd-party-integrations/dao-with-realms)  
5. solana-program-library/governance/README.md at master \- GitHub, consulté le janvier 2, 2026, [https://github.com/solana-labs/solana-program-library/blob/master/governance/README.md](https://github.com/solana-labs/solana-program-library/blob/master/governance/README.md)  
6. spl-governance 4.0.0 \- Docs.rs, consulté le janvier 2, 2026, [https://docs.rs/crate/spl-governance/latest/source/src/instruction.rs](https://docs.rs/crate/spl-governance/latest/source/src/instruction.rs)  
7. openzeppelin-contracts/contracts/governance/Governor.sol at master \- GitHub, consulté le janvier 2, 2026, [https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/Governor.sol](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/governance/Governor.sol)  
8. blockworks-foundation/voter-stake-registry: A vote weight plugin for spl-governance that allows for voting with tokens from different mints, token lockups with vote weight benefits, grants \- GitHub, consulté le janvier 2, 2026, [https://github.com/blockworks-foundation/voter-stake-registry](https://github.com/blockworks-foundation/voter-stake-registry)  
9. VSR (Voter Stake Registry) Set Up: Part 1 | by legend \- Medium, consulté le janvier 2, 2026, [https://medium.com/@raccoonlegend/vsr-voter-stake-registry-set-up-part-1-12238a375741](https://medium.com/@raccoonlegend/vsr-voter-stake-registry-set-up-part-1-12238a375741)  
10. solana-labs/governance-sdk \- GitHub, consulté le janvier 2, 2026, [https://github.com/solana-labs/governance-sdk](https://github.com/solana-labs/governance-sdk)  
11. IDLs (Interface Definition Language) \- Solana, consulté le janvier 2, 2026, [https://solana.com/developers/guides/advanced/idls](https://solana.com/developers/guides/advanced/idls)  
12. What is an IDL? | Quicknode Guides, consulté le janvier 2, 2026, [https://www.quicknode.com/guides/solana-development/anchor/what-is-an-idl](https://www.quicknode.com/guides/solana-development/anchor/what-is-an-idl)  
13. Solana.SPL.Governance — Solana v0.1.0 \- Hexdocs, consulté le janvier 2, 2026, [https://hexdocs.pm/solana\_ex/Solana.SPL.Governance.html](https://hexdocs.pm/solana_ex/Solana.SPL.Governance.html)  
14. governance-idl-sdk \- NPM, consulté le janvier 2, 2026, [https://www.npmjs.com/package/governance-idl-sdk](https://www.npmjs.com/package/governance-idl-sdk)  
15. Actions and Blinks \- Solana, consulté le janvier 2, 2026, [https://solana.com/developers/guides/advanced/actions](https://solana.com/developers/guides/advanced/actions)  
16. Creating a Custom Solana Wallet Connect UI with Next.js , Tailwind and Shadcn \- Medium, consulté le janvier 2, 2026, [https://medium.com/@kusalkalingainfo/creating-a-custom-solana-wallet-connect-ui-with-next-js-tailwind-and-shadcn-b9e372dc2ac0](https://medium.com/@kusalkalingainfo/creating-a-custom-solana-wallet-connect-ui-with-next-js-tailwind-and-shadcn-b9e372dc2ac0)