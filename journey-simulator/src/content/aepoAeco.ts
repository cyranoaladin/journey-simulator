export type AepoAecoDefinition = {
  acronym: 'AEPO' | 'AECO'
  name: string
  tagline: string
  tooltip: string
  description: string
  devNotes: string[]
  examples: string[]
}

export const AEPO: AepoAecoDefinition = {
  acronym: 'AEPO',
  name: 'AI-Enhanced Pathway Orchestration',
  tagline: 'Personalized journey orchestration (solo pathway)',
  tooltip:
    'AEPO is the Zyno-driven engine that builds and updates your personalized roadmap (milestones, deliverables, next actions) based on your context and progress.',
  description:
    "AEPO (AI-Enhanced Pathway Orchestration) is the intelligent engine that creates and manages personalized user pathways within the Money Factory AI ecosystem. It analyzes a user's profile, context, skills, intentions, and objectives to generate a dynamic, adaptive roadmap composed of milestones, deliverables, and actions. These actions are executed or supported by Zyno’s specialized AI agents (Architect, Engineer, CFO, Legal Advisor, etc.).\n\nAEPO powers the individual Journey: Learn & Earn → Build with Zyno → DAO proposal preparation → Tokenomics setup → Project launch & liquidity.\n\nAEPO also integrates Proof-of-Skill™, token-based rewards ($MFAI), and adaptive content based on user progression.",
  devNotes: [
    'Triggers Zyno agents based on user state (persona, phase, intent, prior outputs).',
    'Handles scoring, feedback, and next-step routing for a single user pathway.',
    'Represents user-level orchestration (roadmap generation and routing).',
  ],
  examples: [
    'Learn → Build → Launch: generate next missions, validate submissions, route to the right agent.',
    'Tokenomics setup: trigger CFO + Legal + Architect agents and synthesize a structured plan.',
  ],
}

export const AECO: AepoAecoDefinition = {
  acronym: 'AECO',
  name: 'AI-Enhanced Cohort Orchestration',
  tagline: 'Cohort / group program orchestration',
  tooltip:
    'AECO coordinates cohort programs: shared milestones, synchronized progress, peer reviews, and group dashboards—powered by Zyno collective orchestration.',
  description:
    'AECO (AI-Enhanced Cohort Orchestration) is the orchestration system that manages group-based programs and cohort dynamics within the platform. It coordinates multi-user progress within bootcamps, accelerators, DAO formations, or certification tracks. AECO ensures shared goals, synchronized milestones, and structured member interactions—always powered by Zyno’s collective orchestration logic.\n\nAECO enables cohort onboarding & matching, shared deliverables, peer-to-peer reviews with agent support, AI-led sessions and retrospectives, and live dashboards for group performance. It is essential for social and collective learning, DAO governance tracks, and team incubation.',
  devNotes: [
    'Multi-user coordination layer (cohort state, shared milestones, collaborative reviews).',
    'Builds group dashboards and progress synchronization (team-level signals).',
    'Complements AEPO: AEPO is solo pathway routing, AECO is cohort program coordination.',
  ],
  examples: [
    'DAO Proposal Bootcamp: cohort timeline, peer reviews, shared deliverables, group readiness score.',
    'Certification cohort: synchronized phases and AI-led sessions with collective retrospectives.',
  ],
}

export const AEPO_VS_AECO = [
  { feature: 'Scope', aepo: 'Individual', aeco: 'Cohort / Group' },
  { feature: 'Entry Point', aepo: 'Journey onboarding, solo builder', aeco: 'Bootcamps, DAO accelerators' },
  { feature: 'Managed By', aepo: 'Zyno (single-user logic)', aeco: 'Zyno (multi-user coordination)' },
  { feature: 'Output', aepo: 'Personalized roadmap, rewards, Proof-of-Skill™', aeco: 'Collective milestones, DAO-ready teams' },
  { feature: 'Examples', aepo: 'Learn → Build → Launch', aeco: 'DAO Proposal Bootcamp, team incubation' },
]
