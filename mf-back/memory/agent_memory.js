// Persistent Agent Memory System with basic file persistence
const fs = require('node:fs');
const path = require('node:path');

const MEMORY_DIR = __dirname;
const MEMORY_FILE = path.join(MEMORY_DIR, 'agent_memory.json');

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
      fs.mkdirSync(MEMORY_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create memory directory:', err);
  }
}

function loadFromDisk() {
  ensureMemoryDir();
  if (!fs.existsSync(MEMORY_FILE)) {
    return {};
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(MEMORY_FILE, 'utf-8'));
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed;
    }
  } catch (error) {
    console.error('Failed to load agent memory from disk, starting fresh:', error);
  }
  return {};
}

function persistToDisk(currentMemory) {
  try {
    ensureMemoryDir();
    fs.writeFileSync(MEMORY_FILE, JSON.stringify(currentMemory, null, 2));
  } catch (error) {
    console.error('Failed to persist agent memory:', error);
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
    if (fs.existsSync(MEMORY_FILE)) {
      try {
        fs.unlinkSync(MEMORY_FILE);
      } catch (error) {
        console.error('Failed to reset agent memory file:', error);
      }
    }
  }
};
