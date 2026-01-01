import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle,
  Coins,
  DollarSign,
  Hammer,
  Loader2,
  Lock,
  MessageSquare,
  Palette,
  Play,
  Rocket,
  Shield,
  Target,
  Trophy,
  Vote,
  Zap,
} from 'lucide-react';
import type { FC } from 'react';
import { useState } from 'react';
import { getProofType } from '../../data/proofsData';
import { useJourneyStore } from '../../store/journeyStore';
import { JourneyPhase } from '../../types/journey';
import { generateStableKey } from '../../utils/generateStableKey';
import { renderHighlightedText } from '../../utils/renderHighlightedText';
import MintCelebrationBanner from '../MintCelebrationBanner';
import UIBlocksRenderer from '../UIBlocks/UIBlocksRenderer';
import type { AgentTimelineEntry } from '../Zyno/types';
import PhaseInteractionBlock from './PhaseInteractionBlock';

interface PhaseSectionProps {
  phase: JourneyPhase;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  onComplete: () => Promise<void> | void;
  onMintNFT?: () => void;
  onStake?: () => void;
  onVote?: () => void;
  isProcessing?: boolean;
  activeStep?: AgentTimelineEntry | null;
  onFeedbackRequest?: (step: AgentTimelineEntry) => void;
}

const PhaseSection: FC<PhaseSectionProps> = ({
  phase,
  isCompleted,
  isCurrent,
  isLocked,
  onComplete,
  onMintNFT,
  onStake,
  onVote,
  isProcessing = false,
  activeStep,
  onFeedbackRequest,
}) => {
  const { selectedPersona, lastStep, runInteractiveStep, uiMode, uiTone, setUiMode, setUiTone, openModal, isStepLoading } = useJourneyStore();
  const [stepError, setStepError] = useState<string | null>(null);

  const getButtonState = () => {
    if (isProcessing) {
      return {
        text: 'Processing...',
        disabled: true,
        icon: <Loader2 size={16} className="animate-spin" />,
      };
    }
    if (isLocked) return { text: 'Locked', disabled: true, icon: <Lock size={16} /> };
    if (isCompleted) return { text: 'Completed', disabled: true, icon: <CheckCircle size={16} /> };
    if (isCurrent) return { text: 'Start Phase', disabled: false, icon: <Play size={16} /> };
    return { text: 'Available', disabled: false, icon: <ArrowRight size={16} /> };
  };

  const buttonState = getButtonState();

  const handlePhaseCompletion = async () => {
    if (buttonState.disabled) return;

    try {
      await onComplete();
    } catch (error) {
      console.error('Phase completion handler failed:', error);
    }
  };

  const getProofTypeForPhase = () => {
    if (!selectedPersona) return 'Skill';
    return getProofType(selectedPersona.id, phase.id);
  };

  const getPhaseIcon = () => {
    if (phase.isIncubation) return <Rocket size={20} />;
    if (phase.isLaunchpad) return <Trophy size={20} />;
    if (phase.daoVoteRequired) return <Vote size={20} />;
    if (phase.stakingRequired) return <Coins size={20} />;

    const proofType = getProofTypeForPhase();
    switch (proofType) {
      case 'Skill':
        return <Zap size={20} />;
      case 'Vision':
        return <Target size={20} />;
      case 'Yield':
        return <BarChart3 size={20} />;
      case 'Build':
        return <Hammer size={20} />;
      case 'Creation':
        return <Palette size={20} />;
      case 'Orchestration':
        return <MessageSquare size={20} />;
      case 'Design':
        return <Award size={20} />;
      case 'Invest':
        return <DollarSign size={20} />;
      case 'Security':
        return <Shield size={20} />;
      default:
        return <Zap size={20} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`border-2 rounded-xl p-6 transition-all duration-300 ${(() => {
        // Extract nested ternary into explicit variable
        if (isCompleted) {
          return 'border-green-500 bg-green-500/10';
        }
        if (isCurrent) {
          return 'border-primary-500 bg-primary-500/10';
        }
        if (isLocked) {
          return 'border-gray-600 bg-gray-600/10';
        }
        return 'border-gray-500 bg-gray-500/10';
      })()}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${(() => {
              // Extract nested ternary into explicit variable
              if (isCompleted) {
                return 'bg-green-500';
              }
              if (isCurrent) {
                return 'bg-primary-500';
              }
              return 'bg-gray-600';
            })()}`}
          >
            {getPhaseIcon()}
          </div>
          <div>
            <h3 className="font-space font-semibold text-lg">{phase.title}</h3>
            <p className="text-sm opacity-80">{phase.duration}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          {phase.isIncubation && (
            <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">
              Incubation
            </span>
          )}
          {phase.isLaunchpad && (
            <span className="px-2 py-1 bg-gold-500/20 text-gold-400 text-xs rounded-full">
              Launchpad
            </span>
          )}
          {phase.daoVoteRequired && (
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
              DAO Vote
            </span>
          )}
        </div>
      </div>

      <p className="text-sm opacity-90 mb-4">{phase.description}</p>

      <div className="mb-4">
        <PhaseInteractionBlock
          phaseId={phase.id}
          currentStep={activeStep ?? null}
          onFeedback={onFeedbackRequest}
        />
      </div>

      <div className="bg-white/5 rounded-lg p-3 mb-4">
        <h4 className="font-semibold text-sm mb-2">Mission</h4>
        <p className="text-sm">{renderHighlightedText(phase.mission)}</p>
      </div>

      {phase.modules && phase.modules.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-3">Modules & Deliverables</h4>
          <div className="space-y-2">
            {phase.modules.map((module) => {
              const moduleKey = generateStableKey(module, 'module', ['title', 'id']);
              return (
                <div key={moduleKey} className="bg-white/5 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="font-medium text-sm">{module.title}</h5>
                    <span className="text-xs bg-accent-gold/20 text-accent-gold px-2 py-1 rounded-full">
                      {module.reward}
                    </span>
                  </div>
                  <p className="text-xs opacity-80 mb-2">{module.description}</p>
                  <div className="text-xs">
                    <span className="font-semibold">Deliverable:</span> {module.deliverable}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Tools & Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {phase.tools.map((tool) => {
            const toolKey = generateStableKey({ name: tool }, 'tool', ['name']);
            return (
              <div key={toolKey} className="text-xs bg-white/5 rounded px-2 py-1">
                {tool}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive UI Blocks (Zyno) */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-sm">Interactive Phase (Zyno)</h4>
          <div className="flex items-center gap-2 text-xs">
            <select
              value={uiMode}
              onChange={(e) => setUiMode(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded px-2 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="discovery">Discovery</option>
              <option value="builder">Builder</option>
              <option value="expert">Expert</option>
            </select>
            <select
              value={uiTone}
              onChange={(e) => setUiTone(e.target.value as any)}
              className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded px-2 py-1 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="pedagogical">Pedagogical</option>
              <option value="investor_pitch">Investor Pitch</option>
              <option value="critical">Critical</option>
            </select>
            <button
              className="px-3 py-1.5 rounded bg-gradient-primary text-white"
              onClick={async () => {
                try {
                  setStepError(null);
                  await runInteractiveStep({ phaseId: phase.id, trackId: selectedPersona?.id || 'track' });
                } catch (e: any) {
                  setStepError(e?.message || 'Error loading phase.');
                }
              }}
              disabled={isProcessing || isStepLoading}
            >
              {isStepLoading ? <Loader2 size={14} className="animate-spin" /> : 'Launch Step'}
            </button>
          </div>
        </div>
        {stepError && (
          <div className="mb-2 rounded-lg border border-red-500/40 bg-red-600/15 text-red-200 text-xs px-3 py-2">
            {stepError}
          </div>
        )}
        {lastStep && (
          <>
            {/* Mint celebration banner when evaluation score is high */}
            {(() => {
              try {
                const evalBlock = (lastStep as any)?.ui_blocks?.find((b: any) => b.kind === 'evaluation_block');
                if (!evalBlock) return null;
                const score = Number(evalBlock.global_score || 0);
                const maxScore = Number(evalBlock.max_score || 100);
                const threshold = Math.max(70, Math.round(maxScore * 0.6));
                if (score < threshold) return null;
                const phaseId = (lastStep as any)?.metadata?.phase_id || 'phase';
                return (
                  <div className="mb-2">
                    <MintCelebrationBanner
                      score={score}
                      maxScore={maxScore}
                      phaseId={phaseId}
                      onMint={() => {
                        const cert = {
                          id: `proof-${phaseId}`,
                          name: `Proof-of-Skill™: ${phaseId}`,
                          description: evalBlock.feedback || 'Skill certification',
                          imageUrl: '',
                          attributes: [
                            { trait_type: 'Score', value: `${score}/${maxScore}` },
                            { trait_type: 'Phase', value: phaseId },
                          ]
                        };
                        openModal({ type: 'certification', certification: cert });
                      }}
                    />
                  </div>
                );
              } catch { return null; }
            })()}
            {isStepLoading ? (
              <div className="rounded-xl border border-white/10 p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-white/10 rounded w-1/3" />
                  <div className="h-24 bg-white/10 rounded" />
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ) : lastStep ? (
              <UIBlocksRenderer response={lastStep} />
            ) : null}
          </>
        )}
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-sm mb-2">Expected Outcomes</h4>
        <div className="grid gap-1">
          {phase.outcomes.map((outcome) => {
            const outcomeKey = generateStableKey({ text: outcome }, 'outcome', ['text']);
            return (
              <div key={outcomeKey} className="flex items-center text-xs">
                <CheckCircle size={12} className="mr-2 text-green-400 flex-shrink-0" />
                <span>{outcome}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="text-center">
          <Trophy className="text-accent-gold mx-auto mb-1" size={16} />
          <div className="text-xs font-semibold">{phase.xpReward} XP</div>
        </div>

        {phase.mfaiReward && (
          <div className="text-center">
            <Coins className="text-accent-gold mx-auto mb-1" size={16} />
            <div className="text-xs font-semibold">{phase.mfaiReward} $MFAI</div>
          </div>
        )}

        {phase.nftReward && (
          <div className="text-center">
            <Award className="text-accent-purple mx-auto mb-1" size={16} />
            <div className="text-xs font-semibold">Proof-of-{getProofTypeForPhase()}™</div>
          </div>
        )}

        {phase.stakingRequired && (
          <div className="text-center">
            <Zap className="text-accent-cyan mx-auto mb-1" size={16} />
            <div className="text-xs font-semibold">Staking</div>
          </div>
        )}
      </div>

      {phase.requirements && phase.requirements.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-sm mb-2">Prerequisites</h4>
          <ul className="text-xs space-y-1">
            {phase.requirements.map((req) => {
              const reqKey = generateStableKey({ text: req }, 'requirement', ['text']);
              return (
                <li key={reqKey} className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-primary-500 rounded-full" />
                  <span>{req}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="bg-gradient-primary/20 border border-primary-500/30 rounded-lg p-3 mb-4">
        <div className="flex items-start space-x-2">
          <div className="w-6 h-6 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">Z</span>
          </div>
          <div>
            <h4 className="font-semibold text-xs mb-1">Zyno says:</h4>
            <p className="text-xs italic opacity-90">
              {renderHighlightedText(phase.zynoTip)}
            </p>
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: buttonState.disabled ? 1 : 1.02 }}
        whileTap={{ scale: buttonState.disabled ? 1 : 0.98 }}
        onClick={handlePhaseCompletion}
        disabled={buttonState.disabled}
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${buttonState.disabled
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-gradient-primary text-white hover:shadow-lg'
          }`}
      >
        {buttonState.icon}
        <span>{buttonState.text}</span>
      </motion.button>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
        {isCompleted && phase.nftReward && onMintNFT && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onMintNFT}
            className="py-2 px-4 rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white transition-all flex items-center justify-center space-x-2"
          >
            <Award size={16} />
            <span>View Proof-of-{getProofTypeForPhase()}™</span>
          </motion.button>
        )}

        {phase.stakingRequired && onStake && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStake}
            disabled={isLocked || isProcessing}
            className={`py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${isLocked || isProcessing
              ? 'border border-gray-600 text-gray-500 cursor-not-allowed'
              : 'border border-accent-cyan text-accent-cyan hover:bg-accent-cyan hover:text-black'
              }`}
          >
            <Coins size={16} />
            <span>Stake $MFAI</span>
          </motion.button>
        )}

        {phase.daoVoteRequired && onVote && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onVote}
            disabled={isLocked || isProcessing}
            className={`py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2 ${isLocked || isProcessing
              ? 'border border-gray-600 text-gray-500 cursor-not-allowed'
              : 'border border-accent-purple text-accent-purple hover:bg-accent-purple hover:text-white'
              }`}
          >
            <Vote size={16} />
            <span>DAO Vote</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default PhaseSection;
