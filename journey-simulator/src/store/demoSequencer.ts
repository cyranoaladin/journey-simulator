
import { personas } from '../data/personas';
import type { Metadata, Mode, ResourceItem, Tone } from '../types/uiBlocks';
import { JourneyStepResponse, UIBlock, AgentAction } from '../types/uiBlocks';

/**
 * The Sovereign Sequencer V2 (Hydrated Matrix)
 * 6 Personas x 6 Phases = 36 Unique Content Nodes.
 * Strict Gating & Agent Action Enforcement.
 */

/**
 * Creates a deterministic demo step payload for the simulator.
 */
type DemoStepMetadata = {
    persona_id: string;
    journey_track: string;
    phase_id: string;
    mode?: Mode;
    tone?: Tone;
};

const createStep = (
    title: string,
    blocks: UIBlock[],
    actions: AgentAction[],
    metadata: DemoStepMetadata
): JourneyStepResponse => ({
    metadata: {
        persona_id: metadata.persona_id,
        journey_track: metadata.journey_track,
        phase_id: metadata.phase_id,
        language: 'en',
        mode: metadata.mode,
        tone: metadata.tone,
        title,
        summary: `Demo sequence for ${title}`,
    } satisfies Metadata,
    ui_blocks: blocks,
    agent_actions: actions,
    next_state: {
        phase_id: metadata.phase_id,
        completed_missions: [],
        xp_delta: 50 // Dynamic based on step, typically 50 per sub-step
    },
});

type SequencerFunction = (phaseId: string, trackId: string) => JourneyStepResponse[];

// --- CONTENT GENERATORS ---

type MatrixStepBlueprint = {
    stepTitle: string;
    directive: string;
    resourceLabel: string;
    resourceType: ResourceItem['resource_type'];
    phaseAgent: string;
    phaseAction: string;
    phaseReason: string;
    domainAction: string;
    domainReason: string;
    includeMission: boolean;
    includeLaunchpad: boolean;
};

const MATRIX_PHASE_STEP_TITLES: string[][] = [
    ['Mental Model Map', 'Mission Statement Gate', 'Wallet Hygiene Ritual', 'Transaction Trace', 'Proof Packet Synthesis'],
    ['Balance Snapshot', 'Lock Commitment Gate', 'APY Envelope', 'Stake Flow Trace', 'Staking Readiness'],
    ['Proposal Scope', 'Vote Preconditions Gate', 'Oracle Integrity Drill', 'DAO Payload Notes', 'Vote Brief'],
    ['Trust Surface Map', 'Artifact Spec Gate', 'Recovery Strategy', 'Verification Flow', 'Artifact Packet'],
    ['Mainnet Preflight', 'Liquidity Plan', 'Holder Activation', 'Post-Launch Controls', 'Launch Packet'],
    ['Performance Dashboard', 'Protocol Metrics Gate', 'Network Expansion', 'Collaterize Invitation', 'Veteran Badge Claim'],
];

const MATRIX_PHASE_RESOURCE_TYPES: ResourceItem['resource_type'][][] = [
    ['template', 'checklist', 'checklist', 'template', 'article'],
    ['template', 'checklist', 'template', 'template', 'article'],
    ['template', 'checklist', 'article', 'article', 'article'],
    ['template', 'template', 'checklist', 'template', 'article'],
    ['checklist', 'template', 'tool_link', 'article', 'article'],
    ['template', 'checklist', 'tool_link', 'template', 'article'],
];

const MATRIX_PHASE_AGENTS: Array<{ phaseAgent: string; phaseAction: string; phaseReason: string }> = [
    { phaseAgent: 'ResearchAgent', phaseAction: 'FETCH_REFERENCE', phaseReason: 'Grounds orientation outputs with protocol-native references.' },
    { phaseAgent: 'DeFiAgent', phaseAction: 'CALCULATE_INVARIANTS', phaseReason: '[DeFiAgent] Calculating AMM invariants and staking APY curves.' },
    { phaseAgent: 'SecurityMasterAgent', phaseAction: 'SCAN_PDA_REENTRANCY', phaseReason: '[SecurityAgent] Scanning for PDA re-entrancy and CPI vulnerabilities.' },
    { phaseAgent: 'PrivacyAgent', phaseAction: 'EVALUATE_PRIVACY', phaseReason: 'Ensures identity design avoids oversharing sensitive claims.' },
    { phaseAgent: 'LaunchAgent', phaseAction: 'VALIDATE_LAUNCH', phaseReason: 'Runs preflight validation for mainnet launch readiness.' },
    { phaseAgent: 'CollaterizeAgent', phaseAction: 'NETWORK_INVITE', phaseReason: 'Extends Collaterize network invitation and veteran status.' },
];

/**
 * Builds a deterministic blueprint for a persona/phase/sub-step.
 */
const buildMatrixBlueprint = (
    personaId: string,
    phaseId: string,
    phaseIndex: number,
    stepIndex: number
): MatrixStepBlueprint => {
    const { personaTitle, phaseTitle } = getPersonaPhaseTitles(personaId, phaseId);
    const phaseAgentConfig = MATRIX_PHASE_AGENTS[Math.max(0, Math.min(MATRIX_PHASE_AGENTS.length - 1, phaseIndex))];
    const stepTitle = MATRIX_PHASE_STEP_TITLES[phaseIndex]?.[stepIndex] ?? `Matrix Step ${stepIndex + 1}`;
    const resourceType = MATRIX_PHASE_RESOURCE_TYPES[phaseIndex]?.[stepIndex] ?? 'template';
    // Phase 5 (index 4) uses launchpad as gate, Phase 6 (index 5) uses veteran modal - no mission blocks needed
    // FIXED: Start mission gate at stepIndex 0 so demo starts at Step 1/5
    const includeMission = stepIndex === 0 && phaseIndex !== 4 && phaseIndex !== 5;
    const includeLaunchpad = phaseIndex === 4 && stepIndex === 0;

    return {
        stepTitle,
        directive: `Execute a persona-specific objective for **${personaTitle}** inside **${phaseTitle}** (S${stepIndex + 1}/5).`,
        resourceLabel: `${personaTitle} • ${phaseTitle} • ${stepTitle}`,
        resourceType,
        phaseAgent: phaseAgentConfig.phaseAgent,
        phaseAction: phaseAgentConfig.phaseAction,
        phaseReason: phaseAgentConfig.phaseReason,
        domainAction: `MATRIX_${phaseIndex + 1}_${stepIndex + 1}`,
        domainReason: `Domain execution for ${personaId}/${phaseId}: ${stepTitle}.`,
        includeMission,
        includeLaunchpad,
    };
};

const MATRIX_PERSONA_KERNEL: Record<string, { domainAgent: string; kernel: string }> = {
    'cognitive-activation-hub': { domainAgent: 'LearningAgent', kernel: 'Web3 mental models, Solana runtime fluency, security rituals.' },
    'capital-foundry': { domainAgent: 'DeFiAgent', kernel: 'Market microstructure, AMM invariants, capital efficiency, staking rails.' },
    'system-architect': { domainAgent: 'ArchitectAgent', kernel: 'Distributed systems topology, DePIN execution, observability and SLOs.' },
    'experience-studio': { domainAgent: 'DesignAgent', kernel: 'NFT lifecycle, UX friction removal, engagement loops and creator tooling.' },
    'impact-engine': { domainAgent: 'GovernanceAgent', kernel: 'DAO mechanics, funding transparency, reputation and coordination.' },
    'resilience-master': { domainAgent: 'SecurityMasterAgent', kernel: 'Threat modeling, fuzzing, defense-in-depth, incident command.' },
};

const getPersonaKernel = (personaId: string): { domainAgent: string; kernel: string } => {
    return MATRIX_PERSONA_KERNEL[personaId] ?? { domainAgent: 'Zyno', kernel: 'Sovereign protocol execution and verification.' };
};

const getPersonaPhaseIndex = (personaId: string, phaseId: string): number => {
    const persona = personas.find((p) => p.id === personaId);
    if (!persona) return -1;
    return persona.phases.findIndex((ph) => ph.id === phaseId);
};

const getPersonaPhaseTitles = (personaId: string, phaseId: string): { personaTitle: string; phaseTitle: string } => {
    const persona = personas.find((p) => p.id === personaId);
    const phase = persona?.phases.find((ph) => ph.id === phaseId);
    return {
        personaTitle: persona?.title ?? personaId,
        phaseTitle: phase?.title ?? phaseId,
    };
};

const buildUniqueResource = (personaId: string, phaseId: string, stepIndex: number, agentOwner: string, labelSeed: string): ResourceItem => {
    const suffix = `S${stepIndex + 1}`;
    return {
        id: `mx-${personaId}-${phaseId}-${suffix}`,
        label: `${labelSeed} (${suffix})`,
        description: `Technical deliverable for ${personaId}/${phaseId} step ${stepIndex + 1}.`,
        // FIXED: Empty URL to prevent navigation - content is displayed inline
        url: '',
        resource_type: 'template',
        agent_owner: agentOwner,
    };
};

/**
 * Builds >=3 (actually 4) agent actions per Matrix sub-step.
 */
const buildMatrixActions = (personaId: string, phaseId: string, phaseIndex: number, stepIndex: number, blueprint: MatrixStepBlueprint): AgentAction[] => {
    const { domainAgent } = getPersonaKernel(personaId);
    const phaseTag = `P${phaseIndex + 1}`;
    const stepTag = `S${stepIndex + 1}`;

    return [
        {
            agent_name: 'Zyno',
            action: 'orchestrate',
            reason: `Matrix routing engaged (${phaseTag}/${stepTag}) for ${personaId}/${phaseId}.`,
            parameters: { phase: phaseTag, step: stepTag, intent: blueprint.stepTitle },
        },
        {
            agent_name: domainAgent,
            action: blueprint.domainAction,
            reason: blueprint.domainReason,
            parameters: { persona: personaId, phase: phaseId, step: stepIndex + 1 },
        },
        {
            agent_name: blueprint.phaseAgent,
            action: blueprint.phaseAction,
            reason: blueprint.phaseReason,
            parameters: { persona: personaId, phase: phaseId, step: stepIndex + 1 },
        },
        {
            agent_name: 'SynthetizerAgent',
            action: 'CONSOLIDATE',
            reason: `Merging outputs from ${domainAgent} and ${blueprint.phaseAgent} for ${stepTag}.`,
            parameters: { sources: [domainAgent, blueprint.phaseAgent], output: 'consolidated_deliverable' },
        },
        {
            agent_name: 'ValidationAgent',
            action: 'run_tests',
            reason: `Verification suite for ${phaseTag}/${stepTag} to keep gating deterministic.`,
            parameters: { suite: `${personaId}-${phaseId}-${stepTag}`, mode: 'demo' },
        },
    ];
};

/**
 * Builds UI blocks for a Matrix sub-step, including a unique resource and optional interactive blocks.
 */
const buildMatrixStepBlocks = (personaId: string, phaseId: string, phaseIndex: number, stepIndex: number, blueprint: MatrixStepBlueprint): UIBlock[] => {
    const { personaTitle, phaseTitle } = getPersonaPhaseTitles(personaId, phaseId);
    const { domainAgent, kernel } = getPersonaKernel(personaId);
    const labelSeed = blueprint.resourceLabel;

    // Primary resource
    const resource1: ResourceItem = buildUniqueResource(personaId, phaseId, stepIndex, domainAgent, labelSeed);
    resource1.resource_type = blueprint.resourceType;

    // Secondary resource for pulse saturation
    const resource2: ResourceItem = {
        id: `mx-${personaId}-${phaseId}-S${stepIndex + 1}-aux`,
        label: `${phaseTitle} Supplementary (S${stepIndex + 1})`,
        description: `Auxiliary deliverable from ${blueprint.phaseAgent} for ${personaId}/${phaseId}.`,
        // FIXED: Empty URL to prevent navigation - content is displayed inline
        url: '',
        resource_type: stepIndex % 2 === 0 ? 'checklist' : 'template',
        agent_owner: blueprint.phaseAgent,
    };

    const baseBlocks: UIBlock[] = [
        {
            kind: 'text_block',
            id: `mx-${phaseId}-s${stepIndex + 1}-text`,
            title: `${personaTitle}: ${phaseTitle} • ${blueprint.stepTitle} (${stepIndex + 1}/5)`,
            body_markdown: `Kernel: **${kernel}**\n\nObjective: ${blueprint.directive}\n\nTrace: ${personaId}/${phaseId}/S${stepIndex + 1}.`,
        },
        {
            kind: 'resource_block',
            id: `mx-${phaseId}-s${stepIndex + 1}-res`,
            title: `Generated Technical Resources (S${stepIndex + 1})`,
            resources: [resource1, resource2],
        },
    ];

    if (blueprint.includeMission) {
        baseBlocks.push({
            kind: 'mission_block',
            id: `mx-${phaseId}-s${stepIndex + 1}-mission`,
            title: `Validate Sub-step ${stepIndex + 1}`,
            description: `Confirm the Matrix deliverable for ${phaseTitle} and allow Zyno to proceed.`,
            mission_type: 'deliverable',
            expected_input_type: 'choice',
            xp_reward: 100 + phaseIndex * 10,
        });
    }

    if (blueprint.includeLaunchpad) {
        baseBlocks.push({
            kind: 'market_launchpad_block',
            id: `mx-${phaseId}-launchpad`,
            title: 'Token Market Launch',
            protocolName: 'MFAI Demo',
            ticker: 'MFAI',
            launchUrl: '#',
            initialProgress: 0,
        } as any);
    }

    return baseBlocks;
};

const generateMatrixPhase5Steps = (personaId: string, phaseId: string, phaseIndex: number): JourneyStepResponse[] => {
    const steps: JourneyStepResponse[] = [];
    const meta = { persona_id: personaId, journey_track: personaId, phase_id: phaseId, mode: 'builder' as const, tone: 'pedagogical' as const };

    for (let i = 0; i < 5; i += 1) {
        const { personaTitle, phaseTitle } = getPersonaPhaseTitles(personaId, phaseId);
        const blueprint = buildMatrixBlueprint(personaId, phaseId, phaseIndex, i);
        steps.push(
            createStep(
                `${personaTitle} — ${phaseTitle} — ${blueprint.stepTitle} (${i + 1}/5)`,
                buildMatrixStepBlocks(personaId, phaseId, phaseIndex, i, blueprint),
                buildMatrixActions(personaId, phaseId, phaseIndex, i, blueprint),
                meta
            )
        );
    }

    return steps;
};

/**
 * Capital Foundry - Phase 2 (Program Forge Lab)
 * Ensures each sub-step includes >=3 agent actions and >=2 resources.
 */
const generateCapitalFoundryPhase2 = (trackId: string, phaseId: string): JourneyStepResponse[] => {
    const meta = { persona_id: trackId, journey_track: trackId, phase_id: phaseId, mode: 'builder' as const, tone: 'pedagogical' as const };
    return [
        createStep(
            'Foundry Staking: Yield Architecture Briefing',
            [
                {
                    kind: 'text_block',
                    id: `${phaseId}-s1-text`,
                    title: 'Yield Rails & Curve Constraints',
                    body_markdown: 'Calibrating staking incentives and yield safety envelopes.\n\nExecuting bonding curve sanity checks and slippage bounds.'
                },
                {
                    kind: 'resource_block',
                    id: `${phaseId}-s1-res`,
                    title: 'Foundry Resources',
                    resources: [
                        { id: `res-${phaseId}-curve`, label: 'Bonding Curve Constraints', resource_type: 'article', url: '#', agent_owner: 'DeFiAgent' },
                        { id: `res-${phaseId}-risk`, label: 'Risk Parameters Checklist', resource_type: 'checklist', url: '#', agent_owner: 'SecurityMasterAgent' },
                    ]
                }
            ],
            [
                { agent_name: 'DeFiAgent', action: 'CALCULATE_BONDING_CURVE', reason: 'Deriving curve slope and invariant constraints for staking.', parameters: { invariant: 'x*y=k', slippage_bps: 75 } },
                { agent_name: 'SecurityMasterAgent', action: 'SCAN_VULNERABILITIES', reason: 'Screening staking entrypoints for privilege escalation and oracle abuse.', parameters: { scope: 'staking', severity: 'high' } },
                { agent_name: 'Zyno', action: 'synthesize', reason: 'Consolidating Foundry yield plan into an executable staking action.', parameters: { deliverable: 'staking_plan' } }
            ],
            meta
        ),
        createStep(
            'Foundry Staking: Execute Validation',
            [
                {
                    kind: 'mission_block',
                    id: `${phaseId}-s2-mission`,
                    title: 'Simulate staking commitment',
                    description: 'Validate your staking configuration and commit the simulated lock.',
                    mission_type: 'deliverable',
                    expected_input_type: 'choice',
                    xp_reward: 120
                },
                {
                    kind: 'resource_block',
                    id: `${phaseId}-s2-res`,
                    title: 'Execution Toolkit',
                    resources: [
                        { id: `res-${phaseId}-apy`, label: 'APY Curve Worksheet', resource_type: 'template', url: '#', agent_owner: 'DeFiAgent' },
                        { id: `res-${phaseId}-guardrails`, label: 'Staking Guardrails', resource_type: 'checklist', url: '#', agent_owner: 'SecurityMasterAgent' },
                    ]
                }
            ],
            [
                { agent_name: 'DeFiAgent', action: 'SIMULATE_STAKING', reason: 'Simulating stake flows under expected volatility.', parameters: { volatility: 'moderate', horizon_days: 30 } },
                { agent_name: 'SecurityMasterAgent', action: 'VERIFY_ACCESS_CONTROL', reason: 'Ensuring staking lock respects signer and writable constraints.', parameters: { checks: ['is_signer', 'is_writable'] } },
                { agent_name: 'ValidationAgent', action: 'run_tests', reason: 'Executing Foundry staking validation suite.', parameters: { suite: 'staking', mode: 'demo' } }
            ],
            meta
        )
    ];
};

/**
 * Capital Foundry - Phase 3 (Oracle & Liquidity Mesh)
 * Ensures each sub-step includes >=3 agent actions and >=2 resources.
 */
const generateCapitalFoundryPhase3 = (trackId: string, phaseId: string): JourneyStepResponse[] => {
    const meta = { persona_id: trackId, journey_track: trackId, phase_id: phaseId, mode: 'builder' as const, tone: 'pedagogical' as const };
    return [
        createStep(
            'Security Vote: Threat Model & Audit Intake',
            [
                {
                    kind: 'text_block',
                    id: `${phaseId}-s1-text`,
                    title: 'Threat Model Brief',
                    body_markdown: 'Mapping attack surface for liquidity mesh and governance execution.\n\nPrioritizing oracle manipulation and CPI trust boundaries.'
                },
                {
                    kind: 'resource_block',
                    id: `${phaseId}-s1-res`,
                    title: 'Resilience Resources',
                    resources: [
                        { id: `res-${phaseId}-oracle`, label: 'Oracle Integrity Checklist', resource_type: 'checklist', url: '#', agent_owner: 'SecurityMasterAgent' },
                        { id: `res-${phaseId}-dao`, label: 'DAO Voting Runbook', resource_type: 'article', url: '#', agent_owner: 'GovernanceAgent' },
                    ]
                }
            ],
            [
                { agent_name: 'SecurityMasterAgent', action: 'CRITICAL_AUDIT', reason: 'Running deep vulnerability scan on liquidity mesh primitives.', parameters: { scope: 'liquidity_mesh', risk: 'critical' } },
                { agent_name: 'LogSleuth', action: 'TRACE_SIGNALS', reason: 'Correlating audit signals with prior incidents and artifacts.', parameters: { window: 'last_30_days' } },
                { agent_name: 'Zyno', action: 'prepare_governance', reason: 'Preparing governance narrative and vote framing.', parameters: { proposal_type: 'security_vote' } }
            ],
            meta
        ),
        createStep(
            'Security Vote: Execute Validation',
            [
                {
                    kind: 'mission_block',
                    id: `${phaseId}-s2-mission`,
                    title: 'Validate security vote readiness',
                    description: 'Confirm the security vote preconditions and proceed to the DAO vote modal.',
                    mission_type: 'deliverable',
                    expected_input_type: 'choice',
                    xp_reward: 140
                },
                {
                    kind: 'resource_block',
                    id: `${phaseId}-s2-res`,
                    title: 'Execution Toolkit',
                    resources: [
                        { id: `res-${phaseId}-proposal`, label: 'Security Proposal Template', resource_type: 'template', url: '#', agent_owner: 'SynthetizerAgent' },
                        { id: `res-${phaseId}-checks`, label: 'Vote Integrity Checklist', resource_type: 'checklist', url: '#', agent_owner: 'SecurityMasterAgent' },
                    ]
                }
            ],
            [
                { agent_name: 'SecurityMasterAgent', action: 'FINAL_REVIEW', reason: 'Verifying vote payload integrity and access control expectations.', parameters: { checks: ['proposal_hash', 'signer_set'] } },
                { agent_name: 'SynthetizerAgent', action: 'SYNTHESIS', reason: 'Synthesizing audit findings into final DAO vote options.', parameters: { options: ['approve', 'delay'] } },
                { agent_name: 'ValidationAgent', action: 'run_tests', reason: 'Running resilience regression suite before governance action.', parameters: { suite: 'resilience', mode: 'demo' } }
            ],
            meta
        )
    ];
};

const generateStandardPhase = (trackId: string, phaseId: string, theme: string): JourneyStepResponse[] => {
    const steps: JourneyStepResponse[] = [];
    const meta = { persona_id: trackId, journey_track: trackId, phase_id: phaseId, mode: 'builder' as const, tone: 'pedagogical' as const };

    // Step 1: Context & Research
    steps.push(createStep(
        `${theme} Analysis`,
        [
            {
                kind: 'text_block',
                id: `${phaseId}-s1-text`,
                title: `${theme} - Context Deep Dive`,
                body_markdown: `Initializing **${theme}** investigation protocol.\n\nAnalyzing ecosystem standards and best practices for ${trackId}.`
            },
            {
                kind: 'resource_block',
                id: `${phaseId}-s1-res`,
                title: 'Strategic & Technical Resources',
                resources: [
                    { id: `res-${phaseId}-1`, label: `${theme} Whitepaper`, resource_type: 'article', url: '#', agent_owner: 'ResearchAgent' },
                    { id: `res-${phaseId}-2`, label: 'Security Best Practices', resource_type: 'checklist', url: '#', agent_owner: 'SecurityAgent' },
                ]
            }
        ],
        [
            { agent_name: 'Zyno', action: 'analyze', reason: `Scanning ${trackId} ecosystem for ${theme} patterns`, parameters: { depth: 'deep' } },
            { agent_name: 'ResearchAgent', action: 'fetch_data', reason: 'Aggregating on-chain and off-chain data', parameters: { sources: ['dune', 'flipside'] } },
            { agent_name: 'DevOpsAgent', action: 'provision_env', reason: 'Preparing sandboxed test environment', parameters: { network: 'testnet' } }
        ],
        meta
    ));

    // Step 2: Execution / Mission
    steps.push(createStep(
        `${theme} Execution`,
        [
            {
                kind: 'mission_block',
                id: `${phaseId}-s2-mission`,
                title: `Execute: ${theme}`,
                description: `Apply your knowledge to implement the ${theme} module.`,
                mission_type: 'deliverable',
                expected_input_type: 'markdown_document',
                xp_reward: 100
            },
            {
                kind: 'resource_block',
                id: `${phaseId}-s2-res`,
                title: 'Execution Toolkit',
                resources: [
                    { id: `res-${phaseId}-3`, label: 'Boilerplate Smart Contract', resource_type: 'code_snippet', url: '#', agent_owner: 'ArchitectAgent' },
                    { id: `res-${phaseId}-4`, label: 'API Reference', resource_type: 'article', url: '#', agent_owner: 'DevOpsAgent' }
                ]
            }
        ],
        [
            { agent_name: 'ArchitectAgent', action: 'generate_code', reason: 'Drafting initial implementation', parameters: { language: 'rust' } },
            { agent_name: 'ValidationAgent', action: 'run_tests', reason: 'Executing unit and integration tests', parameters: { coverage: '85%' } },
            { agent_name: 'SecurityAgent', action: 'audit_code', reason: 'Scanning for common vulnerabilities', parameters: { level: 'basic' } }
        ],
        meta
    ));

    return steps;
};

// --- SPECIFIC PERSONA SEQUENCERS ---

const sequences: Record<string, SequencerFunction> = {
    // 1. HUB
    'cognitive-activation-hub': (phaseId, trackId) => generateStandardPhase(trackId, phaseId, 'Cognitive Activation'),

    // 2. FOUNDRY
    'capital-foundry': (phaseId, trackId) => {
        if (phaseId === 'program-forge-lab') {
            return generateCapitalFoundryPhase2(trackId, phaseId);
        }
        if (phaseId === 'oracle-liquidity-mesh') {
            return generateCapitalFoundryPhase3(trackId, phaseId);
        }
        return generateStandardPhase(trackId, phaseId, 'DeFi Architecture');
    },

    // 3. ARCHITECT (System Topology)
    'system-architect': (phaseId, trackId) => generateStandardPhase(trackId, phaseId, 'System Topology'),

    // 4. STUDIO (Experience Studio) - DETAILED PHASE 4
    'experience-studio': (phaseId, trackId) => {
        if (phaseId.includes('ux-elevation') || phaseId.includes('experience-studio-p4')) {
            const meta = { persona_id: trackId, journey_track: trackId, phase_id: phaseId, mode: 'builder' as const, tone: 'pedagogical' as const };
            // FORCE INTERACTION: Mission Block must be present
            return [
                createStep('UX Audit & Friction Mapping', [
                    { kind: 'text_block', id: 'p4-s1-intro', title: 'User Journey Analysis', body_markdown: 'Analyzing flow frictionless status...' },
                    { kind: 'resource_block', id: 'p4-s1-res', title: 'UX Patterns', resources: [{ id: 'ux-1', label: 'SMS Guidelines', resource_type: 'checklist', url: '#', agent_owner: 'DesignAgent' }] }
                ], [{ agent_name: 'DesignAgent', action: 'audit_flow', reason: 'Friction detected.', parameters: { severity: 'medium' } }], meta),

                // MINT MISSION (Interactive)
                createStep('Onboarding Flow Prototype', [
                    { kind: 'text_block', id: 'p4-mint-intro', title: 'Mint Access Pass', body_markdown: 'Mint your sovereign identity artifact.' },
                    { kind: 'mission_block', id: 'p4-s3-mission', title: 'Mint Access Pass', description: 'Mint your proof-of-knowledge.', mission_type: 'deliverable', expected_input_type: 'choice', xp_reward: 150, nft_reward_id: 'ux-mastery' }
                ], [{ agent_name: 'Zyno', action: 'prepare_mint', reason: 'Minting enabled.', parameters: {} }], meta)
            ];
        }
        return generateStandardPhase(trackId, phaseId, 'Experience Design');
    },

    // 5. ENGINE
    'impact-engine': (phaseId, trackId) => generateStandardPhase(trackId, phaseId, 'Impact Coordination'),

    // 6. MASTER (Resilience Master) - DETAILED PHASE 2
    'resilience-master': (phaseId, trackId) => {
        // FORCE BONDING CURVE IN PHASE 2 (Foundry/Resilience intersection)
        // Actually, typically P2 is Foundry/Bonding Curve.
        // Let's inject Code Auditor for P2.
        if (phaseId.includes('exploit-hunt') || phaseId.includes('resilience-master-p2')) {
            const meta = { persona_id: trackId, journey_track: trackId, phase_id: phaseId, mode: 'builder' as const, tone: 'critical' as const };
            return [
                createStep('Threat Vector Analysis', [
                    { kind: 'code_auditor_block', id: 'p2-s1-audit', title: 'Vulnerable Contract Snippet', code: 'pub fn withdraw(...)', language: 'rust', explanation: 'Identify the re-entrancy vulnerability.' }
                ], [
                    { agent_name: 'SecurityMasterAgent', action: 'scan_code', reason: 'Detected unprotected CPI call', parameters: { risk: 'critical' } }
                ], meta),
                createStep('Patch & Verify', [
                    { kind: 'mission_block', id: 'p2-s3-patch', title: 'Deploy Mitigation', description: 'Apply the check-effects-interaction pattern.', mission_type: 'deliverable', expected_input_type: 'code_snippet', xp_reward: 200 }
                ], [{ agent_name: 'SecurityMasterAgent', action: 'verify', reason: 'Patch Verified.', parameters: {} }], meta)
            ];
        }
        return generateStandardPhase(trackId, phaseId, 'Security Operations');
    }
};

// --- MASTER ROUTER ---

export const getDemoSequence = (phaseId: string, trackId: string): JourneyStepResponse[] => {
    // 1. Identify Phase Index by common ID patterns if needed, or just string match
    // Phase 1: Intro/Orientation
    // Phase 2: Foundry/Setup/Fluency
    // Phase 3: Resilience/Audit/Token
    // Phase 4: Identity/Mint/Studio
    // Phase 5: Launch/Scale
    // Phase 6: Conclusion/Collaterize

    const meta = { persona_id: trackId, journey_track: trackId, phase_id: phaseId, mode: 'builder' as const, tone: 'pedagogical' as const };

    const resolvedPhaseIndex = getPersonaPhaseIndex(trackId, phaseId);
    const isMatrixPhase = resolvedPhaseIndex >= 0 && resolvedPhaseIndex <= 5;

    // Check for Phase 3 specifically to ensure Swarm Logic
    const isPhase3 = phaseId.includes('token') || phaseId.includes('resilience') || phaseId.includes('security') || phaseId.includes('systems-hardening') || phaseId.includes('audit');

    // Check for Phase 5 Airdrop
    const isPhase5 = phaseId.includes('launch') || phaseId.includes('synaptic');

    // Check for Phase 6 Veteran
    // 'launch-collaterize' is phase 6 in personas.ts (index 5). 
    // Let's rely on standard content generation unless special overrides.

    let steps: JourneyStepResponse[] = [];

    if (isMatrixPhase) {
        steps = generateMatrixPhase5Steps(trackId, phaseId, resolvedPhaseIndex);
    } else {

        // Dispatch to Persona Sequencer if available
        if (sequences[trackId]) {
            steps = sequences[trackId](phaseId, trackId);
        } else {
            // Fallback
            steps = generateStandardPhase(trackId, phaseId, 'Sovereign');
        }
    }

    // --- SWARM INJECTION (Task 4) ---
    // "Ensure that for every evaluation (Step 3), the SynthetizerAgent logic is called."
    // Phase 3 usually corresponds to index 2 (if 0-indexed) or just by ID check.
    // If steps length >= 2, we inject into the 2nd or 3rd step.
    if (steps.length >= 2 && isPhase3) {
        // Find or create a debate step
        const debateStepIndex = Math.min(steps.length - 1, 1); // Target 2nd step
        const debateStep = steps[debateStepIndex];

        // Inject SecurityMasterAgent and SynthetizerAgent actions
        debateStep.agent_actions = [
            ...debateStep.agent_actions,
            { agent_name: 'SecurityMasterAgent', action: 'CRITICAL_AUDIT', reason: 'Phase 3 Audit: Deep Scan initiated.', parameters: { scope: 'full' } },
            { agent_name: 'SynthetizerAgent', action: 'SYNTHESIS', reason: 'Consolidating audit findings into governance proposal.', parameters: { verdict: 'proceed-with-caution' } }
        ];

        // Ensure "AgentActivityFeed show at least 3 different agents"
        // We have existing agents from generateStandardPhase (Zyno, ResearchAgent/etc) + these 2.
    }

    // --- REWARD INJECTION (Task 1) ---
    if (isPhase5) {
        // Ensure Launchpad Block is present for Airdrop Trigger
        // If not present in generated steps, add it.
        const hasLaunchpad = steps.some(s => s.ui_blocks.some(b => b.kind === 'market_launchpad_block'));
        if (!hasLaunchpad) {
            steps.push(createStep('Market Launchpad', [{
                kind: 'market_launchpad_block',
                id: 'p5-launchpad',
                title: 'MFAI Token Launch',
                protocolName: 'MFAI Demo',
                ticker: 'MFAI',
                launchUrl: '#',
                initialProgress: 0
            }], [
                { agent_name: 'Zyno', action: 'initiate_launch', reason: 'Triggering Market Launchpad Event', parameters: {} }
            ], meta));
        }
    }

    // --- VETERAN INJECTION (Phase 6) ---
    if (phaseId.includes('launch-collaterize')) {
        // Overwrite or append final step
        steps = [
            createStep('Sovereign Mastery', [
                { kind: 'text_block', id: 'p6-final', title: 'Protocol Maturation', body_markdown: 'You have mastered the Builder Track.\n\n**Next Objective**: Scale your impact via the *Collaterize* network.' },
                { kind: 'mission_block', id: 'p6-claim', title: 'Claim Veteran Status', description: 'Mint your Veteran Badge.', mission_type: 'deliverable', expected_input_type: 'choice', xp_reward: 1000, nft_reward_id: 'veteran-badge' }
            ], [
                { agent_name: 'CollaterizeAgent', action: 'invite', reason: 'Invitation to Collaterize DAO: SENT', parameters: { tier: 'veteran' } },
                { agent_name: 'Zyno', action: 'conclude', reason: 'Journey Verified. Systems Standby.', parameters: { status: 'complete' } }
            ], meta)
        ];
    }

    return steps;
};
