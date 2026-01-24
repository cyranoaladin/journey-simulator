/**
 * Project: Money Factory AI (MFAI)
 * Module: Demo Sequencer Extensions 2 - Impact Engine & Resilience Master
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import type { JourneyStepResponse, Mode, Tone } from '../types/uiBlocks';

// ============================================================================
// IMPACT ENGINE - Governance & Philanthropy (Phases 1-4)
// ============================================================================

export const createImpactCharterSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'impact-charter',
        mode: 'explorer' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Mission Charter Definition',
                summary: 'Define purpose, stakeholders, and ethical guardrails',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'charter-intro',
                    title: 'Purpose as Foundation',
                    body_markdown: `
# Mission Charter Lab

**Clarity of purpose prevents mission drift.**

## Charter Components
1. **Impact Thesis**: What change are you creating?
2. **Stakeholder Map**: Who benefits, who contributes?
3. **Ethical Guardrails**: What won't you compromise?
4. **Success Metrics**: How do you measure impact?

## Web3 Impact Patterns
- **Transparent Funding**: All flows visible on-chain
- **Community Governance**: Stakeholders decide together
- **Regenerative Economics**: Value flows to creators
- **Verifiable Impact**: Proof of outcomes, not just intent
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'charter-document',
                    title: 'Mission: Draft Impact Charter',
                    description: 'Create impact charter document. Include: (1) Impact thesis (problem + solution), (2) Stakeholder map with incentives, (3) Ethical guardrails, (4) Success metrics, (5) Theory of change.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 75,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'GovernanceAgent',
                    action: 'review_impact_charter',
                    reason: 'Impact charter submitted. Validating clarity and stakeholder alignment.',
                    parameters: { specialty: 'Impact Strategy' },
                },
            ],
            next_state: {
                phase_id: 'impact-charter',
                completed_missions: ['charter-document'],
                xp_delta: 75,
            },
        },
    ];
};

export const createDAODesignSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'dao-design',
        mode: 'builder' as Mode,
        tone: 'pedagogical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'DAO Governance Architecture',
                summary: 'Design participatory governance with checks and balances',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'dao-intro',
                    title: 'Governance as Code',
                    body_markdown: `
# DAO Design Studio

**Design governance that scales trust without centralizing power.**

## DAO Design Patterns
1. **Token-Weighted Voting**: Stake-based influence
2. **Quadratic Voting**: Reduce whale dominance
3. **Conviction Voting**: Time-weighted preferences
4. **Delegation**: Representative democracy on-chain

## Governance Layers
- Proposal Creation: Who can propose?
- Voting Mechanism: How are decisions made?
- Execution: Who implements approved proposals?
- Treasury Management: How are funds allocated?
                    `.trim(),
                },
                {
                    kind: 'diagram_block',
                    id: 'dao-flow',
                    title: 'DAO Governance Flow',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[Proposal Creation] --> B[Discussion Period]
    B --> C[Voting Period]
    C --> D{Quorum Met?}
    D -->|Yes| E[Execution]
    D -->|No| F[Proposal Fails]
    E --> G[Treasury Action]
                    `.trim(),
                    caption: 'Standard DAO proposal lifecycle',
                },
                {
                    kind: 'mission_block',
                    id: 'dao-design',
                    title: 'Mission: Design DAO Governance',
                    description: 'Create DAO governance specification. Include: (1) Voting mechanism and parameters, (2) Proposal creation rules, (3) Quorum and approval thresholds, (4) Treasury management structure, (5) Emergency procedures.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 90,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'GovernanceAgent',
                    action: 'review_dao_design',
                    reason: 'DAO governance design submitted. Validating decentralization and security.',
                    parameters: { specialty: 'DAO Architecture', min_score: 85 },
                },
            ],
            next_state: {
                phase_id: 'dao-design',
                completed_missions: ['dao-design'],
                xp_delta: 90,
            },
        },
    ];
};

export const createPhilanthropyProtocolsSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'philanthropy-protocols',
        mode: 'builder' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Transparent Funding Rails',
                summary: 'Design verifiable philanthropy and impact funding',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'philanthropy-intro',
                    title: 'Trust Through Transparency',
                    body_markdown: `
# Philanthropy Protocols

**Make every dollar traceable from donor to impact.**

## Transparent Funding Models
1. **Quadratic Funding**: Amplify small donors
2. **Retroactive Public Goods**: Fund what worked
3. **Milestone-Based Grants**: Release funds on delivery
4. **Impact Bonds**: Pay for outcomes, not activities

## On-Chain Accountability
- All donations visible on-chain
- Milestone completion verified
- Impact metrics published
- Community oversight built-in
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'funding-protocol',
                    title: 'Mission: Design Funding Protocol',
                    description: 'Create philanthropy protocol specification. Include: (1) Funding mechanism (quadratic, retroactive, etc.), (2) Milestone and verification system, (3) Impact metrics and reporting, (4) Donor transparency dashboard, (5) Fraud prevention measures.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 100,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'philanthropy-checklist',
                    title: 'Protocol Requirements',
                    items: [
                        { label: 'Funding mechanism defined', checked: false },
                        { label: 'Milestone system designed', checked: false },
                        { label: 'Impact metrics specified', checked: false },
                        { label: 'Transparency dashboard planned', checked: false },
                        { label: 'Fraud prevention included', checked: false },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'PhilanthropyAgent',
                    action: 'review_funding_protocol',
                    reason: 'Funding protocol submitted. Validating transparency and impact measurement.',
                    parameters: { specialty: 'Impact Funding', min_score: 85 },
                },
            ],
            next_state: {
                phase_id: 'philanthropy-protocols',
                completed_missions: ['funding-protocol'],
                xp_delta: 100,
            },
        },
    ];
};

export const createIdentityReputationSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'identity-reputation',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Decentralized Identity & Reputation',
                summary: 'Build portable reputation without surveillance',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'identity-intro',
                    title: 'Reputation Without Surveillance',
                    body_markdown: `
# Identity & Reputation Systems

**Build trust without sacrificing privacy.**

## Decentralized Identity (DID)
1. **Self-Sovereign Identity**: Users control their data
2. **Verifiable Credentials**: Cryptographic proof of claims
3. **Selective Disclosure**: Share only what's needed
4. **Portable Reputation**: Take your history anywhere

## Reputation Mechanisms
- **Soulbound Tokens**: Non-transferable achievements
- **Attestations**: Peer-verified claims
- **Contribution Graphs**: On-chain activity history
- **Privacy-Preserving Scores**: ZK proofs of reputation
                    `.trim(),
                },
                {
                    kind: 'diagram_block',
                    id: 'identity-flow',
                    title: 'Decentralized Identity Flow',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[User Action] --> B[Attestation Created]
    B --> C[Stored in DID]
    C --> D[Selective Disclosure]
    D --> E[Verifier Checks]
    E --> F[Access Granted]
                    `.trim(),
                    caption: 'Privacy-preserving identity verification',
                },
                {
                    kind: 'mission_block',
                    id: 'identity-system',
                    title: 'Mission: Design Identity System',
                    description: 'Create identity and reputation system. Include: (1) DID architecture and standards, (2) Reputation scoring mechanism, (3) Privacy-preserving verification, (4) Portability across protocols, (5) Sybil resistance measures.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 110,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'ReputationAgent',
                    action: 'review_identity_system',
                    reason: 'Identity system submitted. Validating privacy and portability.',
                    parameters: { specialty: 'Decentralized Identity', min_score: 90 },
                },
            ],
            next_state: {
                phase_id: 'identity-reputation',
                completed_missions: ['identity-system'],
                xp_delta: 110,
            },
        },
    ];
};

// ============================================================================
// RESILIENCE MASTER - Security & Defense
// ============================================================================

export const createSecurityBaselineSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'security-baseline',
        mode: 'explorer' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Security Fundamentals',
                summary: 'Establish security baseline and threat model',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'security-intro',
                    title: 'Security is Not Optional',
                    body_markdown: `
# Security Baseline

**Assume breach. Design for resilience.**

## Security Fundamentals
1. **Threat Modeling**: Identify attack vectors
2. **Defense in Depth**: Multiple security layers
3. **Least Privilege**: Minimize access rights
4. **Fail Secure**: Default to safe state

## Web3 Attack Vectors
- **Smart Contract Exploits**: Reentrancy, overflow, logic bugs
- **Oracle Manipulation**: Price feed attacks
- **Front-Running**: MEV exploitation
- **Social Engineering**: Phishing, impersonation
- **Key Management**: Private key compromise

## Security Checklist
- All contracts audited by reputable firms
- Multi-sig for admin functions
- Time-locks on critical operations
- Emergency pause mechanisms
- Bug bounty program active
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'threat-model',
                    title: 'Mission: Create Threat Model',
                    description: 'Develop comprehensive threat model. Include: (1) Asset inventory (what needs protection), (2) Attack surface analysis, (3) Threat actors and motivations, (4) Attack scenarios with impact assessment, (5) Mitigation strategies.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 80,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'security-checklist',
                    title: 'Security Baseline',
                    items: [
                        { label: 'Asset inventory completed', checked: false },
                        { label: 'Attack surface mapped', checked: false },
                        { label: 'Threat actors identified', checked: false },
                        { label: 'Attack scenarios documented', checked: false },
                        { label: 'Mitigation strategies defined', checked: false },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'SecurityAgent',
                    action: 'review_threat_model',
                    reason: 'Threat model submitted. Validating completeness and risk assessment.',
                    parameters: { specialty: 'Security Architecture' },
                },
            ],
            next_state: {
                phase_id: 'security-baseline',
                completed_missions: ['threat-model'],
                xp_delta: 80,
            },
        },
    ];
};

export const createExploitHuntSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'exploit-hunt',
        mode: 'builder' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Vulnerability Discovery',
                summary: 'Hunt for exploits before attackers do',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'exploit-intro',
                    title: 'Think Like an Attacker',
                    body_markdown: `
# Exploit Hunt

**Find vulnerabilities before they find you.**

## Common Smart Contract Vulnerabilities
1. **Reentrancy**: External calls before state updates
2. **Integer Overflow/Underflow**: Arithmetic errors
3. **Access Control**: Unauthorized function calls
4. **Oracle Manipulation**: Price feed attacks
5. **Front-Running**: Transaction ordering exploitation

## Audit Tools
- **Slither**: Static analysis for Solidity
- **Mythril**: Symbolic execution
- **Echidna**: Fuzzing framework
- **Foundry**: Property-based testing
- **Manual Review**: Human expertise

## Testing Strategy
- Unit tests (100% coverage)
- Integration tests
- Fuzz testing
- Formal verification
- External audit
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'vulnerability-audit',
                    title: 'Mission: Conduct Security Audit',
                    description: 'Perform comprehensive security audit. Include: (1) Static analysis results (Slither, Mythril), (2) Manual code review findings, (3) Fuzz testing results, (4) Vulnerability report with severity ratings, (5) Remediation recommendations.',
                    mission_type: 'code_submission',
                    expected_input_type: 'code_snippet',
                    xp_reward: 100,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'audit-checklist',
                    title: 'Audit Requirements',
                    items: [
                        { label: 'Static analysis completed', checked: false },
                        { label: 'Manual review performed', checked: false },
                        { label: 'Fuzz testing executed', checked: false },
                        { label: 'Vulnerabilities documented', checked: false },
                        { label: 'Remediation plan created', checked: false },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'ExploitHunterAgent',
                    action: 'review_security_audit',
                    reason: 'Security audit submitted. Validating vulnerability assessment and remediation.',
                    parameters: { specialty: 'Vulnerability Research', min_score: 90 },
                },
            ],
            next_state: {
                phase_id: 'exploit-hunt',
                completed_missions: ['vulnerability-audit'],
                xp_delta: 100,
            },
        },
    ];
};

export const createDefenseSystemsSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'defense-systems',
        mode: 'builder' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Defense Mechanisms',
                summary: 'Implement security controls and monitoring',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'defense-intro',
                    title: 'Defense in Depth',
                    body_markdown: `
# Defense Systems

**Layer security controls to survive inevitable attacks.**

## Defense Layers
1. **Access Control**: Multi-sig, role-based permissions
2. **Rate Limiting**: Prevent spam and DoS
3. **Circuit Breakers**: Emergency pause mechanisms
4. **Monitoring**: Real-time anomaly detection
5. **Incident Response**: Automated and manual procedures

## Security Controls
- **Time-locks**: Delay critical operations
- **Whitelisting**: Approved addresses only
- **Spending Limits**: Cap transaction amounts
- **Upgradability**: Secure upgrade patterns
- **Kill Switch**: Emergency shutdown

## Monitoring Stack
- On-chain event monitoring
- Anomaly detection algorithms
- Alert system (PagerDuty, Discord)
- Dashboard for security metrics
                    `.trim(),
                },
                {
                    kind: 'diagram_block',
                    id: 'defense-architecture',
                    title: 'Defense Architecture',
                    diagram_type: 'mermaid',
                    content: `
graph TD
    A[User Transaction] --> B[Access Control]
    B --> C[Rate Limiting]
    C --> D[Business Logic]
    D --> E[Circuit Breaker]
    E --> F[Monitoring]
    F --> G{Anomaly?}
    G -->|Yes| H[Alert & Pause]
    G -->|No| I[Execute]
                    `.trim(),
                    caption: 'Layered defense architecture',
                },
                {
                    kind: 'mission_block',
                    id: 'defense-implementation',
                    title: 'Mission: Implement Defense Systems',
                    description: 'Build defense systems. Include: (1) Access control implementation (multi-sig, roles), (2) Circuit breaker mechanisms, (3) Monitoring and alerting setup, (4) Incident response playbook, (5) Security metrics dashboard.',
                    mission_type: 'code_submission',
                    expected_input_type: 'code_snippet',
                    xp_reward: 110,
                    is_mandatory: true,
                },
            ],
            agent_actions: [
                {
                    agent_name: 'DefenseAgent',
                    action: 'review_defense_systems',
                    reason: 'Defense systems submitted. Validating security controls and monitoring.',
                    parameters: { specialty: 'Defense Engineering', min_score: 85 },
                },
            ],
            next_state: {
                phase_id: 'defense-systems',
                completed_missions: ['defense-implementation'],
                xp_delta: 110,
            },
        },
    ];
};

export const createIncidentResponseSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'incident-response',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Incident Response Planning',
                summary: 'Prepare for security incidents and breaches',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'incident-intro',
                    title: 'Hope for Best, Plan for Worst',
                    body_markdown: `
# Incident Response

**Speed and clarity under pressure save millions.**

## Incident Response Phases
1. **Preparation**: Playbooks, tools, team training
2. **Detection**: Identify security incidents
3. **Containment**: Stop the bleeding
4. **Eradication**: Remove threat
5. **Recovery**: Restore normal operations
6. **Lessons Learned**: Post-mortem analysis

## Response Playbooks
- **Smart Contract Exploit**: Pause, assess, patch, redeploy
- **Oracle Manipulation**: Switch to backup feeds
- **Key Compromise**: Rotate keys, revoke access
- **Front-Running Attack**: Adjust MEV protection
- **Social Engineering**: Communication protocol

## Communication Plan
- Internal: Security team, developers, leadership
- External: Users, partners, auditors, media
- Transparency: What to disclose, when, how
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'incident-playbook',
                    title: 'Mission: Create Incident Response Playbook',
                    description: 'Develop incident response playbook. Include: (1) Incident classification matrix, (2) Response procedures for each incident type, (3) Communication templates, (4) Escalation paths, (5) Post-mortem template.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 120,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'incident-checklist',
                    title: 'Playbook Requirements',
                    items: [
                        { label: 'Incident types classified', checked: false },
                        { label: 'Response procedures documented', checked: false },
                        { label: 'Communication templates created', checked: false },
                        { label: 'Escalation paths defined', checked: false },
                        { label: 'Post-mortem process established', checked: false },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'IncidentResponseAgent',
                    action: 'review_incident_playbook',
                    reason: 'Incident response playbook submitted. Validating completeness and clarity.',
                    parameters: { specialty: 'Incident Management', min_score: 90 },
                },
            ],
            next_state: {
                phase_id: 'incident-response',
                completed_missions: ['incident-playbook'],
                xp_delta: 120,
            },
        },
    ];
};

export const createRedBlueEvolutionSequence = (trackId: string): JourneyStepResponse[] => {
    const meta = {
        persona_id: trackId,
        journey_track: trackId,
        phase_id: 'redblue-evolution',
        mode: 'expert' as Mode,
        tone: 'critical' as Tone,
        language: 'en' as const,
    };

    return [
        {
            metadata: {
                ...meta,
                title: 'Continuous Security Evolution',
                summary: 'Red team vs blue team exercises',
            },
            ui_blocks: [
                {
                    kind: 'text_block',
                    id: 'redblue-intro',
                    title: 'Adversarial Testing',
                    body_markdown: `
# Red/Blue Evolution

**Continuous adversarial testing keeps defenses sharp.**

## Red Team (Attackers)
- Simulate real-world attacks
- Find vulnerabilities before bad actors
- Test incident response procedures
- Challenge assumptions

## Blue Team (Defenders)
- Monitor and detect attacks
- Respond to incidents
- Improve defenses based on findings
- Document lessons learned

## Purple Team (Collaboration)
- Red and blue work together
- Share findings immediately
- Iterate on defenses
- Build institutional knowledge

## Evolution Cycle
1. Red team attacks
2. Blue team defends
3. Debrief and analyze
4. Improve defenses
5. Repeat
                    `.trim(),
                },
                {
                    kind: 'mission_block',
                    id: 'redblue-exercise',
                    title: 'Mission: Conduct Red/Blue Exercise',
                    description: 'Run red/blue team exercise. Include: (1) Red team attack scenarios, (2) Blue team detection and response, (3) Exercise debrief report, (4) Identified weaknesses, (5) Defense improvement plan.',
                    mission_type: 'deliverable',
                    expected_input_type: 'markdown_document',
                    xp_reward: 130,
                    is_mandatory: true,
                },
                {
                    kind: 'checklist_block',
                    id: 'redblue-checklist',
                    title: 'Exercise Requirements',
                    items: [
                        { label: 'Attack scenarios executed', checked: false },
                        { label: 'Detection mechanisms tested', checked: false },
                        { label: 'Response procedures validated', checked: false },
                        { label: 'Weaknesses identified', checked: false },
                        { label: 'Improvement plan created', checked: false },
                    ],
                },
            ],
            agent_actions: [
                {
                    agent_name: 'SecurityAgent',
                    action: 'validate_redblue_exercise',
                    reason: 'Red/blue exercise completed. Validating findings and improvement plan.',
                    parameters: { specialty: 'Adversarial Testing', min_score: 90 },
                },
            ],
            next_state: {
                phase_id: 'redblue-evolution',
                completed_missions: ['redblue-exercise'],
                xp_delta: 130,
            },
        },
    ];
};
