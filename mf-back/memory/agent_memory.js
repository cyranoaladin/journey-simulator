/**
 * Project: Money Factory AI (MFAI)
 * Status: Production Ready - 2026
 * Contributors: Alaeddine BEN RHOUMA, Kamel BEN RHOUMA, Adem BELHAJAISSA
 */

// Persistent Agent Memory System with basic file persistence
const fs = require('node:fs');
const path = require('node:path');

const MEMORY_DIR = __dirname;
const MEMORY_FILE = path.join(MEMORY_DIR, 'agent_memory.json');
const FALLBACK_FILE = '/tmp/mfai_agent_memory.json';

function createDefaultUserMemory() {
  return {
    profile: {},
    history: [],
    metrics: {
      AEPO: { total: 0, count: 0 },
      AECO: { total: 0, count: 0 }
    },
    aepo: 0,
    aeco: 0,
    updatedAt: null
  };
}

function ensureMemoryDir() {
  try {
    if (!fs.existsSync(MEMORY_DIR)) {
      // In read-only system, this might fail, but directory usually exists in image
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Warning: Failed to ensure memory directory:', err.message);
  }
}

function loadFromDisk() {
  ensureMemoryDir();

  let fileToLoad = MEMORY_FILE;
  if (!fs.existsSync(MEMORY_FILE)) {
    if (fs.existsSync(FALLBACK_FILE)) {
      fileToLoad = FALLBACK_FILE;
      console.log(`[agent_memory] Loading from fallback: ${FALLBACK_FILE}`);
    } else {
      return {};
    }
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(fileToLoad, 'utf-8'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load agent memory, starting fresh', { file: fileToLoad, error: error?.message || error });
  }
  return {};
}

function persistToDisk(currentMemory) {
  const content = JSON.stringify(currentMemory, null, 2);

  // Try primary location
  try {
    ensureMemoryDir();
    fs.writeFileSync(MEMORY_FILE, content);
  } catch (error) {
    if (error.code === 'EROFS' || error.code === 'EACCES') {
      // Fallback to tmp
      try {
        fs.writeFileSync(FALLBACK_FILE, content);
        console.log(`[agent_memory] Primary path RO, wrote to fallback: ${FALLBACK_FILE}`);
      } catch (fallbackError) {
        console.error('CRITICAL: Failed to persist to fallback memory:', fallbackError);
      }
    } else {
      console.error('Failed to persist agent memory:', error);
    }
  }
}

function ensureUser(memoryStore, userId) {
  if (!memoryStore[userId]) {
    memoryStore[userId] = createDefaultUserMemory();
  }
  return memoryStore[userId];
}

function updateMetricAverages(userRecord, type, numericValue) {
  if (!Number.isFinite(numericValue)) {
    return;
  }

  if (!userRecord.metrics) {
    userRecord.metrics = {
      AEPO: { total: 0, count: 0 },
      AECO: { total: 0, count: 0 }
    };
  }

  if (!userRecord.metrics[type]) {
    userRecord.metrics[type] = { total: 0, count: 0 };
  }

  const bucket = userRecord.metrics[type];
  bucket.total += numericValue;
  bucket.count += 1;

  if (type === 'AEPO') {
    userRecord.aepo = Math.round(bucket.total / bucket.count);
  }

  if (type === 'AECO') {
    userRecord.aeco = Math.round(bucket.total / bucket.count);
  }
}

let memory = loadFromDisk();

module.exports = {
  get(userId) {
    if (!userId) {
      console.error('agent_memory.get called without userId');
      return createDefaultUserMemory();
    }
    return ensureUser(memory, userId);
  },

  update(userId, data) {
    if (!userId) {
      console.error('agent_memory.update called without userId');
      return null;
    }
    const userRecord = ensureUser(memory, userId);
    memory[userId] = {
      ...userRecord,
      ...data,
      updatedAt: new Date().toISOString()
    };
    persistToDisk(memory);
    return memory[userId];
  },

  pushHistory(userId, entry) {
    if (!userId) {
      console.error('agent_memory.pushHistory called without userId');
      return null;
    }
    const userRecord = ensureUser(memory, userId);
    const historyEntry = {
      timestamp: new Date().toISOString(),
      ...entry
    };
    userRecord.history.push(historyEntry);
    userRecord.updatedAt = new Date().toISOString();
    memory[userId] = userRecord;
    persistToDisk(memory);
    return historyEntry;
  },

  saveInteraction(agentName, userId, data = {}) {
    if (!userId) {
      console.error('agent_memory.saveInteraction called without userId');
      return null;
    }
    const userRecord = ensureUser(memory, userId);
    const entry = {
      timestamp: new Date().toISOString(),
      agentName,
      ...data
    };

    userRecord.history.push(entry);

    if (data.type === 'AEPO') {
      const score = Number(data.score ?? data.value ?? data.metric);
      updateMetricAverages(userRecord, 'AEPO', score);
    }

    if (data.type === 'AECO') {
      const score = Number(data.rating ?? data.score ?? data.value);
      updateMetricAverages(userRecord, 'AECO', score);
    }

    userRecord.updatedAt = new Date().toISOString();
    memory[userId] = userRecord;
    persistToDisk(memory);
    return entry;
  },

  listAll() {
    return Object.entries(memory).map(([userId, data]) => ({
      userId,
      ...data
    }));
  },

  reset() {
    memory = {};
    // Try delete primary
    if (fs.existsSync(MEMORY_FILE)) {
      try {
        fs.unlinkSync(MEMORY_FILE);
      } catch (error) {
        console.error('Failed to reset memory (primary):', error.message);
      }
    }
    // Try delete fallback
    if (fs.existsSync(FALLBACK_FILE)) {
      try {
        fs.unlinkSync(FALLBACK_FILE);
      } catch (error) {
        console.error('Failed to reset memory (fallback):', error.message);
      }
    }
  }
};
