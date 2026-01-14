/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

#!/usr/bin/env node
/* Rollback script (safe state) */
process.env.KILL_SWITCH = 'true';
process.env.KILL_SWITCH_SCOPE = 'ALL';

const path = require('path');
const idempotencyStore = require(path.join(__dirname, '../../mf-back/orchestration/idempotencyStore'));
const auditTrailStore = require(path.join(__dirname, '../../mf-back/orchestration/auditTrailStore'));
const memoryStore = require(path.join(__dirname, '../../mf-back/orchestration/memoryStore'));

idempotencyStore.clear();
auditTrailStore.clear();
memoryStore.clear();

const output = {
  rollback: 'DONE',
  killSwitch: 'ENABLED',
  scope: 'ALL',
  storesCleared: ['idempotency', 'audit', 'memory'],
};

console.log(JSON.stringify(output, null, 2));
