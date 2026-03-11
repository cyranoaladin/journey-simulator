<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Tableau de Synchronisation des Agents MFAI

| Nom du Manuel (Persona) | Fichier .js | État | Persona Associe |
|---|---|---|---|
| **Orchestrator** | `ZynoAgent.js` | ✅ **REAL** (Core) | Zyno (Meta-Agent) |
| **Governance Architect** | `GovernanceDAOAgent.js` | ✅ **REAL** (LLM) | Expert DAO & Voting Systems |
| **Security Red Teamer** | `SecurityAgent.js` | ✅ **REAL** (LLM) | Auditeur Securite Offensive |
| **Quality Auditor** | `AuditAgent.js` | ✅ **REAL** (LLM) | Auditeur Qualite Code |
| **Compliance Officer** | `ComplianceAgent.js` | ✅ **REAL** (LLM) | Expert Regulation (MiCA/GDPR) |
| **Web3 Counsel** | `Web3LegalAgent.js` | ✅ **REAL** (LLM) | Juriste Web3 & Structuration |
| **Token Economist** | `TokenomicsAgent.js` | ✅ **REAL** (LLM) | Ingenieur Token & Modeles |
| **VC Analyst** | `InvestorAgent.js` | ✅ **REAL** (LLM) | Investisseur Institutionnel |
| **Product Manager** | `ProductSpecAgent.js` | ✅ **REAL** (LLM) | Product Owner |
| **Security Auditor** | `SecurityAuditAgent.js` | ✅ **REAL** (LLM) | (Doublon/Specialise) |
| **Tech Lead** | `BuilderAgent.js` | ✅ **REAL** (LLM) | Architecte Technique |
| **Growth Hacker** | `GrowthAgent.js` | ✅ **REAL** (LLM) | Expert Acquisition |
| **Community Mgr** | `CommunityAgent.js` | ✅ **REAL** (LLM) | Gestionnaire Communaute |
| **DevOps Engineer** | `DevOpsAgent.js` | ✅ **REAL** (LLM) | CI/CD & Infra |
| **Data Scientist** | `AnalyticsAgent.js` | ✅ **REAL** (LLM) | Analyste Donnees |
| **UX Designer** | `DesignAgent.js` | ✅ **REAL** (LLM) | Designer Experience & Visuels |
| **UX Writer** | `UXWritingAgent.js` | ✅ **REAL** (LLM) | Redacteur Microcopy |
| **QA Engineer** | `QAPlaywrightAgent.js` | ✅ **REAL** (LLM) | Testeur Automatise |
| **Smart Contract Dev** | `SolanaAnchorAgent.js` | ✅ **REAL** (LLM) | Developpeur Anchor |
| **Protocol Architect** | `ProtocolAgent.js` | ✅ **REAL** (LLM) | Standards SPL & Token 2022 |
| **Developer** | `DevAgent.js` | ✅ **REAL** (LLM) | Developpeur Rust/TS |
| **Minting Specialist** | `MintingAgent.js` | ✅ **REAL** (LLM) | Expert NFT Minting |
| **RAG Operator** | `RAGOpsAgent.js` | ✅ **REAL** (LLM) | Gestionnaire Connaissance |
| **Journey Guide** | `GuideAgent.js` | ✅ **REAL** (LLM) | Accompagnateur |
| **Coach** | `CoachAgent.js` | ✅ **REAL** (LLM) | Business Coach |
| **Educator** | `EducationAgent.js` | ✅ **REAL** (LLM) | Pedagogue & Mentor |
| **Reflector** | `ReflectionAgent.js` | ✅ **REAL** (LLM) | Auditeur Progres |
| **Pitch Expert** | `PitchAgent.js` | ✅ **REAL** (LLM) | Expert Communication |
| **Marketplace Mgr** | `MarketplaceAgent.js` | ✅ **REAL** (LLM) | Gestionnaire Ventes |
| **NFT Strategist** | `NFTAgent.js` | ✅ **REAL** (LLM) | Stratege Collections |

**Legende :**
- ✅ **REAL (LLM)** : Agent utilisant `LLMClient` avec un Prompt Systeme Dense et expert.
- ✅ **REAL (Core)** : Agent systeme critique fonctionnel.
- ⚠️ **HOLLOW** : Agent utilisant des mocks ou une logique simpliste (a migrer).

## Note sur l'Architecture AEPO / AECO
Le fichier `zynoVerticalSlice.js` supporte le mode d'orchestration via `ctx.orchestrationMode`, injectant dynamiquement le **Tone** (AECO vs AEPO) dans les prompts des agents refactores.
Tous les agents ci-dessus sont enregistres dans `orchestration/agentsRegistry.js` et `agents/registry.js`, prets pour le routage d'intentions.
