import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, AEPOScore, ProgressStepper, Skeleton } from '../components/ui';
import type { JourneyStep } from '../components/ui/ProgressStepper';
import { useJourneyStore } from '../store/journeyStore';

// Default steps as fallback
const DEFAULT_STEPS: JourneyStep[] = [
  { id: '1', label: 'Wallet Setup', sublabel: 'Create secure wallet', icon: '🔐', status: 'completed' },
  { id: '2', label: 'First Deposit', sublabel: 'Add SOL to wallet', icon: '💎', status: 'completed' },
  { id: '3', label: 'Market Explorer', sublabel: 'Explore DeFi markets', icon: '📊', status: 'active' },
  { id: '4', label: 'Yield Strategy', sublabel: 'Automated yield farming', icon: '🌾', status: 'locked' },
  { id: '5', label: 'AI Agent Deploy', sublabel: 'Launch your first agent', icon: '🤖', status: 'locked' },
];

const DEFAULT_DIMENSIONS = [
  { key: 'financial', label: 'Financial', score: 78, icon: '💰' },
  { key: 'technical', label: 'Technical', score: 65, icon: '⚙️' },
  { key: 'strategic', label: 'Strategic', score: 82, icon: '🎯' },
  { key: 'network',   label: 'Network',   score: 70, icon: '🌐' },
  { key: 'risk',      label: 'Risk',      score: 88, icon: '🛡️' },
];

export default function JourneyView() {
  const [activeStep, setActiveStep] = useState('3');
  const [isLoading, setIsLoading] = useState(true);
  const [steps, setSteps] = useState<JourneyStep[]>(DEFAULT_STEPS);
  const [aepoScore, setAepoScore] = useState(78);
  const [dimensions, setDimensions] = useState(DEFAULT_DIMENSIONS);
  
  // Get data from store
  const loadUserProgress = useJourneyStore(state => state.loadUserProgress);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Try to load from API
        const progress = await loadUserProgress();
        
        // Calculate AEPO score from user progress
        const calculatedScore = progress?.totalXP 
          ? Math.min(100, Math.floor(progress.totalXP / 10) + 50)
          : 78;
        setAepoScore(calculatedScore);

        // Map progress to steps
        const completedCount = progress?.completedPhases?.length || 0;
        const mappedSteps: JourneyStep[] = DEFAULT_STEPS.map((step, index) => ({
          ...step,
          status: index < completedCount ? 'completed' 
                : index === completedCount ? 'active' 
                : 'locked',
        }));
        setSteps(mappedSteps);
        
        // Set active step
        const activeIndex = mappedSteps.findIndex(s => s.status === 'active');
        if (activeIndex >= 0) {
          setActiveStep(mappedSteps[activeIndex].id);
        }

        // Update dimensions based on progress
        const baseScore = calculatedScore;
        setDimensions([
          { key: 'financial', label: 'Financial', score: Math.min(100, baseScore + 5), icon: '💰' },
          { key: 'technical', label: 'Technical', score: Math.min(100, baseScore - 10), icon: '⚙️' },
          { key: 'strategic', label: 'Strategic', score: Math.min(100, baseScore + 10), icon: '🎯' },
          { key: 'network',   label: 'Network',   score: Math.min(100, baseScore - 5), icon: '🌐' },
          { key: 'risk',      label: 'Risk',      score: Math.min(100, baseScore + 8), icon: '🛡️' },
        ]);
      } catch (err) {
        console.warn('Failed to load journey data:', err);
        // Use defaults
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadUserProgress]);

  const currentStepData = steps.find(s => s.id === activeStep);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-[1400px] mx-auto px-6 py-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-50">Your Journey</h1>
          <p className="text-ink-400 mt-1">Progress through the Money Factory path to financial freedom</p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-[1fr_340px] gap-6">
          {/* Left - Journey Steps */}
          <Card variant="glass" className="p-6">
            <h2 className="font-display text-xl font-bold text-ink-50 mb-6">Progress Steps</h2>
            {isLoading ? (
              <div className="space-y-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-7 h-7 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-2" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <ProgressStepper 
                steps={steps} 
                orientation="vertical"
                onStepClick={setActiveStep}
              />
            )}
          </Card>

          {/* Right - AEPO Score */}
          <Card variant="solid" className="p-6">
            <h2 className="font-display text-xl font-bold text-ink-50 mb-6 text-center">Your AEPO Score</h2>
            {isLoading ? (
              <div className="flex flex-col items-center space-y-4">
                <Skeleton className="w-40 h-40 rounded-full" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <AEPOScore 
                global={aepoScore} 
                dimensions={dimensions}
                size="lg"
                showBreakdown
              />
            )}
          </Card>
        </div>

        {/* Current Step Detail */}
        <Card variant="glass" className="p-6">
          {isLoading ? (
            <div className="flex items-start gap-6">
              <Skeleton className="w-16 h-16 rounded-2xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <div className="flex gap-3 pt-2">
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-28" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-3xl">
                {currentStepData?.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2 py-1 rounded-full bg-gold-400/10 text-gold-300 text-2xs font-mono uppercase">
                    {currentStepData?.status === 'active' ? 'Active Step' : 
                     currentStepData?.status === 'completed' ? 'Completed' : 'Locked'}
                  </span>
                </div>
                <h3 className="font-display text-2xl font-bold text-ink-50">
                  {currentStepData?.label}
                </h3>
                <p className="text-ink-400 mt-1">
                  {currentStepData?.sublabel}
                </p>
                <div className="mt-4 flex gap-3">
                  <button className="px-4 py-2 bg-gold-400 text-void rounded-xl font-semibold text-sm hover:bg-gold-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={currentStepData?.status === 'locked'}>
                    {currentStepData?.status === 'completed' ? 'Review' : 'Continue'}
                  </button>
                  <button className="px-4 py-2 border border-white/10 rounded-xl font-semibold text-sm text-ink-300 hover:bg-white/5 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
}
