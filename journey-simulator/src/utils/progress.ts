export type NormalizedCompletedPhases = {
  completedCount: number
  completedPhases: number[]
}

const sanitizePhaseIndexes = (values: any[]): number[] => {
  return values
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value >= 0)
    .sort((a, b) => a - b)
}

export const normalizeCompletedPhases = (progress?: {
  completed_phase_indexes?: any
  completed_phases?: any
}): NormalizedCompletedPhases => {
  if (!progress) {
    return { completedCount: 0, completedPhases: [] }
  }

  if (Array.isArray(progress.completed_phase_indexes)) {
    const normalized = sanitizePhaseIndexes(progress.completed_phase_indexes)
    return { completedCount: normalized.length, completedPhases: normalized }
  }

  if (Array.isArray(progress.completed_phases)) {
    const normalized = sanitizePhaseIndexes(progress.completed_phases)
    return { completedCount: normalized.length, completedPhases: normalized }
  }

  if (typeof progress.completed_phases === 'number' && progress.completed_phases > 0) {
    const count = Math.floor(progress.completed_phases)
    return {
      completedCount: count,
      completedPhases: Array.from({ length: count }, (_, index) => index)
    }
  }

  return { completedCount: 0, completedPhases: [] }
}
