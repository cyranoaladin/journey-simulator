/**
 * Project: Money Factory AI (MFAI)
 * Module: Demo Sequencer Extensions - Additional Persona Sequences
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import type { JourneyStepResponse, Mode, Tone } from '../types/uiBlocks';

// ============================================================================
// SYSTEM ARCHITECT - Infrastructure Builder
// ============================================================================

/**
 * System Architect Phase 1: Topology Reconnaissance
 */
export const createArchitectureScanSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'architecture-scan',
        mode: 'builder' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Infrastructure Topology Scan',
                summary: 'Map decentralized infrastructure landscape',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'topology-intro',
                    title: 'Decentralized Infrastructure Primitives',
                    body_markdown: `
# Infrastructure Topology

**Great architects think in primitives.** Identify the smallest reusable component before designing the cathedral.

## Infrastructure Layers
1. **Compute**: Solana validators, RPC nodes, indexers
2. **Storage**: Arweave, IPFS, Shadow Drive
3. **Networking**: Gossip protocol, TPU, RPC endpoints
4. **Intelligence**: On-chain AI inference, verifiable compute

## DePIN Exemplars
- **Helium**: Decentralized wireless networks
- **Render**: GPU compute marketplace
- **Hivemapper**: Crowdsourced mapping
- **Shadow**: Decentralized storage on Solana

## Architectural Intent
Define your infrastructure vision:
- What problem does centralization create?
- How does decentralization solve it?
- What are the economic incentives?
- How do you ensure quality and uptime?
                    `.trim(),
                },
                {
                    kind: 'diagram_block',
                    id: 'depin-stack',
                    title: 'DePIN Stack Architecture',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[Physical Infrastructure] --> B[Device Layer]
    B --> C[Coordination Protocol]
    C --> D[Token Incentives]
    D --> E[Data Validation]
    E --> F[Consumer Applications]
    F --> G[Revenue Distribution]
    G --> A
                    `.trim(),
                    caption: 'Closed-loop DePIN economics',
                },
                {
                    kind: 'resource_block',
                    id: 'depin-resources',
                    title: 'DePIN Research',
                    resources: [
                        {
                            id: 'depin-primer',
                            label: 'DePIN Primer',
                            description: 'Introduction to decentralized physical infrastructure',
                            url: 'https://messari.io/report/depin',
                            resource_type: 'article',
                            agent_owner: 'InfrastructureAgent',
                        },
                        {
                            id: 'solana-depin',
                            label: 'Solana DePIN Ecosystem',
                            description: 'Overview of DePIN projects on Solana',
                            url: 'https://solana.com/ecosystem/depin',
                            resource_type: 'article',
                            agent_owner: 'InfrastructureAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'InfrastructureAgent',
                    action: 'introduce_topology',
                    reason: 'Infrastructure landscape mapped. Ready for architectural intent definition.',
                    parameters: { specialty: 'Decentralized Infrastructure' },
                },
            ],
            next_state: {
                phase_id: 'architecture-scan',
                completed_missions: [],
                xp_delta: 30,
            },
        },
        {
            metadata: {
                ...meta,
                title: 'Define Architectural Intent',
                summary: 'Document infrastructure vision and requirements',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'architecture-intent',
                    title: 'Mission: Architectural Intent Canvas',
                    description: 'Create your infrastructure intent document. Include: (1) Problem statement (what centralization issue are you solving?), (2) Decentralized solution architecture, (3) Economic incentive model, (4) Quality assurance mechanisms, (5) Throughput requirements and benchmarks.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 60,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'intent-checklist',
                    title: 'Intent Requirements',
                    items: [
                        { label: 'Problem statement clearly defined', checked: false },
                        { label: 'Decentralized architecture outlined', checked: false },
                        { label: 'Economic incentive model documented', checked: false },
                        { label: 'Quality assurance mechanisms specified', checked: false },
                        { label: 'Throughput requirements quantified', checked: false },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'InfrastructureAgent',
                    action: 'review_architectural_intent',
                    reason: 'Architectural intent submitted. Validating feasibility and completeness.',
                    parameters: { min_score: 75 },
                },
            ],
            next_state: {
                phase_id: 'architecture-scan',
                completed_missions: ['architecture-intent'],
                xp_delta: 60,
            },
        },
    ];
};

/**
 * System Architect Phase 2: DePIN Studio (with staking requirement)
 */
export const createDePINStudioSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'depin-studio',
        mode: 'builder' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'DePIN Device Coordination',
                summary: 'Design device onboarding and incentive mechanics',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'depin-intro',
                    title: 'Hardware Meets Blockspace',
                    body_markdown: `
# DePIN Studio

**Ensure every sensor event becomes trustworthy economic signal.**

## Device Lifecycle
1. **Onboarding**: Device registration, identity verification
2. **Coordination**: Task assignment, data collection
3. **Validation**: Proof-of-work verification, quality checks
4. **Rewards**: Token distribution based on contribution
5. **Slashing**: Penalties for malicious behavior

## Token Incentive Design
- **Supply-side**: Reward device operators
- **Demand-side**: Charge data consumers
- **Staking**: Lock tokens for quality assurance
- **Slashing**: Penalize poor performance or fraud

## Staking Requirement
To access DePIN Studio tools, stake **90 $MFAI** to demonstrate commitment to infrastructure quality.
                    `.trim(),
                },
                {
                    kind: 'bonding_curve_block',
                    id: 'depin-staking-curve',
                    title: 'DePIN Staking Economics',
                    description: 'Simulate staking impact on network quality and rewards',
                    curveType: 'exponential',
                    data: {
                        currentSupply: 800000,
                        maxSupply: 5000000,
                        reserveRatio: 0.4,
                        basePrice: 0.3,
                    },
                },
                {
                    kind: 'mission_block',
                    id: 'depin-stake',
                    title: 'Mission: Stake 90 MFAI for DePIN Access',
                    description: 'Stake 90 MFAI to unlock DePIN Studio tools and device coordination protocols.',
                    mission_type: 'staking',
                    expected_input_type: 'choice',
                    xp_reward: 40,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'DePINAgent',
                    action: 'activate_depin_studio',
                    reason: 'Staking commitment received. DePIN Studio tools unlocked.',
                    parameters: { staking_required: 90, specialty: 'Device Coordination' },
                },
            ],
            next_state: {
                phase_id: 'depin-studio',
                completed_missions: ['depin-stake'],
                xp_delta: 40,
            },
        },
        {
            metadata: {
                ...meta,
                title: 'Device Onboarding Protocol',
                summary: 'Implement device registration and validation',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'device-onboarding',
                    title: 'Mission: Design Device Onboarding',
                    description: 'Create device onboarding protocol. Include: (1) Device identity verification (hardware attestation), (2) Geolocation validation, (3) Initial stake requirement, (4) Quality baseline tests, (5) Reward tier assignment based on device capabilities.',
                    mission_type: 'code_submission',
                    expected_input_type: 'code_snippet',
                    xp_reward: 80,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'onboarding-checklist',
                    title: 'Onboarding Requirements',
                    items: [
                        { label: 'Hardware attestation mechanism', checked: false },
                        { label: 'Geolocation validation', checked: false },
                        { label: 'Device staking logic', checked: false },
                        { label: 'Quality baseline tests', checked: false },
                        { label: 'Reward tier assignment', checked: false },
                    ],
                },
                {
                    kind: 'diagram_block',
                    id: 'onboarding-flow',
                    title: 'Device Onboarding Flow',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[Device Registration] --> B[Hardware Attestation]
    B --> C[Geolocation Check]
    C --> D[Stake Tokens]
    D --> E[Quality Baseline Test]
    E --> F{Pass Threshold?}
    F -->|Yes| G[Assign Reward Tier]
    F -->|No| H[Reject Registration]
    G --> I[Active Device Pool]
                    `.trim(),
                    caption: 'Secure device onboarding with quality gates',
                },
            ],
            agent_actions: [
                {
                    agent_name: 'DePINAgent',
                    action: 'review_onboarding_protocol',
                    reason: 'Device onboarding protocol submitted. Validating security and quality mechanisms.',
                    parameters: { min_score: 80, required_checks: ['attestation', 'geolocation', 'staking'] },
                },
            ],
            next_state: {
                phase_id: 'depin-studio',
                completed_missions: ['depin-stake', 'device-onboarding'],
                xp_delta: 80,
            },
        },
    ];
};

/**
 * System Architect Phase 3: On-Chain Intelligence Lab
 */
export const createOnChainAISequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'onchain-ai',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Verifiable AI Inference',
                summary: 'Design provable AI execution on-chain',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'onchain-ai-intro',
                    title: 'Data Without Provenance is Risk',
                    body_markdown: `
# On-Chain Intelligence

**Bind AI outputs to cryptographic truth to earn institutional trust.**

## Verifiable Inference
1. **Model Commitment**: Hash model weights on-chain
2. **Input Commitment**: Record inference inputs
3. **Execution Proof**: Generate zero-knowledge proof of computation
4. **Output Verification**: Validate results against proof

## Privacy-Preserving Analytics
- **Homomorphic Encryption**: Compute on encrypted data
- **Secure Multi-Party Computation**: Collaborative inference without data sharing
- **Zero-Knowledge ML**: Prove model accuracy without revealing data

## Use Cases
- Credit scoring without exposing financial data
- Medical diagnosis with patient privacy
- Fraud detection with transaction confidentiality
- Recommendation systems with user anonymity
                    `.trim(),
                },
                {
                    kind: 'diagram_block',
                    id: 'zkml-flow',
                    title: 'Zero-Knowledge ML Pipeline',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[Private Input] --> B[Encrypted Inference]
    B --> C[Generate ZK Proof]
    C --> D[On-Chain Verification]
    D --> E[Provable Output]
    E --> F[Audit Trail]
                    `.trim(),
                    caption: 'Privacy-preserving verifiable AI',
                },
                {
                    kind: 'resource_block',
                    id: 'zkml-resources',
                    title: 'ZKML Resources',
                    resources: [
                        {
                            id: 'zkml-primer',
                            label: 'Zero-Knowledge Machine Learning',
                            description: 'Introduction to ZKML concepts',
                            url: 'https://0xparc.org/blog/zk-ml',
                            resource_type: 'article',
                            agent_owner: 'AIProvenanceAgent',
                        },
                        {
                            id: 'ezkl',
                            label: 'EZKL Framework',
                            description: 'Toolkit for verifiable ML inference',
                            url: 'https://github.com/zkonduit/ezkl',
                            resource_type: 'code_snippet',
                            agent_owner: 'AIProvenanceAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'AIProvenanceAgent',
                    action: 'introduce_verifiable_ai',
                    reason: 'Verifiable AI fundamentals established. Ready for implementation.',
                    parameters: { specialty: 'AI Provenance & Privacy' },
                },
            ],
            next_state: {
                phase_id: 'onchain-ai',
                completed_missions: [],
                xp_delta: 40,
            },
        },
        {
            metadata: {
                ...meta,
                title: 'Implement Verifiable Inference',
                summary: 'Build privacy-preserving AI pipeline',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'verifiable-inference',
                    title: 'Mission: Build ZKML Pipeline',
                    description: 'Implement verifiable inference pipeline. Requirements: (1) Model commitment on-chain, (2) Input/output logging, (3) ZK proof generation for inference, (4) On-chain verification contract, (5) Privacy-preserving data handling.',
                    mission_type: 'code_submission',
                    expected_input_type: 'code_snippet',
                    xp_reward: 90,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'zkml-checklist',
                    title: 'Implementation Requirements',
                    items: [
                        { label: 'Model commitment (hash) stored on-chain', checked: false },
                        { label: 'Input/output provenance logging', checked: false },
                        { label: 'ZK proof generation for inference', checked: false },
                        { label: 'On-chain verification contract', checked: false },
                        { label: 'Privacy guarantees validated', checked: false },
                    ],
                },
                {
                    kind: 'action_suggestions_block',
                    id: 'zkml-suggestions',
                    title: 'Testing Scenarios',
                    suggestions: [
                        { label: 'Test Model Tampering Detection', action_id: 'test-tampering' },
                        { label: 'Verify Privacy Guarantees', action_id: 'verify-privacy' },
                        { label: 'Benchmark Proof Generation', action_id: 'benchmark-proof' },
                        { label: 'Audit Provenance Trail', action_id: 'audit-trail' },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'AIProvenanceAgent',
                    action: 'review_zkml_implementation',
                    reason: 'ZKML pipeline submitted. Validating provenance and privacy guarantees.',
                    parameters: { min_score: 85, required_checks: ['commitment', 'proof', 'privacy'] },
                },
            ],
            next_state: {
                phase_id: 'onchain-ai',
                completed_missions: ['verifiable-inference'],
                xp_delta: 90,
            },
        },
    ];
};

/**
 * System Architect Phase 4: Systems Hardening Forge
 */
export const createSystemsHardeningSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'systems-hardening',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Resilience Engineering',
                summary: 'Build fault-tolerant distributed systems',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'hardening-intro',
                    title: 'Reliability is Earned in the Dark',
                    body_markdown: `
# Systems Hardening

**Practice failures until the system sings through adversity.**

## High-Availability Patterns
1. **Multi-Region Deployment**: Geographic redundancy
2. **Consensus Failover**: Automatic leader election
3. **Circuit Breakers**: Prevent cascade failures
4. **Graceful Degradation**: Maintain core functionality under stress

## Observability Stack
- **Metrics**: Prometheus, Grafana
- **Logs**: Loki, Elasticsearch
- **Traces**: Jaeger, OpenTelemetry
- **Alerts**: PagerDuty, Opsgenie

## SLO Framework
- **Availability**: 99.9% uptime (43 min downtime/month)
- **Latency**: p95 < 200ms, p99 < 500ms
- **Error Rate**: < 0.1% failed requests
- **Data Durability**: 99.999999999% (11 nines)
                    `.trim(),
                },
                {
                    kind: 'diagram_block',
                    id: 'ha-architecture',
                    title: 'High-Availability Architecture',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[Load Balancer] --> B[Region 1]
    A --> C[Region 2]
    A --> D[Region 3]
    B --> E[Consensus Leader]
    C --> F[Consensus Follower]
    D --> G[Consensus Follower]
    E --> H[Distributed Storage]
    F --> H
    G --> H
                    `.trim(),
                    caption: 'Multi-region consensus with automatic failover',
                },
                {
                    kind: 'resource_block',
                    id: 'sre-resources',
                    title: 'SRE Best Practices',
                    resources: [
                        {
                            id: 'sre-book',
                            label: 'Google SRE Book',
                            description: 'Site Reliability Engineering principles',
                            url: 'https://sre.google/sre-book/table-of-contents/',
                            resource_type: 'article',
                            agent_owner: 'InfrastructureAgent',
                        },
                        {
                            id: 'chaos-engineering',
                            label: 'Chaos Engineering',
                            description: 'Netflix chaos monkey patterns',
                            url: 'https://netflix.github.io/chaosmonkey/',
                            resource_type: 'article',
                            agent_owner: 'InfrastructureAgent',
                        },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'InfrastructureAgent',
                    action: 'introduce_hardening',
                    reason: 'Resilience patterns established. Ready for implementation.',
                    parameters: { specialty: 'Systems Reliability' },
                },
            ],
            next_state: {
                phase_id: 'systems-hardening',
                completed_missions: [],
                xp_delta: 40,
            },
        },
        {
            metadata: {
                ...meta,
                title: 'Implement Resilience Patterns',
                summary: 'Deploy fault-tolerant infrastructure',
            },
            ui_blocks: [
                {
                    kind: 'mission_block',
                    id: 'resilience-implementation',
                    title: 'Mission: Build Resilient Infrastructure',
                    description: 'Implement high-availability infrastructure. Requirements: (1) Multi-region deployment plan, (2) Consensus failover mechanism, (3) Circuit breaker implementation, (4) Observability stack (metrics, logs, traces), (5) SLO definitions and monitoring.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 100,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'resilience-checklist',
                    title: 'Resilience Requirements',
                    items: [
                        { label: 'Multi-region deployment configured', checked: false },
                        { label: 'Consensus failover tested', checked: false },
                        { label: 'Circuit breakers implemented', checked: false },
                        { label: 'Observability stack deployed', checked: false },
                        { label: 'SLOs defined and monitored', checked: false },
                    ],
                },
                {
                    kind: 'indicator_block',
                    id: 'slo-metrics',
                    title: 'SLO Targets',
                    type: 'bar',
                    indicators: [
                        { name: 'Availability (99.9%)', value: 0, max: 100, color: '#10b981' },
                        { name: 'Latency p95 (<200ms)', value: 0, max: 200, color: '#3b82f6' },
                        { name: 'Error Rate (<0.1%)', value: 0, max: 1, color: '#ef4444' },
                        { name: 'Data Durability (11 nines)', value: 0, max: 100, color: '#8b5cf6' },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'InfrastructureAgent',
                    action: 'validate_resilience',
                    reason: 'Resilience implementation submitted. Validating fault tolerance and SLO compliance.',
                    parameters: { min_score: 85, required_patterns: ['multi_region', 'failover', 'circuit_breaker'] },
                },
            ],
            next_state: {
                phase_id: 'systems-hardening',
                completed_missions: ['resilience-implementation'],
                xp_delta: 100,
            },
        },
    ];
};

/**
 * System Architect Phase 5: Synaptic Rollout (DAO vote required)
 */
export const createSynapticRolloutSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'synaptic-rollout',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Governance Integration',
                summary: 'Secure DAO approval for infrastructure deployment',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'rollout-intro',
                    title: 'Architecture Gains Meaning Through Community',
                    body_markdown: `
# Synaptic Rollout

**Enable the network and they will extend your vision.**

## Governance Alignment
Your infrastructure must be ratified by the Synaptic Governance council before mainnet deployment.

## DAO Vote Requirements
1. **Technical Audit**: Security and performance review
2. **Economic Model**: Sustainability assessment
3. **Community Benefit**: Value proposition for ecosystem
4. **Risk Analysis**: Failure modes and mitigation

## Guardian Network
Post-approval, you'll coordinate with Guardian agents who:
- Monitor infrastructure health
- Respond to incidents
- Coordinate upgrades
- Facilitate community adoption
                    `.trim(),
                },
                {
                    kind: 'dao_dashboard_block',
                    id: 'rollout-dao',
                    title: 'Synaptic Governance Council',
                    votingPower: 100,
                    proposals: [
                        {
                            id: 'infra-rollout-proposal',
                            title: 'Infrastructure Rollout Approval',
                            description: 'Approve deployment of decentralized infrastructure protocol',
                            status: 'active',
                            votesFor: 0,
                            votesAgainst: 0,
                            endDate: '7 days',
                        },
                    ],
                },
                {
                    kind: 'mission_block',
                    id: 'dao-vote-mission',
                    title: 'Mission: Secure DAO Approval',
                    description: 'Present your infrastructure proposal to the Synaptic Governance council. Vote on the proposal to demonstrate community alignment.',
                    mission_type: 'dao_vote',
                    expected_input_type: 'choice',
                    xp_reward: 120,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'GovernanceAgent',
                    action: 'facilitate_dao_vote',
                    reason: 'Infrastructure proposal submitted to DAO. Coordinating governance vote.',
                    parameters: { specialty: 'DAO Coordination', required_quorum: 1000 },
                },
            ],
            next_state: {
                phase_id: 'synaptic-rollout',
                completed_missions: ['dao-vote-mission'],
                xp_delta: 120,
            },
        },
        {
            metadata: {
                ...meta,
                title: 'Guardian Coordination',
                summary: 'Activate Guardian network for infrastructure support',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'guardian-intro',
                    title: 'Guardian Network Activation',
                    body_markdown: `
# Guardian Coordination

With DAO approval secured, activate the Guardian network to support your infrastructure.

## Guardian Responsibilities
- **Monitoring**: 24/7 infrastructure health checks
- **Incident Response**: Rapid triage and remediation
- **Upgrade Coordination**: Smooth version transitions
- **Community Support**: Developer onboarding and documentation

## Activation Checklist
✅ Guardian handbook published
✅ Monitoring dashboards configured
✅ Incident escalation matrix defined
✅ Community enablement plan ready
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'guardian-activation',
                    title: 'Mission: Publish Guardian Handbook',
                    description: 'Create comprehensive Guardian handbook. Include: (1) Infrastructure architecture overview, (2) Monitoring and alerting setup, (3) Incident response procedures, (4) Upgrade coordination process, (5) Community support resources.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 80,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'guardian-checklist',
                    title: 'Guardian Activation',
                    items: [
                        { label: 'Guardian handbook published', checked: false },
                        { label: 'Monitoring dashboards live', checked: false },
                        { label: 'Incident escalation matrix defined', checked: false },
                        { label: 'Community enablement plan ready', checked: false },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'GuardianAgent',
                    action: 'activate_guardian_network',
                    reason: 'Guardian handbook submitted. Activating infrastructure support network.',
                    parameters: { specialty: 'Infrastructure Operations' },
                },
            ],
            next_state: {
                phase_id: 'synaptic-rollout',
                completed_missions: ['dao-vote-mission', 'guardian-activation'],
                xp_delta: 80,
            },
        },
    ];
};

// ============================================================================
// EXPERIENCE STUDIO - Creator Tech
// ============================================================================

export const createExperienceDiscoverySequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'experience-discovery',
        mode: 'explorer' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Cultural Signal Mapping',
                summary: 'Research emerging cultural trends and user behaviors',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'culture-intro',
                    title: 'Culture as Protocol',
                    body_markdown: `
# Experience Discovery

**Great experiences emerge from deep cultural listening.**

## Cultural Research Framework
1. **Trend Analysis**: Identify emerging behaviors and aesthetics
2. **Community Ethnography**: Study how communities form and interact
3. **Value Mapping**: Understand what users truly care about
4. **Friction Points**: Identify pain points in existing experiences

## Web3 Experience Patterns
- **Ownership as Identity**: NFTs as self-expression
- **Community as Currency**: Social capital > financial capital
- **Composability**: Experiences that remix and evolve
- **Provenance**: History and authenticity matter
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'cultural-research',
                    title: 'Mission: Cultural Research Report',
                    description: 'Create cultural research report. Include: (1) 3 emerging trends with evidence, (2) Target community profile, (3) Value proposition hypothesis, (4) Competitive landscape analysis, (5) Opportunity gaps.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 60,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CreativeAgent',
                    action: 'guide_cultural_research',
                    reason: 'Cultural research framework established. Ready for trend analysis.',
                    parameters: { specialty: 'Cultural Intelligence' },
                },
            ],
            next_state: {
                phase_id: 'experience-discovery',
                completed_missions: ['cultural-research'],
                xp_delta: 60,
            },
        },
    ];
};

export const createNFTSystemsLabSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'nft-systems-lab',
        mode: 'builder' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'NFT Architecture Design',
                summary: 'Design composable NFT systems with utility',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'nft-architecture',
                    title: 'NFTs as Programmable Culture',
                    body_markdown: `
# NFT Systems Lab

**Design NFTs that evolve, compose, and create value beyond speculation.**

## NFT Design Patterns
1. **Dynamic NFTs**: Metadata that evolves based on on-chain events
2. **Composable NFTs**: Assets that combine to create new experiences
3. **Utility NFTs**: Access, governance, or functional benefits
4. **Soulbound Tokens**: Non-transferable identity and reputation

## Metaplex Core
- Candy Machine for fair launches
- Token Metadata standards
- Programmable NFTs with royalties
- Compressed NFTs for scale
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'nft-design',
                    title: 'Mission: Design NFT System',
                    description: 'Design complete NFT system. Include: (1) Collection concept, (2) Metadata structure, (3) Utility mechanics, (4) Rarity distribution, (5) Composability hooks.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 80,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'NFTArchitectAgent',
                    action: 'review_nft_design',
                    reason: 'NFT system design submitted. Validating utility and composability.',
                    parameters: { specialty: 'NFT Architecture', min_score: 80 },
                },
            ],
            next_state: {
                phase_id: 'nft-systems-lab',
                completed_missions: ['nft-design'],
                xp_delta: 80,
            },
        },
    ];
};

export const createGameplayLabSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'gameplay-lab',
        mode: 'builder' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Game Mechanics Design',
                summary: 'Design engagement loops and reward systems',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'gameplay-intro',
                    title: 'Engagement as Protocol',
                    body_markdown: `
# Gameplay Lab

**Design loops that reward participation without exploitation.**

## Core Engagement Loops
- Onboarding: First 5 minutes define retention
- Core Loop: The repeatable action that drives value
- Progression: Clear path to mastery
- Social Dynamics: Collaboration and competition

## Ethical Design
- No predatory mechanics
- Transparent odds
- Sustainable economics
- Community governance
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'gameplay-design',
                    title: 'Mission: Design Gameplay System',
                    description: 'Create gameplay system. Include: (1) Core engagement loop, (2) Progression tiers, (3) Social mechanics, (4) Seasonal events, (5) Ethical safeguards.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 90,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'GameplayAgent',
                    action: 'review_gameplay_design',
                    reason: 'Gameplay system submitted. Validating engagement loops and ethics.',
                    parameters: { specialty: 'Game Design', min_score: 85 },
                },
            ],
            next_state: {
                phase_id: 'gameplay-lab',
                completed_missions: ['gameplay-design'],
                xp_delta: 90,
            },
        },
    ];
};

export const createUXElevationSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'ux-elevation',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Frictionless UX Design',
                summary: 'Remove barriers between intent and action',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'ux-intro',
                    title: 'Invisibility is Mastery',
                    body_markdown: `
# UX Elevation

**Remove friction until the protocol feels like second nature.**

## Web3 UX Challenges
- Wallet onboarding complexity
- Transaction signing clarity
- Gas fee prediction
- Error state recovery

## Best Practices
- Progressive disclosure
- Familiar patterns
- Clear feedback
- Graceful degradation
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'ux-audit',
                    title: 'Mission: UX Audit & Redesign',
                    description: 'Conduct UX audit. Include: (1) User journey map, (2) Wallet onboarding flow, (3) Transaction UX, (4) Error handling, (5) Mobile responsiveness.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 100,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'UXAgent',
                    action: 'review_ux_design',
                    reason: 'UX audit submitted. Validating friction reduction and accessibility.',
                    parameters: { specialty: 'User Experience', min_score: 90 },
                },
            ],
            next_state: {
                phase_id: 'ux-elevation',
                completed_missions: ['ux-audit'],
                xp_delta: 100,
            },
        },
    ];
};

export const createExperienceLaunchSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'experience-launch',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Community Activation',
                summary: 'Launch with community resonance',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'launch-intro',
                    title: 'Launch as Conversation',
                    body_markdown: `
# Experience Launch

**Treat your launch as the first conversation, not the final act.**

## Launch Strategy
- Pre-Launch: Build anticipation
- Launch Event: Create memorable moment
- Post-Launch: Rapid iteration
- Retention: Long-term engagement

## Metrics That Matter
- Day 1, 7, 30 retention
- Community engagement rate
- User-generated content
- Net Promoter Score
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'launch-plan',
                    title: 'Mission: Launch & Retention Plan',
                    description: 'Create launch plan. Include: (1) Pre-launch campaign, (2) Launch event design, (3) Content calendar, (4) Community care plan, (5) Retention metrics.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 120,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'CommunityAgent',
                    action: 'validate_launch_plan',
                    reason: 'Launch plan submitted. Validating community activation strategy.',
                    parameters: { specialty: 'Community Growth', min_score: 85 },
                },
            ],
            next_state: {
                phase_id: 'experience-launch',
                completed_missions: ['launch-plan'],
                xp_delta: 120,
            },
        },
    ];
};
