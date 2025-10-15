import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useJourneyStore } from "../../store/journeyStore";
import { JourneyPhase } from "../../types/journey";

interface JourneyTimelineProps {
  phases: JourneyPhase[];
  currentPhase: number;
  onPhaseChange: (index: number) => void;
}

const JourneyTimeline: React.FC<JourneyTimelineProps> = ({
  phases,
  currentPhase,
  onPhaseChange,
}) => {
  const { userProgress, loadUserProgress } = useJourneyStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-refresh progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        await loadUserProgress();
      } catch (error) {
        console.error("Failed to auto-refresh timeline:", error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loadUserProgress]);

  // Handle phase change with backend sync
  const handlePhaseChange = async (index: number) => {
    if (index > userProgress.completedPhases.length) return; // Can't skip ahead

    try {
      setIsLoading(true);
      setError(null);

      // Update current phase in backend if needed
      // This could be implemented as a separate API call if needed
      await loadUserProgress();

      // Call the original onPhaseChange callback
      onPhaseChange(index);
    } catch (error) {
      console.error("Failed to change phase:", error);
      setError("Failed to update phase. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-12">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="text-red-400">⚠️</div>
            <span className="text-red-300 text-sm">{error}</span>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        {/* Timeline Track */}
        <div className="h-1 bg-white/10 rounded-full w-full absolute top-5 z-0"></div>

        {/* Progress Bar */}
        <motion.div
          className="h-1 bg-gradient-primary rounded-full absolute top-5 z-0"
          initial={{ width: "0%" }}
          animate={{
            width: `${Math.min((userProgress.completedPhases.length / phases.length) * 100, 100)}%`,
          }}
          transition={{ duration: 1, ease: "easeOut" }}
        />

        {/* Phase Markers */}
        <div className="flex justify-between relative z-10">
          {phases.map((phase, index) => {
            const isCompleted = userProgress.completedPhases.includes(index);
            const isCurrent = index === currentPhase;
            const isLocked = index > userProgress.completedPhases.length;

            return (
              <motion.div
                key={phase.id}
                className="flex flex-col items-center"
                whileHover={{ scale: isLoading ? 1 : 1.05 }}
                onClick={() =>
                  !isLocked && !isLoading && handlePhaseChange(index)
                }
              >
                {/* Phase Circle */}
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isLoading ? "cursor-wait" : "cursor-pointer"
                  } ${
                    isCompleted
                      ? "bg-gradient-primary text-white"
                      : isCurrent
                        ? "bg-gradient-primary text-white animate-pulse"
                        : "bg-white/10 text-white/50"
                  }`}
                  whileTap={{ scale: isLoading ? 1 : 0.95 }}
                >
                  {isLoading && isCurrent ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : isCompleted ? (
                    "✓"
                  ) : (
                    index + 1
                  )}
                </motion.div>

                {/* Phase Title */}
                <div
                  className={`text-sm font-medium mt-2 ${isLocked ? "opacity-50" : ""}`}
                >
                  {phase.title}
                </div>

                {/* XP Reward */}
                <div
                  className={`text-xs opacity-60 ${isLocked ? "opacity-30" : ""}`}
                >
                  {phase.xpReward} XP
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default JourneyTimeline;
