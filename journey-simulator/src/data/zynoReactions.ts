/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const zynoReactions = {
  ideation: 'Lets shape your vision into something unforgettable. Ill orchestrate the right builders to spark it to life.',
  validation: 'Community is your mirror  lets refine the path until signal cuts through the noise.',
  launch: 'Your DAO believes  it\'s time to launch  Momentum is primed and capital is aligned.',
  growth: 'Stake, reward, repeat. Adoption begins now and compounding starts with each aligned mission.'
} as const

export type ZynoPhaseKey = keyof typeof zynoReactions

export default zynoReactions
