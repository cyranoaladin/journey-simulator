/**
 * LangGraph State Machine for Journey Simulator
 * Manages journey progression: Learn → Build → Prove → Activate → Scale
 *
 * Handles:
 * - State transitions based on progress (XP, missions completed)
 * - Context enrichment for Zyno
 * - Memory persistence
 */

import type { TypedDict } from 'typing-extensions'

export interface JourneyState extends TypedDict {
  user_id: string
  persona_id: string
  track_id: string
  phase_id: 'learn' | 'build' | 'prove' | 'activate' | 'scale'
  completed_missions: string[]
  xp: number
  nft_minted: string[]
  next_action: string | null
  context: Record<string, unknown>
  created_at: string
  updated_at: string
}

/**
 * Learn Phase: Foundation knowledge
 * Mission: Understand blockchain, Solana basics, Web3 concepts
 * Rewards: 0.1 SOL per mission, XP, "Seeker" NFT on completion
 */
function learn_node(state: JourneyState): Partial<JourneyState> {
  return {
    context: {
      phase: 'learn',
      missions: [
        { id: 'learn-1', title: 'What is Blockchain?', type: 'quiz' },
        { id: 'learn-2', title: 'Solana Speed Explained', type: 'article' },
        { id: 'learn-3', title: 'Smart Contracts 101', type: 'video' },
        { id: 'learn-4', title: 'Web3 Wallets', type: 'tutorial' },
        { id: 'learn-5', title: 'DeFi Fundamentals', type: 'quiz' },
      ],
      current_mission_idx: 0,
      reward_per_mission: 0.1, // SOL
      total_xp_available: 50,
    },
    next_action: 'start_mission' || (state.completed_missions.length >= 3 ? 'transition_to_build' : 'next_mission'),
  }
}

/**
 * Build Phase: Hands-on development
 * Mission: Write code, deploy contracts, build DApps
 * Rewards: 0.5 SOL per mission, 50 XP, "Builder" NFT on completion
 */
function build_node(state: JourneyState): Partial<JourneyState> {
  return {
    context: {
      phase: 'build',
      missions: [
        { id: 'build-1', title: 'Setup Solana CLI', type: 'tutorial' },
        { id: 'build-2', title: 'Write Hello World in Rust', type: 'code' },
        { id: 'build-3', title: 'Deploy on Devnet', type: 'hands_on' },
        { id: 'build-4', title: 'Create SPL Token', type: 'code' },
        { id: 'build-5', title: 'Build Counter Program', type: 'hands_on' },
        { id: 'build-6', title: 'Frontend Integration', type: 'code' },
        { id: 'build-7', title: 'Test & Debug', type: 'tutorial' },
        { id: 'build-8', title: 'Deploy to Mainnet', type: 'hands_on' },
        { id: 'build-9', title: 'Optimize for Production', type: 'advanced' },
        { id: 'build-10', title: 'Security Best Practices', type: 'article' },
      ],
      current_mission_idx: 0,
      reward_per_mission: 0.5, // SOL
      total_xp_available: 500,
    },
    next_action: state.completed_missions.length >= 7 ? 'transition_to_prove' : 'next_mission',
  }
}

/**
 * Prove Phase: Project submission & evaluation
 * Mission: Build real DApp, submit for evaluation (AI + community)
 * Rewards: 1 SOL per project, 200 XP, "Proven Developer" NFT
 */
function prove_node(state: JourneyState): Partial<JourneyState> {
  return {
    context: {
      phase: 'prove',
      projects: [
        { id: 'proj-1', title: 'Build a Todo DApp', type: 'solo' },
        { id: 'proj-2', title: 'Create an NFT Collection', type: 'solo' },
        { id: 'proj-3', title: 'Build a Staking DApp', type: 'team' },
      ],
      evaluation_criteria: [
        { name: 'code_quality', weight: 0.3 },
        { name: 'functionality', weight: 0.3 },
        { name: 'ui_ux', weight: 0.2 },
        { name: 'security', weight: 0.2 },
      ],
      voting_method: 'ai_50_community_50', // AI + community votes
      reward_per_project: 1.0, // SOL
      total_xp_available: 200,
    },
    next_action: state.completed_missions.length >= 1 ? 'transition_to_activate' : 'submit_project',
  }
}

/**
 * Activate Phase: Launch & mint achievements
 * Mission: Deploy project, mint achievements, unlock DeFi
 * Rewards: Mainnet mint, DAO token airdrop, yield farming
 */
function activate_node(state: JourneyState): Partial<JourneyState> {
  return {
    context: {
      phase: 'activate',
      nft_collection: 'Proven Developer Cohort',
      nft_metadata: {
        title: 'Founder',
        rank: 4,
        rarity: 'mythic',
        benefits: ['DAO governance', 'Revenue share', 'Mentorship role'],
      },
      defi_options: [
        { name: 'Marinade Staking', apy: 3.5 },
        { name: 'Lido Staking', apy: 3.2 },
        { name: 'Yield Farming', apy: 12 },
      ],
      community_role: 'creator_mentor',
      reward_per_activation: 0.5, // SOL
      total_xp_available: 100,
    },
    next_action: 'mint_nft_activate_defi_unlock_creator_role',
  }
}

/**
 * Scale Phase: Leadership & legacy
 * Mission: Build next cohort, mentor juniors, contribute to protocol
 * Rewards: Revenue share, DAO tokens, protocol ownership
 */
function scale_node(state: JourneyState): Partial<JourneyState> {
  return {
    context: {
      phase: 'scale',
      roles: [
        { name: 'Ambassador', description: 'Promote Journey Simulator', compensation: 'commission' },
        { name: 'Mentor', description: 'Guide new cohorts', compensation: 'token_allocation' },
        { name: 'Content Creator', description: 'Build new journeys', compensation: '30%_revenue_share' },
        { name: 'DAO Governor', description: 'Vote on proposals', compensation: 'governance_tokens' },
      ],
      revenue_share: 0.3, // 30% of journeys they create
      monthly_potential: 10000, // USD, based on 100 users × 0.5 SOL × $200
      nft_legend_status: true,
    },
    next_action: 'select_role_earn_passive_income_build_legacy',
  }
}

/**
 * Router: Determine next phase based on progress
 */
function router_node(state: JourneyState): string {
  const xp = state.xp || 0
  const missions = state.completed_missions?.length || 0

  // Transitions
  if (state.phase_id === 'learn' && missions >= 3 && xp >= 50) {
    return 'build'
  }
  if (state.phase_id === 'build' && missions >= 7 && xp >= 300) {
    return 'prove'
  }
  if (state.phase_id === 'prove' && missions >= 1 && xp >= 200) {
    return 'activate'
  }
  if (state.phase_id === 'activate' && missions >= 1 && xp >= 100) {
    return 'scale'
  }

  // Stay in current phase
  return state.phase_id
}

/**
 * Graph compilation (pseudo-code for Python/LangGraph)
 *
 * In production:
 * ```python
 * from langgraph.graph import StateGraph, START, END
 *
 * graph_builder = StateGraph(JourneyState)
 * graph_builder.add_node('learn', learn_node)
 * graph_builder.add_node('build', build_node)
 * graph_builder.add_node('prove', prove_node)
 * graph_builder.add_node('activate', activate_node)
 * graph_builder.add_node('scale', scale_node)
 *
 * graph_builder.add_conditional_edges(
 *     START,
 *     router_node,
 *     {
 *         'learn': 'learn',
 *         'build': 'build',
 *         'prove': 'prove',
 *         'activate': 'activate',
 *         'scale': 'scale',
 *     }
 * )
 *
 * graph = graph_builder.compile()
 * ```
 */

export async function invokeJourneyGraph(state: JourneyState): Promise<JourneyState> {
  // Placeholder: in production, call actual LangGraph compiled graph
  const nextPhase = router_node(state)

  let nodeResult: Partial<JourneyState> = {}

  switch (nextPhase) {
    case 'learn':
      nodeResult = learn_node(state)
      break
    case 'build':
      nodeResult = build_node(state)
      break
    case 'prove':
      nodeResult = prove_node(state)
      break
    case 'activate':
      nodeResult = activate_node(state)
      break
    case 'scale':
      nodeResult = scale_node(state)
      break
    default:
      throw new Error(`Unknown phase: ${nextPhase}`)
  }

  return {
    ...state,
    phase_id: nextPhase as JourneyState['phase_id'],
    updated_at: new Date().toISOString(),
    ...nodeResult,
  }
}

export { learn_node, build_node, prove_node, activate_node, scale_node, router_node }
