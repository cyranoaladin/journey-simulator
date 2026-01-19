/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

import type { UserProgress } from '../types/journey'

export type JourneySignalScores = {
  aepo: number
  aeco: number
  alignment: number
}

export const deriveJourneySignals = (
  progress: UserProgress,
  totalPhases?: number
): JourneySignalScores => {
  const normalizedXp = Math.min(1, progress.totalXP / 2500)
  const completionRatio = totalPhases && totalPhases > 0
    ? Math.min(1, progress.completedPhases.length / totalPhases)
    : 0.25
  const proposalFactor = Math.min(0.25, progress.daoProposals / 12)
  const votingFactor = Math.min(0.3, progress.votingPower / 400)

  const aepoBase = 58
  const aecoBase = 55
  const alignmentBase = 52

  const aepo = clampScore(aepoBase + normalizedXp * 28 + completionRatio * 14)
  const aeco = clampScore(aecoBase + completionRatio * 32 + proposalFactor * 40)
  const alignment = clampScore(
    alignmentBase + completionRatio * 20 + votingFactor * 100 + normalizedXp * 10
  )

  return { aepo, aeco, alignment }
}

const clampScore = (value: number) => Math.max(35, Math.min(99, Math.round(value)))
