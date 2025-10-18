import { motion } from 'framer-motion';
import { Trophy, Coins, Award, Rocket, Vote } from 'lucide-react';
import { useJourneyStore } from '../../store/journeyStore';

const JourneyDashboard = () => {
  const { userProgress, selectedPersona } = useJourneyStore();

  const getPassGradient = (level: string) => {
    switch (level) {
      case 'Gold': return 'bg-gradient-gold';
      case 'Platinum': return 'bg-gradient-platinum';
      case 'Diamond': return 'bg-gradient-diamond';
      default: return 'bg-gradient-primary';
    }
  };

  const getVotingPowerColor = (power: number) => {
    if (power >= 1000) return 'text-purple-400';
    if (power >= 500) return 'text-blue-400';
    if (power >= 100) return 'text-green-400';
    return 'text-gray-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* XP & Level */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <Trophy className="text-accent-gold" size={24} />
          <span className="text-base opacity-80">Total XP</span>
        </div>
        <div className="text-2xl font-space font-bold mb-2">
          {userProgress.totalXP.toLocaleString()}
        </div>
        <div className="w-full bg-white/10 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((userProgress.totalXP / 2000) * 100, 100)}%` }}
            className="h-full bg-gradient-primary rounded-full"
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="text-sm opacity-60 mt-2">
          Level {Math.floor(userProgress.totalXP / 200) + 1}
        </div>
      </motion.div>

      {/* $MFAI Tokens */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <Coins className="text-accent-gold" size={24} />
          <span className="text-base opacity-80">$MFAI</span>
        </div>
        <div className="text-2xl font-space font-bold mb-2">
          {userProgress.mfaiTokens.toFixed(1)}
        </div>
        <div className="text-sm opacity-60">
          Staked: {userProgress.stakedMfai.toFixed(1)} $MFAI
        </div>
        <div className="text-sm text-accent-cyan mt-1">
          APY: {userProgress.stakedMfai > 0 ? '12.5%' : '0%'}
        </div>
      </motion.div>

      {/* Voting Power */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <Vote className="text-accent-purple" size={24} />
          <span className="text-base opacity-80">Voting Power</span>
        </div>
        <div className={`text-2xl font-space font-bold mb-2 ${getVotingPowerColor(userProgress.votingPower)}`}>
          {userProgress.votingPower}
        </div>
        <div className="text-sm opacity-60">
          Proposals: {userProgress.daoProposals}
        </div>
        <div className="text-sm text-accent-cyan mt-1">
          {userProgress.votingPower >= 100 ? 'Active DAO' : 'Observer'}
        </div>
      </motion.div>

      {/* Access Pass */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-4">
          <Award className="text-accent-gold" size={24} />
          <span className="text-base opacity-80">Access Pass</span>
        </div>
        <div className={`text-lg font-space font-bold mb-2 ${getPassGradient(userProgress.passLevel)} text-transparent bg-clip-text`}>
          {userProgress.passLevel}
        </div>
        <div className="text-sm opacity-60">
          NFTs: {userProgress.nfts.length}
        </div>
        <div className="text-sm text-accent-cyan mt-1">
          {userProgress.passLevel === 'Free' ? 'Upgrade available' : 'Premium active'}
        </div>
      </motion.div>

      {/* Journey Progress */}
      {selectedPersona && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card md:col-span-2 lg:col-span-4"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Rocket className="text-accent-cyan" size={24} />
              <span className="font-space font-semibold">Journey: {selectedPersona.title}</span>
            </div>
            <span className="text-sm opacity-80">
              {userProgress.completedPhases.length}/{selectedPersona.phases.length} phases
            </span>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            {selectedPersona.phases.map((phase, index) => {
              const isCompleted = userProgress.completedPhases.includes(index);
              const isCurrent = index === userProgress.completedPhases.length;

              return (
                <div key={phase.id} className="text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    isCompleted ? 'bg-gradient-primary text-white' :
                    isCurrent ? 'bg-gradient-primary text-white animate-pulse' :
                    'bg-white/10 text-white/50'
                  }`}>
                    {isCompleted ? '✓' : index + 1}
                  </div>
                  <div className="text-xs font-medium">{phase.title}</div>
                  <div className="text-xs opacity-60">{phase.xpReward} XP</div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default JourneyDashboard;
