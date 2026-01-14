<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# Tableau de Synchronisation des Agents MFAI

| Nom du Manuel (Persona) | Fichier .js | État | Persona Associé |
|---|---|---|---|
| **Orchestrator** | `ZynoAgent.js` | ✅ **REAL** (Core) | Zyno (Meta-Agent) |
| **Governance Architect** | `GovernanceDAOAgent.js` | ✅ **REAL** (LLM) | Expert DAO & Voting Systems |
| **Security Red Teamer** | `SecurityAgent.js` | ✅ **REAL** (LLM) | Auditeur Sécurité Offensive |
| **Quality Auditor** | `AuditAgent.js` | ✅ **REAL** (LLM) | Auditeur Qualité Code |
| **Compliance Officer** | `ComplianceAgent.js` | ✅ **REAL** (LLM) | Expert Régulation (MiCA/GDPR) |
| **Web3 Counsel** | `Web3LegalAgent.js` | ✅ **REAL** (LLM) | Juriste Web3 & Structuration |
| **Token Economist** | `TokenomicsAgent.js` | ✅ **REAL** (LLM) | Ingénieur Token & Modèles |
| **VC Analyst** | `InvestorAgent.js` | ✅ **REAL** (LLM) | Investisseur Institutionnel |
| **Product Manager** | `ProductSpecAgent.js` | ✅ **REAL** (LLM) | Product Owner |
| **Security Auditor** | `SecurityAuditAgent.js` | ✅ **REAL** (LLM) | (Doublon/Spécialisé) |
| **Tech Lead** | `BuilderAgent.js` | ✅ **REAL** (LLM) | Architecte Technique |
| **Growth Hacker** | `GrowthAgent.js` | ✅ **REAL** (LLM) | Expert Acquisition |
| **Community Mgr** | `CommunityAgent.js` | ✅ **REAL** (LLM) | Gestionnaire Communauté |
| **DevOps Engineer** | `DevOpsAgent.js` | ✅ **REAL** (LLM) | CI/CD & Infra |
| **Data Scientist** | `AnalyticsAgent.js` | ✅ **REAL** (LLM) | Analyste Données |
| **UX Designer** | `DesignAgent.js` | ✅ **REAL** (LLM) | Designer Expérience & Visuels |
| **UX Writer** | `UXWritingAgent.js` | ✅ **REAL** (LLM) | Rédacteur Microcopy |
| **QA Engineer** | `QAPlaywrightAgent.js` | ✅ **REAL** (LLM) | Testeur Automatisé |
| **Smart Contract Dev** | `SolanaAnchorAgent.js` | ✅ **REAL** (LLM) | Développeur Anchor |
| **Protocol Architect** | `ProtocolAgent.js` | ✅ **REAL** (LLM) | Standards SPL & Token 2022 |
| **Developer** | `DevAgent.js` | ✅ **REAL** (LLM) | Développeur Rust/TS |
| **Minting Specialist** | `MintingAgent.js` | ✅ **REAL** (LLM) | Expert NFT Minting |
| **RAG Operator** | `RAGOpsAgent.js` | ✅ **REAL** (LLM) | Gestionnaire Connaissance |
| **Journey Guide** | `GuideAgent.js` | ✅ **REAL** (LLM) | Accompagnateur |
| **Coach** | `CoachAgent.js` | ✅ **REAL** (LLM) | Business Coach |
| **Educator** | `EducationAgent.js` | ✅ **REAL** (LLM) | Pédagogue & Mentor |
| **Reflector** | `ReflectionAgent.js` | ✅ **REAL** (LLM) | Auditeur Progrès |
| **Pitch Expert** | `PitchAgent.js` | ✅ **REAL** (LLM) | Expert Communication |
| **Marketplace Mgr** | `MarketplaceAgent.js` | ✅ **REAL** (LLM) | Gestionnaire Ventes |
| **NFT Strategist** | `NFTAgent.js` | ✅ **REAL** (LLM) | Stratège Collections |

**Légende :**
- ✅ **REAL (LLM)** : Agent utilisant `LLMClient` avec un Prompt Système Dense et expert.
- ✅ **REAL (Core)** : Agent système critique fonctionnel.
- ⚠️ **HOLLOW** : Agent utilisant des mocks ou une logique simpliste (à migrer).

## Note sur l'Architecture AEPO / AECO
Le fichier `zynoVerticalSlice.js` supporte le mode d'orchestration via `ctx.orchestrationMode`, injectant dynamiquement le **Tone** (AECO vs AEPO) dans les prompts des agents refactorés.
Tous les agents ci-dessus sont enregistrés dans `orchestration/agentsRegistry.js` et `agents/registry.js`, prêts pour le routage d'intentions.
