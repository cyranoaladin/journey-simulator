/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import { Code2, Lock, Network, ShieldCheck, Workflow } from 'lucide-react';
import { useMemo } from 'react';

type AgentCard = {
  id: string;
  title: string;
  role: string;
  logic: string;
  entry: string;
  available?: boolean;
};

const agents: AgentCard[] = [
  { id: 'guide', title: 'GuideAgent', role: 'Journey Orientation', logic: 'Strategy-driven', entry: 'Learn / AEPO' },
  { id: 'coach', title: 'CoachAgent', role: 'Strategic Coaching', logic: 'Strategy-driven', entry: 'Build / Activate' },
  { id: 'education', title: 'EducationAgent', role: 'Pedagogical Transmission', logic: 'Knowledge-fed', entry: 'Learn' },
  { id: 'reflection', title: 'ReflectionAgent', role: 'Meta-feedback', logic: 'Reasoning-focused', entry: 'Learn / Prove' },
  { id: 'builder', title: 'BuilderAgent', role: 'System Architecture', logic: 'RAG-based architecture', entry: 'Build' },
  { id: 'protocol', title: 'ProtocolAgent', role: 'Standards & tokens', logic: 'RAG-based compliance', entry: 'Build / Prove' },
  { id: 'dev', title: 'DevAgent', role: 'Code Implementation', logic: 'Execution-driven', entry: 'Build' },
  { id: 'design', title: 'DesignAgent', role: 'Design/UI', logic: 'Experience-centric', entry: 'Build' },
  { id: 'nft', title: 'NFTAgent', role: 'NFT Strategy/Metadata', logic: 'RAG-based metadata', entry: 'Build / Activate' },
  { id: 'dao', title: 'DAOAgent', role: 'DAO Tools/Structures', logic: 'Governance strategy', entry: 'Activate' },
  { id: 'govdao', title: 'GovernanceDAOAgent', role: 'Governance & Voting', logic: 'RAG-based governance', entry: 'Activate / Scale' },
  { id: 'tokenomics', title: 'TokenomicsAgent', role: 'Economics & Supply', logic: 'Math-heavy (curves)', entry: 'Scale / Launch' },
  { id: 'productspec', title: 'ProductSpecAgent', role: 'Detailed Specs', logic: 'RAG-based specs', entry: 'Learn / Build' },
  { id: 'journeydesign', title: 'JourneyDesignAgent', role: 'Journey Mapping', logic: 'Mapping/strategy', entry: 'Learn / Build' },
  { id: 'evaluation', title: 'EvaluationAgent', role: 'Quality Rubric', logic: 'Rubric/metrics', entry: 'Prove' },
  { id: 'investor', title: 'InvestorAgent', role: 'Fundraising', logic: 'Strategy/valuation', entry: 'Scale' },
  { id: 'investordemo', title: 'InvestorDemoAgent', role: 'Investor Demo', logic: 'Narrative-driven', entry: 'Activate' },
  { id: 'growth', title: 'GrowthAgent', role: 'Acquisition/Growth', logic: 'Experimentation-driven', entry: 'Activate / Scale' },
  { id: 'analytics', title: 'AnalyticsAgent', role: 'Insights/Metrics', logic: 'Data/analytics', entry: 'Prove / Scale' },
  { id: 'marketplace', title: 'MarketplaceAgent', role: 'Pricing/Listing', logic: 'Pricing models', entry: 'Scale' },
  { id: 'performance', title: 'PerformanceAgent', role: 'Perf Optimization', logic: 'Perf heuristics', entry: 'Build / Prove' },
  { id: 'devops', title: 'DevOpsAgent', role: 'CI/CD & Infra', logic: 'Automation-driven', entry: 'Build' },
  { id: 'observability', title: 'ObservabilityAgent', role: 'Logs/Metrics/Traces', logic: 'Telemetry-focused', entry: 'Build / Prove' },
  { id: 'qa', title: 'QAPlaywrightAgent', role: 'E2E Playwright', logic: 'Test harness', entry: 'Prove' },
  { id: 'security', title: 'SecurityAgent', role: 'Red Team/Exploits', logic: 'Adversarial', entry: 'Scale / Launch' },
  { id: 'securityaudit', title: 'SecurityAuditAgent', role: 'Security Audit', logic: 'RAG-based audit', entry: 'Scale / Launch' },
  { id: 'compliance', title: 'ComplianceAgent', role: 'Compliance/Regulation', logic: 'Policy-driven', entry: 'Scale' },
  { id: 'web3legal', title: 'Web3LegalAgent', role: 'Web3 Legal/MiCA', logic: 'RAG-based legal', entry: 'Scale / Launch' },
  { id: 'audit', title: 'AuditAgent', role: 'Code Quality/Security', logic: 'Static/dynamic checks', entry: 'Prove' },
  { id: 'solanaanchor', title: 'SolanaAnchorAgent', role: 'Anchor Stack', logic: 'Chain-runtime', entry: 'Build' },
  { id: 'minting', title: 'MintingAgent', role: 'Mint Pipeline', logic: 'Queue-driven', entry: 'Activate / Launch' },
  { id: 'walletauth', title: 'WalletAuthAgent', role: 'Wallet Auth', logic: 'Auth/crypto', entry: 'Build' },
  { id: 'ragops', title: 'RAGOpsAgent', role: 'Ingestion/Search', logic: 'RAG ingestion', entry: 'Learn / Build' },
  { id: 'dataintegrity', title: 'DataIntegrityAgent', role: 'Data Validation', logic: 'Consistency checks', entry: 'Prove' },
  { id: 'apicontract', title: 'APIContractAgent', role: 'Schemas/API', logic: 'Schema-first', entry: 'Build / Prove' },
  { id: 'curriculum', title: 'CurriculumAgent', role: 'Learning Path', logic: 'Curriculum design', entry: 'Learn' },
  { id: 'uxwriting', title: 'UXWritingAgent', role: 'UX Writing', logic: 'Style-guided', entry: 'Build' },
  { id: 'riskfraud', title: 'RiskFraudAgent', role: 'Fraud/Risk (Disabled)', logic: 'Risk heuristics', entry: 'Guarded', available: false },
];

const decisionTree = [
  {
    id: 'spec-to-tokenomics',
    title: 'Decision Tree: ProductSpec  Tokenomics',
    steps: [
      'Framing: ProductSpecAgent sets functional requirements and acceptance criteria.',
      'Journey Design: JourneyDesignAgent aligns personas/phases and AEPO/AECO.',
      'Validation: EvaluationAgent builds the success rubric and checkpoints.',
      'Economics: TokenomicsAgent calculates the curve (m, b), checks monotonicity P\'(S)>0 and liquidity cap.',
      'Governance: GovernanceDAOAgent defines rights/quorum, ComplianceAgent applies MiCA/KYC constraints.',
      'Launch: MintingAgent prepares the BullMQ queue, SecurityAuditAgent verifies attack surface before execution.'
    ]
  },
  {
    id: 'dry-run',
    title: 'Default Dry-Run Mode',
    steps: [
      'All actions start in SIMULATED (dry-run) without side-effects.',
      'Real execution only if `executionGate=APPROVED` and agent authorized by the Reality Matrix for the phase.',
      'In case of refusal or inconsistency: automatic fallback to simulation, complete logs (traceId, plan, constraints).'
    ]
  }
];

const GuidePage = () => {
  const availableAgents = useMemo(() => agents.filter((a) => a.available !== false), []);

  return (
    <div className="min-h-screen bg-void text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 md:px-12">
        <header className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Zyno Handbook</p>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-cyan-300">
            Deterministic orchestration. Traceable decisions. Controlled execution.
          </h1>
          <p className="text-lg text-white/60">
            Thought Partner (academic tone): each response is a structured plan, aligned with the Reality Matrix. Default dry-run,
            real execution conditioned by an approved gate.
          </p>
        </header>

        <section className="grid gap-6 md:grid-cols-2">
          {decisionTree.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-3 mb-3">
                {item.id === 'spec-to-tokenomics' ? (
                  <Workflow className="text-indigo-300" size={22} />
                ) : (
                  <ShieldCheck className="text-cyan-300" size={22} />
                )}
                <h2 className="text-xl font-bold">{item.title}</h2>
              </div>
              {item.steps.map((step) => (
                <p key={step} className="mt-3 text-sm leading-relaxed text-white/70">
                   {step}
                </p>
              ))}
              {item.id === 'dry-run' && (
                <p className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-white/60">
                  No real action without explicit gate. Plans are signed, cited, and archived before any execution.
                </p>
              )}
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-slate-50 p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">37 Experts</p>
              <h2 className="text-2xl font-bold">Roster Zyno</h2>
              <p className="text-sm text-white/60">How to solicit them and which logic engine they rely on.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden /> Active
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 ml-3" aria-hidden /> Restricted/Disabled
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {availableAgents.map((agent) => (
              <div
                key={agent.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-indigo-400/60 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{agent.title}</h3>
                    <p className="text-xs text-indigo-200">{agent.logic}</p>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">Active</span>
                </div>
                <p className="mt-2 text-sm text-white/70">{agent.role}</p>
                <p className="mt-1 text-xs text-white/50">Entry: {agent.entry}</p>
              </div>
            ))}
            {agents
              .filter((a) => a.available === false)
              .map((agent) => (
                <div
                  key={agent.id}
                  className="rounded-xl border border-amber-300/30 bg-amber-100/5 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-amber-200">{agent.title}</h3>
                      <p className="text-xs text-amber-300">{agent.logic}</p>
                    </div>
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-200">Disabled</span>
                  </div>
                  <p className="mt-2 text-sm text-amber-100/80">{agent.role}</p>
                  <p className="mt-1 text-xs text-amber-300/80">Entry: {agent.entry}</p>
                </div>
              ))}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Code2 className="text-indigo-300" size={18} />
              <h3 className="text-lg font-semibold">Reality Matrix</h3>
            </div>
            <p className="text-sm text-white/70">
              6 phases  37 agents: each cell encodes intent, phase, learningScore, confidenceWeight, constraints. Out of phase = immediate rejection.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Network className="text-cyan-300" size={18} />
              <h3 className="text-lg font-semibold">AEPO / AECO</h3>
            </div>
            <p className="text-sm text-white/70">
              Personas and cohorts modulate tone, granularity, and priorities. The router combines persona, phase, intent, and execution gate.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="text-rose-300" size={18} />
              <h3 className="text-lg font-semibold">Safeguards</h3>
            </div>
            <p className="text-sm text-white/70">
              Default dry-run, mandatory gate, complete logs (traceId). Real execution only after explicit validation.
            </p>
          </div>
        </section>

        <section className="space-y-8">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold mb-4">NFT Certificates (Simulation)</h2>
            <p className="text-sm text-white/70 mb-4">
              Proof-of-Skill certificates are minted on-chain. In Testnet v0/Connect-Only mode, this process is simulated.
              You will see a "Minted" status and a simulated transaction ID. No real SOL is needed.
            </p>
            <div className="rounded-lg bg-black/20 p-4 font-mono text-xs text-green-300">
              [SIMULATION] Mint request received -&gt; Validating metrics -&gt; Certificate issued (Simulated Tx: 0x...)
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold mb-4">Staking (Simulation)</h2>
            <p className="text-sm text-white/70 mb-4">
              Staking $MFAI tokens unlocks premium agent capabilities. In this environment, staking is purely simulated
              to demonstrate the utility without financial risk.
            </p>
            <div className="rounded-lg bg-black/20 p-4 font-mono text-xs text-yellow-300">
              [SIMULATION] Staking 1000 MFAI -&gt; Lock period 30d -&gt; Confirmed.
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold mb-4">DAO Governance & Voting</h2>
            <p className="text-sm text-white/70 mb-4">
              Participate in protocol decisions via the DAO. Proposals and votes are tracked on-chain.
              Current mode simulates proposal creation and voting weight calculation based on your (simulated) holdings.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold mb-4">Simulation Mode</h2>
            <p className="text-sm text-white/70 mb-4">
              Simulation Mode uses the real backend endpoints (Profile A) while neutralizing irreversible effects. Use it to validate journeys end-to-end without impacting production data.
            </p>
            <div className="rounded-lg bg-black/20 p-4 font-mono text-xs text-blue-300">
              Backend: http://127.0.0.1:3002 (real APIs)  Effects: sandboxed & sanitized outputs
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-2xl font-bold mb-4">Launching & Resources</h2>
            <p className="text-sm text-white/70 mb-4">
              Deploy your project to the ecosystem. Resources (repos, docs) are unlocked upon phase completion.
              Launch events are broadcast to the network (simulated event bus).
            </p>
          </div>
        </section>

        <footer className="rounded-2xl border border-white/10 bg-slate-50 p-6 text-center">
          <p className="text-sm text-white/70">
            Zyno acts as a thought partner: deterministic, traceable, and aligned with the Reality Matrix. Proceed to real execution only when all guardrails are green.
          </p>
          <p className="mt-3 text-xs text-white/50">
            (c) 2025 - Money Factory AI  Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default GuidePage;
