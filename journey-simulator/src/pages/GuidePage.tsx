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
  { id: 'guide', title: 'GuideAgent', role: 'Orientation parcours', logic: 'Strategy-driven', entry: 'Learn / AEPO' },
  { id: 'coach', title: 'CoachAgent', role: 'Coaching stratégique', logic: 'Strategy-driven', entry: 'Build / Activate' },
  { id: 'education', title: 'EducationAgent', role: 'Transmission pédagogique', logic: 'Knowledge-fed', entry: 'Learn' },
  { id: 'reflection', title: 'ReflectionAgent', role: 'Méta-feedback', logic: 'Reasoning-focused', entry: 'Learn / Prove' },
  { id: 'builder', title: 'BuilderAgent', role: 'Architecture système', logic: 'RAG-based architecture', entry: 'Build' },
  { id: 'protocol', title: 'ProtocolAgent', role: 'Standards & tokens', logic: 'RAG-based compliance', entry: 'Build / Prove' },
  { id: 'dev', title: 'DevAgent', role: 'Implémentation code', logic: 'Execution-driven', entry: 'Build' },
  { id: 'design', title: 'DesignAgent', role: 'Design/UI', logic: 'Experience-centric', entry: 'Build' },
  { id: 'nft', title: 'NFTAgent', role: 'Stratégie NFT/metadata', logic: 'RAG-based metadata', entry: 'Build / Activate' },
  { id: 'dao', title: 'DAOAgent', role: 'Outils/structures DAO', logic: 'Governance strategy', entry: 'Activate' },
  { id: 'govdao', title: 'GovernanceDAOAgent', role: 'Gouvernance & vote', logic: 'RAG-based governance', entry: 'Activate / Scale' },
  { id: 'tokenomics', title: 'TokenomicsAgent', role: 'Économie & supply', logic: 'Math-heavy (curves)', entry: 'Scale / Launch' },
  { id: 'productspec', title: 'ProductSpecAgent', role: 'Spécifications détaillées', logic: 'RAG-based specs', entry: 'Learn / Build' },
  { id: 'journeydesign', title: 'JourneyDesignAgent', role: 'Cartographie parcours', logic: 'Mapping/strategy', entry: 'Learn / Build' },
  { id: 'evaluation', title: 'EvaluationAgent', role: 'Rubrique qualité', logic: 'Rubric/metrics', entry: 'Prove' },
  { id: 'investor', title: 'InvestorAgent', role: 'Fundraising', logic: 'Strategy/valuation', entry: 'Scale' },
  { id: 'investordemo', title: 'InvestorDemoAgent', role: 'Démo investisseur', logic: 'Narrative-driven', entry: 'Activate' },
  { id: 'growth', title: 'GrowthAgent', role: 'Acquisition/growth', logic: 'Experimentation-driven', entry: 'Activate / Scale' },
  { id: 'analytics', title: 'AnalyticsAgent', role: 'Insights/metrics', logic: 'Data/analytics', entry: 'Prove / Scale' },
  { id: 'marketplace', title: 'MarketplaceAgent', role: 'Pricing/listing', logic: 'Pricing models', entry: 'Scale' },
  { id: 'performance', title: 'PerformanceAgent', role: 'Optimisation perf', logic: 'Perf heuristics', entry: 'Build / Prove' },
  { id: 'devops', title: 'DevOpsAgent', role: 'CI/CD & infra', logic: 'Automation-driven', entry: 'Build' },
  { id: 'observability', title: 'ObservabilityAgent', role: 'Logs/metrics/traces', logic: 'Telemetry-focused', entry: 'Build / Prove' },
  { id: 'qa', title: 'QAPlaywrightAgent', role: 'E2E Playwright', logic: 'Test harness', entry: 'Prove' },
  { id: 'security', title: 'SecurityAgent', role: 'Red team/exploits', logic: 'Adversarial', entry: 'Scale / Launch' },
  { id: 'securityaudit', title: 'SecurityAuditAgent', role: 'Audit sécurité', logic: 'RAG-based audit', entry: 'Scale / Launch' },
  { id: 'compliance', title: 'ComplianceAgent', role: 'Conformité/régulation', logic: 'Policy-driven', entry: 'Scale' },
  { id: 'web3legal', title: 'Web3LegalAgent', role: 'Légal Web3/MiCA', logic: 'RAG-based legal', entry: 'Scale / Launch' },
  { id: 'audit', title: 'AuditAgent', role: 'Code quality/security', logic: 'Static/dynamic checks', entry: 'Prove' },
  { id: 'solanaanchor', title: 'SolanaAnchorAgent', role: 'Stack Anchor', logic: 'Chain-runtime', entry: 'Build' },
  { id: 'minting', title: 'MintingAgent', role: 'Pipeline mint', logic: 'Queue-driven', entry: 'Activate / Launch' },
  { id: 'walletauth', title: 'WalletAuthAgent', role: 'Auth wallet', logic: 'Auth/crypto', entry: 'Build' },
  { id: 'ragops', title: 'RAGOpsAgent', role: 'Ingestion/search', logic: 'RAG ingestion', entry: 'Learn / Build' },
  { id: 'dataintegrity', title: 'DataIntegrityAgent', role: 'Validation données', logic: 'Consistency checks', entry: 'Prove' },
  { id: 'apicontract', title: 'APIContractAgent', role: 'Schémas/API', logic: 'Schema-first', entry: 'Build / Prove' },
  { id: 'curriculum', title: 'CurriculumAgent', role: 'Parcours d’apprentissage', logic: 'Curriculum design', entry: 'Learn' },
  { id: 'uxwriting', title: 'UXWritingAgent', role: 'UX writing', logic: 'Style-guided', entry: 'Build' },
  { id: 'riskfraud', title: 'RiskFraudAgent', role: 'Fraude/risque (désactivé)', logic: 'Risk heuristics', entry: 'Guarded', available: false },
];

const decisionTree = [
  {
    id: 'spec-to-tokenomics',
    title: 'Arbre des décisions : ProductSpec → Tokenomics',
    steps: [
      'Cadrage : ProductSpecAgent fixe les exigences fonctionnelles et les critères d’acceptation.',
      'Design parcours : JourneyDesignAgent aligne personas/phases et AEPO/AECO.',
      'Validation : EvaluationAgent construit la grille de réussite et les points de contrôle.',
      'Économie : TokenomicsAgent calcule la courbe (m, b), vérifie la monotonie P\'(S)>0 et le plafond de liquidité.',
      'Gouvernance : GovernanceDAOAgent définit droits/quorum, ComplianceAgent applique les contraintes MiCA/KYC.',
      'Lancement : MintingAgent prépare la file BullMQ, SecurityAuditAgent vérifie la surface d’attaque avant exécution.'
    ]
  },
  {
    id: 'dry-run',
    title: 'Mode Dry-Run par défaut',
    steps: [
      'Toutes les actions démarrent en SIMULATED (dry-run) sans side-effect.',
      'Exécution réelle uniquement si `executionGate=APPROVED` et agent autorisé par la Reality Matrix pour la phase.',
      'En cas de refus ou d’incohérence : fallback automatique en simulation, logs complets (traceId, plan, constraints).'
    ]
  }
];

const GuidePage = () => {
  const availableAgents = useMemo(() => agents.filter((a) => a.available !== false), []);

  return (
    <div className="min-h-screen bg-[#0b0b18] text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-12 md:px-12">
        <header className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">Zyno Handbook</p>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-blue-300 to-cyan-300">
            Orchestration déterministe. Décisions traçables. Exécution maîtrisée.
          </h1>
          <p className="text-lg text-white/60">
            Thought Partner (ton académique) : chaque réponse est un plan structuré, aligné sur la Reality Matrix. Dry-run par défaut,
            exécution réelle conditionnée par un gate approuvé.
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
                  • {step}
                </p>
              ))}
              {item.id === 'dry-run' && (
                <p className="mt-4 rounded-lg bg-white/5 p-3 text-xs text-white/60">
                  Aucune action réelle sans gate explicite. Les plans sont signés, cités et archivés avant toute exécution.
                </p>
              )}
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-white/10 bg-[#101025] p-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-indigo-300">37 Experts</p>
              <h2 className="text-2xl font-bold">Roster Zyno</h2>
              <p className="text-sm text-white/60">Comment les solliciter et sur quel moteur logique ils s’appuient.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" aria-hidden /> Actif
              <span className="inline-flex h-2 w-2 rounded-full bg-amber-400 ml-3" aria-hidden /> Restreint/désactivé
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
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200">Actif</span>
                </div>
                <p className="mt-2 text-sm text-white/70">{agent.role}</p>
                <p className="mt-1 text-xs text-white/50">Entrée : {agent.entry}</p>
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
                    <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-200">Désactivé</span>
                  </div>
                  <p className="mt-2 text-sm text-amber-100/80">{agent.role}</p>
                  <p className="mt-1 text-xs text-amber-300/80">Entrée : {agent.entry}</p>
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
              6 phases × 37 agents : chaque cellule encode intent, phase, learningScore, confidenceWeight, constraints. Hors phase = rejet immédiat.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Network className="text-cyan-300" size={18} />
              <h3 className="text-lg font-semibold">AEPO / AECO</h3>
            </div>
            <p className="text-sm text-white/70">
              Personas et cohortes modulent le ton, la granularité et les priorités. Le router combine persona, phase, intent et gate d’exécution.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3 mb-2">
              <Lock className="text-rose-300" size={18} />
              <h3 className="text-lg font-semibold">Safeguards</h3>
            </div>
            <p className="text-sm text-white/70">
              Dry-run par défaut, gate obligatoire, logs complets (traceId). Exécution réelle seulement après validation explicite.
            </p>
          </div>
        </section>

        <footer className="rounded-2xl border border-white/10 bg-[#0f162a] p-6 text-center">
          <p className="text-sm text-white/70">
            Zyno agit comme partenaire de pensée : déterministe, traçable et aligné sur la Reality Matrix. Passez en exécution réelle uniquement lorsque tous les garde-fous sont verts.
          </p>
          <p className="mt-3 text-xs text-white/50">
            (c) 2025 - Money Factory AI — Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default GuidePage;
