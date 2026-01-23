/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

/**
 * AEPO / AECO — Unified definitions for backend logs, API payloads, and documentation.
 *
 * - AEPO (AI-Enhanced Pathway Orchestration): Zyno-driven orchestration for an individual (personal roadmap).
 * - AECO (AI-Enhanced Cohort Orchestration): Zyno-driven orchestration for cohorts (group programs / shared milestones).
 *
 * Note (important): In the current MVP backend implementation, we store:
 * - AEPO as a per-agent execution signal (duration/success/retries → aepoScore). This signal feeds the pathway engine.
 * - AECO as feedback/cohort signal (user rating/comment, later extensible to cohort analytics).
 */

const AEPO = {
  acronym: 'AEPO',
  name: 'AI-Enhanced Pathway Orchestration',
  tooltip:
    'AEPO is the Zyno-driven engine that builds and updates a personalized roadmap (milestones, deliverables, next actions) based on user context and progress.',
};

const AECO = {
  acronym: 'AECO',
  name: 'AI-Enhanced Cohort Orchestration',
  tooltip:
    'AECO coordinates cohort programs: shared milestones, synchronized progress, peer reviews, and group dashboards—powered by Zyno collective orchestration.',
};

const AEPO_VS_AECO = [
  { feature: 'Scope', aepo: 'Individual', aeco: 'Cohort / Group' },
  { feature: 'Entry Point', aepo: 'Journey onboarding, solo builder', aeco: 'Bootcamps, DAO accelerators' },
  { feature: 'Managed By', aepo: 'Zyno (single-user logic)', aeco: 'Zyno (multi-user coordination)' },
  { feature: 'Output', aepo: 'Personal roadmap, rewards, Proof-of-Skill™', aeco: 'Collective milestones, DAO-ready teams' },
];

function getOrchestrationGlossary() {
  return {
    AEPO,
    AECO,
    table: AEPO_VS_AECO,
  };
}

module.exports = {
  AEPO,
  AECO,
  AEPO_VS_AECO,
  getOrchestrationGlossary,
};
