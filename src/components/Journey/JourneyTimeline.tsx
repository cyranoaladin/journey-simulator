import React from 'react';
import { motion } from 'framer-motion';
import { useJourneyStore } from '../../store/journeyStore';
import { JourneyPhase } from '../../types/journey';

interface JourneyTimelineProps {
  phases: JourneyPhase[];
  currentPhase: number;
  onPhaseChange: (index: number) => void;
}

const JourneyTimeline: React.FC<JourneyTimelineProps> = ({ 
  phases, 
  currentPhase, 
  onPhaseChange 
}) => {
  const { userProgress } = useJourneyStore();

  return (
    <div className="mb-12">
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
          initial={{ width: '0%' }}
          animate={{ 
            width: `${Math.min((userProgress.completedPhases.length / phases.length) * 100, 100)}%` 
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
                whileHover={{ scale: 1.05 }}
                onClick={() => !isLocked && onPhaseChange(index)}
              >
                {/* Phase Circle */}
                <motion.div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center cursor-pointer ${
                    isCompleted 
                      ? 'bg-gradient-primary text-white' 
                      : isCurrent 
                        ? 'bg-gradient-primary text-white animate-pulse' 
                        : 'bg-white/10 text-white/50'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isCompleted ? '✓' : index + 1}
                </motion.div>
                
                {/* Phase Title */}
                <div className={`text-sm font-medium mt-2 ${isLocked ? 'opacity-50' : ''}`}>
                  {phase.title}
                </div>
                
                {/* XP Reward */}
                <div className={`text-xs opacity-60 ${isLocked ? 'opacity-30' : ''}`}>
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