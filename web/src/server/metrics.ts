/* eslint-disable no-var */

type Counters = {
  healthHits: number
  echoHits: number
  txPrepared: number
  visits: number
}

declare global { var __metrics: Counters | undefined }
const store: Counters = globalThis.__metrics || { healthHits: 0, echoHits: 0, txPrepared: 0, visits: 0 }
globalThis.__metrics = store

export function bumpVisit() { store.visits++ }
export function bumpHealth() { store.healthHits++ }
export function bumpEcho() { store.echoHits++ }
export function bumpTxPrepared() { store.txPrepared++ }
export function getMetrics(): Counters { return { ...store } }

/* eslint-enable no-var */
