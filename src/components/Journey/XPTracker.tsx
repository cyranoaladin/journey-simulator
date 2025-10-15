import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { useJourneyStore } from "../../store/journeyStore";

interface XPTrackerProps {
  currentXP: number;
  phaseXP?: number;
  nextRewardAt?: number;
}

const XPTracker: React.FC<XPTrackerProps> = ({
  currentXP,
  phaseXP = 0,
  nextRewardAt = 0,
}) => {
  const { userProgress, loadUserProgress } = useJourneyStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Auto-sync XP every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await loadUserProgress();
        setLastSync(new Date());
      } catch (error) {
        console.error("Failed to sync XP:", error);
        setError("Failed to sync XP data");
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadUserProgress]);

  // Manual refresh function
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      await loadUserProgress();
      setLastSync(new Date());
    } catch (error) {
      console.error("Failed to refresh XP:", error);
      setError("Failed to refresh XP data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate level based on XP
  const level = Math.floor(currentXP / 200) + 1;

  // Calculate progress to next level
  const nextLevelXP = level * 200;
  const prevLevelXP = (level - 1) * 200;
  const progressToNextLevel =
    ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;

  // Determine if user has a pass boost
  const hasPassBoost = userProgress.passLevel !== "Free";
  const boostMultiplier =
    userProgress.passLevel === "Diamond"
      ? 1.5
      : userProgress.passLevel === "Platinum"
        ? 1.3
        : userProgress.passLevel === "Gold"
          ? 1.2
          : 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Trophy className="text-accent-gold" size={24} />
          <h3 className="font-space font-semibold text-lg">XP Tracker</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="text-sm bg-white/10 px-2 py-1 rounded">
            Level {level}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-1 hover:bg-white/10 rounded transition-all disabled:opacity-50"
            title="Refresh XP data"
          >
            <RefreshCw
              size={14}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </motion.button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle size={16} className="text-red-400" />
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* Last Sync Info */}
      {lastSync && (
        <div className="mb-4 text-xs opacity-60 text-center">
          Last synced: {lastSync.toLocaleTimeString()}
        </div>
      )}

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>Progress to Level {level + 1}</span>
          <span>
            {currentXP} / {nextLevelXP} XP
          </span>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressToNextLevel}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-primary rounded-full"
          />
        </div>
      </div>

      {/* Recent XP Gain */}
      {phaseXP > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <TrendingUp className="text-green-400" size={16} />
            <span className="font-semibold">+{phaseXP} XP earned</span>
          </div>
          <p className="text-xs mt-1 opacity-80">
            From your latest completed phase
          </p>
        </motion.div>
      )}

      {/* Pass Boost */}
      {hasPassBoost && (
        <div className="mb-4 p-3 bg-gradient-primary/20 border border-primary-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <Star className="text-accent-gold" size={16} />
            <span className="font-semibold">
              {userProgress.passLevel} Pass Boost
            </span>
          </div>
          <p className="text-xs mt-1 opacity-80">
            {Math.round((boostMultiplier - 1) * 100)}% XP boost on all
            activities
          </p>
        </div>
      )}

      {/* Next Reward */}
      {nextRewardAt > 0 && (
        <div className="text-sm">
          <div className="flex justify-between mb-1">
            <span>Next reward at:</span>
            <span>{nextRewardAt} XP</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-gold rounded-full"
              style={{
                width: `${Math.min((currentXP / nextRewardAt) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-xs mt-2 opacity-60 text-center">
            {nextRewardAt - currentXP} XP needed for next reward
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default XPTracker;
