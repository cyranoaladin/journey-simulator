export type Step = { id: string; kind: 'task' | 'quiz'; payload?: any }
export type Plan = { steps: Step[] }
export type ExecLog = any[]
export type Verdict = { ok: boolean; details?: any }

export async function planJourney(userId: string, journeyId: string): Promise<Plan>{
  return { steps: [{ id: 's1', kind: 'task' }] }
}

export async function executeJourneyStep(_userId: string, _journeyId: string, step: Step){
  return { stepId: step.id, result: 'ok' }
}

export async function verifyCompletion(_userId: string, _journeyId: string, _exec: ExecLog): Promise<Verdict>{
  return { ok: true }
}