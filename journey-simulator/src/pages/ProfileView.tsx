import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Award, Copy } from 'lucide-react';
import { Card, Badge, Skeleton, ZynoAvatar } from '../components/ui';
import { ProofOfSkillCard } from '../components/features/ProofOfSkillCard';
import { cnftService, ProofOfSkillNFT } from '../services/cnftService';
import { solanaAgentService, AEPOHistoryPoint } from '../services/solanaAgentService';
import { useJourneyStore } from '../store/journeyStore';
import { useToast } from '../contexts/ToastContext';
import { clsx } from 'clsx';

// Recharts imports
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface ProfileStats {
  balance: number;
  balanceInUSD: number;
  nfts: number;
  transactions: number;
}

function AEPOChart({ data }: { data: AEPOHistoryPoint[] }) {
  const minScore = Math.min(...data.map(d => d.score)) - 5;
  const maxScore = Math.max(...data.map(d => d.score)) + 5;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="aepoGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFB300" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#FFB300" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis 
            dataKey="date" 
            stroke="#64748B"
            fontSize={10}
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${date.getMonth() + 1}`;
            }}
          />
          <YAxis 
            domain={[minScore, maxScore]} 
            stroke="#64748B"
            fontSize={10}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0D1017',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px',
            }}
            labelStyle={{ color: '#94A3B8' }}
            itemStyle={{ color: '#FFB300' }}
            formatter={(value) => [`Score: ${value}`, 'AEPO']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              });
            }}
          />
          <ReferenceLine y={85} stroke="#FFB300" strokeDasharray="3 3" opacity={0.5} />
          <ReferenceLine y={70} stroke="#00E5FF" strokeDasharray="3 3" opacity={0.5} />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#FFB300"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#aepoGradient)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function StatCard({ 
  label, 
  value, 
  subtext, 
  icon: Icon, 
  color,
  isLoading 
}: { 
  label: string; 
  value: string; 
  subtext?: string;
  icon: any;
  color: 'gold' | 'cyan' | 'emerald';
  isLoading?: boolean;
}) {
  const colorClasses = {
    gold: 'bg-gold-400/15 text-gold-300',
    cyan: 'bg-cyan-300/15 text-cyan-300',
    emerald: 'bg-emerald-500/15 text-emerald-400',
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-10 w-10 rounded-xl mb-3" />
        <Skeleton className="h-7 w-20 mb-1" />
        <Skeleton className="h-4 w-28" />
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center mb-3', colorClasses[color])}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold font-mono text-ink-50">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
      {subtext && <p className="text-2xs text-ink-500 mt-1">{subtext}</p>}
    </Card>
  );
}

export default function ProfileView() {
  const [isLoading, setIsLoading] = useState(true);
  const [nfts, setNfts] = useState<ProofOfSkillNFT[]>([]);
  const [aepoHistory, setAepoHistory] = useState<AEPOHistoryPoint[]>([]);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [walletAddress, setWalletAddress] = useState<string>('');
  
  const userProgress = useJourneyStore(state => state.userProgress);
  const { addToast } = useToast();

  useEffect(() => {
    const loadProfileData = async () => {
      setIsLoading(true);
      
      try {
        // Récupérer l'adresse wallet depuis le store
        const address = userProgress?.walletAddress;
        if (address) {
          setWalletAddress(address);
          
          // Charger les données en parallèle
          const [nftsData, historyData, walletStats] = await Promise.all([
            cnftService.getProofOfSkillNFTs(address),
            solanaAgentService.getAEPOHistory(),
            solanaAgentService.getWalletStats(address),
          ]);
          
          setNfts(nftsData);
          setAepoHistory(historyData);
          setStats(walletStats);
        } else {
          // Fallback avec données mockées
          setAepoHistory(await solanaAgentService.getAEPOHistory());
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        addToast({
          type: 'error',
          title: 'Erreur de chargement',
          message: 'Impossible de charger vos données de profil',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [userProgress?.walletAddress, addToast]);

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      addToast({
        type: 'success',
        title: 'Adresse copiée',
        message: 'Votre adresse wallet est dans le presse-papiers',
      });
    }
  };

  // Calculer le niveau AEPO actuel
  const currentAEPO = aepoHistory.length > 0 
    ? aepoHistory[aepoHistory.length - 1].score 
    : 74;

  const getPassLevel = (score: number) => {
    if (score >= 90) return { level: 'ELITE', color: 'gold', next: null };
    if (score >= 75) return { level: 'ADVANCED', color: 'cyan', next: 90 };
    if (score >= 60) return { level: 'INTERMEDIATE', color: 'emerald', next: 75 };
    return { level: 'STARTER', color: 'amber', next: 60 };
  };

  const passLevel = getPassLevel(currentAEPO);
  const progressToNext = passLevel.next ? ((currentAEPO - (passLevel.next - 15)) / 15) * 100 : 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1400px] mx-auto px-6 py-6"
    >
      <div className="space-y-6">
        {/* Header avec infos utilisateur */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <ZynoAvatar state="idle" size="xl" />
            <div>
              <h1 className="font-display text-3xl font-bold text-ink-50">
                Mon Profil
              </h1>
              {walletAddress ? (
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2 text-sm text-ink-400 hover:text-gold-300 transition-colors mt-1"
                >
                  <Wallet size={14} />
                  <span className="font-mono">
                    {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                  </span>
                  <Copy size={12} />
                </button>
              ) : (
                <p className="text-sm text-ink-400 mt-1">Wallet non connecté</p>
              )}
            </div>
          </div>

          {/* Badge PassLevel */}
          <div className="text-right">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className={clsx(
                'inline-flex flex-col items-center px-4 py-3 rounded-2xl border',
                passLevel.color === 'gold' && 'bg-gold-400/10 border-gold-400/30',
                passLevel.color === 'cyan' && 'bg-cyan-400/10 border-cyan-400/30',
                passLevel.color === 'emerald' && 'bg-emerald-400/10 border-emerald-400/30',
                passLevel.color === 'amber' && 'bg-amber-400/10 border-amber-400/30',
              )}
            >
              <span className={clsx(
                'text-2xs uppercase tracking-wider font-bold',
                passLevel.color === 'gold' && 'text-gold-300',
                passLevel.color === 'cyan' && 'text-cyan-300',
                passLevel.color === 'emerald' && 'text-emerald-300',
                passLevel.color === 'amber' && 'text-amber-300',
              )}>
                Niveau AEPO
              </span>
              <span className="text-xl font-display font-bold text-ink-50 mt-1">
                {passLevel.level}
              </span>
              {passLevel.next && (
                <div className="mt-2 w-32">
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className={clsx(
                        'h-full rounded-full',
                        passLevel.color === 'gold' && 'bg-gold-400',
                        passLevel.color === 'cyan' && 'bg-cyan-400',
                        passLevel.color === 'emerald' && 'bg-emerald-400',
                        passLevel.color === 'amber' && 'bg-amber-400',
                      )}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progressToNext, 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <p className="text-2xs text-ink-500 mt-1">
                    {passLevel.next - currentAEPO} pts jusqu'au prochain niveau
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <StatCard
            label="Solde SOL"
            value={isLoading ? '—' : `${stats?.balance.toFixed(4) || '0'} SOL`}
            subtext={isLoading ? undefined : `~$${stats?.balanceInUSD.toFixed(2) || '0'}`}
            icon={Wallet}
            color="gold"
            isLoading={isLoading}
          />
          <StatCard
            label="Certifications"
            value={isLoading ? '—' : nfts.length.toString()}
            subtext="Proof-of-Skill™"
            icon={Award}
            color="cyan"
            isLoading={isLoading}
          />
          <StatCard
            label="Score AEPO"
            value={isLoading ? '—' : currentAEPO.toString()}
            subtext="Sur 100 points"
            icon={TrendingUp}
            color="emerald"
            isLoading={isLoading}
          />
          <StatCard
            label="Transactions"
            value={isLoading ? '—' : stats?.transactions.toString() || '0'}
            subtext="On-chain"
            icon={TrendingUp}
            color="gold"
            isLoading={isLoading}
          />
        </div>

        {/* Graphique AEPO */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-xl font-bold text-ink-50">
                Évolution AEPO
              </h2>
              <p className="text-sm text-ink-400 mt-1">
                Progression sur les 30 derniers jours
              </p>
            </div>
            <div className="flex gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-gold-400" />
                <span className="text-ink-400">Elite (85+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-0.5 bg-cyan-400" />
                <span className="text-ink-400">Advanced (70+)</span>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <AEPOChart data={aepoHistory} />
          )}
        </Card>

        {/* Portfolio NFTs */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-bold text-ink-50">
                Portfolio Proof-of-Skill™
              </h2>
              <p className="text-sm text-ink-400 mt-1">
                Vos certifications on-chain NFT
              </p>
            </div>
            <Badge variant="gold" passLevel="ELITE">
              {nfts.length} NFTs
            </Badge>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="p-4">
                  <Skeleton className="aspect-square rounded-xl mb-4" />
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </Card>
              ))}
            </div>
          ) : nfts.length === 0 ? (
            <Card className="p-8 text-center">
              <Award size={48} className="mx-auto text-ink-500 mb-4" />
              <h3 className="text-lg font-semibold text-ink-200 mb-2">
                Aucune certification encore
              </h3>
              <p className="text-sm text-ink-400 max-w-md mx-auto">
                Complétez les phases du parcours pour mint vos premiers NFTs Proof-of-Skill™
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {nfts.map((nft, index) => (
                <ProofOfSkillCard
                  key={nft.mintAddress}
                  nft={nft}
                  index={index}
                  isNew={index === 0} // Le plus récent a l'animation
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
