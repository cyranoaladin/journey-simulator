import { planJourney, executeJourneyStep, verifyCompletion } from 'agents/orchestrator'

describe('agents orchestrator', () => {
  it('runs PEV skeleton', async () => {
    const plan = await planJourney('u1','j1')
    expect(plan.steps.length).toBeGreaterThan(0)
    const log:any[] = []
    for(const s of plan.steps){
      const out = await executeJourneyStep('u1','j1', s)
      log.push(out)
    }
    const verdict = await verifyCompletion('u1','j1', log)
    expect(verdict.ok).toBe(true)
  })
})