import { motion } from 'framer-motion';
import { Rocket, Users, Clock, Lock, Unlock } from 'lucide-react';
import { Card, Badge, ZynoAvatar } from '../components/ui';

interface Project {
  id:          string;
  name:        string;
  description: string;
  status:      'live' | 'upcoming' | 'ended';
  raised:      number;
  goal:        number;
  participants: number;
  endDate:     string;
  token:       string;
  price:       number;
}

const PROJECTS: Project[] = [
  {
    id: '1',
    name: 'NeuroYield AI',
    description: 'Neural network-powered yield optimization protocol with real-time strategy adaptation',
    status: 'live',
    raised: 1250000,
    goal: 2000000,
    participants: 342,
    endDate: '2025-01-25',
    token: 'NYAI',
    price: 0.05,
  },
  {
    id: '2',
    name: 'QuantumDEX',
    description: 'Next-generation DEX with quantum-resistant cryptography and zero-knowledge proofs',
    status: 'upcoming',
    raised: 0,
    goal: 3000000,
    participants: 0,
    endDate: '2025-02-01',
    token: 'QDEX',
    price: 0.08,
  },
  {
    id: '3',
    name: 'SolanaGuard',
    description: 'Decentralized insurance protocol for Solana DeFi positions',
    status: 'live',
    raised: 890000,
    goal: 1500000,
    participants: 198,
    endDate: '2025-01-18',
    token: 'GUARD',
    price: 0.12,
  },
];

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const progress = Math.min((project.raised / project.goal) * 100, 100);
  const isLive = project.status === 'live';
  const isUpcoming = project.status === 'upcoming';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card 
        variant={isLive ? 'glow' : 'glass'} 
        className="p-5 group hover:scale-[1.01] transition-transform duration-300 overflow-hidden"
      >
        {/* Status Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gold-400/20 to-cyan-300/20 flex items-center justify-center text-2xl">
              🚀
            </div>
            <div>
              <h3 className="font-display text-lg font-semibold text-ink-100">{project.name}</h3>
              <p className="text-xs text-ink-400">${project.token} • ${project.price}</p>
            </div>
          </div>
          <Badge variant={isLive ? 'success' : isUpcoming ? 'cyan' : 'default'}>
            {isLive ? '● LIVE' : isUpcoming ? 'UPCOMING' : 'ENDED'}
          </Badge>
        </div>

        <p className="text-sm text-ink-300 mb-4 line-clamp-2">{project.description}</p>

        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs">
            <span className="text-ink-400">Raised</span>
            <span className="text-ink-200 font-mono">{(project.raised / 1000000).toFixed(2)}M / {(project.goal / 1000000).toFixed(2)}M USDC</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div 
              className="h-full rounded-full bg-gradient-to-r from-gold-400 to-cyan-300"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="flex justify-between text-2xs text-ink-500">
            <span className="flex items-center gap-1">
              <Users size={10} /> {project.participants} participants
            </span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> Ends {project.endDate}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-white/5">
          {isLive ? (
            <>
              <button className="flex-1 py-2.5 bg-gold-400 text-void rounded-xl font-semibold text-sm hover:bg-gold-300 transition-colors flex items-center justify-center gap-2">
                <Lock size={14} /> Invest Now
              </button>
              <button className="px-4 py-2.5 border border-white/10 rounded-xl text-sm font-semibold text-ink-300 hover:bg-white/5 transition-colors">
                Details
              </button>
            </>
          ) : isUpcoming ? (
            <button className="w-full py-2.5 bg-cyan-400/10 text-cyan-300 rounded-xl font-semibold text-sm hover:bg-cyan-400/20 transition-colors flex items-center justify-center gap-2">
              <Unlock size={14} /> Whitelist
            </button>
          ) : (
            <button className="w-full py-2.5 bg-white/5 text-ink-500 rounded-xl text-sm font-semibold cursor-not-allowed">
              Closed
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

export default function LaunchpadView() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-ink-50">Launchpad</h1>
            <p className="text-ink-400 mt-1">Discover and invest in the next generation of DeFi protocols</p>
          </div>
          <button className="px-4 py-2 bg-gold-400 text-void rounded-xl font-semibold text-sm hover:bg-gold-300 transition-colors flex items-center gap-2">
            <Rocket size={16} /> Submit Project
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Raised', value: '$8.2M', sub: 'all time' },
            { label: 'Projects', value: '12', sub: 'launched' },
            { label: 'Participants', value: '2,847', sub: 'unique' },
            { label: 'Avg ROI', value: '234%', sub: '30d post-launch' },
          ].map((stat, i) => (
            <Card key={i} variant="solid" className="p-4">
              <p className="text-2xs text-ink-500 uppercase tracking-wider">{stat.label}</p>
              <p className="font-display text-2xl font-bold text-ink-50 mt-1">{stat.value}</p>
              <p className="text-xs text-ink-400 mt-0.5">{stat.sub}</p>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 pb-2">
          <button className="px-4 py-2 rounded-xl bg-gold-400/10 text-gold-300 text-sm font-semibold">
            All Projects
          </button>
          <button className="px-4 py-2 rounded-xl text-ink-400 text-sm font-semibold hover:bg-white/5 transition-colors">
            Live
          </button>
          <button className="px-4 py-2 rounded-xl text-ink-400 text-sm font-semibold hover:bg-white/5 transition-colors">
            Upcoming
          </button>
          <button className="px-4 py-2 rounded-xl text-ink-400 text-sm font-semibold hover:bg-white/5 transition-colors">
            Ended
          </button>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-3 gap-5">
          {PROJECTS.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>

        {/* Info Banner */}
        <Card variant="info" className="p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-400/10 flex items-center justify-center">
            <ZynoAvatar state="speaking" size="md" />
          </div>
          <div className="flex-1">
            <h4 className="font-display text-lg font-semibold text-ink-100">Zyno AI Project Analysis</h4>
            <p className="text-sm text-ink-400">Get AI-powered due diligence on any launchpad project before investing.</p>
          </div>
          <button className="px-4 py-2 bg-cyan-400/10 text-cyan-300 rounded-xl font-semibold text-sm hover:bg-cyan-400/20 transition-colors">
            Analyze Projects
          </button>
        </Card>
      </motion.div>
    </div>
  );
}
