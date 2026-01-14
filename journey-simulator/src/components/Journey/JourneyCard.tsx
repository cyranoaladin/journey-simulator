/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import React, { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Compass, Target, RefreshCw } from 'lucide-react';
import { useJourneyStore } from '../../store/journeyStore';
import { Persona } from '../../types/journey';
import { api } from '../../utils/api';

interface JourneyCardProps {
  persona: Persona;
  onSelected?: () => void;
}

const JourneyCard: React.FC<JourneyCardProps> = ({ persona, onSelected }) => {
  const { setSelectedPersona, userProgress, loadUserProgress } = useJourneyStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const isActivePersona = userProgress.currentPersona === persona.id;
  const completedCount = isActivePersona ? userProgress.completedPhases.length : 0;
  const hasStarted = completedCount > 0;
  const progressPercentage = hasStarted
    ? Math.min((completedCount / persona.phases.length) * 100, 100)
    : 0;

  const spotlightPhases = useMemo(() => persona.phases.slice(0, 3), [persona.phases]);
  const upcomingPhase = useMemo(() => {
    if (!isActivePersona) return persona.phases[0];
    return persona.phases[Math.min(completedCount, persona.phases.length - 1)];
  }, [completedCount, isActivePersona, persona.phases]);
  const certificatePreview = useMemo(() => `/images/certificates/${persona.id}.png`, [persona.id]);

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, ease: [0.23, 1, 0.32, 1] },
    },
  } as const;

  const handlePersonaSelection = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Set persona in store only if no callback provided (otherwise let parent/URL handle it)
      if (!onSelected) {
        setSelectedPersona(persona);
      }

      // Update user profile with selected persona in backend
      try {
        await api.updateUserProfile({ persona: persona.id as any });
      } catch (profileError) {
        console.error('Failed to update user profile:', profileError);
      }

      // Reload user progress to get latest data
      try {
        await loadUserProgress();
      } catch (progressError) {
        console.error('Failed to reload user progress:', progressError);
      }

      onSelected?.();
    } catch (error) {
      console.error('Failed to select persona:', error);
      setError('Failed to select journey. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // NOTE: Demo is now a separate, explicit workflow under /journeys/demo.
  // We intentionally do not expose "Load Demo State" in the real journeys list to avoid UX confusion.

  const getPersonaIcon = () => {
    switch (persona.id) {
      case 'cognitive-activation-hub':
        return '';
      case 'capital-foundry':
        return '';
      case 'system-architect':
        return '';
      case 'experience-studio':
        return '';
      case 'impact-engine':
        return '';
      case 'resilience-master':
        return '';
      default:
        return persona.icon;
    }
  };

  return (
    <motion.article
      variants={shouldReduceMotion ? undefined : cardVariants}
      initial={shouldReduceMotion ? false : 'hidden'}
      whileInView={shouldReduceMotion ? undefined : 'visible'}
      viewport={shouldReduceMotion ? undefined : { once: true, margin: '-80px' }}
      whileHover={shouldReduceMotion ? undefined : { y: -8, rotateX: -1.8 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
      className={`neon-border card-surface-layer relative flex flex-col gap-6 overflow-hidden p-6 text-left transition-transform duration-500 ease-out-quart motion-safe:hover:shadow-neon-ring ${isActivePersona ? 'ring-2 ring-accent-neon ring-offset-2 ring-offset-white dark:ring-offset-mfai-surface' : ''
        }`}
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex flex-1 flex-col gap-5">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
            <div className="flex items-center gap-4">
              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-r ${persona.color} text-3xl shadow-neon-ring`}
              >
                <span aria-hidden>{getPersonaIcon()}</span>
              </div>
              <div>
                <p className="mfai-chip">{persona.passType}</p>
                <h3 className="mt-3 text-xl font-semibold leading-tight text-slate-900 dark:text-mfai-text md:text-2xl">
                  {persona.title}
                </h3>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isActivePersona ? (
                <span className="mfai-chip bg-success/15 text-success">
                  <Sparkles size={14} /> Active journey
                </span>
              ) : (
                <span className="mfai-chip">
                  <Compass size={14} /> {persona.phases.length} phases
                </span>
              )}
              <span className="mfai-chip bg-info/15 text-info">
                <Target size={14} /> {persona.targetProfile}
              </span>
              <span className="mfai-chip bg-warning/15 text-warning">Testnet Ready</span>
            </div>
          </div>

          <p className="text-sm leading-6 text-slate-900/90 dark:text-white/85 md:text-base">
            {persona.description}
          </p>

          <div className="mfai-divider" />

          <div className="console-history-grid">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-white/80">
                Spotlight missions
              </h4>
              <ul className="space-y-3 text-sm text-slate-800 dark:text-white/80">
                {spotlightPhases.map((phase) => (
                  <li
                    key={phase.id}
                    className="group relative overflow-hidden rounded-2xl border border-mfai-border/60 bg-mfai-surfaceAlt/40 px-4 py-3 transition-colors duration-300 hover:border-accent-neon/60"
                  >
                    <span className="text-[11px] uppercase tracking-[0.25em] text-slate-700 dark:text-white/60">
                      {phase.duration}
                    </span>
                    <p className="mt-1 font-medium text-slate-950 dark:text-white">
                      {phase.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-700 dark:text-white/70">
                      {phase.zynoTip}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col justify-between gap-3 rounded-2xl border border-mfai-border/60 bg-mfai-surfaceAlt/40 p-4 text-sm text-slate-700 dark:text-mfai-text/85">
              <div>
                <span className="text-[11px] uppercase tracking-[0.25em] text-slate-700 dark:text-white/60">
                  Next milestone
                </span>
                <p className="mt-2 font-semibold text-slate-950 dark:text-white">
                  {upcomingPhase?.title ?? 'Select to reveal roadmap'}
                </p>
                <p className="mt-1 text-xs text-slate-700 dark:text-white/70">
                  {upcomingPhase?.mission ?? "Start this journey to unlock Zyno's activation pipeline."}
                </p>
              </div>
              <div className="mfai-divider" />
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg bg-mfai-surface/60 px-3 py-2 text-left">
                  <dt className="text-slate-700 dark:text-white/65">XP Reward</dt>
                  <dd className="text-sm font-semibold text-slate-950 dark:text-white">{upcomingPhase?.xpReward ?? 0}</dd>
                </div>
                <div className="rounded-lg bg-mfai-surface/60 px-3 py-2 text-left">
                  <dt className="text-slate-700 dark:text-white/65">$MFAI</dt>
                  <dd className="text-sm font-semibold text-slate-950 dark:text-white">{upcomingPhase?.mfaiReward ?? 0}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        <aside className="flex w-full flex-col justify-between gap-4 rounded-3xl border border-mfai-border/50 bg-mfai-surface/60 p-5 shadow-inner-glow lg:max-w-xs">
          <figure className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30">
            <img
              src={certificatePreview}
              alt={`${persona.title} signature Proof-of-Skill NFT`}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(event) => {
                const target = event.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/images/nfts/default-nft.svg';
              }}
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-black/60 px-3 py-2 text-xs uppercase tracking-[0.3em] text-white/80">
              Signature Proof NFT
            </figcaption>
          </figure>

          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-mfai-text/60">Progress</p>
            <div className="flex items-center justify-between text-sm text-slate-900 dark:text-white/85">
              <span>{hasStarted ? 'In progress' : 'Not started'}</span>
              <span>{completedCount}/{persona.phases.length}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-mfai-surfaceMuted">
              <motion.div
                className="h-full rounded-full bg-gradient-accent"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <p className="text-xs text-slate-700 dark:text-white/75">
              {(() => {
                // Extract nested ternary into explicit variable
                if (!hasStarted) {
                  return 'Select this journey to activate guided missions and scoring telemetry.';
                }
                const missionText = completedCount === 1 ? 'mission' : 'missions';
                return `You have validated ${completedCount} ${missionText} with Zyno.`;
              })()}
            </p>
          </div>

          <div className="space-y-2">
            <motion.button
              type="button"
              whileHover={{ scale: isLoading ? 1 : 1.03 }}
              whileTap={{ scale: isLoading ? 1 : 0.97 }}
              onClick={handlePersonaSelection}
              disabled={isLoading}
              className={(() => {
                // Extract nested ternary into explicit variable
                let buttonClass = 'relative inline-flex w-full items-center justify-center overflow-hidden rounded-2xl px-6 py-3 text-sm font-semibold transition-all duration-300 ease-out-quart focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';
                if (isLoading) {
                  buttonClass += ' cursor-wait bg-mfai-surfaceMuted text-slate-500 dark:text-mfai-text/50';
                } else if (isActivePersona) {
                  buttonClass += ' bg-gradient-accent text-white shadow-neon-ring';
                } else {
                  buttonClass += ' border border-accent/40 bg-transparent text-accent hover:bg-accent/10';
                }
                return buttonClass;
              })()}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {(() => {
                  // Extract nested ternary into explicit variable
                  if (isLoading) {
                    return 'Syncing with Zyno...';
                  }
                  if (isActivePersona) {
                    return hasStarted ? 'Continue journey' : 'Resume onboarding';
                  }
                  return 'Launch with Zyno';
                })()}
              </span>
              {!isLoading && (
                <span
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(197,148,255,0.25),transparent_60%)] opacity-0 transition-opacity duration-300 hover:opacity-100"
                />
              )}
            </motion.button>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="assertive"
              className="rounded-xl border border-danger/30 bg-danger/15 px-3 py-2 text-xs text-danger"
            >
              {error}
            </div>
          )}
        </aside>
      </div>
    </motion.article>
  );
};

export default JourneyCard;
