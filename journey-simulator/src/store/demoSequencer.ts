/**
 * Project: Money Factory AI (MFAI)
 * Module: Demo Sequencer V2 - Reconstruction
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 *
 * ARCHITECTURE:
 * - Pure factory function (no side effects)
 * - Input: trackId (string)
 * - Output: JourneyStepResponse[] (complete sequence)
 * - Based on backend hub_track.json spec
 */

import type { JourneyStepResponse, Mode, Tone } from '../types/uiBlocks';
import {
    createArchitectureScanSequence,
    createDePINStudioSequence,
    createOnChainAISequence,
    createSystemsHardeningSequence,
    createSynapticRolloutSequence,
    createExperienceDiscoverySequence,
    createNFTSystemsLabSequence,
    createGameplayLabSequence,
    createUXElevationSequence,
    createExperienceLaunchSequence,
} from './demoSequencerExtensions';
import {
    createImpactCharterSequence,
    createDAODesignSequence,
    createPhilanthropyProtocolsSequence,
    createIdentityReputationSequence,
    createSecurityBaselineSequence,
    createExploitHuntSequence,
    createDefenseSystemsSequence,
    createIncidentResponseSequence,
    createRedBlueEvolutionSequence,
} from './demoSequencerExtensions2';

// ============================================================================
// TYPES
// ============================================================================

// ============================================================================
// COGNITIVE ACTIVATION HUB - COMPLETE SEQUENCE
// ============================================================================

/**
 * Phase 1: Neural Handshake (Wallet Connection)
 * Based on: hub_track.json phase_id:1
 */
const createNeuralHandshakeSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'cognitive-orientation',
        mode: 'discovery' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        // Step 1: Introduction
        {
            metadata: {
                ...meta,
                title: 'Neural Handshake: Initiation',
                summary: 'Establish cryptographic sovereignty with Ed25519 signature',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'neural-intro',
                    title: 'Neural Link Established',
                    body_markdown: `
# Welcome to the Cognitive Activation Hub

**Neural link established.** Sealevel runtime calibration active.

I am **GuideAgent**, your interface to the Cognitive Hub. To proceed, you must prove **cryptographic sovereignty**.

## Your Mission
Initiate the **Ed25519 signature sequence** to establish your neural connection.

### What is Ed25519?
Ed25519 is an elliptic curve signature scheme that provides:
- **High performance**: Faster than RSA
- **Strong security**: 128-bit security level
- **Deterministic**: No random number generation needed

This is the foundation of Solana's identity system.
                    `.trim(),
                },
                {
                    kind: 'resource_block',
                    id: 'neural-resources',
                    title: 'Technical References',
                    resources: [
                        {
                            id: 'ed25519-spec',
                            label: 'Ed25519 Specification',
                            description: 'Official cryptographic specification',
                            url: 'https://ed25519.cr.yp.to/',
                            resource_type: 'article',
                            agent_owner: 'GuideAgent',
                        },
                        {
                            id: 'solana-rpc',
                            label: 'Solana JSON RPC',
                            description: 'Cluster communication protocol',
                            url: 'https://docs.solana.com/api/http',
                            resource_type: 'article',
                            agent_owner: 'GuideAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'GuideAgent',
                    action: 'initialize_connection',
                    reason: 'Neural interface activated. Waiting for cryptographic proof.',
                    parameters: { cluster: 'devnet', latency_threshold_ms: 400 },
                },
            ],
            next_state: {
                phase_id: 'cognitive-orientation',
                completed_missions: [],
                xp_delta: 20,
            },
        },

        // Step 2: Wallet Connection Activity
        {
            metadata: {
                ...meta,
                title: 'Wallet Connection & Ed25519 Init',
                summary: 'Connect wallet and complete signature challenge',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'neural-wallet-connect',
                    title: 'Mission: Establish Cryptographic Identity',
                    description: 'Connect your Phantom wallet and sign the nonce-based challenge. Your signature will be verified against the Ed25519 public key. Latency tolerance: <400ms.',
                    mission_type: 'wallet_signature',
                    expected_input_type: 'link',
                    xp_reward: 40,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'neural-checklist',
                    title: 'Validation Criteria',
                    items: [
                        { label: 'Wallet connection status confirmed', checked: false },
                        { label: 'Ed25519 Signature verified', checked: false },
                        { label: 'Cluster responsiveness (Ping < 400ms)', checked: false },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'Web3LegalAgent',
                    action: 'handoff_compliance',
                    reason: 'Compliance check passed. Handoff to next phase initiated.',
                    parameters: { specialty: 'Compliance & Handshakes' },
                },
            ],
            next_state: {
                phase_id: 'cognitive-orientation',
                completed_missions: ['neural-wallet-connect'],
                xp_delta: 40,
            },
        },
    ];
};

/**
 * Phase 2: Memory Forge (PDA Derivation)
 * Based on: hub_track.json phase_id:2
 */
const createMemoryForgeSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'solana-fluency',
        mode: 'builder' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        // Step 1: PDA Theory
        {
            metadata: {
                ...meta,
                title: 'Memory Forge: PDA Introduction',
                summary: 'Understanding Program Derived Addresses',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'pda-intro',
                    title: 'Memory is the Foundation of Identity',
                    body_markdown: `
# Program Derived Addresses (PDAs)

In Solana, **memory is identity**. We forge memory using **Program Derived Addresses**.

## What is a PDA?
A PDA is a deterministic address derived from:
- **Program ID** (32 bytes)
- **Seeds** (arbitrary bytes, max 32 bytes each)
- **Bump seed** (1 byte, 0-255)

## Why PDAs Matter
PDAs allow programs to:
- **Sign transactions** without private keys
- **Deterministically find accounts** (no need to store addresses)
- **Avoid collisions** through bump seed search

## The Canonical Bump
The **canonical bump** is the first bump seed (starting from 255 and counting down) that produces an **off-curve address**.

\`\`\`rust
let (pda, bump) = Pubkey::find_program_address(&[b"seed"], &program_id);
\`\`\`

⚠️ **CRITICAL**: Ensure the derived address composition does not exceed the **Transaction Size Limit of 1232 bytes**.
                    `.trim(),
                },
                {
                    kind: 'diagram_block',
                    id: 'pda-diagram',
                    title: 'PDA Derivation Flow',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[Seeds + Program ID] --> B{Try Bump 255}
    B -->|On Curve| C{Try Bump 254}
    C -->|On Curve| D{Try Bump 253}
    D -->|Off Curve| E[Canonical PDA Found]
    E --> F[Store Bump for Future Lookups]
                    `.trim(),
                    caption: 'Canonical bump search algorithm (255 → 0)',
                },
            ],
            agent_actions: [
                {
                    agent_name: 'HubAgent',
                    action: 'explain_pda_theory',
                    reason: 'Theoretical foundation established. Ready for practical derivation.',
                    parameters: { specialty: 'Memory Systems' },
                },
            ],
            next_state: {
                phase_id: 'solana-fluency',
                completed_missions: [],
                xp_delta: 30,
            },
        },

        // Step 2: PDA Derivation Mission
        {
            metadata: {
                ...meta,
                title: 'PDA Canonical Bump Search',
                summary: 'Derive canonical bump seed for program-derived address',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'pda-derivation',
                    title: 'Mission: Find the Canonical Bump',
                    description: 'Use the MentalModelMapper to link Seeds (String, u8) to PublicKey. Iterate downwards from 255 to find the first valid bump seed that results in an off-curve address.',
                    mission_type: 'code_submission',
                    expected_input_type: 'code_snippet',
                    xp_reward: 50,
                    is_mandatory: true,
                },
                {
                    kind: 'resource_block',
                    id: 'pda-resources',
                    title: 'Code References',
                    resources: [
                        {
                            id: 'pda-rust',
                            label: 'findProgramAddress (Rust)',
                            description: 'Rust implementation of PDA derivation',
                            url: 'snippet://pda-rust',
                            resource_type: 'code_snippet',
                            agent_owner: 'HubAgent',
                        },
                        {
                            id: 'pda-helper',
                            label: 'PDA Helper Library',
                            description: 'TypeScript utilities for PDA operations',
                            url: 'snippet://pda-helper',
                            resource_type: 'code_snippet',
                            agent_owner: 'HubAgent',
                        },
                    ],
                },
                {
                    kind: 'checklist_block',
                    id: 'pda-validation',
                    title: 'Validation Checklist',
                    items: [
                        { label: 'Canonical Bump Identification (255 downscan)', checked: false },
                        { label: 'Off-curve verification (isOnCurve == false)', checked: false },
                        { label: 'Seed collision avoidance confirmed', checked: false },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'HubAgent',
                    action: 'validate_pda_derivation',
                    reason: 'PDA derivation submitted. Verifying canonical bump and collision safety.',
                    parameters: { min_score: 80, required_keywords: ['seeds', 'bump', 'canonical', 'off-curve'] },
                },
            ],
            next_state: {
                phase_id: 'solana-fluency',
                completed_missions: ['pda-derivation'],
                xp_delta: 50,
            },
        },
    ];
};

/**
 * Phase 3: Parallel Logic (Sealevel Optimization)
 * Based on: hub_track.json phase_id:3
 */
const createParallelLogicSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'token-design-lab',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        // Step 1: Sealevel Introduction
        {
            metadata: {
                ...meta,
                title: 'Parallel Logic: Sealevel Runtime',
                summary: 'Optimize execution via account locking',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'sealevel-intro',
                    title: 'Efficiency is Paramount',
                    body_markdown: `
# Sealevel Runtime Optimization

The **Sealevel runtime** executes transactions **in parallel** based on account read/write locks.

## Core Principles
1. **Account Locking**: Transactions declare which accounts they read/write
2. **Parallel Execution**: Non-conflicting transactions run simultaneously
3. **Deterministic Ordering**: Conflicts resolved by slot ordering

## Optimization Strategy
Minimize **Write-Lock contention** on hot accounts:
- Separate read-only from writable accounts
- Group unrelated writes
- Use Priority Fees during congestion

⚠️ **Budget Constraints**:
- Max **200,000 Compute Units** per instruction
- Attach **Priority Fees** to land transactions during congestion
- Monitor **Write-Lock Contention Ratio** (target: <10%)
                    `.trim(),
                },
                {
                    kind: 'indicator_block',
                    id: 'sealevel-metrics',
                    title: 'Target Performance Metrics',
                    type: 'gauge',
                    indicators: [
                        { name: 'Target TPS', value: 50000, max: 65000, color: '#22d3ee' },
                        { name: 'Write-Lock Contention', value: 5, max: 100, color: '#10b981' },
                        { name: 'Compute Unit Usage', value: 150000, max: 200000, color: '#fbbf24' },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'HubAgent',
                    action: 'explain_sealevel',
                    reason: 'Sealevel architecture explained. Ready for optimization challenge.',
                    parameters: { specialty: 'Runtime Optimization' },
                },
            ],
            next_state: {
                phase_id: 'token-design-lab',
                completed_missions: [],
                xp_delta: 35,
            },
        },

        // Step 2: Optimization Mission
        {
            metadata: {
                ...meta,
                title: 'Sealevel Optimization Simulation',
                summary: 'Reorder instructions to minimize contention',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'sealevel-optimization',
                    title: 'Mission: Optimize Transaction Throughput',
                    description: 'Reorder the instruction set in the visualizer. Identify read-only accounts vs writable accounts. Group unrelated write operations to run in the same block slot.',
                    mission_type: 'simulation',
                    expected_input_type: 'choice',
                    xp_reward: 55,
                    is_mandatory: true,
                },
                {
                    kind: 'resource_block',
                    id: 'sealevel-resources',
                    title: 'Optimization Guides',
                    resources: [
                        {
                            id: 'sealevel-guide',
                            label: 'Sealevel Deep Dive',
                            description: 'Comprehensive guide to parallel execution',
                            url: 'doc://sealevel',
                            resource_type: 'article',
                            agent_owner: 'HubAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'HubAgent',
                    action: 'evaluate_optimization',
                    reason: 'Optimization proposal received. Calculating throughput and contention metrics.',
                    parameters: {
                        min_score: 85,
                        required_keywords: ['parallel', 'sealevel', 'write-lock'],
                        criteria: ['Throughput (TPS)', 'Write-Lock Contention Ratio < 10%', 'Compute Unit Consumption'],
                    },
                },
            ],
            next_state: {
                phase_id: 'token-design-lab',
                completed_missions: ['sealevel-optimization'],
                xp_delta: 55,
            },
        },
    ];
};

/**
 * Phase 4: Graduation (Final Assessment)
 * Based on: hub_track.json phase_id:5
 */
const createGraduationSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'identity-proofing',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Hub Graduation: Final Assessment',
                summary: 'Defend your architectural choices',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'graduation-intro',
                    title: 'You Have Traversed the Hub',
                    body_markdown: `
# Final Attestation

Your neural pathways are aligned with the cluster. It is time for the **final attestation**.

## Architectural Defense
Prepare to defend your architectural choices against the Supervisor:
1. **Seed Strategy**: Why did you choose these seeds? How do you avoid collisions?
2. **Parallelization**: How did you reduce lock contention? What was your optimization strategy?
3. **Compression**: Why these Merkle tree parameters? What tradeoffs did you make?

## First Principles Thinking
Your defense must demonstrate:
- **Holistic understanding** of Sealevel
- **Reasoning from first principles**
- **Awareness of trade-offs** (performance vs cost vs security)
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'graduation-defense',
                    title: 'Mission: Architectural Defense',
                    description: 'Present your optimized architecture. Defend your choice of seeds (to avoid collision), your parallelization strategy (locking reduction), and your compression parameters (depth vs cost).',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 100,
                    nft_reward_id: 'hub-architect-cert',
                    is_mandatory: true,
                },
                {
                    kind: 'evaluation_block',
                    id: 'graduation-eval',
                    title: 'Assessment Criteria',
                    global_score: 0,
                    max_score: 100,
                    feedback: 'Defense will be evaluated by ZynoCore',
                    status: 'pending',
                    axes: [
                        { name: 'Architectural Coherence', score: 0, max_score: 40, comment: 'Pending evaluation' },
                        { name: 'Defense Reasoning (First Principles)', score: 0, max_score: 30, comment: 'Pending evaluation' },
                        { name: 'Holistic Understanding of Sealevel', score: 0, max_score: 30, comment: 'Pending evaluation' },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'ZynoAgent',
                    action: 'initiate_graduation',
                    reason: 'Final assessment initiated. Supervisor evaluation pending.',
                    parameters: {
                        specialty: 'Sovereign Certification',
                        min_score: 95,
                        required_keywords: ['architect', 'ready', 'deploy'],
                    },
                },
            ],
            next_state: {
                phase_id: 'identity-proofing',
                completed_missions: ['graduation-defense'],
                xp_delta: 100,
            },
        },
    ];
};

/**
 * Phase 5: Ecosystem Activation
 */
const createEcosystemEngagementSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'ecosystem-engagement',
        mode: 'builder' as Mode,
        tone: 'motivational' as Tone,
        language: 'en' as const,
    };

    return [
        // Step 1: Community Contribution Introduction
        {
            metadata: {
                ...meta,
                title: 'Ecosystem Activation: Apply Your Knowledge',
                summary: 'Convert insight into real-world contributions',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'ecosystem-intro',
                    title: 'From Learning to Leading',
                    body_markdown: `
# Ecosystem Activation

You've built the mental models. Now it's time to **apply them**.

## Your Mission
The ecosystem rewards those who **convert knowledge into shared momentum**:
1. **Ship a community contribution** (documentation, tool, tutorial)
2. **Present your activation brief** to peers
3. **Initiate DAO participation** in governance decisions

## Why This Matters
- **Documentation** becomes infrastructure
- **Tools** multiply builder velocity
- **Governance** shapes the future

Your contribution becomes part of the **Skillchain ledger**—permanent, verifiable, and recognized across the network.
                    `.trim(),
                },
                {
                    kind: 'resource_block',
                    id: 'ecosystem-resources',
                    title: 'Community Resources',
                    resources: [
                        {
                            id: 'skillchain-portal',
                            label: 'Skillchain Contributor Portal',
                            description: 'Submit contributions and track impact',
                            url: 'portal://skillchain',
                            resource_type: 'tool_link',
                            agent_owner: 'CommunityAgent',
                        },
                        {
                            id: 'dao-sandbox',
                            label: 'DAO Sandbox',
                            description: 'Practice governance participation',
                            url: 'sandbox://dao',
                            resource_type: 'tool_link',
                            agent_owner: 'GovernanceAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CommunityAgent',
                    action: 'activate_contributor',
                    reason: 'Contributor profile initialized. Ready for ecosystem engagement.',
                    parameters: { specialty: 'Community Coordination' },
                },
            ],
            next_state: {
                phase_id: 'ecosystem-engagement',
                completed_missions: [],
                xp_delta: 30,
            },
        },

        // Step 2: Activation Brief Mission
        {
            metadata: {
                ...meta,
                title: 'Ship Your Activation Brief',
                summary: 'Document and present your contribution plan',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'activation-brief',
                    title: 'Mission: Publish Your Activation Brief',
                    description: 'Create a markdown document outlining: (1) Your chosen contribution type, (2) Target audience and impact, (3) Implementation timeline, (4) How this aligns with MFAI ecosystem goals. Submit to Skillchain for peer review.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 60,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'activation-checklist',
                    title: 'Activation Requirements',
                    items: [
                        { label: 'Contribution type identified (doc/tool/tutorial)', checked: false },
                        { label: 'Impact assessment documented', checked: false },
                        { label: 'Timeline and milestones defined', checked: false },
                        { label: 'Peer review feedback received', checked: false },
                    ],
                },
                {
                    kind: 'action_suggestions_block',
                    id: 'activation-suggestions',
                    title: 'Suggested Contributions',
                    suggestions: [
                        { label: 'Write Technical Tutorial', action_id: 'write-technical-tutorial' },
                        { label: 'Build Developer Tool', action_id: 'build-developer-tool' },
                        { label: 'Contribute to Docs', action_id: 'contribute-to-docs' },
                        { label: 'Create Educational Content', action_id: 'create-educational-content' },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CommunityAgent',
                    action: 'review_activation_brief',
                    reason: 'Activation brief submitted. Coordinating peer review process.',
                    parameters: { min_score: 75, review_pool: 'sovereign-builders' },
                },
            ],
            next_state: {
                phase_id: 'ecosystem-engagement',
                completed_missions: ['activation-brief'],
                xp_delta: 60,
            },
        },

        // Step 3: DAO Participation
        {
            metadata: {
                ...meta,
                title: 'DAO Governance Initiation',
                summary: 'Participate in decentralized governance',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'dao-intro',
                    title: 'Governance is Co-Ownership',
                    body_markdown: `
# DAO Participation

In decentralized systems, **governance is power**.

## Your First Vote
Review the current governance proposals in the DAO sandbox:
- **Proposal A**: Adjust staking rewards distribution
- **Proposal B**: Fund new developer tooling initiative
- **Proposal C**: Update community contribution rewards

## Voting Considerations
1. **Align with mission**: Does this serve the ecosystem?
2. **Assess sustainability**: Can we maintain this long-term?
3. **Check incentives**: Who benefits and who bears costs?

Your vote is recorded on-chain and contributes to your **reputation score**.
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'dao-participation',
                    title: 'Mission: Cast Your First DAO Vote',
                    description: 'Review active proposals, analyze their impact, and cast your vote. Include a brief rationale (2-3 sentences) explaining your decision based on ecosystem alignment, sustainability, and incentive design.',
                    mission_type: 'governance',
                    expected_input_type: 'choice',
                    xp_reward: 30,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'GovernanceAgent',
                    action: 'record_vote',
                    reason: 'First governance participation recorded. Reputation score updated.',
                    parameters: { specialty: 'DAO Coordination', reputation_boost: 10 },
                },
            ],
            next_state: {
                phase_id: 'ecosystem-engagement',
                completed_missions: ['activation-brief', 'dao-participation'],
                xp_delta: 30,
            },
        },
    ];
};

/**
 * Phase 6: Launch via Collaterize
 */
const createLaunchCollaterizeSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'launch-collaterize',
        mode: 'simulation' as Mode,
        tone: 'professional' as Tone,
        language: 'en' as const,
    };

    return [
        // Step 1: Collaterize Platform Introduction
        {
            metadata: {
                ...meta,
                title: 'Launch Simulation: Introduction',
                summary: 'Understand the Collaterize launch platform',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'collaterize-intro',
                    title: 'Real-World Validation',
                    body_markdown: `
# Launch via Collaterize

**Collaterize** is the MFAI launch platform that validates project readiness through comprehensive simulation.

## What is Collaterize?
A multi-dimensional assessment system that evaluates:
- **Technical Readiness**: Architecture, security, performance
- **Economic Viability**: Tokenomics, sustainability, market fit
- **Community Alignment**: Governance, transparency, contributor engagement
- **Risk Profile**: Security audits, stress testing, contingency planning

## Launch Tiers
Based on your eligibility score:
- **Tier 1 (90-100)**: Full mainnet launch with MFAI backing
- **Tier 2 (75-89)**: Conditional launch with monitoring
- **Tier 3 (60-74)**: Testnet-only with improvement roadmap
- **Below 60**: Return to Core Track for additional development

## Why This Matters
Real-world validation prevents:
- ❌ Premature launches that damage reputation
- ❌ Economic models that collapse under load
- ❌ Security vulnerabilities that risk capital
- ✅ **Ensures you're truly ready**
                    `.trim(),
                },
                {
                    kind: 'diagram_block',
                    id: 'collaterize-flow',
                    title: 'Launch Assessment Flow',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[Submit Project] --> B[Technical Audit]
    B --> C[Economic Simulation]
    C --> D[Security Stress Test]
    D --> E[Community Readiness]
    E --> F{Calculate Score}
    F -->|90-100| G[Tier 1: Full Launch]
    F -->|75-89| H[Tier 2: Conditional]
    F -->|60-74| I[Tier 3: Testnet]
    F -->|<60| J[Core Track Return]
                    `.trim(),
                    caption: 'Multi-dimensional assessment process',
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CollaterizeAgent',
                    action: 'initialize_simulation',
                    reason: 'Launch simulation environment initialized. Ready for assessment.',
                    parameters: { specialty: 'Launch Validation', mode: 'comprehensive' },
                },
            ],
            next_state: {
                phase_id: 'launch-collaterize',
                completed_missions: [],
                xp_delta: 40,
            },
        },

        // Step 2: Run Simulation
        {
            metadata: {
                ...meta,
                title: 'Run Collaterize Simulation',
                summary: 'Execute comprehensive launch assessment',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'collaterize-simulation',
                    title: 'Mission: Complete Launch Simulation',
                    description: 'Submit your project details to the Collaterize simulator. The system will run: (1) Technical architecture audit, (2) Economic stress testing, (3) Security vulnerability scan, (4) Community governance assessment. Results will generate your Eligibility Score and Launch Tier.',
                    mission_type: 'simulation',
                    expected_input_type: 'link',
                    xp_reward: 80,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'simulation-checklist',
                    title: 'Simulation Components',
                    items: [
                        { label: 'Technical Architecture Audit (25 points)', checked: false },
                        { label: 'Economic Stress Testing (25 points)', checked: false },
                        { label: 'Security Vulnerability Scan (25 points)', checked: false },
                        { label: 'Community Governance Assessment (25 points)', checked: false },
                    ],
                },
                {
                    kind: 'indicator_block',
                    id: 'launch-metrics',
                    title: 'Target Metrics',
                    type: 'bar',
                    indicators: [
                        { name: 'Technical Score', value: 0, max: 25, color: '#3b82f6' },
                        { name: 'Economic Score', value: 0, max: 25, color: '#10b981' },
                        { name: 'Security Score', value: 0, max: 25, color: '#f59e0b' },
                        { name: 'Governance Score', value: 0, max: 25, color: '#8b5cf6' },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CollaterizeAgent',
                    action: 'run_simulation',
                    reason: 'Running comprehensive launch simulation across all assessment vectors.',
                    parameters: {
                        assessment_vectors: ['technical', 'economic', 'security', 'governance'],
                        stress_test_duration: '24h',
                        min_passing_score: 60,
                    },
                },
            ],
            next_state: {
                phase_id: 'launch-collaterize',
                completed_missions: ['collaterize-simulation'],
                xp_delta: 80,
            },
        },

        // Step 3: Review Results and Next Steps
        {
            metadata: {
                ...meta,
                title: 'Launch Assessment Results',
                summary: 'Review eligibility score and launch plan',
            },
            ui_blocks: [
                {
                    kind: 'evaluation_block',
                    id: 'launch-evaluation',
                    title: 'Launch Readiness Assessment',
                    global_score: 0,
                    max_score: 100,
                    feedback: 'Simulation complete. Review detailed breakdown below.',
                    status: 'completed',
                    axes: [
                        { name: 'Technical Architecture', score: 0, max_score: 25, comment: 'Awaiting simulation results' },
                        { name: 'Economic Viability', score: 0, max_score: 25, comment: 'Awaiting simulation results' },
                        { name: 'Security Posture', score: 0, max_score: 25, comment: 'Awaiting simulation results' },
                        { name: 'Community Readiness', score: 0, max_score: 25, comment: 'Awaiting simulation results' },
                    ],
                },
                {
                    kind: 'text_block',
                    id: 'launch-next-steps',
                    title: 'Next Steps',
                    body_markdown: `
# Your Launch Journey

Based on your **Eligibility Score**, you've been assigned a **Launch Tier**.

## Next Actions
1. **Tier 1 (90-100)**: Proceed to Core Track for mainnet deployment
2. **Tier 2 (75-89)**: Address conditional requirements, then advance
3. **Tier 3 (60-74)**: Deploy to testnet, iterate based on feedback
4. **Below 60**: Return to relevant training phases for improvement

## MFAI Support
- **Technical Guidance**: Access to HubAgent for architecture optimization
- **Economic Modeling**: Tokenomics review with FinanceAgent
- **Security Hardening**: Audit support from ResilienceAgent
- **Community Building**: Governance design with GovernanceAgent

## Collaterize Launch Badge
Upon completion, you receive the **Collaterize Launch Badge** NFT—proof of comprehensive readiness validation.
                    `.trim(),
                },
                {
                    kind: 'resource_block',
                    id: 'launch-resources',
                    title: 'Post-Simulation Resources',
                    resources: [
                        {
                            id: 'core-track',
                            label: 'Core Track Enrollment',
                            description: 'Advanced development track for mainnet launch',
                            url: 'track://core',
                            resource_type: 'tool_link',
                            agent_owner: 'CollaterizeAgent',
                        },
                        {
                            id: 'improvement-plan',
                            label: 'Improvement Roadmap',
                            description: 'Personalized plan based on assessment gaps',
                            url: 'plan://improvement',
                            resource_type: 'article',
                            agent_owner: 'CollaterizeAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'ZynoAgent',
                    action: 'finalize_assessment',
                    reason: 'Launch assessment complete. Eligibility score calculated. Next track determined.',
                    parameters: {
                        specialty: 'Journey Orchestration',
                        nft_reward: 'collaterize-launch-badge',
                        unlock_core_track: true,
                    },
                },
            ],
            next_state: {
                phase_id: 'launch-collaterize',
                completed_missions: ['collaterize-simulation'],
                xp_delta: 80,
            },
        },
    ];
};

/**
 * Capital Foundry Phase 2: Program Forge Lab
 * Build Solana programs with Anchor/Rust patterns
 */
const createProgramForgeSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'program-forge',
        mode: 'builder' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        // Step 1: Anchor Framework Introduction
        {
            metadata: {
                ...meta,
                title: 'Anchor Framework Mastery',
                summary: 'Master Solana program development with Anchor',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'anchor-intro',
                    title: 'The Anchor Framework',
                    body_markdown: `
# Anchor: The Solana Development Framework

**Anchor** is the Rust framework that makes Solana program development safe and efficient.

## Core Concepts
1. **Accounts**: Declare account constraints with macros
2. **Instructions**: Define program logic with type safety
3. **Context**: Automatic account validation and deserialization
4. **Error Handling**: Custom error types with descriptive messages

## Why Anchor?
- ✅ **Security**: Automatic checks prevent common vulnerabilities
- ✅ **Productivity**: Reduces boilerplate by 70%
- ✅ **Testing**: Built-in TypeScript client generation
- ✅ **IDL**: Automatic interface generation for frontends

## Program Structure
\`\`\`rust
#[program]
pub mod lending_protocol {
    use super::*;
    
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // Your logic here
        Ok(())
    }
}
\`\`\`
                    `.trim(),
                },
                {
                    kind: 'diagram_block',
                    id: 'anchor-architecture',
                    title: 'Anchor Program Architecture',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[Client Request] --> B[Anchor IDL]
    B --> C[Instruction Handler]
    C --> D[Account Validation]
    D --> E[Business Logic]
    E --> F[State Update]
    F --> G[Return Result]
                    `.trim(),
                    caption: 'Anchor request flow with automatic validation',
                },
                {
                    kind: 'resource_block',
                    id: 'anchor-resources',
                    title: 'Learning Resources',
                    resources: [
                        {
                            id: 'anchor-book',
                            label: 'The Anchor Book',
                            description: 'Official Anchor documentation',
                            url: 'https://book.anchor-lang.com/',
                            resource_type: 'article',
                            agent_owner: 'CapitalAgent',
                        },
                        {
                            id: 'anchor-examples',
                            label: 'Anchor Program Examples',
                            description: 'Real-world Anchor programs',
                            url: 'https://github.com/coral-xyz/anchor/tree/master/tests',
                            resource_type: 'code_snippet',
                            agent_owner: 'CapitalAgent',
                        },
                        {
                            id: 'solana-cookbook',
                            label: 'Solana Cookbook',
                            description: 'Practical recipes for Solana development',
                            url: 'https://solanacookbook.com/',
                            resource_type: 'article',
                            agent_owner: 'CapitalAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CapitalAgent',
                    action: 'introduce_anchor',
                    reason: 'Anchor framework fundamentals established. Ready for hands-on development.',
                    parameters: { specialty: 'DeFi Protocol Development' },
                },
            ],
            next_state: {
                phase_id: 'program-forge',
                completed_missions: [],
                xp_delta: 40,
            },
        },

        // Step 2: Build Core Module
        {
            metadata: {
                ...meta,
                title: 'Build Core Lending Module',
                summary: 'Implement lending protocol with Anchor',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'lending-module',
                    title: 'Mission: Implement Lending Core',
                    description: 'Build a lending protocol module with Anchor. Implement: (1) Initialize pool instruction, (2) Deposit collateral logic, (3) Borrow against collateral, (4) Repayment and liquidation handlers. Include account validation and error handling.',
                    mission_type: 'code_submission',
                    expected_input_type: 'code_snippet',
                    xp_reward: 70,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'lending-checklist',
                    title: 'Implementation Requirements',
                    items: [
                        { label: 'Pool initialization with proper account constraints', checked: false },
                        { label: 'Collateral deposit with SPL token transfer', checked: false },
                        { label: 'Borrow logic with collateralization ratio check', checked: false },
                        { label: 'Repayment and liquidation handlers', checked: false },
                        { label: 'Custom error types defined', checked: false },
                        { label: 'Unit tests with >80% coverage', checked: false },
                    ],
                },
                {
                    kind: 'resource_block',
                    id: 'lending-resources',
                    title: 'Code References',
                    resources: [
                        {
                            id: 'lending-template',
                            label: 'Lending Protocol Template',
                            description: 'Starter template for lending programs',
                            url: 'snippet://lending-anchor-template',
                            resource_type: 'code_snippet',
                            agent_owner: 'CapitalAgent',
                        },
                        {
                            id: 'spl-token-anchor',
                            label: 'SPL Token with Anchor',
                            description: 'Token transfer patterns in Anchor',
                            url: 'snippet://spl-token-anchor',
                            resource_type: 'code_snippet',
                            agent_owner: 'CapitalAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CapitalAgent',
                    action: 'review_lending_module',
                    reason: 'Lending module submitted. Validating logic, security, and test coverage.',
                    parameters: {
                        min_score: 80,
                        required_keywords: ['initialize', 'deposit', 'borrow', 'liquidate'],
                        security_checks: ['overflow', 'reentrancy', 'authorization'],
                    },
                },
            ],
            next_state: {
                phase_id: 'program-forge',
                completed_missions: ['lending-module'],
                xp_delta: 70,
            },
        },

        // Step 3: Testing & Optimization
        {
            metadata: {
                ...meta,
                title: 'Testing & Gas Optimization',
                summary: 'Validate and optimize program performance',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'optimization-intro',
                    title: 'Performance is Product-Market Fit',
                    body_markdown: `
# Optimize Every Compute Unit

In DeFi, **performance = capital efficiency**.

## Optimization Strategies
1. **Minimize CPI calls**: Cross-program invocations are expensive
2. **Pack account data**: Reduce storage costs
3. **Batch operations**: Combine multiple actions when possible
4. **Use zero-copy**: Avoid unnecessary deserialization

## Compute Unit Budget
- **Max per transaction**: 1.4M compute units
- **Target**: <200k for standard operations
- **Critical**: <500k for complex DeFi interactions

## Testing Checklist
- ✅ Fuzzing with random inputs
- ✅ Stress testing with max account sizes
- ✅ Edge case validation (zero amounts, max values)
- ✅ Gas profiling for all instructions
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'optimization-mission',
                    title: 'Mission: Optimize & Benchmark',
                    description: 'Run gas profiling on your lending module. Identify the most expensive operations and optimize them. Target: All instructions under 200k compute units. Submit benchmark report with before/after metrics.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 50,
                    is_mandatory: true,
                },
                {
                    kind: 'indicator_block',
                    id: 'gas-metrics',
                    title: 'Target Compute Units',
                    type: 'bar',
                    indicators: [
                        { name: 'Initialize', value: 0, max: 200000, color: '#3b82f6' },
                        { name: 'Deposit', value: 0, max: 200000, color: '#10b981' },
                        { name: 'Borrow', value: 0, max: 200000, color: '#f59e0b' },
                        { name: 'Liquidate', value: 0, max: 200000, color: '#ef4444' },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CapitalAgent',
                    action: 'validate_optimization',
                    reason: 'Benchmarks submitted. Validating compute unit efficiency and test coverage.',
                    parameters: {
                        max_compute_units: 200000,
                        required_tests: ['fuzzing', 'stress', 'edge_cases'],
                    },
                },
            ],
            next_state: {
                phase_id: 'program-forge',
                completed_missions: ['lending-module', 'optimization-mission'],
                xp_delta: 50,
            },
        },
    ];
};

/**
 * Capital Foundry Phase 3: Oracle & Liquidity Mesh
 * Integrate oracle feeds and liquidity management
 */
const createOracleIntegrationSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'oracle-integration',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        // Step 1: Oracle Architecture
        {
            metadata: {
                ...meta,
                title: 'Oracle Integration Fundamentals',
                summary: 'Design resilient oracle and liquidity layers',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'oracle-intro',
                    title: 'Data Truth Feeds Capital Trust',
                    body_markdown: `
# Oracle & Liquidity Architecture

**Oracles** are the nervous system of DeFi protocols.

## Oracle Types
1. **Price Feeds**: Pyth, Switchboard, Chainlink
2. **Liquidity Oracles**: DEX TWAP, aggregated depth
3. **Volatility Oracles**: Implied vol, historical metrics

## Integration Patterns
- **Pull-based**: Protocol fetches latest data on-demand
- **Push-based**: Oracle updates protocol state automatically
- **Hybrid**: Combine both for optimal freshness vs cost

## Critical Considerations
⚠️ **Staleness**: Always check timestamp freshness
⚠️ **Manipulation**: Use TWAP or median of multiple sources
⚠️ **Availability**: Implement fallback oracles
⚠️ **Precision**: Handle decimal places correctly

## Liquidity Management
- Monitor pool depth across DEXs
- Implement slippage protection
- Design cross-chain contingency flows
                    `.trim(),
                },
                {
                    kind: 'diagram_block',
                    id: 'oracle-flow',
                    title: 'Multi-Oracle Architecture',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[DeFi Protocol] --> B{Oracle Aggregator}
    B --> C[Pyth Network]
    B --> D[Switchboard]
    B --> E[DEX TWAP]
    C --> F[Median Price]
    D --> F
    E --> F
    F --> G{Staleness Check}
    G -->|Fresh| H[Use Price]
    G -->|Stale| I[Fallback Oracle]
                    `.trim(),
                    caption: 'Resilient multi-source oracle architecture',
                },
                {
                    kind: 'resource_block',
                    id: 'oracle-resources',
                    title: 'Oracle Integration Guides',
                    resources: [
                        {
                            id: 'pyth-docs',
                            label: 'Pyth Network Documentation',
                            description: 'High-frequency price feeds for Solana',
                            url: 'https://docs.pyth.network/',
                            resource_type: 'article',
                            agent_owner: 'CapitalAgent',
                        },
                        {
                            id: 'switchboard-guide',
                            label: 'Switchboard Integration',
                            description: 'Customizable oracle feeds',
                            url: 'https://docs.switchboard.xyz/',
                            resource_type: 'article',
                            agent_owner: 'CapitalAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CapitalAgent',
                    action: 'introduce_oracle_architecture',
                    reason: 'Oracle fundamentals established. Ready for integration implementation.',
                    parameters: { specialty: 'Oracle & Liquidity Systems' },
                },
            ],
            next_state: {
                phase_id: 'oracle-integration',
                completed_missions: [],
                xp_delta: 40,
            },
        },

        // Step 2: Implement Oracle Integration
        {
            metadata: {
                ...meta,
                title: 'Implement Multi-Oracle System',
                summary: 'Build resilient oracle integration with fallbacks',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'oracle-integration',
                    title: 'Mission: Integrate Oracle Feeds',
                    description: 'Implement multi-oracle price feed system for your lending protocol. Requirements: (1) Integrate Pyth as primary oracle, (2) Add Switchboard as fallback, (3) Implement staleness checks (max 60s), (4) Calculate median from multiple sources, (5) Handle oracle failures gracefully.',
                    mission_type: 'code_submission',
                    expected_input_type: 'code_snippet',
                    xp_reward: 80,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'oracle-checklist',
                    title: 'Integration Requirements',
                    items: [
                        { label: 'Pyth price feed integration', checked: false },
                        { label: 'Switchboard fallback configured', checked: false },
                        { label: 'Staleness validation (<60s)', checked: false },
                        { label: 'Median calculation from multiple sources', checked: false },
                        { label: 'Circuit breaker for extreme price moves', checked: false },
                        { label: 'Comprehensive error handling', checked: false },
                    ],
                },
                {
                    kind: 'action_suggestions_block',
                    id: 'oracle-suggestions',
                    title: 'Testing Scenarios',
                    suggestions: [
                        { label: 'Test Stale Data Handling', action_id: 'test-stale-data' },
                        { label: 'Simulate Oracle Failure', action_id: 'simulate-failure' },
                        { label: 'Test Price Manipulation', action_id: 'test-manipulation' },
                        { label: 'Benchmark Latency', action_id: 'benchmark-latency' },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CapitalAgent',
                    action: 'review_oracle_integration',
                    reason: 'Oracle integration submitted. Validating resilience and failure handling.',
                    parameters: {
                        min_score: 85,
                        required_checks: ['staleness', 'fallback', 'circuit_breaker'],
                        max_latency_ms: 100,
                    },
                },
            ],
            next_state: {
                phase_id: 'oracle-integration',
                completed_missions: ['oracle-integration'],
                xp_delta: 80,
            },
        },

        // Step 3: Liquidity Stress Testing
        {
            metadata: {
                ...meta,
                title: 'Liquidity Shock Simulation',
                summary: 'Test protocol resilience under extreme conditions',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'stress-test-intro',
                    title: 'Stress Testing is Risk Mitigation',
                    body_markdown: `
# Liquidity Stress Testing

Protocols fail when liquidity disappears. **Test before it happens.**

## Stress Test Scenarios
1. **Flash Crash**: 50% price drop in 1 block
2. **Liquidity Drain**: 80% pool depth removed
3. **Oracle Failure**: All price feeds go offline
4. **Network Congestion**: 10x gas prices, 5s block times

## Expected Behaviors
- ✅ Circuit breakers trigger at -30% price move
- ✅ Liquidations execute within 2 blocks
- ✅ Protocol remains solvent through all scenarios
- ✅ User funds remain accessible

## Metrics to Monitor
- Collateralization ratio stability
- Liquidation efficiency
- Slippage impact
- Protocol solvency ratio
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'stress-test-mission',
                    title: 'Mission: Run Liquidity Stress Tests',
                    description: 'Execute comprehensive stress testing suite. Simulate: (1) Flash crash scenario, (2) Liquidity drain, (3) Oracle failure, (4) Network congestion. Document protocol behavior and any vulnerabilities discovered. Submit detailed stress test report.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 60,
                    is_mandatory: true,
                },
                {
                    kind: 'indicator_block',
                    id: 'stress-metrics',
                    title: 'Stress Test Targets',
                    type: 'bar',
                    indicators: [
                        { name: 'Flash Crash Resilience', value: 0, max: 100, color: '#ef4444' },
                        { name: 'Liquidity Drain Handling', value: 0, max: 100, color: '#f59e0b' },
                        { name: 'Oracle Failure Recovery', value: 0, max: 100, color: '#3b82f6' },
                        { name: 'Congestion Tolerance', value: 0, max: 100, color: '#8b5cf6' },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CapitalAgent',
                    action: 'validate_stress_tests',
                    reason: 'Stress test report submitted. Analyzing protocol resilience and failure modes.',
                    parameters: {
                        required_scenarios: ['flash_crash', 'liquidity_drain', 'oracle_failure', 'congestion'],
                        min_resilience_score: 80,
                    },
                },
            ],
            next_state: {
                phase_id: 'oracle-integration',
                completed_missions: ['oracle-integration', 'stress-test-mission'],
                xp_delta: 60,
            },
        },
    ];
};

/**
 * Capital Foundry Phase 4: Risk Command Center (staking + bonding curve)
 */
const createRiskCommandSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'risk-command',
        mode: 'builder' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Risk Command Center',
                summary: 'Operationalize risk analytics with staking commitment',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'risk-command-intro',
                    title: 'Risk Command Center',
                    body_markdown: `
# Risk Command Center

You must stake tokens to activate risk governance and unlock protocol controls.
This phase anchors your commitment and enables on-chain risk participation.
                    `.trim(),
                },
                {
                    kind: 'bonding_curve_block',
                    id: 'risk-command-curve',
                    title: 'Staking Bonding Curve',
                    description: 'Simulate staking impact on reserve ratios and price pressure.',
                    curveType: 'linear',
                    data: {
                        currentSupply: 1200000,
                        maxSupply: 5000000,
                        reserveRatio: 0.35,
                        basePrice: 0.25,
                    },
                },
                {
                    kind: 'mission_block',
                    id: 'risk-command-stake',
                    title: 'Mission: Stake 75 MFAI for Risk Access',
                    description: 'Stake 75 MFAI to unlock risk analytics and governance guardrails.',
                    mission_type: 'staking',
                    expected_input_type: 'choice',
                    xp_reward: 90,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'RiskAgent',
                    action: 'activate_risk_console',
                    reason: 'Risk Command Center activated after staking intent.',
                    parameters: { staking_required: 75 },
                },
            ],
            next_state: {
                phase_id: 'risk-command',
                completed_missions: ['risk-command-stake'],
                xp_delta: 90,
            },
        },
    ];
};

/**
 * DAO vote phase helper (DAO dashboard + dao_vote mission)
 */
const createDaoVotePhaseSequence = (
    trackId: string,
    phaseId: string,
    phaseTitle: string,
    phaseSummary: string
): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: phaseId,
        mode: 'builder' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: phaseTitle,
                summary: phaseSummary,
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: `${phaseId}-dao-intro`,
                    title: phaseTitle,
                    body_markdown: `
# ${phaseTitle}

DAO governance is now active for this phase. Review proposals and cast your vote.
                    `.trim(),
                },
                {
                    kind: 'dao_dashboard_block',
                    id: `${phaseId}-dao-dashboard`,
                    title: 'DAO Voting Dashboard',
                    votingPower: 150,
                    proposals: [
                        {
                            id: `${phaseId}-p1`,
                            title: 'Treasury Risk Allocation',
                            description: 'Adjust reserve ratios to stabilize protocol liquidity.',
                            votesFor: 58,
                            votesAgainst: 12,
                            status: 'active',
                            endDate: '2026-12-31',
                        },
                        {
                            id: `${phaseId}-p2`,
                            title: 'Protocol Expansion Grant',
                            description: 'Fund a new integration to expand ecosystem reach.',
                            votesFor: 42,
                            votesAgainst: 20,
                            status: 'active',
                            endDate: '2026-12-31',
                        },
                    ],
                },
                {
                    kind: 'mission_block',
                    id: `${phaseId}-dao-vote`,
                    title: 'Mission: Cast DAO Vote',
                    description: 'Review proposals and submit your vote with a brief rationale.',
                    mission_type: 'dao_vote',
                    expected_input_type: 'choice',
                    xp_reward: 80,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'GovernanceAgent',
                    action: 'record_vote_intent',
                    reason: 'DAO vote captured for governance record.',
                    parameters: { phase: phaseId },
                },
            ],
            next_state: {
                phase_id: phaseId,
                completed_missions: [`${phaseId}-dao-vote`],
                xp_delta: 80,
            },
        },
    ];
};

// ============================================================================
// CAPITAL FOUNDRY - DeFi Protocol Builder Track
// ============================================================================

/**
 * Capital Foundry: Protocol Discovery Sprint
 */
const createCapitalDiscoverySequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'capital-discovery',
        mode: 'discovery' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'DeFi Landscape Analysis',
                summary: 'Audit Solana DeFi protocols and identify opportunities',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'defi-intro',
                    title: 'The DeFi Frontier',
                    body_markdown: `
# Protocol Discovery Sprint

The Capital Foundry transforms financial primitives into high-performance protocols.

## Your Mission
Benchmark the Solana DeFi landscape:
1. **Audit leading protocols**: Serum, Raydium, Marinade, Jupiter
2. **Analyze composability patterns**: How do protocols integrate?
3. **Identify market gaps**: Where is demand unmet?

## Key Metrics
- **Total Value Locked (TVL)**: Capital deployed
- **Transaction throughput**: TPS and latency
- **Composability score**: Integration complexity
- **User retention**: Sticky vs transient capital

The best DeFi ideas emerge where **throughput meets unserved demand**.
                    `.trim(),
                },
                {
                    kind: 'resource_block',
                    id: 'defi-resources',
                    title: 'DeFi Analysis Tools',
                    resources: [
                        {
                            id: 'solana-defi-map',
                            label: 'Solana DeFi Ecosystem Map',
                            description: 'Interactive visualization of protocols',
                            url: 'https://solana.com/ecosystem/defi',
                            resource_type: 'tool_link',
                            agent_owner: 'AnalysisAgent',
                        },
                        {
                            id: 'defillama',
                            label: 'DeFiLlama Analytics',
                            description: 'Real-time TVL and protocol metrics',
                            url: 'https://defillama.com/chain/Solana',
                            resource_type: 'article',
                            agent_owner: 'AnalysisAgent',
                        },
                    ],
                },
                {
                    kind: 'mission_block',
                    id: 'opportunity-matrix',
                    title: 'Mission: Publish Opportunity Matrix',
                    description: 'Create a markdown analysis documenting: (1) Top 5 Solana DeFi protocols, (2) Composability patterns you observed, (3) Three unmet market needs, (4) Your proposed solution direction.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 80,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'FinanceAgent',
                    action: 'analyze_market',
                    reason: 'Market analysis initiated. Identifying DeFi opportunities on Solana.',
                    parameters: { specialty: 'DeFi Research', focus: 'opportunity-identification' },
                },
            ],
            next_state: {
                phase_id: 'capital-discovery',
                completed_missions: ['opportunity-matrix'],
                xp_delta: 80,
            },
        },
    ];
};

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

const isProd = process.env.NODE_ENV === 'production';
const logDebug = (...args: unknown[]) => {
    if (!isProd) {
        console.log(...args);
    }
};
const logWarn = (...args: unknown[]) => {
    if (!isProd) {
        console.warn(...args);
    }
};

/**
 * Generate complete demo sequence for a track
 *
 * @param trackId - Persona track identifier
 * @returns Complete journey sequence (all phases, all steps)
 */
const buildTrackSequence = (trackId: string): JourneyStepResponse[] => {
    logDebug(`[DemoSequencer V2] Generating sequence for track: ${trackId}`);

    // Cognitive Activation Hub - Complete 6-phase journey
    if (trackId === 'cognitive-activation-hub' || trackId === 'hub') {
        const sequence: JourneyStepResponse[] = [
            ...createNeuralHandshakeSequence(trackId),    // Phase 1: cognitive-orientation (2 steps)
            ...createMemoryForgeSequence(trackId),         // Phase 2: solana-fluency (2 steps)
            ...createParallelLogicSequence(trackId),       // Phase 3: token-design-lab (2 steps)
            ...createGraduationSequence(trackId),          // Phase 4: identity-proofing (1 step)
            ...createEcosystemEngagementSequence(trackId), // Phase 5: ecosystem-engagement (3 steps)
            ...createLaunchCollaterizeSequence(trackId),   // Phase 6: launch-collaterize (3 steps)
        ];

        logDebug(`[DemoSequencer V2] Generated ${sequence.length} steps for ${trackId}`);
        return sequence;
    }

    // Capital Foundry - DeFi Protocol Builder (Complete Implementation)
    if (trackId === 'capital-foundry') {
        const sequence: JourneyStepResponse[] = [
            ...createCapitalDiscoverySequence(trackId),    // Phase 1: capital-discovery
            ...createProgramForgeSequence(trackId),        // Phase 2: program-forge
            ...createOracleIntegrationSequence(trackId),   // Phase 3: oracle-integration
            ...createRiskCommandSequence(trackId),         // Phase 4: risk-command
            ...createDaoVotePhaseSequence(trackId, 'capital-launchpad', 'Launch & Scale Deck', 'Prepare for production'),
            ...createLaunchCollaterizeSequence(trackId),   // Phase 6: launch-collaterize
        ];

        logDebug(`[DemoSequencer V2] Generated ${sequence.length} steps for ${trackId}`);
        return sequence;
    }

    // System Architect - Infrastructure Builder (Complete Implementation)
    if (trackId === 'system-architect') {
        const sequence: JourneyStepResponse[] = [
            ...createArchitectureScanSequence(trackId),      // Phase 1: architecture-scan
            ...createDePINStudioSequence(trackId),           // Phase 2: depin-studio (staking)
            ...createOnChainAISequence(trackId),             // Phase 3: onchain-ai
            ...createSystemsHardeningSequence(trackId),      // Phase 4: systems-hardening
            ...createSynapticRolloutSequence(trackId),       // Phase 5: synaptic-rollout (DAO vote)
            ...createLaunchCollaterizeSequence(trackId),     // Phase 6: launch-collaterize
        ];

        logDebug(`[DemoSequencer V2] Generated ${sequence.length} steps for ${trackId}`);
        return sequence;
    }

    // Experience Studio - Creator Tech (Complete Implementation)
    if (trackId === 'experience-studio') {
        const sequence: JourneyStepResponse[] = [
            ...createExperienceDiscoverySequence(trackId),  // Phase 1: experience-discovery
            ...createNFTSystemsLabSequence(trackId),        // Phase 2: nft-systems
            ...createGameplayLabSequence(trackId),          // Phase 3: gameplay-lab
            ...createUXElevationSequence(trackId),          // Phase 4: ux-elevation
            ...createExperienceLaunchSequence(trackId),     // Phase 5: experience-launch
            ...createLaunchCollaterizeSequence(trackId),    // Phase 6: launch-collaterize
        ];

        logDebug(`[DemoSequencer V2] Generated ${sequence.length} steps for ${trackId}`);
        return sequence;
    }

    // Impact Engine - Governance & Coordination (Complete Implementation)
    if (trackId === 'impact-engine') {
        const sequence: JourneyStepResponse[] = [
            ...createImpactCharterSequence(trackId),           // Phase 1: impact-charter
            ...createDAODesignSequence(trackId),               // Phase 2: dao-design
            ...createPhilanthropyProtocolsSequence(trackId),   // Phase 3: philanthropy-protocols
            ...createIdentityReputationSequence(trackId),      // Phase 4: identity-reputation
            ...createDaoVotePhaseSequence(trackId, 'synaptic-impact', 'Synaptic Impact Launch', 'Present to DAO'),
            ...createLaunchCollaterizeSequence(trackId),       // Phase 6: launch-collaterize
        ];

        logDebug(`[DemoSequencer V2] Generated ${sequence.length} steps for ${trackId}`);
        return sequence;
    }

    // Resilience Master - Security Guardian (Complete Implementation)
    if (trackId === 'resilience-master') {
        const sequence: JourneyStepResponse[] = [
            ...createSecurityBaselineSequence(trackId),      // Phase 1: security-baseline
            ...createExploitHuntSequence(trackId),           // Phase 2: exploit-hunt
            ...createDefenseSystemsSequence(trackId),        // Phase 3: defense-systems
            ...createIncidentResponseSequence(trackId),      // Phase 4: incident-response
            ...createRedBlueEvolutionSequence(trackId),      // Phase 5: red-blue-evolution
            ...createLaunchCollaterizeSequence(trackId),     // Phase 6: launch-collaterize
        ];

        logDebug(`[DemoSequencer V2] Generated ${sequence.length} steps for ${trackId}`);
        return sequence;
    }

    // E2E Persona - Minimal 3-phase journey for tests
    if (trackId === 'e2e-persona') {
        const sequence: JourneyStepResponse[] = [
            ...createGenericPhaseSequence(trackId, 'discovery', 'Discovery', 'Discovery Phase'),
            ...createGenericPhaseSequence(trackId, 'strategy', 'Strategy', 'Strategy Phase'),
            ...createGenericPhaseSequence(trackId, 'plan', 'Plan Generation', 'Plan Phase'),
        ];

        logDebug(`[DemoSequencer V2] Generated ${sequence.length} steps for ${trackId}`);
        return sequence;
    }

    // Fallback for unknown tracks
    logWarn(`[DemoSequencer V2] Unknown track: ${trackId}. Returning empty sequence.`);
    return [];
};

export function getDemoSequence(trackId: string): JourneyStepResponse[];
export function getDemoSequence(phaseId: string, personaId: string): JourneyStepResponse[];
export function getDemoSequence(a: string, b?: string): JourneyStepResponse[] {
    const resolvedTrack = b || a;
    const sequence = buildTrackSequence(resolvedTrack);

    if (b) {
        const phaseId = a;
        const filtered = sequence.filter(
            (step) => step.metadata?.phase_id === phaseId || (step.metadata as { phaseId?: string })?.phaseId === phaseId
        );
        if (filtered.length === 0) {
            logWarn(`[DemoSequencer V2] Unknown phase: ${phaseId} for track: ${resolvedTrack}. Returning empty sequence.`);
        }
        return filtered;
    }

    return sequence;
}

/**
 * Generic phase sequence generator for rapid implementation
 * Creates a minimal but complete phase sequence
 */
const createGenericPhaseSequence = (
    trackId: string,
    phaseId: string,
    phaseTitle: string,
    phaseDescription: string
): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: phaseId,
        mode: 'builder' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: phaseTitle,
                summary: phaseDescription,
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: `${phaseId}-intro`,
                    title: phaseTitle,
                    body_markdown: `
# ${phaseTitle}

${phaseDescription}

## Your Journey
This phase guides you through the essential concepts and practical applications needed to master this domain.

## Key Objectives
- Understand core principles
- Apply knowledge through hands-on missions
- Build portfolio-ready deliverables
- Integrate with MFAI ecosystem

Complete the mission below to progress to the next phase.
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: `${phaseId}-mission`,
                    title: `Mission: Complete ${phaseTitle}`,
                    description: `Document your approach to ${phaseDescription}. Include: (1) Key concepts learned, (2) Implementation strategy, (3) Challenges encountered, (4) Next steps for improvement.`,
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 100,
                    is_mandatory: true,
                },
                {
                    kind: 'resource_block',
                    id: `${phaseId}-resources`,
                    title: 'Learning Resources',
                    resources: [
                        {
                            id: `${phaseId}-doc`,
                            label: 'Phase Documentation',
                            description: `Complete guide for ${phaseTitle}`,
                            url: `doc://${phaseId}`,
                            resource_type: 'article',
                            agent_owner: 'GuideAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'GuideAgent',
                    action: 'phase_introduction',
                    reason: `${phaseTitle} initiated. Providing guidance and resources.`,
                    parameters: { specialty: 'Phase Guidance', phase: phaseId },
                },
            ],
            next_state: {
                phase_id: phaseId,
                completed_missions: [`${phaseId}-mission`],
                xp_delta: 100,
            },
        },
    ];
};
