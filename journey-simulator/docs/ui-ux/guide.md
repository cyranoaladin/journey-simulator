<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

<!-- Production Ready - 2026 | Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA -->

# UI/UX Guide – Journey Simulator (MVP)

## Niveaux de profondeur (mode)
- discovery: démo rapide (5–10 min), missions très guidées, quiz courts, docs pré-remplis.
- builder: travail sérieux (missions longues, docs à compléter, évaluations détaillées).
- expert: audit/stress tests, due diligence, critiques systématiques.

## Ton (tone)
- pedagogical | investor_pitch | critical
- Adapter la narration: “vous + Zyno (cofondateur IA)”.

## Layout 3 colonnes (desktop)
1) Gauche: Timeline phases, persona/track/mode, XP/badges (mini XpBlock).
2) Centre: contenu actif (text/checklist/mission/quiz/document).
3) Droite: AgentActivityFeed + Resource cards + mini chat Zyno.

Mobile: pile verticale, ordre: contenu actif → timeline résumé → activity feed.

## Design system
- Base sombre (inspiration Solana) + accents MFAI (gradient Zyno).
- Cards arrondies, ombres légères, pictos agents (builder/growth/dao...).
- Micro-interactions: fade/slide on appear; pulsation icônes agents lors d’agent_actions.

## Micro‑UX clés
- Mission: distinguer Entrée (à produire) / Traitement (ce que le système fera).
- Bouton “Comprendre la mission” → text_block explicatif court.
- Quiz: feedback immédiat, mode entraînement vs certifiant.

## Ressources & formats
- Templates cliquables (copier), documents Markdown (tokenomics_one_pager, investor_brief, dao_playbook, launch_runbook).
- Flashcards (quiz simplifié) via resource_block (tool_link/template).
- Diagrammes textuels/mentaux en Markdown (document_block/text_block).

## Interactions avancées
- Choix narratifs (action_suggestions_block) → arbre de décisions.
- Indicateurs (evaluation_block axes): soutenabilité, attractivité investisseur, risque.

## Sandbox Solana (MVP)
- 1 collection NFT “Proof-of-*”, 3–5 types.
- Staking simulé (UI + persistance simple), vote DAO simulé.

## Mode “Audit rapide”
- Entrée: pitch ou URL → evaluation_blocks (clarity, tokenomics, governance, GTM) + document_block “Rapport d’audit”.

## Accessibilité & finition
- Contrastes suffisants, typographies lisibles, hiérarchie H1/H2/H3, navigation clavier.
- Démo scriptée (DEMO_MODE) avec journey_state pré-rempli et raccourcis de phase.
