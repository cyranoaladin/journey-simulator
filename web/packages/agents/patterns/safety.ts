export const LIMITS = { feeMax: 1_000_000, riskMax: 0.8, humanGate: 200_000 }

export function guard(sim: { ok: boolean; estFeeLamports?: number; riskScore?: number }) {
  if (!sim.ok) throw new Error('Simulation failed')
  if (sim.estFeeLamports && sim.estFeeLamports > LIMITS.feeMax) throw new Error('Fee too high')
  if (sim.riskScore && sim.riskScore > LIMITS.riskMax) throw new Error('Risk too high')
}

export function needsHumanApproval(sim: { estFeeLamports?: number; riskScore?: number }) {
  return (sim.estFeeLamports ?? 0) > LIMITS.humanGate || (sim.riskScore ?? 0) > 0.2
}
