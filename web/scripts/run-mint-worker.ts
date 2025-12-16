import { mintWorker } from '../src/workers/mintWorker.ts'

async function startWorker() {
  console.log('[worker:mint] Mint worker started')
  // The worker is initialized on import (mintWorker.ts)
}

startWorker().catch((err) => {
  console.error('[worker:mint] Fatal error:', err)
  process.exit(1)
})


