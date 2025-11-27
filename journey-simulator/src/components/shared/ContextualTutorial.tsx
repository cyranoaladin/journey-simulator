import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  targetElement?: string; // ID de l'élément cible pour le focus
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface ContextualTutorialProps {
  steps: TutorialStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

const ContextualTutorial = ({
  steps,
  onComplete,
  onSkip,
  autoStart = false
}: ContextualTutorialProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(autoStart);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (autoStart) {
      setIsVisible(true);
    }
  }, [autoStart]);

  const nextStep = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        finishTutorial();
      }
      setIsAnimating(false);
    }, 300);
  };

  const prevStep = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setTimeout(() => {
      if (currentStepIndex > 0) {
        setCurrentStepIndex(prev => prev - 1);
      }
      setIsAnimating(false);
    }, 300);
  };

  const finishTutorial = () => {
    setIsVisible(false);
    if (onComplete) {
      onComplete();
    }
  };

  const skipTutorial = () => {
    setIsVisible(false);
    if (onSkip) {
      onSkip();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      skipTutorial();
    }
  };

  if (!isVisible || !currentStep) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={handleBackdropClick}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-gray-900 border border-white/20 rounded-2xl p-6 max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-white">{currentStep.title}</h3>
            <button
              onClick={skipTutorial}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
              aria-label="Close tutorial"
            >
              <X size={20} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-300 leading-relaxed">{currentStep.content}</p>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              Step {currentStepIndex + 1} of {steps.length}
            </div>

            <div className="flex gap-2">
              {currentStepIndex > 0 && (
                <button
                  onClick={prevStep}
                  className="px-4 py-2 rounded-lg border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft size={16} className="inline mr-1" />
                  Prev
                </button>
              )}

              <button
                onClick={nextStep}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-purple-600 text-white hover:from-cyan-700 hover:to-purple-700 transition-all flex items-center"
              >
                {currentStepIndex < steps.length - 1 ? (
                  <>
                    Next
                    <ChevronRight size={16} className="inline ml-1" />
                  </>
                ) : (
                  'Finish'
                )}
              </button>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <div className="flex gap-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${index === currentStepIndex
                      ? 'w-4 bg-gradient-to-r from-cyan-500 to-purple-500'
                      : 'w-1.5 bg-gray-700'
                    }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContextualTutorial;