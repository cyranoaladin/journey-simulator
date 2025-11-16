// 📦 agentFeedbackLog.js — Modèle Mongoose pour journaliser les exécutions agents
const mongoose = require('mongoose');

const AgentLogSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  agentName: { type: String, required: true },
  payload: { type: mongoose.Schema.Types.Mixed, required: true },
  ragSnippets: [String],
  ae_summary: String,
  ae_outcome: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AgentInteractionLog', AgentLogSchema);

