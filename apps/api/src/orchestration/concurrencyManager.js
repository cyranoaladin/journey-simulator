/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

const MAX_RUNNING = Number(process.env.CONCURRENCY_MAX_RUNNING || 5);
const MAX_QUEUE = Number(process.env.CONCURRENCY_MAX_QUEUE || 20);

const queues = new Map(); // tenant -> { running, queue: [] }

function ensure(tenantId = 'default') {
  const key = tenantId || 'default';
  if (!queues.has(key)) queues.set(key, { running: 0, queue: [] });
  return queues.get(key);
}

async function acquire(tenantId = 'default') {
  const q = ensure(tenantId);
  if (q.running >= MAX_RUNNING) {
    if (q.queue.length >= MAX_QUEUE) {
      return { shed: true, queued: q.queue.length, running: q.running, max: MAX_RUNNING, release: () => {} };
    }
    return new Promise((resolve) => {
      q.queue.push(() => {
        q.running += 1;
        resolve({
          shed: false,
          queued: q.queue.length,
          running: q.running,
          max: MAX_RUNNING,
          release: () => release(tenantId),
        });
      });
    });
  }
  q.running += 1;
  return {
    shed: false,
    queued: q.queue.length,
    running: q.running,
    max: MAX_RUNNING,
    release: () => release(tenantId),
  };
}

function release(tenantId = 'default') {
  const q = ensure(tenantId);
  q.running = Math.max(0, q.running - 1);
  const next = q.queue.shift();
  if (next) {
    next();
  }
}

function summary() {
  const byTenant = {};
  queues.forEach((v, k) => {
    byTenant[k] = { running: v.running, queued: v.queue.length, max: MAX_RUNNING };
  });
  return byTenant;
}

function reset() {
  queues.clear();
}

module.exports = {
  acquire,
  release,
  summary,
  reset,
};
