// memory/agent_metrics.js
const fs = require('node:fs');
const path = require('node:path');
const agentMemory = require('./agent_memory');

const METRIC_LOG_PATH = path.join(__dirname, 'agent_metrics.log.json');
const FEEDBACK_LOG_DIR = path.join(__dirname, '..', 'logs');
const FEEDBACK_LOG_PATH = path.join(FEEDBACK_LOG_DIR, 'agent_feedback.json');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) {
    return [];
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function writeJsonArray(filePath, data) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function saveMetric(agentName, userId, metricType, value, missionId) {
  const entry = {
    timestamp: new Date().toISOString(),
    agentName,
    userId,
    missionId: missionId ?? null,
    // "AEPO" or "AECO" (see utils/aepoAeco.js for unified definitions)
    // - AEPO: per-agent execution signal feeding the individual pathway engine (AEPO orchestration).
    // - AECO: feedback/cohort signal (ratings/comments), extensible to cohort analytics.
    type: metricType,
    value
  };

  let existing = [];
  if (fs.existsSync(METRIC_LOG_PATH)) {
    try {
      existing = JSON.parse(fs.readFileSync(METRIC_LOG_PATH, 'utf-8'));
      if (!Array.isArray(existing)) {
        existing = [];
      }
    } catch (error) {
      existing = [];
    }
  }

  existing.push(entry);
  writeJsonArray(METRIC_LOG_PATH, existing);
}

async function saveFeedback(payload) {
  const agentName = payload.agent || payload.agentName;
  const userId = payload.userId || 'unknown_user';
  const missionId = payload.missionId ?? null;
  const aepoScore = payload.aepoScore ?? payload.aepeScore ?? null;
  const feedbackValue = payload.aecoFeedback || {};

  const entry = {
    timestamp: new Date().toISOString(),
    agentName,
    userId,
    missionId,
    aepoScore,
    feedback: feedbackValue
  };

  const existing = readJsonArray(FEEDBACK_LOG_PATH);
  existing.push(entry);
  writeJsonArray(FEEDBACK_LOG_PATH, existing);

  saveMetric(agentName, userId, 'AECO', {
    aepoScore,
    feedback: feedbackValue
  }, missionId);

  const satisfactionScore = feedbackValue.satisfaction ?? feedbackValue.rating ?? feedbackValue.score ?? null;
  agentMemory.saveInteraction(agentName, userId, {
    type: 'AECO',
    missionId,
    rating: satisfactionScore,
    feedback: feedbackValue,
    aepoScore
  });

  return { saved: true, entry };
}

module.exports = { saveMetric, saveFeedback };
