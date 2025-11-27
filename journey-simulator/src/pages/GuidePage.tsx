import React, { useState, useEffect } from 'react';
import {
    Book,
    Compass,
    Trophy,
    Coins,
    Layers,
    Menu,
    X,
    ChevronRight,
    Target,
    Shield,
    Zap,
    Rocket,
    Brain
} from 'lucide-react';

const GuidePage = () => {
    const [activeSection, setActiveSection] = useState('getting-started');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const sections = [
        { id: 'getting-started', label: 'Getting Started', icon: Compass },
        { id: 'the-journey', label: 'The Journey', icon: Rocket },
        { id: 'ai-agents', label: 'AI Agents', icon: Brain },
        { id: 'progression', label: 'Progression & XP', icon: Trophy },
        { id: 'economy', label: 'Economy & DAO', icon: Coins },
        { id: 'launch', label: 'Launch & Collaterize', icon: Rocket },
        { id: 'workflow', label: 'User Workflow', icon: Layers },
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(id);
            setIsMobileMenuOpen(false);
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section.id);
                if (element) {
                    const { offsetTop, offsetHeight } = element;
                    if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
                        setActiveSection(section.id);
                        break;
                    }
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="flex min-h-screen bg-[#0d0d1a] text-white">
            {/* Mobile Menu Button */}
            <button
                className="fixed right-4 top-20 z-50 rounded-lg bg-[#1a1a2e] p-2 md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Sidebar Navigation */}
            <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-[#14142a] transition-transform duration-300 ease-in-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex h-full flex-col border-r border-white/10 p-6">
                    <div className="mb-8 flex items-center gap-3">
                        <Book className="text-indigo-400" size={28} />
                        <h1 className="text-xl font-bold tracking-wide">Platform Guide</h1>
                    </div>

                    <nav className="space-y-2">
                        {sections.map((section) => {
                            const Icon = section.icon;
                            return (
                                <button
                                    key={section.id}
                                    onClick={() => scrollToSection(section.id)}
                                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${activeSection === section.id
                                        ? 'bg-indigo-500/20 text-indigo-300 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium">{section.label}</span>
                                    {activeSection === section.id && <ChevronRight className="ml-auto" size={16} />}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-auto rounded-xl bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-4">
                        <p className="text-xs font-medium text-indigo-200">Need more help?</p>
                        <p className="mt-1 text-xs text-white/50">Ask the Guide Agent in your dashboard for real-time assistance.</p>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-x-hidden">
                <div className="mx-auto max-w-4xl px-6 py-12 md:px-12">

                    {/* Header */}
                    <div className="mb-16 text-center">
                        <h1 className="mb-4 text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-blue-400">
                            User Manual & Platform Guide
                        </h1>
                        <p className="text-lg text-white/60">
                            Master the Money Factory AI Journey Simulator. Learn how to navigate, build, earn, and scale your Web3 projects.
                        </p>
                    </div>

                    {/* Getting Started */}
                    <section id="getting-started" className="mb-20 scroll-mt-24">
                        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                            <Compass className="text-indigo-400" size={32} />
                            <h2 className="text-3xl font-bold">Getting Started</h2>
                        </div>

                        <div className="space-y-8 text-white/80">
                            <p className="text-lg leading-relaxed">
                                Welcome to the Journey Simulator. This platform is your command center for mastering Web3 development, from ideation to DAO governance. Here's how to begin:
                            </p>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                    <h3 className="mb-3 text-xl font-semibold text-white">1. Dashboard Navigation</h3>
                                    <p className="text-sm leading-relaxed text-white/60">
                                        Your <strong>Dashboard</strong> is the central hub. It displays your active persona, current phase, XP progress, and recent notifications. Use the sidebar to access Missions, Resources, and the Command Console.
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                                    <h3 className="mb-3 text-xl font-semibold text-white">2. Tools & Resources</h3>
                                    <p className="text-sm leading-relaxed text-white/60">
                                        Access the <strong>Resource Library</strong> for curated guides, code snippets, and templates. The <strong>Playground</strong> allows you to test tokenomics models and governance simulations safely.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* The Journey */}
                    <section id="the-journey" className="mb-20 scroll-mt-24">
                        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                            <Rocket className="text-purple-400" size={32} />
                            <h2 className="text-3xl font-bold">The Journey</h2>
                        </div>

                        <div className="space-y-8 text-white/80">
                            <p className="leading-relaxed">
                                Your journey is structured into specialized <strong>Personas</strong> and <strong>Phases</strong>. Choosing the right persona tailors your entire experience, from the missions you receive to the agents that assist you.
                            </p>

                            <div className="space-y-6">
                                <h3 className="text-2xl font-semibold text-white">Personas</h3>
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {[
                                        { name: 'Cognitive Activation Hub', desc: 'Foundations of Web3 & Solana' },
                                        { name: 'Capital Foundry', desc: 'DeFi Infrastructure & Protocols' },
                                        { name: 'System Architect', desc: 'DePIN & Decentralized Systems' },
                                        { name: 'Experience Studio', desc: 'NFTs, Gaming & UX Design' },
                                        { name: 'Impact Engine', desc: 'DAOs & Social Impact' },
                                        { name: 'Resilience Master', desc: 'Security & Auditing' }
                                    ].map((persona) => (
                                        <div key={persona.name} className="rounded-xl border border-white/10 bg-[#1a1a2e] p-4 transition-colors hover:border-indigo-500/50">
                                            <h4 className="font-bold text-indigo-300">{persona.name}</h4>
                                            <p className="mt-2 text-sm text-white/60">{persona.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-8 space-y-6">
                                <h3 className="text-2xl font-semibold text-white">Phases</h3>
                                <div className="relative border-l-2 border-white/10 pl-8 space-y-8">
                                    {[
                                        { title: '1. Learn', desc: 'Absorb foundational knowledge and mindset.' },
                                        { title: '2. Build', desc: 'Develop practical skills and create outputs.' },
                                        { title: '3. Prove', desc: 'Validate knowledge through practical application.' },
                                        { title: '4. Activate', desc: 'Deploy and activate community participation.' },
                                        { title: '5. Scale', desc: 'Expand governance and scale solutions.' }
                                    ].map((phase, idx) => (
                                        <div key={idx} className="relative">
                                            <span className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                                                {idx + 1}
                                            </span>
                                            <h4 className="text-lg font-bold text-white">{phase.title}</h4>
                                            <p className="text-white/60">{phase.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 rounded-xl border border-indigo-500/30 bg-indigo-500/10 p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Rocket className="text-indigo-400" size={24} />
                                        <h3 className="text-xl font-bold text-white">Phase 5: Launch Criteria</h3>
                                    </div>
                                    <p className="text-white/80 mb-4">
                                        Access to the final <strong>Launch Phase</strong> is restricted to projects that meet strict validation criteria. This ensures quality and safety for the ecosystem.
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg bg-[#1a1a2e] p-4 border border-white/10">
                                            <h4 className="font-bold text-white mb-2">1. DAO Approval</h4>
                                            <p className="text-sm text-white/60">
                                                Must receive a passing vote from the DAO. Voting power is held by $MFAI stakers and Proof-of-Skill™ NFT holders.
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-[#1a1a2e] p-4 border border-white/10">
                                            <h4 className="font-bold text-white mb-2">2. Incubation Score</h4>
                                            <p className="text-sm text-white/60">
                                                Maintain an average validation score of <strong>8.0+</strong> across all "Build" and "Prove" phase missions.
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-[#1a1a2e] p-4 border border-white/10">
                                            <h4 className="font-bold text-white mb-2">3. Tokenomics Audit</h4>
                                            <p className="text-sm text-white/60">
                                                The <strong>Tokenomics Agent</strong> must validate your economic model (supply, allocation, vesting) as sustainable.
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-[#1a1a2e] p-4 border border-white/10">
                                            <h4 className="font-bold text-white mb-2">4. Collaterize Setup</h4>
                                            <p className="text-sm text-white/60">
                                                Launch via <strong>Collaterize</strong> bonding curves for instant liquidity. Automatic migration to <strong>Meteora</strong> upon curve completion.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* AI Agents */}
                    <section id="ai-agents" className="mb-20 scroll-mt-24">
                        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                            <Brain className="text-blue-400" size={32} />
                            <h2 className="text-3xl font-bold">AI Agents</h2>
                        </div>

                        <div className="space-y-6 text-white/80">
                            <p className="leading-relaxed">
                                The platform is powered by <strong>Zyno</strong>, the central orchestrator, and a team of 24 specialized agents. Each agent is an expert in a specific domain and will guide you through relevant missions.
                            </p>

                            <div className="rounded-2xl border border-indigo-500/30 bg-indigo-500/10 p-6 mb-8">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
                                        <Zap size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Zyno Orchestrator</h3>
                                        <p className="text-indigo-200">The cognitive brain. Analyzes your state, coordinates agents, and delivers personalized content.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {[
                                    { name: 'Guide Agent', role: 'Orientation & Navigation' },
                                    { name: 'Onboarding Agent', role: 'Wallet & Setup' },
                                    { name: 'Education Agent', role: 'Core Concepts & Theory' },
                                    { name: 'Builder Agent', role: 'Coding & Implementation' },
                                    { name: 'Dev Agent', role: 'Technical Troubleshooting' },
                                    { name: 'Product Agent', role: 'Strategy & Roadmap' },
                                    { name: 'Design Agent', role: 'UX/UI & User Flow' },
                                    { name: 'Tokenomics Agent', role: 'Economy Design' },
                                    { name: 'Token Agent', role: 'SPL Token Management' },
                                    { name: 'NFT Agent', role: 'Collections & Metadata' },
                                    { name: 'DAO Agent', role: 'Governance Structures' },
                                    { name: 'Governance Agent', role: 'Voting & Proposals' },
                                    { name: 'Community Agent', role: 'Growth & Engagement' },
                                    { name: 'Growth Agent', role: 'Marketing & User Acq.' },
                                    { name: 'Protocol Agent', role: 'Architecture & Standards' },
                                    { name: 'Security Agent', role: 'Systems Hardening' },
                                    { name: 'Audit Agent', role: 'Smart Contract Audits' },
                                    { name: 'Web3 Legal Agent', role: 'Compliance & Regulation' },
                                    { name: 'Pitch Agent', role: 'Deck & Storytelling' },
                                    { name: 'Investor Agent', role: 'VC Feedback Simulation' },
                                    { name: 'Launchpad Agent', role: 'Go-to-Market Strategy' },
                                    { name: 'Coach Agent', role: 'Personal Development' },
                                    { name: 'Reflection Agent', role: 'Retrospectives' },
                                ].map((agent) => (
                                    <div key={agent.name} className="flex items-start gap-3 rounded-lg border border-white/5 bg-white/5 p-4 hover:bg-white/10">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-green-400"></div>
                                        <div>
                                            <h4 className="font-bold text-white">{agent.name}</h4>
                                            <p className="text-xs text-white/50">{agent.role}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Progression */}
                    <section id="progression" className="mb-20 scroll-mt-24">
                        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                            <Trophy className="text-yellow-400" size={32} />
                            <h2 className="text-3xl font-bold">Progression & Validation</h2>
                        </div>

                        <div className="space-y-8 text-white/80">
                            <div className="rounded-2xl bg-[#1a1a2e] p-6 border border-white/10">
                                <h3 className="text-xl font-bold text-white mb-4">XP System</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3">
                                        <Target size={18} className="text-green-400" />
                                        <span><strong>Mission Score:</strong> Rated 0-10 by AI based on accuracy and depth.</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Zap size={18} className="text-yellow-400" />
                                        <span><strong>XP Calculation:</strong> Score × 10 (e.g., 8.5 score = 85 XP).</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <Shield size={18} className="text-blue-400" />
                                        <span><strong>Validation:</strong> Score ≥ 8.0 required to pass critical milestones.</span>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold text-white mb-4">Proof-of-Skill™ NFTs</h3>
                                <p className="mb-4">
                                    Upon completing a phase with a high average score, you become eligible to mint a <strong>Proof-of-Skill™ NFT</strong>. These are verifiable on-chain credentials that prove your expertise.
                                </p>
                                <div className="flex gap-4 overflow-x-auto pb-4">
                                    {['Bronze', 'Silver', 'Gold', 'Platinum'].map((tier) => (
                                        <div key={tier} className="min-w-[120px] rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                                            <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg"></div>
                                            <span className="font-bold text-white">{tier}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Economy */}
                    <section id="economy" className="mb-20 scroll-mt-24">
                        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                            <Coins className="text-green-400" size={32} />
                            <h2 className="text-3xl font-bold">Economy & DAO</h2>
                        </div>

                        <div className="grid gap-8 md:grid-cols-2">
                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white">$MFAI Token</h3>
                                <p className="text-white/70">
                                    The native utility token of the platform. Earn $MFAI by completing missions, contributing to the community, and maintaining high streaks.
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-sm text-white/60">
                                    <li>Earn via Mission Completion</li>
                                    <li>Stake for Voting Power</li>
                                    <li>Unlock Premium Content</li>
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-bold text-white">DAO Governance</h3>
                                <p className="text-white/70">
                                    Holders of staked $MFAI can participate in the DAO. Your <strong>Voting Power</strong> determines your influence on platform upgrades and treasury allocations.
                                </p>
                                <div className="rounded-lg bg-white/5 p-4">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-white/60">Voting Power Multiplier</span>
                                        <span className="text-green-400 font-bold">2x</span>
                                    </div>
                                    <div className="h-2 w-full rounded-full bg-white/10">
                                        <div className="h-full w-2/3 rounded-full bg-green-500"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Launch & Collaterize */}
                    <section id="launch" className="mb-20 scroll-mt-24">
                        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                            <Rocket className="text-pink-500" size={32} />
                            <h2 className="text-3xl font-bold">Launch & Collaterize</h2>
                        </div>

                        <div className="space-y-8 text-white/80">
                            <p className="text-lg leading-relaxed">
                                The ultimate goal of the Money Factory AI journey is to launch a successful, sustainable Web3 protocol. We utilize <strong>Collaterize</strong>, a secure launchpad mechanism that ensures fair distribution and instant liquidity.
                            </p>

                            {/* Requirements & Fees */}
                            <div className="grid gap-6 md:grid-cols-3">
                                <div className="rounded-xl bg-[#1a1a2e] p-6 border border-white/10">
                                    <h4 className="text-pink-400 font-bold mb-2 flex items-center gap-2">
                                        <Coins size={16} /> Access Requirement
                                    </h4>
                                    <p className="text-sm text-white/70">
                                        To submit a project for DAO review and launch, you must stake <strong>1,000+ $MFAI</strong>. This ensures commitment and aligns incentives.
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#1a1a2e] p-6 border border-white/10">
                                    <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
                                        <Brain size={16} /> Zyno Support
                                    </h4>
                                    <p className="text-sm text-white/70">
                                        Your launch is orchestrated by specialized agents: <strong>CFO</strong> (Tokenomics), <strong>Engineer</strong> (Contracts), <strong>Risk</strong> (Security), and <strong>Legal</strong> (Compliance).
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#1a1a2e] p-6 border border-white/10">
                                    <h4 className="text-green-400 font-bold mb-2 flex items-center gap-2">
                                        <Zap size={16} /> Ecosystem Fee
                                    </h4>
                                    <p className="text-sm text-white/70">
                                        Successful launches contribute <strong>2%</strong> of raised capital to the ecosystem, with 15% of that fee burned to support $MFAI deflation.
                                    </p>
                                </div>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="rounded-2xl border border-pink-500/30 bg-pink-500/10 p-6">
                                    <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
                                        <Zap size={20} /> The Bonding Curve
                                    </h3>
                                    <p className="text-sm leading-relaxed text-white/70 mb-4">
                                        Projects launch on a <strong>Bonding Curve</strong>. This mathematical formula determines the token price based on supply.
                                    </p>
                                    <ul className="space-y-2 text-sm text-white/60">
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400">•</span>
                                            <span><strong>Fair Launch:</strong> No pre-sale or insider allocation. Everyone buys at the curve price.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400">•</span>
                                            <span><strong>Instant Trading:</strong> Buy and sell immediately against the curve contract.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-pink-400">•</span>
                                            <span><strong>Dynamic Pricing:</strong> Price increases as more tokens are bought, rewarding early adopters.</span>
                                        </li>
                                    </ul>
                                </div>

                                <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-6">
                                    <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
                                        <Shield size={20} /> Safety & Graduation
                                    </h3>
                                    <p className="text-sm leading-relaxed text-white/70 mb-4">
                                        When the bonding curve reaches its market cap target (e.g., ~85 SOL), the project <strong>Graduates</strong>.
                                    </p>
                                    <ul className="space-y-2 text-sm text-white/60">
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-400">•</span>
                                            <span><strong>Liquidity Migration:</strong> Funds are automatically moved to a DEX (Meteora/Raydium).</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-400">•</span>
                                            <span><strong>Liquidity Lock:</strong> LP tokens are burned or locked, preventing rug pulls.</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-400">•</span>
                                            <span><strong>Renounced Ownership:</strong> Contract ownership is revoked to ensure decentralization.</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>

                            <div className="rounded-xl bg-[#1a1a2e] p-8 border border-white/10">
                                <h3 className="text-2xl font-bold text-white mb-6 text-center">The Launch Lifecycle</h3>
                                <div className="relative">
                                    {/* Connecting Line */}
                                    <div className="absolute left-[15px] top-8 h-[calc(100%-60px)] w-0.5 bg-gradient-to-b from-indigo-500 to-pink-500 md:left-1/2 md:-ml-0.5 md:h-0.5 md:w-full md:top-[15px]"></div>

                                    <div className="grid gap-8 md:grid-cols-4">
                                        {[
                                            { title: '1. Validation', desc: 'Tokenomics Audit & DAO Vote (8.0+ Score)' },
                                            { title: '2. Deployment', desc: 'Token Minting & Bonding Curve Creation' },
                                            { title: '3. Trading', desc: 'Public Buy/Sell on Curve (Price Discovery)' },
                                            { title: '4. Graduation', desc: 'DEX Listing & Liquidity Lock' }
                                        ].map((step, idx) => (
                                            <div key={idx} className="relative flex md:flex-col items-center gap-4 md:text-center">
                                                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0d0d1a] border-2 border-indigo-500 text-sm font-bold text-white">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-white">{step.title}</h4>
                                                    <p className="text-xs text-white/50">{step.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Workflow */}
                    <section id="workflow" className="mb-24 scroll-mt-24">
                        <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                            <Layers className="text-orange-400" size={32} />
                            <h2 className="text-3xl font-bold">User Workflow</h2>
                        </div>

                        <div className="relative border-l-2 border-white/10 pl-8 space-y-12">
                            {[
                                {
                                    step: '1. Onboarding',
                                    text: 'Connect your Solana wallet and select your Persona. The Onboarding Agent will configure your dashboard.'
                                },
                                {
                                    step: '2. Mission Execution',
                                    text: 'Receive missions from Zyno. Read the briefing, use the provided resources, and submit your work.'
                                },
                                {
                                    step: '3. AI Evaluation',
                                    text: 'Get immediate, multi-axis feedback. Review your scores on Accuracy, Creativity, and Technical Depth.'
                                },
                                {
                                    step: '4. Refine & Resubmit',
                                    text: 'If your score is below 8.0, use the feedback to improve your work and resubmit for higher XP.'
                                },
                                {
                                    step: '5. Phase Completion',
                                    text: 'Complete all missions in a phase to unlock the Boss Battle or Capstone Project. Mint your NFT upon success.'
                                }
                            ].map((item, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[41px] flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                        {idx + 1}
                                    </div>
                                    <h3 className="text-xl font-bold text-white">{item.step}</h3>
                                    <p className="mt-2 text-white/70">{item.text}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
};

export default GuidePage;
